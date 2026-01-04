import React, { useEffect, useMemo, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import * as Notifications from "expo-notifications";

import { auth } from "./src/services/firebase";
import { registerForPushNotificationsAsync, setNotificationCategories } from "./src/notifications/notifications";
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import TimeInputScreen from "./src/screens/TimeInputScreen";
import GroupScreen from "./src/screens/GroupScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  TimeInput: { groupId: string; requestId: string; selectedDay: string };
  Group: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<null | { uid: string }>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid });
      } else {
        setUser(null);
      }
      setInitialized(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    setNotificationCategories();
    registerForPushNotificationsAsync();
  }, []);

  const initialRoute = useMemo(() => {
    if (!initialized) return "Auth";
    return user ? "Home" : "Auth";
  }, [initialized, user]);

  if (!initialized) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="TimeInput" component={TimeInputScreen} />
            <Stack.Screen name="Group" component={GroupScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
