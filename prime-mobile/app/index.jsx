import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../utils/constants';

export default function Index() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!token || !user) {
      router.replace('/(auth)/login');
    } else if (user.role === 'admin') {
      router.replace('/(admin)/dashboard');
    } else {
      router.replace('/(farmer)/dashboard');
    }
  }, [loading, token, user, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
