import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { DateTime } from "luxon";

initializeApp();

const db = getFirestore();
const messaging = getMessaging();

const TZ = "Asia/Tokyo";
const ROUND_TRIP_LIMIT = 3;

const DAY_KEYS = ["today", "tomorrow", "day_after"] as const;

type DayKey = (typeof DAY_KEYS)[number];

type RequestState = "pending_day" | "pending_time" | "committed" | "expired" | "transferred";

type Member = {
  uid: string;
  joinedAt: Timestamp;
};

function ensureAuth(context: { auth?: { uid?: string } }) {
  if (!context.auth?.uid) {
    throw new HttpsError("unauthenticated", "Authentication required");
  }
  return context.auth.uid;
}

function dateKeyNow() {
  return DateTime.now().setZone(TZ).toFormat("yyyy-MM-dd");
}

function dateTimeFromDayKey(dayKey: DayKey, time: string) {
  const base = DateTime.now().setZone(TZ).startOf("day");
  const dayOffset = dayKey === "today" ? 0 : dayKey === "tomorrow" ? 1 : 2;
  const [hour, minute] = time.split(":").map(Number);
  return base.plus({ days: dayOffset }).set({ hour, minute, second: 0, millisecond: 0 });
}

async function sendToTokens(tokens: string[], title: string, body: string, data: Record<string, string>, category: string) {
  if (!tokens.length) return;
  await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    android: { notification: { channelId: "default" } },
    apns: { payload: { aps: { category } } },
    data
  });
}

async function getGroupMembers(groupId: string): Promise<Member[]> {
  const membersSnap = await db.collection("groups").doc(groupId).collection("members").get();
  return membersSnap.docs.map((doc) => ({ uid: doc.id, joinedAt: doc.data().joinedAt })) as Member[];
}

async function assertGroupMember(groupId: string, uid: string) {
  const memberSnap = await db.collection("groups").doc(groupId).collection("members").doc(uid).get();
  if (!memberSnap.exists) {
    throw new HttpsError("permission-denied", "not a group member");
  }
}

async function getUserTokens(uid: string): Promise<string[]> {
  const userSnap = await db.collection("users").doc(uid).get();
  return (userSnap.data()?.fcmTokens || []) as string[];
}

async function createRequest(groupId: string, requesterUid: string, assigneeUid: string, fromEventId: string) {
  const deadlineAt = DateTime.now().setZone(TZ).set({ hour: 21, minute: 0, second: 0, millisecond: 0 });
  return db.collection("groups").doc(groupId).collection("requests").add({
    type: "commit",
    fromEventId,
    requesterUid,
    assigneeUid,
    state: "pending_day" as RequestState,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    deadlineAt: Timestamp.fromDate(deadlineAt.toJSDate()),
    lastNotifiedAt: FieldValue.serverTimestamp()
  });
}

async function logEvent(groupId: string, type: string, actorUid: string, payload: Record<string, unknown> = {}) {
  return db.collection("groups").doc(groupId).collection("events").add({
    type,
    actorUid,
    payload,
    createdAt: FieldValue.serverTimestamp()
  });
}

async function selectNext(groupId: string, actorUid: string): Promise<string | null> {
  const members = await getGroupMembers(groupId);
  const candidates = members.filter((member) => member.uid !== actorUid);
  if (!candidates.length) return null;

  const since = DateTime.now().setZone(TZ).minus({ hours: 24 }).toJSDate();
  const doneSnap = await db
    .collection("groups")
    .doc(groupId)
    .collection("events")
    .where("type", "==", "done")
    .where("createdAt", ">=", Timestamp.fromDate(since))
    .get();
  const doneSet = new Set(doneSnap.docs.map((doc) => doc.data().actorUid));
  const filtered = candidates.filter((member) => !doneSet.has(member.uid));
  const pool = filtered.length ? filtered : candidates;

  const requestCounts = await Promise.all(
    pool.map(async (member) => {
      const snap = await db
        .collection("groups")
        .doc(groupId)
        .collection("requests")
        .where("assigneeUid", "==", member.uid)
        .where("state", "in", ["pending_day", "pending_time"])
        .get();
      return { uid: member.uid, joinedAt: member.joinedAt, count: snap.size };
    })
  );

  requestCounts.sort((a, b) => {
    if (a.count !== b.count) return a.count - b.count;
    return a.joinedAt.toMillis() - b.joinedAt.toMillis();
  });

  return requestCounts[0]?.uid || null;
}

export const checkIn = onCall(async (request) => {
  const uid = ensureAuth(request);
  const { groupId } = request.data as { groupId: string };
  if (!groupId) throw new HttpsError("invalid-argument", "groupId required");
  await assertGroupMember(groupId, uid);

  const eventRef = await logEvent(groupId, "checkin", uid);
  const members = await getGroupMembers(groupId);
  const targets = members.filter((member) => member.uid !== uid);

  await Promise.all(
    targets.map(async (member) => {
      const reqRef = await createRequest(groupId, uid, member.uid, eventRef.id);
      const tokens = await getUserTokens(member.uid);
      await sendToTokens(
        tokens,
        "ジム行った！",
        "いつ行く？",
        {
          type: "commit",
          step: "day",
          groupId,
          requestId: reqRef.id
        },
        "commit_day"
      );
    })
  );

  return { ok: true };
});

