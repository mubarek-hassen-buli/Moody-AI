import React, { useState } from "react";
import { View, Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  useDerivedValue,
} from "react-native-reanimated";
import Svg, { Path, Rect, Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { Typography, FontSize } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";

const AnimatedPath = Animated.createAnimatedComponent(Path);

/* ──────────────────────────────────────────────────────────
 * Icons
 * ────────────────────────────────────────────────────────── */

const HomeIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M4 10V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 12L12 3L2 12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="10" y="14" width="4" height="8" fill={color} />
  </Svg>
);

const InsightsIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="8" cy="10" r="1.5" fill={color} />
    <Circle cx="8" cy="16" r="1.5" fill={color} />
    <Path d="M12 10H16M12 16H16" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ChatIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.61 20 9.29415 19.6644 8.12586 19.0664L3 20.5L4.69749 16.0354C3.6262 14.7336 3 13.1788 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="8" cy="11.5" r="1.5" fill={color} />
    <Circle cx="12" cy="11.5" r="1.5" fill={color} />
    <Circle cx="16" cy="11.5" r="1.5" fill={color} />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke="#FFF" strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Constants & Colors
 * ────────────────────────────────────────────────────────── */

// Standardize route to icon mapping
const TAB_ICONS: Record<string, (props: { color: string }) => React.JSX.Element> = {
  index: HomeIcon,
  statistics: InsightsIcon,
  journal: ChatIcon,
};

const BG_DARK = "#252525";    // Outer gooey container
const ITEM_BG = "#3D3D3D";    // Inner pill/circle background
const TEXT_ACTIVE = "#FFFFFF";
const ICON_INACTIVE = "#A0A0A0";
const ICON_ACTIVE = "#FFFFFF";
const BLUE_BTN = "#2B8CFF";

// Layout metrics
const TAB_HEIGHT = 64;       // Outer container height
const ICON_SIZE = 48;        // Inner item height (and width when inactive)
const EXPANDED_WIDTH = 110;  // Inner item width when active
const INNER_GAP = 8;         // Gap between inner items

