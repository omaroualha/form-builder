import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initDB } from './src/db';
import { syncPendingSubmissions } from './src/sync';
import { HomeScreen } from './src/screens/HomeScreen';
import { FormScreen } from './src/screens/FormScreen';

type RootStackParamList = {
  Home: undefined;
  Form: { slug: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDB();
      setReady(true);
      // Try to sync any pending submissions on app start
      syncPendingSubmissions();
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Form Builder' }} />
        <Stack.Screen name="Form" component={FormScreen} options={{ title: 'Fill Form' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
