export interface MoodDefinition {
  key: "awful" | "bad" | "okay" | "good" | "great";
  label: string;
  image: string;
  color: string;
  score: number;
  reflection: string;
  suggestedAction: string;
}

export const MOODS: MoodDefinition[] = [
  {
    key: "awful",
    label: "Awful",
    image: "/images/worst-face.png",
    color: "#EF5350",
    score: 1,
    reflection: "It is completely okay to feel overwhelmed. Your feelings are valid, and you don't have to carry them alone.",
    suggestedAction: "Try a 3-minute guided deep breathing session or talk to Moody AI.",
  },
  {
    key: "bad",
    label: "Sad",
    image: "/images/sad.png",
    color: "#64B5F6",
    score: 2,
    reflection: "Some days feel heavier than others. Taking a moment to acknowledge it is the first step toward relief.",
    suggestedAction: "Record a quick 30-second voice journal entry to untangle your thoughts.",
  },
  {
    key: "okay",
    label: "Calm",
    image: "/images/smile.png",
    color: "#9E9E9E",
    score: 3,
    reflection: "A balanced, peaceful state of mind is a wonderful foundation for mental clarity and stillness.",
    suggestedAction: "Listen to a soothing ambient soundscape to maintain your center.",
  },
  {
    key: "good",
    label: "Happy",
    image: "/images/smiley.png",
    color: "#F8A775",
    score: 4,
    reflection: "Your optimism is shining through! Celebrating the good moments helps anchor positive habits.",
    suggestedAction: "Write down three gratitude points in your daily journal.",
  },
  {
    key: "great",
    label: "Great",
    image: "/images/vey-happy-face.png",
    color: "#F07033",
    score: 5,
    reflection: "Peak positive energy! Channel this motivation into what brings you passion and joy.",
    suggestedAction: "Try a high-energy dance workout audio session to keep the momentum going.",
  },
];

export const CORE_FEATURES = [
  {
    id: "voice-call",
    badge: "Conversational AI",
    title: "Real-time AI Voice Companion",
    description:
      "Have natural, human-like voice conversations anytime. Powered by low-latency WebRTC, Moody listens empathetically, provides grounding exercises, and speaks with calming cadence.",
    icon: "microphone",
    highlight: "Low-latency natural speech",
  },
  {
    id: "voice-journal",
    badge: "Smart Transcribing",
    title: "Voice Memo to Styled Journal",
    description:
      "Simply speak your mind. Moody transcribes your words in real time, clears filler words, generates a meaningful title, and detects your underlying emotional tone.",
    icon: "journal",
    highlight: "Automatic mood inference",
  },
  {
    id: "chat-companion",
    badge: "Gemini 2.5 AI",
    title: "Context-Aware Chat Support",
    description:
      "Chat with an AI trained specifically on supportive mental wellness principles. Moody remembers recent emotional context to deliver truly personalized comfort.",
    icon: "chat",
    highlight: "Non-judgmental & confidential",
  },
  {
    id: "smart-analytics",
    badge: "Trend Insights",
    title: "Scientific Emotional Analytics",
    description:
      "Gain perspective on your wellness patterns with dynamic weekly curve charts, 30-day mood distributions, and personalized consistency streak indicators.",
    icon: "chart",
    highlight: "7-day trends & 30-day breakdowns",
  },
];

export const AUDIO_COLLECTIONS = [
  {
    category: "Relaxing Audios",
    subtitle: "Calm your mind, release tension, and drift into deep relaxation.",
    image: "/images/yoga.jpg",
    tracks: [
      { title: "In Pursuit", artist: "Siine", duration: "3:00" },
      { title: "Into the Night", artist: "Hallmore", duration: "3:00" },
      { title: "Supernovas", artist: "Hallman", duration: "3:00" },
    ],
  },
  {
    category: "Dance Workouts",
    subtitle: "Boost serotonin and energize your body with rhythm-driven movement.",
    image: "/images/workout.jpg",
    tracks: [
      { title: "Pose", artist: "ALICE", duration: "3:00" },
      { title: "Ur Face", artist: "LeDorean", duration: "3:00" },
      { title: "MENTAL", artist: "Manuelo Jersey", duration: "3:00" },
    ],
  },
];

export const MOCK_WEEKLY_STATS = [
  { day: "Mon", score: 3, label: "Calm" },
  { day: "Tue", score: 4, label: "Happy" },
  { day: "Wed", score: 2, label: "Sad" },
  { day: "Thu", score: 4, label: "Happy" },
  { day: "Fri", score: 5, label: "Great" },
  { day: "Sat", score: 5, label: "Great" },
  { day: "Sun", score: 4, label: "Happy" },
];

export const MOCK_EMOTION_BREAKDOWN = [
  { label: "Great", percentage: 38, color: "#F07033" },
  { label: "Happy", percentage: 32, color: "#F8A775" },
  { label: "Calm", percentage: 18, color: "#9E9E9E" },
  { label: "Sad", percentage: 8, color: "#64B5F6" },
  { label: "Awful", percentage: 4, color: "#EF5350" },
];
