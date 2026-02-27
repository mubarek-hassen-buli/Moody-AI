import React, { useState, useCallback } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Divider } from "@/components/ui/Divider";
import { SocialButton } from "@/components/ui/SocialButton";
import { Colors } from "@/constants/colors";
import { Typography, FontSize } from "@/constants/typography";
import { Spacing, SCREEN_PADDING, BorderRadius } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Icons
 * ────────────────────────────────────────────────────────── */

const ChevronLeftIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
      fill={Colors.textPrimary}
    />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length >= 6;

  const handleCreateAccount = useCallback(() => {
    // TODO: integrate with backend signup & validation
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/(tabs)" as any);
    }, 800);
  }, [router]);

  const handleGoogleSignup = useCallback(() => {
    // TODO: integrate Google OAuth
  }, []);

  const handleFacebookSignup = useCallback(() => {
    // TODO: integrate Facebook OAuth
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Back button ──────────────────────────────── */}
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeftIcon />
          </Pressable>

          {/* ── Header ───────────────────────────────────── */}
          <Text style={styles.heading}>Create account</Text>
          <Text style={styles.subtitleText}>
            Start your journey towards better emotional well-being today.
          </Text>

          {/* ── Form fields ──────────────────────────────── */}
          <TextInput
            label="Full name"
            placeholder="Your name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <TextInput
            label="Email"
            placeholder="Your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Password"
            placeholder="Min. 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            helperText="Must be at least 6 characters."
            style={styles.lastInput}
          />

          {/* ── Create Account button ────────────────────── */}
          <Button
            label="Create Account"
            onPress={handleCreateAccount}
            loading={loading}
            disabled={!isFormValid}
          />

          {/* ── Divider ──────────────────────────────────── */}
          <Divider />

          {/* ── Social buttons ───────────────────────────── */}
          <SocialButton provider="google" onPress={handleGoogleSignup} />
          <SocialButton provider="facebook" onPress={handleFacebookSignup} />

          {/* ── Login link ───────────────────────────────── */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.loginLink}>Log in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: Spacing.base,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  heading: {
    ...Typography.hero,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitleText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  lastInput: {
    marginBottom: Spacing.xl,
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  loginText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  loginLink: {
    ...Typography.link,
    color: Colors.primary,
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
});