export const commitSelectDay = onCall(async (request) => {
  const uid = ensureAuth(request);
  const { groupId, requestId, dayKey } = request.data as { groupId: string; requestId: string; dayKey: DayKey };
  if (!groupId || !requestId || !DAY_KEYS.includes(dayKey)) {
    throw new HttpsError("invalid-argument", "invalid request");
  }
  await assertGroupMember(groupId, uid);

  const requestRef = db.collection("groups").doc(groupId).collection("requests").doc(requestId);
  const snap = await requestRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "request not found");
  const requestData = snap.data();
  if (requestData?.assigneeUid !== uid) throw new HttpsError("permission-denied", "not assignee");

  await requestRef.update({
    state: "pending_time" as RequestState,
    selectedDay: dayKey,
    updatedAt: FieldValue.serverTimestamp()
  });

  const tokens = await getUserTokens(uid);
  await sendToTokens(
    tokens,
    "いつ行く？",
    "時間を選んでください",
    {
      type: "commit",
      step: "time",
      groupId,
      requestId,
      selectedDay: dayKey
    },
    "commit_time"
  );

  return { ok: true };
});

export const commitSelectTime = onCall(async (request) => {
  const uid = ensureAuth(request);
  const { groupId, requestId, timePreset, timeCustom } = request.data as {
    groupId: string;
    requestId: string;
    timePreset: string;
    timeCustom?: string;
  };
  if (!groupId || !requestId) throw new HttpsError("invalid-argument", "invalid request");
  await assertGroupMember(groupId, uid);

  const requestRef = db.collection("groups").doc(groupId).collection("requests").doc(requestId);
  const snap = await requestRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "request not found");
  const requestData = snap.data();
  if (requestData?.assigneeUid !== uid) throw new HttpsError("permission-denied", "not assignee");

  const selectedDay = requestData?.selectedDay as DayKey;
  if (!selectedDay) throw new HttpsError("failed-precondition", "day not selected");

  const time = timePreset === "OTHER" ? timeCustom : timePreset;
  if (!time) throw new HttpsError("invalid-argument", "time required");

  const plannedAt = dateTimeFromDayKey(selectedDay, time);

  await requestRef.update({
    state: "committed" as RequestState,
    plannedAt: Timestamp.fromDate(plannedAt.toJSDate()),
    updatedAt: FieldValue.serverTimestamp()
  });

  await logEvent(groupId, "commit", uid, { plannedAt: plannedAt.toISO() });

  return { ok: true, plannedAt: plannedAt.toISO() };
});

export const commitDecline = onCall(async (request) => {
  const uid = ensureAuth(request);
  const { groupId, requestId } = request.data as { groupId: string; requestId: string };
  if (!groupId || !requestId) throw new HttpsError("invalid-argument", "invalid request");
  await assertGroupMember(groupId, uid);

  const requestRef = db.collection("groups").doc(groupId).collection("requests").doc(requestId);
  const snap = await requestRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "request not found");
  const requestData = snap.data();
  if (requestData?.assigneeUid !== uid) throw new HttpsError("permission-denied", "not assignee");

  await requestRef.update({
    state: "expired" as RequestState,
    updatedAt: FieldValue.serverTimestamp()
  });

  await logEvent(groupId, "system", uid, { note: "commitDeclined" });

  return { ok: true };
});

