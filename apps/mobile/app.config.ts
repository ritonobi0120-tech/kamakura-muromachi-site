import "dotenv/config";

export default {
  expo: {
    name: "Gym Rally",
    slug: "gym-rally",
    scheme: "gymrally",
    version: "0.1.0",
    orientation: "portrait",
    platform: {
      android: {
        package: "com.example.gymrally"
      },
      ios: {
        bundleIdentifier: "com.example.gymrally"
      }
    },
    android: {
      package: "com.example.gymrally",
      googleServicesFile: process.env.EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES || undefined
    },
    ios: {
      bundleIdentifier: "com.example.gymrally",
      googleServicesFile: process.env.EXPO_PUBLIC_IOS_GOOGLE_SERVICES || undefined
    },
    extra: {
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      functionsEmulatorHost: process.env.EXPO_PUBLIC_FUNCTIONS_EMULATOR_HOST || "localhost"
    }
  }
};
