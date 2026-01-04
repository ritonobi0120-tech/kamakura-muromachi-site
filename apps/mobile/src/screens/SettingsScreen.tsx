import React, { useEffect, useState } from "react";
import { Button, Switch, Text, TextInput, View } from "react-native";
import { auth, db } from "../services/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

export default function SettingsScreen() {
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState("23:00");
  const [quietEnd, setQuietEnd] = useState("07:00");

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db, "users", uid), (snap) => {
      const settings = snap.data()?.settings || {};
      setNotifyEnabled(settings.notifyEnabled ?? true);
      setQuietStart(settings.quietHoursStart ?? "23:00");
      setQuietEnd(settings.quietHoursEnd ?? "07:00");
    });
  }, []);

  const save = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await updateDoc(doc(db, "users", uid), {
      settings: {
        notifyEnabled,
        quietHoursStart: quietStart,
        quietHoursEnd: quietEnd
      }
    });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18 }}>通知</Text>
      <Switch value={notifyEnabled} onValueChange={setNotifyEnabled} />
      <Text style={{ marginTop: 16 }}>サイレント時間 開始</Text>
      <TextInput value={quietStart} onChangeText={setQuietStart} style={{ borderWidth: 1, padding: 8 }} />
      <Text style={{ marginTop: 16 }}>サイレント時間 終了</Text>
      <TextInput value={quietEnd} onChangeText={setQuietEnd} style={{ borderWidth: 1, padding: 8 }} />
      <View style={{ height: 16 }} />
      <Button title="保存" onPress={save} />
    </View>
  );
}
