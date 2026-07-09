import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

const ACCENT_BLUE = '#0145F2';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background.secondary,
          borderTopColor: Colors.glass.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 28,
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
