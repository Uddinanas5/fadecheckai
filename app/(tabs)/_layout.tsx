import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.ink,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 0.2,
          marginTop: 2,
        },
        // Floating, sticker-outlined bar
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: bottomPad,
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 24,
          backgroundColor: '#FFFFFF',
          borderWidth: 2,
          borderColor: Colors.ink,
          borderTopWidth: 2,
          borderTopColor: Colors.ink,
          shadowColor: '#17130F',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
          ...(Platform.OS === 'android' ? { paddingBottom: 8 } : {}),
        },
        tabBarItemStyle: { borderRadius: 18, marginHorizontal: 4 },
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
