import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { auth, db } from "../services/firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { Platform } from "react-native";

export const ACTIONS = {
  DAY_TODAY: "DAY_TODAY",
  DAY_TOMORROW: "DAY_TOMORROW",
  DAY_AFTER: "DAY_AFTER",
  DAY_CANT: "DAY_CANT",
  TIME_0700: "TIME_0700",
  TIME_1800: "TIME_1800",
  TIME_1900: "TIME_1900",
  TIME_2100: "TIME_2100",
  TIME_OTHER: "TIME_OTHER",
  DONE: "DONE"
};

export async function setNotificationCategories() {
  await Notifications.setNotificationCategoryAsync("commit_day", [
    { identifier: ACTIONS.DAY_TODAY, buttonTitle: "今日", options: { opensAppToForeground: false } },
    { identifier: ACTIONS.DAY_TOMORROW, buttonTitle: "明日", options: { opensAppToForeground: false } },
    { identifier: ACTIONS.DAY_AFTER, buttonTitle: "明後日", options: { opensAppToForeground: false } },
    { identifier: ACTIONS.DAY_CANT, buttonTitle: "行けない", options: { opensAppToForeground: true } }
  ]);

  await Notifications.setNotificationCategoryAsync("commit_time", [
    { identifier: ACTIONS.TIME_0700, buttonTitle: "07:00", options: { opensAppToForeground: false } },
    { identifier: ACTIONS.TIME_1800, buttonTitle: "18:00", options: { opensAppToForeground: false } },
    { identifier: ACTIONS.TIME_1900, buttonTitle: "19:00", options: { opensAppToForeground: false } },
    { identifier: ACTIONS.TIME_2100, buttonTitle: "21:00", options: { opensAppToForeground: false } },
    { identifier: ACTIONS.TIME_OTHER, buttonTitle: "その他", options: { opensAppToForeground: true } }
  ]);
}

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH
    });
  }

  const token = await Notifications.getDevicePushTokenAsync();
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  await setDoc(
    doc(db, "users", uid),
    {
      fcmTokens: arrayUnion(token.data),
      updatedAt: new Date()
    },
    { merge: true }
  );
}

export function getFunctionsEmulatorHost() {
  return Constants.expoConfig?.extra?.functionsEmulatorHost || "localhost";
}
