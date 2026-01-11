import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { getScoreColor } from '../../constants/Colors';
import { spacing, borderRadius } from '../../constants/Styles';
import { useHistory } from '../../hooks/useHistory';
import HistoryCard from '../../components/HistoryCard';
import { HistoryItem } from '../../types';

const ACCENT_BLUE = '#0145F2';

// Stats Card Component
const StatsCard = ({
  icon,
  label,
  value,
  color,
  delay = 0
}: {
  icon: string;
  label: string;
  value: string;
  color?: string;
  delay?: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statsCard,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
        style={styles.statsCardGradient}
      >
        <Text style={styles.statsIcon}>{icon}</Text>
        <Text style={[styles.statsValue, color ? { color } : null]}>{value}</Text>
        <Text style={styles.statsLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { history, isLoading, clearHistory } = useHistory();

  // Calculate stats
  const stats = useMemo(() => {
    if (history.length === 0) return null;

    const scores = history
      .map(h => h.result.overall_score)
      .filter((s): s is number => s !== null && s !== undefined);

    if (scores.length === 0) return null;

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const totalRatings = history.length;

    // Calculate trend (compare last 3 vs previous 3)
    let trend = 'neutral';
    if (scores.length >= 6) {
      const recent = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const older = scores.slice(3, 6).reduce((a, b) => a + b, 0) / 3;
      trend = recent > older ? 'up' : recent < older ? 'down' : 'neutral';
    }

    return { avgScore, bestScore, totalRatings, trend };
  }, [history]);

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all your ratings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  };

  const handleItemPress = (item: HistoryItem) => {
    router.push({
      pathname: '/results',
      params: {
        imageUri: item.imageUri,
        result: JSON.stringify(item.result),
        fromHistory: 'true',
      },
    });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={['rgba(1, 69, 242, 0.2)', 'rgba(1, 69, 242, 0.05)']}
          style={styles.emptyIconGradient}
        >
          <Ionicons name="cut-outline" size={48} color={ACCENT_BLUE} />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>No Ratings Yet</Text>
      <Text style={styles.emptyText}>
        Rate your first haircut and start{'\n'}tracking your style journey
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/(tabs)')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[ACCENT_BLUE, '#0033CC']}
          style={styles.emptyButtonGradient}
        >
          <Ionicons name="camera" size={18} color="#FFF" />
          <Text style={styles.emptyButtonText}>Rate Your Cut</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <StatsCard
          icon="📊"
          label="Average"
          value={stats.avgScore.toFixed(1)}
          color={getScoreColor(stats.avgScore)}
          delay={0}
        />
        <StatsCard
          icon="🏆"
          label="Best"
          value={stats.bestScore.toFixed(1)}
          color={getScoreColor(stats.bestScore)}
          delay={100}
        />
        <StatsCard
          icon="✂️"
          label="Total"
          value={stats.totalRatings.toString()}
          delay={200}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>History</Text>
          {history.length > 0 && (
            <Text style={styles.headerSubtitle}>
              {history.length} rating{history.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        {history.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearHistory}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <HistoryCard
              item={item}
              onPress={() => handleItemPress(item)}
              index={index}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  clearButtonText: {
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  statsCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  statsCardGradient: {
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.lg,
  },
  statsIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -1,
  },
  statsLabel: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.sm,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: 60,
  },
  emptyIconContainer: {
    marginBottom: spacing.lg,
    borderRadius: 40,
    overflow: 'hidden',
  },
  emptyIconGradient: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(1, 69, 242, 0.3)',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
});
