import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface ActivityCardProps {
  /** Card title. */
  title: string;
  /** Card subtitle / description. */
  subtitle: string;
  /** Background tint for the card. */
  backgroundColor?: string;
  /** Background image for the card. */
  backgroundImage?: any;
  /** Called when the card is pressed. */
  onPress?: () => void;
  /** Override container style. */
  style?: ViewStyle;
}

/* ──────────────────────────────────────────────────────────
 * Arrow icon
 * ────────────────────────────────────────────────────────── */

const ArrowIcon: React.FC = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 17L17 7M17 7H7M17 7v10"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  subtitle,
  backgroundColor = "#FFF3EC",
  backgroundImage,
  onPress,
  style,
}) => {
  const CardContent = (
    <>
      {backgroundImage && <View style={styles.imageOverlay} />}
      <View style={styles.content}>
        <Text style={[styles.title, backgroundImage && styles.textWhite]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.subtitle, backgroundImage && styles.textWhiteLight]} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <View style={[styles.arrowContainer, backgroundImage && styles.arrowContainerOverlay]}>
        <ArrowIcon />
      </View>
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor },
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {backgroundImage ? (
        <ImageBackground
          source={backgroundImage}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
        >
          {CardContent}
        </ImageBackground>
      ) : (
        CardContent
      )}
    </Pressable>
  );
};

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    minHeight: 140,
    justifyContent: "space-between",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  arrowContainer: {
    alignSelf: "flex-end",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: Spacing.sm,
  },
  arrowContainerOverlay: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  imageBackground: {
    ...StyleSheet.absoluteFillObject,
    padding: Spacing.base,
    justifyContent: "space-between",
  },
  imageStyle: {
    borderRadius: BorderRadius.lg,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: BorderRadius.lg,
  },
  textWhite: {
    color: "#FFFFFF",
  },
  textWhiteLight: {
    color: "rgba(255,255,255,0.8)",
  },
});
