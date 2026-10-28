import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import TaskFormScreen from './src/screens/TaskFormScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import { COLORS } from './src/commons/theme';
import { RootStackParamList } from './src/commons/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.card },
            headerTintColor: COLORS.text,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Danh sách công việc' }}
          />
          <Stack.Screen
            name="TaskForm"
            component={TaskFormScreen}
            options={{ title: 'Công việc' }}
          />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={{ title: 'Chi tiết công việc' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}