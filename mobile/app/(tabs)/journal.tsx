import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Spacing, SCREEN_PADDING } from "@/constants/spacing";

/**
 * Journal tab placeholder.
 *
 * Will be replaced with the full journal feature in a later sprint.
 */
export default function JournalScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={[styles.content, { paddingTop: insets.top + Spacing.xl }]}>
        <Text style={styles.heading}>Journal</Text>
        <Text style={styles.subtitle}>
          Your mood journal entries will appear here.
        </Text>
        <Text style={styles.emoji}>📝</Text>
        <Text style={styles.placeholder}>Coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  heading: {
    ...Typography.hero,
    color: Colors.textPrimary,
    alignSelf: "flex-start",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    alignSelf: "flex-start",
    marginBottom: Spacing.massive,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  placeholder: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
});
