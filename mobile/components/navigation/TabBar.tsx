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
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M4 10V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 12L12 3L2 12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="10" y="14" width="4" height="8" fill={color} />
  </Svg>
);

const InsightsIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="8" cy="10" r="1.5" fill={color} />
    <Circle cx="8" cy="16" r="1.5" fill={color} />
    <Path d="M12 10H16M12 16H16" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const JournalIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.61 20 9.29415 19.6644 8.12586 19.0664L3 20.5L4.69749 16.0354C3.6262 14.7336 3 13.1788 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="8" cy="11.5" r="1.5" fill={color} />
    <Circle cx="12" cy="11.5" r="1.5" fill={color} />
    <Circle cx="16" cy="11.5" r="1.5" fill={color} />
  </Svg>
);

const ProfileIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} />
    <Path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke="#FFF" strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────── */

const TAB_ICONS: Record<string, (props: { color: string }) => React.JSX.Element> = {
  index: HomeIcon,
  journal: JournalIcon,
  statistics: InsightsIcon,
  profile: ProfileIcon,
};

const TAB_LABELS: Record<string, string> = {
  index: "Home",
  journal: "Journal",
  statistics: "Insights",
  profile: "Profile",
};

const BG_DARK    = "#252525";
const ITEM_BG    = "#3D3D3D";
const ICON_INACTIVE = "#A0A0A0";
const ICON_ACTIVE   = "#FFFFFF";
const BLUE_BTN   = "#2B8CFF";
const TEXT_ACTIVE = "#FFFFFF";

// Sizing — tuned for 4 tabs on the narrowest supported device
const TAB_HEIGHT       = 60;
const ICON_SIZE        = 44;   // square icon area
const EXPANDED_WIDTH   = 88;   // width of the active pill
const INNER_GAP        = 5;    // gap between pills
const SEGMENT_WIDTH    = 278;  // total width of the gooey container

