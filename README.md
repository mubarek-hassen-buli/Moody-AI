# Moody AI 🌿

Moody AI is an intelligent, beautifully designed mood tracker and mental wellness companion. It combines the power of journaling, daily check-ins, statistical insights, and an advanced AI companion to help you understand and improve your mental well-being over time.

---

## ✨ Features

- **Mood Tracking:** Log your daily moods and identify simple patterns over time.
- **AI Voice Calling (Vapi):** Have real-time, natural voice conversations with Moody's AI companion for support and reflection.
- **AI Chat Companion:** Text-based chat with Gemini-powered AI, context-aware of your mood history.
- **Voice Journaling:** Record voice memos and watch them transcribe into styled journal entries in real-time.
- **Smart Analytics:** View beautifully rendered charts (React Native Gifted Charts) breaking down your emotional trends.
- **Daily Quotes:** Automated motivational quotes sent every morning to start your day right.
- **Push Notifications:** Reminders to log your mood and daily uplifting messages powered by Expo Notifications.
- **Cross-Platform:** Built natively for iOS and Android using React Native & Expo.

---

## 🛠️ Tech Stack

### Mobile App (Frontend)
- **Framework:** React Native / Expo (SDK 54)
- **Navigation:** Expo Router (File-based routing)
- **Styling:** Custom CSS/StyleSheet system with centralized tokens
- **State Management:** Zustand
- **Data Fetching & Caching:** TanStack Query (React Query)
- **Key Libraries:**
  - `@vapi-ai/react-native` (AI Voice Calls)
  - `@siteed/expo-audio-studio` (Voice Journaling & Audio processing)
  - `react-native-gifted-charts` (Data visualization)
  - `expo-notifications` (Push notifications)

### Backend
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL (hosted on Neon)
- **ORM:** Drizzle ORM
- **Authentication:** Supabase Auth (JWT)
- **Integrations:**
  - **Gemini AI API:** AI companion text chats
  - **Cloudinary:** Media upload & storage
  - **Expo Server SDK:** Push notification delivery

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Expo CLI
- A PostgreSQL Database (e.g., Neon)
- Supabase Project (for Auth)
- API Keys: Gemini, Vapi, Cloudinary

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
DATABASE_URL=your_neon_db_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_key
GEMINI_API_KEY_VOICE=your_gemini_voice_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Start the backend server:
```bash
# Push database schema
npx drizzle-kit push

# Start development server
npm run start:dev
```

### 2. Mobile Setup

```bash
cd mobile
npm install
```

Create a `.env` file in the `mobile` directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://your-local-ip:3000/api
EXPO_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
EXPO_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
```

Start the Expo server:
```bash
npx expo start
```

---

## 📦 Deployment

### Backend (Docker & Render)
The backend is fully containerized using a multi-stage `Dockerfile`.
1. Connect your repository to Render.
2. Select "Docker" as the runtime.
3. Set the Root Directory to `backend`.
4. Add your `.env` variables to the Render dashboard.

### Mobile (EAS Build)
Built and deployed via Expo Application Services (EAS).
```bash
# Build Android APK
eas build --profile apk --platform android

# Build iOS Simulator
eas build --profile simulator --platform ios
```

---

## 📄 License
This project is open-source and available under the MIT License.
