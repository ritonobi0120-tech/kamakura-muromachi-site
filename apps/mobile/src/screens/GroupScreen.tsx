import React, { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { auth, db } from "../services/firebase";
import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc, increment } from "firebase/firestore";

export default function GroupScreen() {
  const [groupName, setGroupName] = useState("Gym Buddy");
  const [joinId, setJoinId] = useState("");

  const createGroup = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const groupRef = await addDoc(collection(db, "groups"), {
      name: groupName,
      createdBy: uid,
      memberCount: 1,
      createdAt: serverTimestamp()
    });
    await setDoc(doc(db, "groups", groupRef.id, "members", uid), {
      role: "owner",
      joinedAt: serverTimestamp(),
      muted: false
    });
    await updateDoc(doc(db, "users", uid), {
      currentGroupId: groupRef.id,
      updatedAt: serverTimestamp()
    });
  };

  const joinGroup = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !joinId) return;
    await setDoc(doc(db, "groups", joinId, "members", uid), {
      role: "member",
      joinedAt: serverTimestamp(),
      muted: false
    });
    await updateDoc(doc(db, "groups", joinId), {
      memberCount: increment(1)
    });
    await updateDoc(doc(db, "users", uid), {
      currentGroupId: joinId,
      updatedAt: serverTimestamp()
    });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18 }}>グループ作成</Text>
      <TextInput
        value={groupName}
        onChangeText={setGroupName}
        style={{ borderWidth: 1, padding: 8, marginVertical: 8 }}
      />
      <Button title="作成" onPress={createGroup} />
      <View style={{ height: 24 }} />
      <Text style={{ fontSize: 18 }}>グループ参加</Text>
      <TextInput
        placeholder="groupId"
        value={joinId}
        onChangeText={setJoinId}
        style={{ borderWidth: 1, padding: 8, marginVertical: 8 }}
      />
      <Button title="参加" onPress={joinGroup} />
    </View>
  );
}
