import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, ArrowRight, BookOpen, User, Plus, Mail } from 'lucide-react-native';
import { api } from '../../src/api/api';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const result = await api.login({ username, password });

      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erreur', result.message || 'Identifiants incorrects');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <BookOpen size={50} color="white" />
          </View>
          <Text style={styles.title}>Bienvenue sur</Text>
          <Text style={styles.appName}>Comptabilité Chrétiens</Text>
          <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Connexion</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom d'utilisateur</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#9ca3af" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Votre nom d'utilisateur"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#9ca3af" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Votre mot de passe"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoComplete="password"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.buttonText}>Se connecter</Text>
                <ArrowRight size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.createAccountBtn} 
            onPress={() => router.push('/(auth)/register')}
          >
            <Plus size={16} color="#059669" />
            <Text style={styles.createAccountText}>Créer un compte</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>© 2024 Comptabilité Chrétiens</Text>
          <Text style={styles.footerText}>Sécurité et Confidentialité Garanties</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollContent: { padding: 30, paddingBottom: 50, flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 40 },
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
  title: { fontSize: 18, color: '#4b5563', fontWeight: '500' },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#059669', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  form: { backgroundColor: 'white', borderRadius: 25, padding: 25, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 } },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 30, textAlign: 'center' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 15, paddingHorizontal: 15, height: 55, backgroundColor: '#f9fafb' },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  button: { backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 15, marginTop: 10, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  buttonDisabled: { backgroundColor: '#9ca3af', shadowOpacity: 0 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  footer: { alignItems: 'center', marginTop: 40 },
  createAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    marginBottom: 10
  },
  createAccountText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600'
  },
  footerText: { color: '#9ca3af', fontSize: 12, marginTop: 4 }
});