/* ──────────────────────────────────────────────────────────
 * CustomTabBar
 * ────────────────────────────────────────────────────────── */

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets     = useSafeAreaInsets();
  const router     = useRouter();
  const [fabOpen, setFabOpen] = useState(false);

  const activeIndex = useSharedValue(state.index);

  React.useEffect(() => {
    activeIndex.value = withSpring(state.index, {
      damping: 14, stiffness: 120, mass: 0.8,
    });
  }, [state.index, activeIndex]);

  /* ── Derived item widths and positions ─────────────────── */

  const NUM_TABS = 4;

  // For each tab, compute its animated width & left position
  const tabItems = Array.from({ length: NUM_TABS }, (_, i) =>
    useDerivedValue(() => {
      // Widths for all 4 tabs at each active index
      const inputRange  = [0, 1, 2, 3];
      const widths = [0, 1, 2, 3].map((j) =>
        j === i ? EXPANDED_WIDTH : ICON_SIZE
      );
      const w = interpolate(activeIndex.value, inputRange, widths);

      // Compute positions left-to-right from width sequence
      const allWidths = [0, 1, 2, 3].map((j) => {
        const out = [0, 1, 2, 3].map((k) => k === j ? EXPANDED_WIDTH : ICON_SIZE);
        return interpolate(activeIndex.value, inputRange, out);
      });

      let x = 8; // left padding
      for (let k = 0; k < i; k++) {
        x += allWidths[k] + INNER_GAP;
      }

      return { w, x };
    })
  );

  /* ── Animated gooey background ─────────────────────────── */

  const animatedProps = useAnimatedProps(() => {
    const inp = [0, 1, 2, 3];
    const W = [0, 1, 2, 3].map((j) => {
      const out = [0, 1, 2, 3].map((k) => (k === j ? EXPANDED_WIDTH : ICON_SIZE));
      return interpolate(activeIndex.value, inp, out);
    });

    // Left edges of each pill
    const X: number[] = [];
    X[0] = 8;
    X[1] = X[0] + W[0] + INNER_GAP;
    X[2] = X[1] + W[1] + INNER_GAP;
    X[3] = X[2] + W[2] + INNER_GAP;

    // Outer hull edges (outer 8px padding)
    const OL = X.map((x) => x - 8);
    const OR = X.map((x, i) => x - 8 + W[i] + 16);

    const h = TAB_HEIGHT;
    const r = 30;
    const dip = 5;
    const gap = -8;

    // Helper: top bridge between pill i and i+1
    const topBridge = (i: number) => {
      const p0 = OR[i] - 14;
      const mid = OR[i] + gap / 2;
      const p3 = OL[i + 1] + 14;
      return `L ${p0},0 C ${p0 + 7},0 ${mid - 4},${dip} ${mid},${dip} C ${mid + 4},${dip} ${p3 - 7},0 ${p3},0`;
    };

    // Helper: bottom bridge between pill i+1 and i (right-to-left)
    const botBridge = (i: number) => {
      const p0 = OL[i + 1] + 14;
      const mid = OR[i] + gap / 2;
      const p3 = OR[i] - 14;
      return `L ${p0},${h} C ${p0 - 7},${h} ${mid + 4},${h - dip} ${mid},${h - dip} C ${mid - 4},${h - dip} ${p3 + 7},${h} ${p3},${h}`;
    };

    const d = `
      M ${OL[0] + r},0
      ${topBridge(0)}
      ${topBridge(1)}
      ${topBridge(2)}
      L ${OR[3] - r},0
      A ${r},${r} 0 0,1 ${OR[3]},${r}
      A ${r},${r} 0 0,1 ${OR[3] - r},${h}
      ${botBridge(2)}
      ${botBridge(1)}
      ${botBridge(0)}
      L ${OL[0] + r},${h}
      A ${r},${r} 0 0,1 ${OL[0]},${h - r}
      A ${r},${r} 0 0,1 ${OL[0] + r},0
      Z
    `;
    return { d };
  });

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom > 0 ? insets.bottom : 20 }]}>

      {/* ── Gooey 4-tab segment ──────────────────────────────── */}
      <View style={styles.segmentContainer}>
        <Svg
          width={SEGMENT_WIDTH}
          height={TAB_HEIGHT}
          style={StyleSheet.absoluteFill}
        >
          <AnimatedPath animatedProps={animatedProps} fill={BG_DARK} />
        </Svg>

        {state.routes.map((route, index) => {
          const label    = TAB_LABELS[route.name] ?? route.name;
          const isFocused = state.index === index;
          const Icon     = TAB_ICONS[route.name] ?? HomeIcon;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const itemStyle = useAnimatedStyle(() => ({
            width: tabItems[index].value.w,
            left: tabItems[index].value.x,
          }));

          const textStyle = useAnimatedStyle(() => {
            const progress = interpolate(
              activeIndex.value,
              [index - 1, index, index + 1],
              [-1, 1, -1],
              "clamp"
            );
            const isActive = Math.max(0, progress);
            return {
              opacity: withTiming(isActive > 0.5 ? 1 : 0, { duration: 200 }),
              transform: [{ translateX: interpolate(isActive, [0, 1], [-8, 0]) }],
            };
          });

          return (
            <Animated.View key={route.key} style={[styles.tabItem, itemStyle]}>
              <Pressable onPress={onPress} style={styles.pressableFill}>
                <View style={styles.iconWrapper}>
                  <Icon color={isFocused ? ICON_ACTIVE : ICON_INACTIVE} />
                </View>
                <Animated.View style={[styles.labelWrapper, textStyle]} pointerEvents="none">
                  <Text style={styles.labelText} numberOfLines={1}>{label}</Text>
                </Animated.View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {/* ── Floating Action Button ────────────────────────────── */}
      <View style={styles.fabContainer}>
        {fabOpen && (
          <View style={styles.fabMenu}>
            <Pressable
              style={styles.fabMenuItem}
              onPress={() => { setFabOpen(false); router.push("/chat" as any); }}
            >
              <Text style={styles.fabMenuText}>💬 Chat</Text>
            </Pressable>
            <View style={styles.fabMenuDivider} />
            <Pressable
              style={styles.fabMenuItem}
              onPress={() => { setFabOpen(false); }}
            >
              <Text style={styles.fabMenuText}>📞 Call</Text>
            </Pressable>
          </View>
        )}
        <Pressable
          style={styles.fab}
          accessibilityLabel="Open action menu"
          onPress={() => setFabOpen(!fabOpen)}
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
    width: SEGMENT_WIDTH,
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
    fontSize: 13,
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
    shadowColor: "#000",
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
