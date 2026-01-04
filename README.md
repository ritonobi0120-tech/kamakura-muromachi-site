# Gym Rally (MVP)

通知を起点に「ジム行った！」→「いつ行く？」→「やった！」のラリーが回る最小構成のアプリです。Android実機での動作確認を最優先にしています。

## 構成
- フロント: Expo (React Native) + TypeScript
  - expo-notifications / expo-auth-session / firebase modular SDK
- バックエンド: Firebase
  - Authentication (Google Sign-In)
  - Firestore
  - Cloud Functions (Node 20)
  - Cloud Messaging (FCM)
- 開発: Firebase Emulator Suite 対応

## 事前準備
- Node 20+
- Firebase CLI (`npm i -g firebase-tools`)
- Firebase プロジェクト
  - Authentication: Google を有効化
  - Firestore (※本番はBilling有効化が必要な可能性あり)
  - Cloud Messaging (Android実機のFCM送信に必須)

## 重要な決め打ち（READMEで明示）
- タイムゾーンは `Asia/Tokyo` 固定
- ローカル通知で Remind（30分前/時間/30分後）をスケジュール（端末依存。将来はサーバー送信へ移行可能）
- 招待コードは `groupId` を共有（短縮化は未対応）

## ディレクトリ構成
```
apps/mobile/   # Expo アプリ
functions/     # Cloud Functions
firebase.json  # Emulator 設定
firestore.rules
```

## 環境変数
`apps/mobile/.env` を作成し、Expo Public 変数を設定します。

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_FUNCTIONS_EMULATOR_HOST=localhost
```

- Android の `google-services.json` / iOS の `GoogleService-Info.plist` を入れる場合、
  - `EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES=/absolute/path/to/google-services.json`
  - `EXPO_PUBLIC_IOS_GOOGLE_SERVICES=/absolute/path/to/GoogleService-Info.plist`

## Emulator での起動手順
```
firebase emulators:start
```

```
cd apps/mobile
npm install
npm run start
```

- Expo の開発サーバーから Android エミュレーター or 実機に接続します。
- Firestore/Functions/Auth は Emulator を使用します。

## 実機でFCM通知を確認する（Android）
1. Firebase プロジェクトの Cloud Messaging を有効化
2. `apps/mobile` に `google-services.json` を配置（`EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES` を設定）
3. EAS Build もしくは `expo run:android` で実機向けビルド
4. 端末でアプリ起動→通知権限を許可
5. グループ参加→Check-in 実行で通知が届くことを確認

> Emulator利用時はFCM通知は届きません。実機＋実プロジェクトが必要です。

## 使い方（MVP）
1. ログイン
2. グループ作成 or `groupId` で参加
3. 「ジム行った！」を押す
4. 受信者が通知上で日付→時刻を選択
5. plannedAt にローカルRemindが3件届く
6. 「やった！」で Done 通知、返球が発生

## 通知アクション
- Commit Step1 (日付): `commit_day` カテゴリ
  - TODAY / TOMORROW / DAY_AFTER / CANT
- Commit Step2 (時刻): `commit_time` カテゴリ
  - 07:00 / 18:00 / 19:00 / 21:00 / OTHER

## Firestore 主要コレクション
- `/users/{uid}`
  - `fcmTokens: string[]`
  - `settings: { quietHoursStart, quietHoursEnd, notifyEnabled }`
- `/groups/{groupId}`
- `/groups/{groupId}/members/{uid}`
- `/groups/{groupId}/events/{eventId}`
- `/groups/{groupId}/requests/{requestId}`
- `/groups/{groupId}/counters/{yyyy-MM-dd}`

## Cloud Functions
- `checkIn(groupId)`
- `commitSelectDay(groupId, requestId, dayKey)`
- `commitSelectTime(groupId, requestId, timePreset | OTHER)`
- `done(groupId)`
- `transferRequestIfUnanswered(groupId?)`

## 典型トラブル
- Billing が必要なケース: Firestore/FCM はプロジェクト設定により Billing が必要です。
- 通知が届かない: 実機で通知権限の許可、`google-services.json` の配置、FCM 有効化を確認してください。
- Emulator で push できない: Emulator は FCM を送れません（実機テスト必須）。

## MVP 受け入れ条件に対する対応
- 2人グループで通知上の Commit（Step1/Step2）
- plannedAt にローカルRemind（30分前/時間/30分後）
- Done 後の返球（2人/3人以上で Next 選出）
- 1日3往復で返球停止（Done通知は送る）
- transfer は手動Callable/定期スケジュールで実行
