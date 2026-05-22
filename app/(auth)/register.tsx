import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Lock, Store, ArrowRight, BookOpen, LogIn, Mail } from 'lucide-react-native';
import { api } from '../../src/api/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword || !businessName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 4 caractères');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const result = await api.register({
        username,
        email: email || undefined,
        password,
        businessName
      });

      if (result.success) {
        Alert.alert('Succès', 'Votre compte a été créé avec succès !', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        Alert.alert('Erreur', result.message || 'Impossible de créer le compte');
      }
    } catch (error) {
      console.error('Register error:', error);
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
          <Text style={styles.subtitle}>Sécurisez votre travail en créant votre compte</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Votre Nom Complet</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#9ca3af" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Jean Dupont"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (optionnel)</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#9ca3af" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: jean@exemple.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom de votre Commerce</Text>
            <View style={styles.inputContainer}>
              <Store size={20} color="#9ca3af" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Ma Boutique Chrétienne"
                value={businessName}
                onChangeText={setBusinessName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe (min. 4 caractères)</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#9ca3af" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#9ca3af" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmez votre mot de passe"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.buttonText}>Créer mon compte</Text>
                <ArrowRight size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.loginBtn} 
            onPress={() => router.push('/(auth)/login')}
          >
            <LogIn size={16} color="#059669" />
            <Text style={styles.loginText}>Déjà un compte ? Se connecter</Text>
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
  scrollContent: { padding: 30, paddingBottom: 50 },
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
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 15, paddingHorizontal: 15, height: 55, backgroundColor: '#f9fafb' },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  button: { backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 15, marginTop: 10, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  buttonDisabled: { backgroundColor: '#9ca3af', shadowOpacity: 0 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  footer: { alignItems: 'center', marginTop: 40 },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    marginBottom: 10
  },
  loginText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600'
  },
  footerText: { color: '#9ca3af', fontSize: 12, marginTop: 4 }
});