export const done = onCall(async (request) => {
  const uid = ensureAuth(request);
  const { groupId } = request.data as { groupId: string };
  if (!groupId) throw new HttpsError("invalid-argument", "groupId required");
  await assertGroupMember(groupId, uid);

  const eventRef = await logEvent(groupId, "done", uid);
  const members = await getGroupMembers(groupId);

  await Promise.all(
    members.map(async (member) => {
      if (member.uid === uid) return;
      const tokens = await getUserTokens(member.uid);
      await sendToTokens(
        tokens,
        "ジム完了！",
        "おつかれさま",
        {
          type: "done",
          step: "done",
          groupId,
          requestId: eventRef.id
        },
        "default"
      );
    })
  );

  const counterRef = db.collection("groups").doc(groupId).collection("counters").doc(dateKeyNow());
  const counterSnap = await counterRef.get();
  const roundTrips = counterSnap.exists ? counterSnap.data()?.roundTrips || 0 : 0;
  if (roundTrips >= ROUND_TRIP_LIMIT) {
    await logEvent(groupId, "system", uid, { note: "roundTripLimitReached" });
    return { ok: true, roundTrips };
  }

  let nextUid: string | null = null;
  if (members.length === 2) {
    nextUid = members.find((member) => member.uid !== uid)?.uid || null;
  } else {
    nextUid = await selectNext(groupId, uid);
  }

  if (nextUid) {
    const reqRef = await createRequest(groupId, uid, nextUid, eventRef.id);
    const tokens = await getUserTokens(nextUid);
    await sendToTokens(
      tokens,
      "次はあなたの番！",
      "いつ行く？",
      {
        type: "commit",
        step: "day",
        groupId,
        requestId: reqRef.id
      },
      "commit_day"
    );

    await counterRef.set(
      {
        dateKey: dateKeyNow(),
        roundTrips: roundTrips + 1,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  }

  return { ok: true };
});

export const transferRequestIfUnanswered = onCall(async (request) => {
  const uid = ensureAuth(request);
  const { groupId } = request.data as { groupId?: string };
  const groupIds = groupId ? [groupId] : (await db.collection("groups").get()).docs.map((doc) => doc.id);

  const now = DateTime.now().setZone(TZ);

  for (const gid of groupIds) {
    const requestsSnap = await db
      .collection("groups")
      .doc(gid)
      .collection("requests")
      .where("state", "in", ["pending_day", "pending_time"])
      .get();

    for (const reqDoc of requestsSnap.docs) {
      const data = reqDoc.data();
      const deadline = (data.deadlineAt as Timestamp | undefined)?.toDate();
      const lastNotifiedAt = (data.lastNotifiedAt as Timestamp | undefined)?.toDate();
      if (deadline && deadline > now.toJSDate()) {
        if (!lastNotifiedAt || now.diff(DateTime.fromJSDate(lastNotifiedAt), "minutes").minutes >= 60) {
          const tokens = await getUserTokens(data.assigneeUid);
          await sendToTokens(
            tokens,
            "リマインド",
            "返信が必要です",
            {
              type: "commit",
              step: "day",
              groupId: gid,
              requestId: reqDoc.id
            },
            "commit_day"
          );
          await reqDoc.ref.update({ lastNotifiedAt: FieldValue.serverTimestamp() });
        }
        continue;
      }
      if (!deadline) continue;

      const currentAssignee = data.assigneeUid as string;
      const nextUid = await selectNext(gid, currentAssignee);
      if (!nextUid || nextUid === currentAssignee) continue;

      await reqDoc.ref.update({
        state: "transferred" as RequestState,
        updatedAt: FieldValue.serverTimestamp()
      });

      await logEvent(gid, "system", uid, {
        note: "requestTransferred",
        from: currentAssignee,
        to: nextUid
      });

      const newRequest = await createRequest(gid, data.requesterUid, nextUid, data.fromEventId);
      const tokens = await getUserTokens(nextUid);
      await sendToTokens(
        tokens,
        "返信が必要です",
        "いつ行く？",
        {
          type: "commit",
          step: "day",
          groupId: gid,
          requestId: newRequest.id
        },
        "commit_day"
      );
    }
  }

  return { ok: true };
});

export const transferRequestIfUnansweredScheduled = onSchedule("every 60 minutes", async () => {
  const now = DateTime.now().setZone(TZ);
  const groupsSnap = await db.collection("groups").get();

  for (const groupDoc of groupsSnap.docs) {
    const gid = groupDoc.id;
    const requestsSnap = await db
      .collection("groups")
      .doc(gid)
      .collection("requests")
      .where("state", "in", ["pending_day", "pending_time"])
      .get();

    for (const reqDoc of requestsSnap.docs) {
      const data = reqDoc.data();
      const deadline = (data.deadlineAt as Timestamp | undefined)?.toDate();
      const lastNotifiedAt = (data.lastNotifiedAt as Timestamp | undefined)?.toDate();
      if (deadline && deadline > now.toJSDate()) {
        if (!lastNotifiedAt || now.diff(DateTime.fromJSDate(lastNotifiedAt), "minutes").minutes >= 60) {
          const tokens = await getUserTokens(data.assigneeUid);
          await sendToTokens(
            tokens,
            "リマインド",
            "返信が必要です",
            {
              type: "commit",
              step: "day",
              groupId: gid,
              requestId: reqDoc.id
            },
            "commit_day"
          );
          await reqDoc.ref.update({ lastNotifiedAt: FieldValue.serverTimestamp() });
        }
        continue;
      }
      if (!deadline) continue;

      const currentAssignee = data.assigneeUid as string;
      const nextUid = await selectNext(gid, currentAssignee);
      if (!nextUid || nextUid === currentAssignee) continue;

      await reqDoc.ref.update({
        state: "transferred" as RequestState,
        updatedAt: FieldValue.serverTimestamp()
      });

      await logEvent(gid, "system", "system", {
        note: "requestTransferred",
        from: currentAssignee,
        to: nextUid
      });

      const newRequest = await createRequest(gid, data.requesterUid, nextUid, data.fromEventId);
      const tokens = await getUserTokens(nextUid);
      await sendToTokens(
        tokens,
        "返信が必要です",
        "いつ行く？",
        {
          type: "commit",
          step: "day",
          groupId: gid,
          requestId: newRequest.id
        },
        "commit_day"
      );
    }
  }
});
