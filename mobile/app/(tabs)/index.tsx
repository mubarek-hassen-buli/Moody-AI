import React, { useState, useCallback, useEffect } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { useFonts } from "expo-font";

import { useRouter } from "expo-router";

import { MoodSelector, type MoodSelectorState } from "@/components/home/MoodSelector";
import { ActivityCard } from "@/components/home/ActivityCard";
import { QuoteCard } from "@/components/home/QuoteCard";
import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { Spacing, SCREEN_PADDING, BorderRadius } from "@/constants/spacing";
import { useCreateMood, useTodayMood, type MoodLevel, MOOD_KEYS } from "@/hooks/useMood";
import { JOURNAL_KEYS } from "@/hooks/useJournal";
import { AUDIO_KEYS } from "@/hooks/useAudio";
import { useProfile } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";

// ── Activity Card Images ──────────────────────────────────
const yogaImg = require("@/assets/images/yoga.jpg");
const workoutImg = require("@/assets/images/workout.jpg");
const journalImg = require("@/assets/images/journal.jpg");

/* ──────────────────────────────────────────────────────────
 * Inline Icons
 * ────────────────────────────────────────────────────────── */

const BellIcon: React.FC = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0"
      stroke={Colors.textPrimary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SearchIcon: React.FC = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={Colors.textTertiary} strokeWidth={2} />
    <Path
      d="M21 21l-4.35-4.35"
      stroke={Colors.textTertiary}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────── */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectorState, setSelectorState] = useState<MoodSelectorState>('idle');
  const createMood = useCreateMood();
  const { data: profile } = useProfile();

  /* ── Server source of truth for today's mood ──────────── */
  const { data: todayMood, isSuccess: todayMoodLoaded } = useTodayMood();

  const [fontsLoaded] = useFonts({
    BradoQuena: require("@/assets/fonts/BradoQuena-Regular.ttf"),
  });

  const displayName = profile?.name ?? "Friend";
  const avatarUrl = profile?.avatarUrl ?? null;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const queryClient = useQueryClient();

  /* ── Restore mood state from server ─────────────────────
   * When the server tells us the user already logged today,
   * we mark the selector as "confirmed" immediately.
   * This survives sign-out, reinstall, and cache clears.
   * ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!todayMoodLoaded) return;

    if (todayMood) {
      setSelectedMood(todayMood.mood);
      setSelectorState('confirmed');
    } else {
      // No mood logged today — show the picker
      setSelectedMood(null);
      setSelectorState('idle');
    }
  }, [todayMoodLoaded, todayMood]);

  // Prefetch all other tab data in the background as soon as the home
  // screen mounts. This warms TanStack's cache so Journal, Stats, and
  // Audio screens render without a loading spinner on first visit.
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: MOOD_KEYS.weekly,
      queryFn: async () => { const { data } = await api.get('/mood/weekly'); return data.data; },
      staleTime: 10 * 60 * 1000,
    });
    queryClient.prefetchQuery({
      queryKey: MOOD_KEYS.stats,
      queryFn: async () => { const { data } = await api.get('/mood/stats'); return data.data; },
      staleTime: 10 * 60 * 1000,
    });
    queryClient.prefetchQuery({
      queryKey: JOURNAL_KEYS.all,
      queryFn: async () => { const { data } = await api.get('/journal'); return data.data; },
      staleTime: 5 * 60 * 1000,
    });
    queryClient.prefetchQuery({
      queryKey: AUDIO_KEYS.byCategory('relaxing'),
      queryFn: async () => { const { data } = await api.get('/audio/relaxing'); return data.data; },
      staleTime: 30 * 60 * 1000,
    });
    queryClient.prefetchQuery({
      queryKey: AUDIO_KEYS.byCategory('workout'),
      queryFn: async () => { const { data } = await api.get('/audio/workout'); return data.data; },
      staleTime: 30 * 60 * 1000,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const handleMoodSelect = useCallback((key: string) => {
    // If already confirmed, don't allow re-selection
    if (selectorState === 'confirmed') return;

    // Cancel any in-flight mutation before starting a new one
    createMood.reset();
    setSelectedMood(key);
    setSelectorState('pending');

    createMood.mutate(
      { mood: key as MoodLevel },
      {
        onSuccess: () => {
          setSelectorState('confirmed');
        },
        onError: () => {
          // API failed — let the user try again
          setSelectorState('idle');
          setSelectedMood(null);
        },
      },
    );
  }, [selectorState, createMood]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Top Header Section (Edge-to-Edge) ──────────────── */}
        <View style={[styles.topSection, { paddingTop: insets.top + Spacing.md }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.homeAvatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>{initials || "😊"}</Text>
                )}
              </View>
              <View style={styles.headerTextBlock}>
                <Text style={styles.greeting}>Hi 👋</Text>
                <Text style={styles.userName}>{displayName}</Text>
              </View>
            </View>
            
          </View>

          <Text style={styles.bannerGreeting}>{getGreeting()}</Text>
          <Text style={styles.bannerTitle}>
            Welcome back,{"\n"}how's your mind{"\n"}today?
          </Text>

          {/* Search bar */}
          <Pressable
            style={styles.searchBar}
            onPress={() => router.push("/search" as any)}
          >
            <SearchIcon />
            <Text style={styles.searchPlaceholder}>Search...</Text>
          </Pressable>
        </View>

        {/* ── Main Content Container ─────────────────────── */}
        <View style={styles.mainContent}>
          {/* ── Daily Mood ─────────────────────────────────── */}
          <MoodSelector
            selectedMood={selectedMood}
            selectorState={selectorState}
            onSelectMood={handleMoodSelect}
            style={styles.moodSelector}
          />

          {/* ── Activities ─────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Activities</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activitiesRow}
        >
          <ActivityCard
            title="Relaxing Audios"
            subtitle="Calm your mind"
            backgroundImage={yogaImg}
            style={{ width: 160 }}
            onPress={() => router.push("/relaxing-audios" as any)}
          />
          <ActivityCard
            title="Dance Workout"
            subtitle="Get your body moving"
            backgroundImage={workoutImg}
            style={{ width: 160 }}
            onPress={() => router.push("/dance-workouts" as any)}
          />
          <ActivityCard
            title="Mood Journal"
            subtitle="Reflect on your day"
            backgroundImage={journalImg}
            style={{ width: 160 }}
            onPress={() => router.navigate("/(tabs)/journal" as any)}
          />
        </ScrollView>

          {/* ── Daily Quote ────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Daily Inspiration</Text>
          <QuoteCard />
        </View>
      </ScrollView>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  /* Top Section */
  topSection: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primaryDark,
  },
  homeAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerTextBlock: {
    justifyContent: "center",
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },

  /* Banner Text & Search */
  bannerGreeting: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    opacity: 0.8,
  },
  bannerTitle: {
    fontSize: FontSize.hero,
    lineHeight: FontSize.hero * 1.2,
    fontFamily: "BradoQuena",
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.pill,
    height: 48,
    paddingHorizontal: Spacing.base,
    alignSelf: "stretch", // full width within padding
  },
  searchPlaceholder: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },

  /* Main Content */
  mainContent: {
    paddingHorizontal: SCREEN_PADDING,
  },
  moodSelector: {
    marginTop: Spacing.xl,
  },

  /* Sections */
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.base,
  },

  /* Activities */
  activitiesRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  activityCardLeft: {
    marginRight: 0,
  },
  activityCardRight: {
    marginLeft: 0,
  },

});
