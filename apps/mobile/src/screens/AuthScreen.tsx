import React, { useEffect } from "react";
import { Button, View, Text } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential, signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import Constants from "expo-constants";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AuthScreen() {
  const extra = Constants.expoConfig?.extra || {};
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: extra.googleWebClientId,
    androidClientId: extra.googleAndroidClientId,
    iosClientId: extra.googleIosClientId
  });

  useEffect(() => {
    const signIn = async () => {
      if (response?.type === "success") {
        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const userCred = await signInWithCredential(auth, credential);
        await setDoc(
          doc(db, "users", userCred.user.uid),
          {
            displayName: userCred.user.displayName || "",
            photoURL: userCred.user.photoURL || "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      }
    };
    signIn();
  }, [response]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Gym Rally</Text>
      <Button title="Googleでログイン" disabled={!request} onPress={() => promptAsync()} />
      <View style={{ height: 12 }} />
      <Button title="ログアウト" onPress={() => signOut(auth)} />
    </View>
  );
}
