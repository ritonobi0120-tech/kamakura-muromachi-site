import * as Notifications from "expo-notifications";

export async function scheduleReminders(plannedAt: Date) {
  const offsets = [-30, 0, 30];
  for (const offset of offsets) {
    const triggerDate = new Date(plannedAt.getTime() + offset * 60 * 1000);
    if (triggerDate.getTime() < Date.now()) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "ジムの予定",
        body: "予定時刻が近づいています",
        data: { type: "remind" }
      },
      trigger: triggerDate
    });
  }
}
