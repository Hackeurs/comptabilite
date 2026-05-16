import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowRight, BookOpen, Check } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { updateUserEmail, getUser } from '../src/database/database';
import type { User as UserType } from '../src/database/database';

export default function EmailSetupScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<UserType | null>(null);

  React.useEffect(() => {
    if (userId) {
      const u = getUser();
      setUser(u);
    }
  }, [userId]);

  const handleSave = () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez saisir une adresse email valide');
      return;
    }

    if (!userId) {
      Alert.alert('Erreur', 'Utilisateur non trouvé');
      return;
    }

    try {
      updateUserEmail(parseInt(userId), email.trim());
      Alert.alert(
        'Succès !',
        'Votre adresse email a été enregistrée. Vous pourrez l\'utiliser pour réinitialiser votre PIN.',
        [
          {
            text: 'Continuer',
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'email');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <BookOpen size={50} color="white" />
            </View>
            <Text style={styles.title}>Configuration</Text>
            <Text style={styles.subtitle}>
              {user ? `Bonjour, ${user.username} !` : ''}
            </Text>
            <Text style={styles.description}>
              Ajoutez votre adresse email pour pouvoir réinitialiser votre PIN en cas d'oubli.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Mail size={24} color="#059669" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="adresse@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  selectionColor="#059669"
                  autoFocus
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, !email && styles.buttonDisabled]} 
              onPress={handleSave}
              disabled={!email}
            >
              <Text style={styles.buttonText}>Enregistrer</Text>
              <Check size={20} color="white" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.skipText}>Passer pour le moment</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Comptabilité Chrétiens v1.4.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollContent: { padding: 30, paddingBottom: 50, flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  logoContainer: { 
    width: 100, 
    height: 100, 
    backgroundColor: '#059669', 
    borderRadius: 30, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  title: { fontSize: 26, color: '#111827', fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#059669', fontWeight: '600', marginBottom: 10 },
  description: { fontSize: 15, color: '#6b7280', textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
  form: { backgroundColor: 'white', borderRadius: 25, padding: 25, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 } },
  inputGroup: { marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#059669', borderRadius: 15, paddingHorizontal: 15, height: 65, backgroundColor: '#f0fdf4' },
  icon: { marginRight: 15 },
  input: { flex: 1, fontSize: 17, color: '#111827' },
  button: { backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 15, marginTop: 10, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  buttonDisabled: { backgroundColor: '#9ca3af', shadowOpacity: 0 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  skipButton: { alignItems: 'center', marginTop: 25, padding: 10 },
  skipText: { color: '#6b7280', fontSize: 15, fontWeight: '500' },
  footer: { alignItems: 'center', marginTop: 40 },
  footerText: { color: '#9ca3af', fontSize: 12, marginTop: 4 }
});
