import React, { useRef, useState, useCallback } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingSvg from "@/assets/images/onboarding.svg";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Spacing, SCREEN_PADDING } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Data
 * ────────────────────────────────────────────────────────── */

interface OnboardingPage {
  title: string;
  subtitle: string;
}

const PAGES: OnboardingPage[] = [
  {
    title: "Meet your mood\ncompanion",
    subtitle:
      "Moody is your daily emotional intelligence partner — always here to listen, never to judge.",
  },
  {
    title: "Understand your\nemotions",
    subtitle:
      "Track how you feel, uncover patterns, and gain real insight into what drives your moods.",
  },
  {
    title: "Optimise your\nmental state",
    subtitle:
      "Personalised tips, breathing exercises, and daily check-ins to help you feel your best.",
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      setActiveIndex(index);
    },
    [],
  );

  const navigateToLogin = useCallback(() => {
    router.push("/(auth)/login");
  }, [router]);

  const navigateToSignup = useCallback(() => {
    router.push("/(auth)/signup");
  }, [router]);

  const isLastPage = activeIndex === PAGES.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* ── Illustration area (orange) ──────────────────── */}
      <View style={[styles.topSection, { paddingTop: insets.top + Spacing.xl }]}>
        <OnboardingSvg width={260} height={248} />
      </View>

      {/* ── Content pages ───────────────────────────────── */}
      <View style={styles.bottomSection}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
        >
          {PAGES.map((page, index) => (
            <View key={index} style={styles.page}>
              <Text style={styles.title}>{page.title}</Text>
              <Text style={styles.subtitle}>{page.subtitle}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Pagination dots ───────────────────────────── */}
        <View style={styles.dotsContainer}>
          {PAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* ── CTA Buttons ───────────────────────────────── */}
        <View
          style={[styles.ctaContainer, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          {isLastPage ? (
            <>
              <Button label="Log in" onPress={navigateToLogin} />
              <Button
                label="Sign up"
                variant="outline"
                onPress={navigateToSignup}
                style={styles.secondaryButton}
              />
            </>
          ) : (
            <Button
              label="Get started"
              onPress={() => {
                scrollRef.current?.scrollTo({
                  x: SCREEN_WIDTH * (activeIndex + 1),
                  animated: true,
                });
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  topSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSection: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: Spacing.xxl,
    minHeight: 320,
  },
  page: {
    width: SCREEN_WIDTH,
    paddingHorizontal: SCREEN_PADDING,
  },
  title: {
    ...Typography.hero,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  ctaContainer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: Spacing.xl,
  },
  secondaryButton: {
    marginTop: Spacing.md,
  },
});
