import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";

import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { Spacing, BorderRadius } from "@/constants/spacing";
import { useChatHistory, useSendMessage, type ChatMessage } from "@/hooks/useChat";

/* ──────────────────────────────────────────────────────────
 * Icons
 * ────────────────────────────────────────────────────────── */

const BackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={Colors.textPrimary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SendIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Typing indicator — three bouncing dots
 * ────────────────────────────────────────────────────────── */

const TypingIndicator: React.FC = () => (
  <View style={styles.typingBubble}>
    {[0, 1, 2].map((i) => (
      <View key={i} style={[styles.typingDot, { opacity: 0.3 + i * 0.2 }]} />
    ))}
    <Text style={styles.typingText}>Moody is thinking…</Text>
  </View>
);

/* ──────────────────────────────────────────────────────────
 * Helper
 * ────────────────────────────────────────────────────────── */

const INITIAL_GREETING: ChatMessage = {
  id: "greeting",
  content: "Hello! I'm Moody, your AI wellness companion. How are you feeling right now?",
  role: "ai",
  createdAt: new Date().toISOString(),
};

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const [inputText, setInputText] = useState("");

  // ── Data ─────────────────────────────────────────────────
  const { data: history, isLoading: historyLoading } = useChatHistory();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  // Prepend greeting before any history messages
  const messages: ChatMessage[] = [
    INITIAL_GREETING,
    ...(history ?? []),
  ];

  // ── Auto-scroll on new message ───────────────────────────
  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // ── Send ─────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || isSending) return;
    setInputText("");
    sendMessage(text);
  }, [inputText, isSending, sendMessage]);

  // ── Render message bubble ────────────────────────────────
  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isAI = item.role === "ai";
    return (
      <View style={[styles.messageBubble, isAI ? styles.aiBubble : styles.userBubble]}>
        <Text style={[styles.messageText, isAI ? styles.aiText : styles.userText]}>
          {item.content}
        </Text>
      </View>
    );
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <BackIcon />
        </Pressable>

        <View style={styles.headerCenter}>
          {/* AI Avatar dot */}
          <View style={styles.avatarDot} />
          <Text style={styles.headerTitle}>AI Companion</Text>
        </View>

        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* ── Message List ────────────────────────────────────── */}
      {historyLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={isSending ? <TypingIndicator /> : null}
        />
      )}

      {/* ── Input Area ──────────────────────────────────────── */}
      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
        <TextInput
          style={styles.inputField}
          placeholder="Message Moody…"
          placeholderTextColor={Colors.textTertiary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={2000}
          editable={!isSending}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <Pressable
          style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <SendIcon />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPlaceholder: { width: 44 },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  avatarDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4ADE80", // green pulse — "online"
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
  },

  /* Messages */
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  messageBubble: {
    maxWidth: "82%",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primaryLight,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: FontSize.md,
    lineHeight: 22,
    fontFamily: Typography.fontFamily,
  },
  aiText: { color: Colors.textPrimary },
  userText: { color: Colors.textPrimary, fontWeight: "500" },

  /* Typing indicator */
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  typingText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily,
    marginLeft: Spacing.xs,
  },

  /* Input */
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  inputField: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Colors.card,
    borderRadius: 22,
    paddingHorizontal: Spacing.base,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});
