import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

const ACCENT_BLUE = '#0145F2';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // Safe-area aware: base bar height + the device's bottom inset (0 on web),
  // so labels are never clipped on devices without a home indicator.
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background.secondary,
          borderTopColor: Colors.glass.border,
          borderTopWidth: 1,
          height: 56 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 8,
        },
        tabBarActiveTintColor: ACCENT_BLUE,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'color-wand' : 'color-wand-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="styles"
        options={{
          title: 'Styles',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rate"
        options={{
          title: 'Rate',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'star' : 'star-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
