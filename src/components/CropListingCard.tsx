import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, shadow, spacing } from '../constants/theme';
import { useT } from '../i18n';
import { CropListing } from '../types';

interface CropListingCardProps {
  listing: CropListing;
  onPress: () => void;
  onSaveToggle?: () => void;
  isSaved?: boolean;
}

export function CropListingCard({
  listing,
  onPress,
  onSaveToggle,
  isSaved = false,
}: CropListingCardProps) {
  const t = useT();

  const isSoldOut = listing.availableQuantity === 0 || listing.status === 'sold';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.imageContainer}>
          <Text style={styles.emojiIcon}>{listing.images[0] || '🌾'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.cropName} numberOfLines={1}>
              {listing.cropName}
            </Text>
            {onSaveToggle && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onSaveToggle();
                }}
                hitSlop={10}
              >
                <Text style={styles.heart}>{isSaved ? '❤️' : '🤍'}</Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.varietyText}>{listing.variety}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.qualityBadge}>
              <Text style={styles.qualityText}>{listing.quality}</Text>
            </View>
            <View style={[styles.methodBadge, listing.farmingMethod === 'Organic' && styles.organicBadge]}>
              <Text style={[styles.methodText, listing.farmingMethod === 'Organic' && styles.organicText]}>
                {listing.farmingMethod}
              </Text>
            </View>

            {listing.allowNegotiation ? (
              <View style={styles.negBadge}>
                <Text style={styles.negText}>{t('negotiable')}</Text>
              </View>
            ) : (
              <View style={styles.fixedBadge}>
                <Text style={styles.fixedText}>{t('fixedPrice')}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View>
          <Text style={styles.priceLabel}>{t('pricePerUnit')}</Text>
          <Text style={styles.priceValue}>
            ₹{listing.pricePerUnit.toLocaleString('en-IN')} <Text style={styles.unitText}>/ {listing.unit}</Text>
          </Text>
        </View>

        <View style={styles.rightDetail}>
          <Text style={styles.qtyLabel}>{t('quantity')}</Text>
          <Text style={[styles.qtyValue, isSoldOut && styles.soldOutText]}>
            {isSoldOut ? t('soldOut') : `${listing.availableQuantity} ${listing.unit}`}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.locationText} numberOfLines={1}>
          📍 {listing.location.district}, {listing.location.state}
        </Text>
        <Text style={styles.farmerText} numberOfLines={1}>
          👤 {listing.farmerName}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  headerRow: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: radius.s,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  emojiIcon: {
    fontSize: 32,
  },
  infoContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropName: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  heart: {
    fontSize: 18,
    marginLeft: spacing.s,
  },
  varietyText: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  qualityBadge: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  qualityText: {
    fontFamily: font.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  methodBadge: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  organicBadge: {
    backgroundColor: '#E8F5E9',
  },
  methodText: {
    fontFamily: font.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  organicText: {
    color: '#2E7D32',
  },
  negBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  negText: {
    fontFamily: font.medium,
    fontSize: 11,
    color: '#E65100',
  },
  fixedBadge: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  fixedText: {
    fontFamily: font.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.s,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  priceValue: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.primary,
  },
  unitText: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  rightDetail: {
    alignItems: 'flex-end',
  },
  qtyLabel: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  qtyValue: {
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  soldOutText: {
    color: colors.error,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.s,
    paddingTop: spacing.xs,
  },
  locationText: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  farmerText: {
    fontFamily: font.medium,
    fontSize: 12,
    color: colors.textPrimary,
  },
});
