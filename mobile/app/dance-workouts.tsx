import React from "react";
import { AudioList, AudioTrack } from "@/components/home/AudioList";

const MOCK_TRACKS: AudioTrack[] = [
  { id: "d1", title: "Morning Energy Burst", duration: "15:00", author: "Coach Sarah" },
  { id: "d2", title: "Cardio Hip Hop", duration: "30:00", author: "Moody-AI Fitness" },
  { id: "d3", title: "Quick Sweat", duration: "10:00", author: "Coach Sarah" },
  { id: "d4", title: "Weekend Vibe Dance", duration: "45:00", author: "DJ Marcus" },
];

export default function DanceWorkoutsScreen() {
  return (
    <AudioList 
      title="Dance Workout" 
      subtitle="Get your body moving and grooving" 
      tracks={MOCK_TRACKS} 
    />
  );
}
