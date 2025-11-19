import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import SetupWizardScreen from '../screens/SetupWizardScreen';
import BulkImportScreen from '../screens/BulkImportScreen';
import PersonaBoosterScreen from '../screens/PersonaBoosterScreen';
import SnapshotsScreen from '../screens/SnapshotsScreen';
import { Colors } from '../constants/theme';

export type RootStackParamList = {
  MainTabs: undefined;
  SetupWizard: {
    personaId: string;
    personaName: string;
  };
  BulkImport: {
    personaId: string;
    personaName: string;
  };
  PersonaBooster: {
    personaId: string;
    personaName: string;
  };
  Snapshots: {
    personaId: string;
    personaName: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />

      {/* Modal Screens */}
      <Stack.Screen
        name="SetupWizard"
        component={SetupWizardScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BulkImport"
        component={BulkImportScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PersonaBooster"
        component={PersonaBoosterScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Snapshots"
        component={SnapshotsScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
