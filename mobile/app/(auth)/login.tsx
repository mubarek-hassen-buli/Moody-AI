import React, { useState, useCallback } from "react";
import {
  Alert,
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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConnect = useCallback(async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      const { useAuthStore } = await import("@/hooks/useAuth");
      await useAuthStore.getState().signIn(email.trim(), password);
      router.replace("/(tabs)" as any);
    } catch (error: any) {
      Alert.alert("Login Failed", error?.message ?? "Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }, [email, password, router]);

  const handleGoogleLogin = useCallback(() => {
    // TODO: integrate Google OAuth
  }, []);

  const handleFacebookLogin = useCallback(() => {
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
          <Text style={styles.heading}>Log in</Text>
          <Text style={styles.termsText}>
            By logging in, you agree to our{" "}
            <Text style={styles.link}>Terms of Use</Text>.
          </Text>

          {/* ── Email input ──────────────────────────────── */}
          <TextInput
            label="Email"
            placeholder="Your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.inputSection}
          />

          {/* ── Password input ────────────────────────────── */}
          <TextInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.inputSection}
          />

          {/* ── Connect button ───────────────────────────── */}
          <Button
            label="Connect"
            onPress={handleConnect}
            loading={loading}
            disabled={email.trim().length === 0 || password.trim().length < 6}
          />

          {/* ── Divider ──────────────────────────────────── */}
          <Divider />

          {/* ── Social buttons ───────────────────────────── */}
          <SocialButton provider="google" onPress={handleGoogleLogin} />
          <SocialButton provider="facebook" onPress={handleFacebookLogin} />

          {/* ── Privacy policy ────────────────────────────── */}
          <Text style={styles.privacyText}>
            For more information, please see our{" "}
            <Text style={styles.link}>Privacy policy</Text>.
          </Text>
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
  termsText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  link: {
    color: Colors.textPrimary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  inputSection: {
    marginBottom: Spacing.xl,
  },
  privacyText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: "center",
    marginTop: Spacing.lg,
    fontSize: FontSize.xs,
  },
});
