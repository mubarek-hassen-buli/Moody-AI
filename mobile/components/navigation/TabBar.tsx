import React from "react";
import { View, Pressable, StyleSheet, Text, LayoutChangeEvent } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

/* ──────────────────────────────────────────────────────────
 * Icons (mimicking the reference image)
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
    <Rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="8" cy="9" r="1" fill={color} />
    <Circle cx="8" cy="15" r="1" fill={color} />
    <Path d="M12 9H16M12 15H16" stroke={color} strokeWidth={2} strokeLinecap="round" />
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
 * Types & Constants
 * ────────────────────────────────────────────────────────── */

const TAB_ICONS: Record<string, (props: { color: string }) => React.JSX.Element> = {
  index: HomeIcon,
  statistics: InsightsIcon,
  journal: ChatIcon, // Treating journal as the Chat icon for now
  profile: HomeIcon, // Fallback if used
};

// Colors from the design
const BG_DARK = "#252525";    // Dark container
const ITEM_BG = "#3D3D3D";    // Active icon background
const TEXT_ACTIVE = "#FFFFFF";
const ICON_INACTIVE = "#A0A0A0";
const ICON_ACTIVE = "#FFFFFF";
const BLUE_BTN = "#2B8CFF";

// Layout metrics
const TAB_HEIGHT = 64;
const ICON_SIZE = 48;
const PADDING = 8;
const EXPANDED_WIDTH = 130;
const COLLAPSED_WIDTH = ICON_SIZE;

/* ──────────────────────────────────────────────────────────
 * Animated Tab Item
 * ────────────────────────────────────────────────────────── */

interface TabItemProps {
  label: string;
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const TabItem = ({ label, routeName, isFocused, onPress, onLongPress }: TabItemProps) => {
  const Icon = TAB_ICONS[routeName] || HomeIcon;

  // Spring config for the bouncy liquid feel
  const springConfig = { damping: 16, stiffness: 120, mass: 0.8 };

  const animatedStyle = useAnimatedStyle(() => {
    const width = withSpring(isFocused ? EXPANDED_WIDTH : COLLAPSED_WIDTH, springConfig);
    return { width };
  });

  const textStyle = useAnimatedStyle(() => {
    const opacity = withTiming(isFocused ? 1 : 0, { duration: 200 });
    const translateX = withSpring(isFocused ? 0 : -10, springConfig);
    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItemPressable}
    >
      <Animated.View style={[styles.tabItemContainer, animatedStyle]}>
        <View style={styles.iconCircle}>
          <Icon color={isFocused ? ICON_ACTIVE : ICON_INACTIVE} />
        </View>
        <Animated.View style={[styles.labelContainer, textStyle]}>
          <Text style={styles.labelText} numberOfLines={1}>
            {label}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

/* ──────────────────────────────────────────────────────────
 * Main Tab Bar Component
 * ────────────────────────────────────────────────────────── */

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
      
      {/* ── Main Tab Segment ───────────────────────────── */}
      <View style={styles.segmentContainer}>
        {state.routes.map((route, index) => {
          // Skip 'profile' tab to match the 3-tab layout in the image
          if (route.name === "profile") return null;

          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? (options.tabBarLabel as string)
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

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

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              label={label === "index" ? "Home" : label}
              routeName={route.name}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>

      {/* ── Floating Action Button (Blue) ──────────────── */}
      <Pressable style={styles.fab} accessibilityLabel="Create new">
        <PlusIcon />
      </Pressable>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: BG_DARK,
    height: TAB_HEIGHT,
    borderRadius: TAB_HEIGHT / 2,
    padding: PADDING,
    alignItems: "center",
    gap: 4,
  },
  tabItemPressable: {
    height: ICON_SIZE,
  },
  tabItemContainer: {
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: ITEM_BG,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  labelContainer: {
    position: "absolute",
    left: ICON_SIZE,
    right: 0,
    height: "100%",
    justifyContent: "center",
    paddingLeft: 8,
    zIndex: 1,
  },
  labelText: {
    color: TEXT_ACTIVE,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Typography.fontFamily,
  },
  fab: {
    width: TAB_HEIGHT,
    height: TAB_HEIGHT,
    borderRadius: TAB_HEIGHT / 2,
    backgroundColor: BLUE_BTN,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BLUE_BTN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
