import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import BookingsScreen from '../screens/main/BookingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import PoojariProfileScreen from '../screens/poojari/PoojariProfileScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import BookingDetailsScreen from '../screens/booking/BookingDetailsScreen';
import ReviewScreen from '../screens/review/ReviewScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import PoojariDashboardScreen from '../screens/poojari/PoojariDashboardScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PoojariProfile" 
      component={PoojariProfileScreen}
      options={{ title: 'Poojari Profile' }}
    />
    <Stack.Screen 
      name="Booking" 
      component={BookingScreen}
      options={{ title: 'Book Service' }}
    />
    <Stack.Screen 
      name="Payment" 
      component={PaymentScreen}
      options={{ title: 'Payment' }}
    />
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="SearchMain" 
      component={SearchScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PoojariProfile" 
      component={PoojariProfileScreen}
      options={{ title: 'Poojari Profile' }}
    />
  </Stack.Navigator>
);

const BookingsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="BookingsMain" 
      component={BookingsScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="BookingDetails" 
      component={BookingDetailsScreen}
      options={{ title: 'Booking Details' }}
    />
    <Stack.Screen 
      name="Review" 
      component={ReviewScreen}
      options={{ title: 'Write Review' }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => {
  const { user } = useSelector(state => state.auth);
  
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ headerShown: false }}
      />
      {user?.role === 'poojari' && (
        <Stack.Screen 
          name="PoojariDashboard" 
          component={PoojariDashboardScreen}
          options={{ title: 'Dashboard' }}
        />
      )}
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'Bookings') {
            iconName = user?.role === 'poojari' ? 'dashboard' : 'event-note';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchStack}
        options={{ title: 'Search' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsStack}
        options={{ 
          title: user?.role === 'poojari' ? 'Dashboard' : 'My Bookings' 
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
