import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';
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
  const image = product.images?.[0];
  const hasImageUrl = typeof image === 'string' && /^https?:\/\//i.test(image);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.name}
      style={({ pressed }) => [styles.card, compact && styles.compactCard, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {hasImageUrl ? (
          <Image source={{ uri: image }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <Text style={styles.productEmoji} numberOfLines={1}>
            {image || '🌾'}
          </Text>
        )}
        {onWishlistToggle && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            style={styles.wishlistBtn}
            onPress={(e) => {
              e.stopPropagation();
              onWishlistToggle();
            }}
            hitSlop={10}
          >
            <Text style={styles.wishlistHeart}>{isWishlisted ? '♥' : '♡'}</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.brandText} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.nameText} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.ratingRow}>
          <Text style={styles.starText}>★ {product.rating}</Text>
          <Text style={styles.reviewsText}>({product.reviewCount})</Text>
        </View>

        <Text style={styles.packSizeText} numberOfLines={1}>
          {mainVariant?.packSize}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>₹{(mainVariant?.price || 0).toLocaleString('en-IN')}</Text>

          {mainVariant?.mrp && mainVariant.mrp > mainVariant.price && (
            <Text style={styles.mrpText}>₹{mainVariant.mrp.toLocaleString('en-IN')}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0B2A14',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  compactCard: {
    width: 152,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    height: 104,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productEmoji: {
    fontSize: 42,
    maxWidth: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  wishlistHeart: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '800',
  },
  infoContainer: {
    gap: 3,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    lineHeight: 17,
    minHeight: 34,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A6400',
    backgroundColor: '#FFF8DB',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  reviewsText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  packSizeText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 3,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
  },
  mrpText: {
    fontSize: 11,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