/* ──────────────────────────────────────────────────────────
 * Custom Tab Bar
 * ────────────────────────────────────────────────────────── */

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  
  // Reanimated shared value for active index
  const activeIndex = useSharedValue(state.index);

  React.useEffect(() => {
    activeIndex.value = withSpring(state.index, { damping: 14, stiffness: 120, mass: 0.8 });
  }, [state.index, activeIndex]);

  // Derived Values for Inner Item Positions & Widths
  const items = [0, 1, 2].map((i) => {
    return useDerivedValue(() => {
      // Widths
      const w0 = interpolate(activeIndex.value, [0, 1, 2], [EXPANDED_WIDTH, ICON_SIZE, ICON_SIZE]);
      const w1 = interpolate(activeIndex.value, [0, 1, 2], [ICON_SIZE, EXPANDED_WIDTH, ICON_SIZE]);
      const w2 = interpolate(activeIndex.value, [0, 1, 2], [ICON_SIZE, ICON_SIZE, EXPANDED_WIDTH]);

      // X positions
      const x0 = 8;
      const x1 = x0 + w0 + INNER_GAP;
      const x2 = x1 + w1 + INNER_GAP;

      const widths = [w0, w1, w2];
      const positions = [x0, x1, x2];

      return { w: widths[i], x: positions[i] };
    });
  });

  // Animated gooey background SVG Path
  const animatedProps = useAnimatedProps(() => {
    const w0 = interpolate(activeIndex.value, [0, 1, 2], [EXPANDED_WIDTH, ICON_SIZE, ICON_SIZE]);
    const w1 = interpolate(activeIndex.value, [0, 1, 2], [ICON_SIZE, EXPANDED_WIDTH, ICON_SIZE]);
    const w2 = interpolate(activeIndex.value, [0, 1, 2], [ICON_SIZE, ICON_SIZE, EXPANDED_WIDTH]);

    const x0 = 8;
    const x1 = x0 + w0 + INNER_GAP;
    const x2 = x1 + w1 + INNER_GAP;

    // Outer hulls
    const ox0 = x0 - 8;
    const orx0 = ox0 + w0 + 16;
    const ox1 = x1 - 8;
    const orx1 = ox1 + w1 + 16;
    const ox2 = x2 - 8;
    const orx2 = ox2 + w2 + 16;

    const gap = -8; // Overlap for the gooey effect
    const h = TAB_HEIGHT;
    const r = 32;
    const dip = 6; // Depth of the concavity between items

    // Top bridge 0 -> 1
    const t0_P0 = orx0 - 16;
    const t0_M = orx0 + gap / 2;
    const t0_P3 = ox1 + 16;
    const t0_C1 = `C ${t0_P0 + 8},0 ${t0_M - 4},${dip} ${t0_M},${dip}`;
    const t0_C2 = `C ${t0_M + 4},${dip} ${t0_P3 - 8},0 ${t0_P3},0`;

    // Top bridge 1 -> 2
    const t1_P0 = orx1 - 16;
    const t1_M = orx1 + gap / 2;
    const t1_P3 = ox2 + 16;
    const t1_C1 = `C ${t1_P0 + 8},0 ${t1_M - 4},${dip} ${t1_M},${dip}`;
    const t1_C2 = `C ${t1_M + 4},${dip} ${t1_P3 - 8},0 ${t1_P3},0`;

    // Bottom bridge 2 -> 1 (drawn right to left)
    const b1_P0 = ox2 + 16;
    const b1_M = orx1 + gap / 2;
    const b1_P3 = orx1 - 16;
    const b1_C1 = `C ${b1_P0 - 8},${h} ${b1_M + 4},${h - dip} ${b1_M},${h - dip}`;
    const b1_C2 = `C ${b1_M - 4},${h - dip} ${b1_P3 + 8},${h} ${b1_P3},${h}`;

    // Bottom bridge 1 -> 0
    const b0_P0 = ox1 + 16;
    const b0_M = orx0 + gap / 2;
    const b0_P3 = orx0 - 16;
    const b0_C1 = `C ${b0_P0 - 8},${h} ${b0_M + 4},${h - dip} ${b0_M},${h - dip}`;
    const b0_C2 = `C ${b0_M - 4},${h - dip} ${b0_P3 + 8},${h} ${b0_P3},${h}`;

    const d = `
      M ${ox0 + r},0
      L ${t0_P0},0
      ${t0_C1}
      ${t0_C2}
      L ${t1_P0},0
      ${t1_C1}
      ${t1_C2}
      L ${orx2 - r},0
      A ${r},${r} 0 0,1 ${orx2},${r}
      A ${r},${r} 0 0,1 ${orx2 - r},${h}
      L ${b1_P0},${h}
      ${b1_C1}
      ${b1_C2}
      L ${b0_P0},${h}
      ${b0_C1}
      ${b0_C2}
      L ${ox0 + r},${h}
      A ${r},${r} 0 0,1 ${ox0},${h - r}
      A ${r},${r} 0 0,1 ${ox0 + r},0
      Z
    `;
    return { d };
  });

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
      
      {/* ── Grouped Gooey Tabs ────────────────────────────── */}
      <View style={styles.segmentContainer}>
        {/* The SVG Morphing Web Background */}
        <Svg width={300} height={TAB_HEIGHT} style={StyleSheet.absoluteFill}>
          <AnimatedPath animatedProps={animatedProps} fill={BG_DARK} />
        </Svg>

        {/* The Inner Absolute Items */}
        {state.routes.map((route, index) => {
          if (route.name === "profile") return null;

          // Override label for journal to match design perfectly
          let label = "Home";
          if (route.name === "statistics") label = "Insights";
          if (route.name === "journal") label = "AI Chat";

          const isFocused = state.index === index;
          const Icon = TAB_ICONS[route.name] || HomeIcon;
          
          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          const itemAnimatedStyle = useAnimatedStyle(() => ({
            width: items[index].value.w,
            left: items[index].value.x,
          }));

          const textAnimatedStyle = useAnimatedStyle(() => {
             const progress = interpolate(activeIndex.value,
               [index - 1, index, index + 1],
               [-1, 1, -1],
               "clamp"
             );
             // When this index is active, progress = 1.
             // When inactive, progress = -1.
             const isActiveFloat = Math.max(0, progress); // 1 when active, 0 otherwise

             const opacity = withTiming(isActiveFloat > 0.5 ? 1 : 0, { duration: 200 });
             const translateX = interpolate(isActiveFloat, [0, 1], [-10, 0]);
             return { opacity, transform: [{ translateX }] };
          });

          return (
            <Animated.View key={route.key} style={[styles.tabItem, itemAnimatedStyle]}>
              <Pressable onPress={onPress} style={styles.pressableFill}>
                <View style={styles.iconWrapper}>
                  <Icon color={isFocused ? ICON_ACTIVE : ICON_INACTIVE} />
                </View>
                <Animated.View style={[styles.labelWrapper, textAnimatedStyle]} pointerEvents="none">
                  <Text style={styles.labelText} numberOfLines={1}>{label}</Text>
                </Animated.View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {/* ── Floating Action Button (Blue) & Menu ─────────── */}
      <View style={styles.fabContainer}>
        {fabMenuVisible && (
          <View style={styles.fabMenu}>
            <Pressable 
              style={styles.fabMenuItem} 
              onPress={() => {
                setFabMenuVisible(false);
                router.push("/chat" as any);
              }}
            >
              <Text style={styles.fabMenuText}>💬 Chat</Text>
            </Pressable>
            <View style={styles.fabMenuDivider} />
            <Pressable 
              style={styles.fabMenuItem} 
              onPress={() => {
                setFabMenuVisible(false);
                console.log("Call feature coming later");
              }}
            >
              <Text style={styles.fabMenuText}>📞 Call</Text>
            </Pressable>
          </View>
        )}
        
        <Pressable 
          style={styles.fab} 
          accessibilityLabel="Create new"
          onPress={() => setFabMenuVisible(!fabMenuVisible)}
        >
          <PlusIcon />
        </Pressable>
      </View>
      
    </View>
  );
}

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  segmentContainer: {
    width: 260, // Total outer width for 3 items
    height: TAB_HEIGHT,
    position: "relative",
  },
  tabItem: {
    position: "absolute",
    top: 8,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: ITEM_BG,
    overflow: "hidden",
    flexDirection: "row",
  },
  pressableFill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  labelWrapper: {
    position: "absolute",
    left: ICON_SIZE - 4,
    right: 0,
    height: "100%",
    justifyContent: "center",
    zIndex: 1,
  },
  labelText: {
    color: TEXT_ACTIVE,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Typography.fontFamily,
  },
  fabContainer: {
    width: TAB_HEIGHT,
    height: TAB_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  fab: {
    width: TAB_HEIGHT - 8,
    height: TAB_HEIGHT - 8,
    borderRadius: (TAB_HEIGHT - 8) / 2,
    backgroundColor: BLUE_BTN,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  fabMenu: {
    position: "absolute",
    bottom: TAB_HEIGHT + 10,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
    width: 140,
  },
  fabMenuItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  fabMenuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    width: "100%",
  },
  fabMenuText: {
    fontSize: FontSize.md,
    fontWeight: "500",
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
  },
});
