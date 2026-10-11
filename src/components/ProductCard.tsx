import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, shadow, spacing } from '../constants/theme';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onWishlistToggle?: () => void;
  isWishlisted?: boolean;
  compact?: boolean;
}

export function ProductCard({
  product,
  onPress,
  onWishlistToggle,
  isWishlisted = false,
  compact = false,
}: ProductCardProps) {
  const mainVariant = product.variants[0];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Text style={styles.productEmoji}>{product.images[0] || '🌾'}</Text>
        {onWishlistToggle && (
          <Pressable
            style={styles.wishlistBtn}
            onPress={(e) => {
              e.stopPropagation();
              onWishlistToggle();
            }}
            hitSlop={10}
          >
            <Text style={styles.wishlistHeart}>{isWishlisted ? '❤️' : '🤍'}</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.brandText}>{product.brand}</Text>
        <Text style={styles.nameText} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.ratingRow}>
          <Text style={styles.starText}>★ {product.rating}</Text>
          <Text style={styles.reviewsText}>({product.reviewCount})</Text>
        </View>

        <Text style={styles.packSizeText}>{mainVariant?.packSize}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            ₹{(mainVariant?.price || 0).toLocaleString('en-IN')}
          </Text>

          {mainVariant?.mrp && mainVariant.mrp > mainVariant.price && (
            <Text style={styles.mrpText}>
              ₹{mainVariant.mrp.toLocaleString('en-IN')}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  compactCard: {
    width: 180,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    height: 110,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.s,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: spacing.xs,
  },
  productEmoji: {
    fontSize: 48,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistHeart: {
    fontSize: 14,
  },
  infoContainer: {
    gap: 2,
  },
  brandText: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  nameText: {
    fontFamily: font.bold,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
  },
  starText: {
    fontFamily: font.bold,
    fontSize: 12,
    color: colors.accent,
  },
  reviewsText: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  packSizeText: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  priceText: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.primary,
  },
  mrpText: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
