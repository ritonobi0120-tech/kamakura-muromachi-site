import React, { useEffect, useMemo, useState } from "react";
import { Button, FlatList, Text, View } from "react-native";
import { auth, db } from "../services/firebase";
import { collection, doc, onSnapshot, orderBy, query, where, limit, Timestamp } from "firebase/firestore";
import { checkIn, commitDecline, commitSelectDay, commitSelectTime, done } from "../services/api";
import * as Notifications from "expo-notifications";
import { ACTIONS } from "../notifications/notifications";
import { scheduleReminders } from "../notifications/reminders";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type RequestItem = {
  id: string;
  state: string;
  selectedDay?: string;
  plannedAt?: Timestamp;
  requesterUid?: string;
};

type EventItem = {
  id: string;
  type: string;
  actorUid?: string;
  createdAt?: Timestamp;
  payload?: { note?: string; plannedAt?: string };
};

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Home">) {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [committedRequests, setCommittedRequests] = useState<RequestItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const userRef = doc(db, "users", uid);
    return onSnapshot(userRef, (snap) => {
      setGroupId(snap.data()?.currentGroupId || null);
    });
  }, []);

  useEffect(() => {
    if (!groupId || !auth.currentUser?.uid) return;
    const requestsRef = collection(db, "groups", groupId, "requests");
    const q = query(
      requestsRef,
      where("assigneeUid", "==", auth.currentUser.uid),
      where("state", "in", ["pending_day", "pending_time"])
    );
    return onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as RequestItem) })));
    });
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !auth.currentUser?.uid) return;
    const requestsRef = collection(db, "groups", groupId, "requests");
    const q = query(
      requestsRef,
      where("assigneeUid", "==", auth.currentUser.uid),
      where("state", "==", "committed"),
      limit(1)
    );
    return onSnapshot(q, (snap) => {
      setCommittedRequests(snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as RequestItem) })));
    });
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    const eventsRef = collection(db, "groups", groupId, "events");
    const q = query(eventsRef, orderBy("createdAt", "desc"), limit(10));
    return onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as EventItem) })));
    });
  }, [groupId]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const data = response.notification.request.content.data as any;
      const action = response.actionIdentifier;
      if (!data?.groupId || !data?.requestId) return;

      if ([ACTIONS.DAY_TODAY, ACTIONS.DAY_TOMORROW, ACTIONS.DAY_AFTER].includes(action)) {
        const selectedDay =
          action === ACTIONS.DAY_TODAY
            ? "today"
            : action === ACTIONS.DAY_TOMORROW
            ? "tomorrow"
            : "day_after";
        await commitSelectDay({ groupId: data.groupId, requestId: data.requestId, dayKey: selectedDay });
      }

      if (action === ACTIONS.DAY_CANT) {
        await commitDecline({ groupId: data.groupId, requestId: data.requestId });
      }

      if ([ACTIONS.TIME_0700, ACTIONS.TIME_1800, ACTIONS.TIME_1900, ACTIONS.TIME_2100].includes(action)) {
        const timePreset =
          action === ACTIONS.TIME_0700
            ? "07:00"
            : action === ACTIONS.TIME_1800
            ? "18:00"
            : action === ACTIONS.TIME_1900
            ? "19:00"
            : "21:00";
        const result = await commitSelectTime({ groupId: data.groupId, requestId: data.requestId, timePreset });
        const plannedAt = (result.data as any)?.plannedAt;
        if (plannedAt) {
          await scheduleReminders(new Date(plannedAt));
        }
      }

      if (action === ACTIONS.TIME_OTHER) {
        navigation.navigate("TimeInput", { groupId: data.groupId, requestId: data.requestId, selectedDay: data.selectedDay || "today" });
      }
    });

    return () => sub.remove();
  }, [navigation]);

  const plannedAt = useMemo(() => {
    const committed = committedRequests.find((req) => req.plannedAt);
    if (!committed?.plannedAt) return null;
    return committed.plannedAt.toDate().toLocaleString();
  }, [committedRequests]);

  if (!groupId) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>グループに参加してください。</Text>
        <Button title="グループ管理" onPress={() => navigation.navigate("Group")} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button title="ジム行った！" onPress={() => checkIn({ groupId })} />
      <View style={{ height: 12 }} />
      <Button title="やった！" onPress={() => done({ groupId })} />
      <View style={{ height: 20 }} />
      <Text style={{ fontSize: 18 }}>今日の予定</Text>
      <Text>{plannedAt || "未設定"}</Text>
      <View style={{ height: 16 }} />
      <Text style={{ fontSize: 18 }}>未返信Request</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 4 }}>
            <Text>{item.state}</Text>
          </View>
        )}
      />
      <View style={{ height: 16 }} />
      <Text style={{ fontSize: 18 }}>最新ログ</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 4 }}>
            <Text>{item.type}</Text>
          </View>
        )}
      />
      <View style={{ height: 16 }} />
      <Button title="グループ管理" onPress={() => navigation.navigate("Group")} />
      <View style={{ height: 12 }} />
      <Button title="設定" onPress={() => navigation.navigate("Settings")} />
    </View>
  );
}
