import React from "react";
import { AudioList, AudioTrack } from "@/components/home/AudioList";

const MOCK_TRACKS: AudioTrack[] = [
  { id: "r1", title: "Deep Sleep River", duration: "45:00", author: "Dr. Lilian" },
  { id: "r2", title: "Morning Calm", duration: "10:00", author: "Moody-AI Originals" },
  { id: "r3", title: "Anxiety Relief", duration: "15:00", author: "Sarah Jenkins" },
  { id: "r4", title: "Focus Forest", duration: "60:00", author: "Moody-AI Originals" },
  { id: "r5", title: "Evening Wind Down", duration: "20:00", author: "Dr. Lilian" },
];

export default function RelaxingAudiosScreen() {
  return (
    <AudioList 
      title="Relaxing Audios" 
      subtitle="Calm your mind and reset" 
      tracks={MOCK_TRACKS} 
    />
  );
}
