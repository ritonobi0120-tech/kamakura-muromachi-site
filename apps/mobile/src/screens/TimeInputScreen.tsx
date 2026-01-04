import React, { useState } from "react";
import { Button, FlatList, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { commitSelectTime } from "../services/api";
import { scheduleReminders } from "../notifications/reminders";

const timeOptions = [
  "06:00",
  "06:30",
  "07:00",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30"
];

export default function TimeInputScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, "TimeInput">) {
  const { groupId, requestId } = route.params;
  const [selected, setSelected] = useState<string | null>(null);

  const submit = async () => {
    if (!selected) return;
    const result = await commitSelectTime({ groupId, requestId, timePreset: "OTHER", timeCustom: selected });
    const plannedAt = (result.data as any)?.plannedAt;
    if (plannedAt) {
      await scheduleReminders(new Date(plannedAt));
    }
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>時刻を選択</Text>
      <FlatList
        data={timeOptions}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 6 }}>
            <Button title={item} onPress={() => setSelected(item)} />
          </View>
        )}
      />
      <Button title={selected ? `${selected}で決定` : "時刻を選択"} onPress={submit} />
    </View>
  );
}
