import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

const Stack = createStackNavigator();

const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' }
      }}
    >
      <Stack.Screen 
        name="OnboardingMain" 
        component={OnboardingScreen} 
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
