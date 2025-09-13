import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import PoojariProfileScreen from '../screens/PoojariProfileScreen';
import BookingScreen from '../screens/BookingScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isAuthenticated ? "Home" : "Login"}
        screenOptions={{ 
          headerStyle: {
            backgroundColor: '#FF6B35',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'DivineConnect' }}
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
              name="MyBookings" 
              component={MyBookingsScreen}
              options={{ title: 'My Bookings' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
