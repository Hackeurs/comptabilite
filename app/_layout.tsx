import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { initDB, isUserRegistered } from '../src/database/database';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [initialNavigationDone, setInitialNavigationDone] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    try {
      initDB();
      setDbReady(true);
      console.log('Database initialized');
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }, []);

  useEffect(() => {
    if (!dbReady || initialNavigationDone) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const registered = isUserRegistered();

    console.log('Navigation state:', { inAuthGroup, inTabsGroup, registered, segments });

    if (!registered && !inAuthGroup) {
      console.log('Redirecting to register');
      router.replace('/(auth)/register');
    } else if (registered && !inAuthGroup && !inTabsGroup) {
      console.log('Redirecting to login');
      router.replace('/(auth)/login');
    }

    setInitialNavigationDone(true);
  }, [dbReady, initialNavigationDone, segments]);

  if (!dbReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
