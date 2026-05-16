import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Lock, ArrowRight, BookOpen, User, Plus } from 'lucide-react-native';
import { loginUser, getUser, getUsers, resetUserPIN, isUserRegistered } from '../../src/database/database';
import type { User as UserType } from '../../src/database/database';

export default function LoginScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  useFocusEffect(
    useCallback(() => {
      try {
        const allUsers = getUsers();
        setUsers(allUsers);
        if (allUsers.length === 1) {
          setSelectedUser(allUsers[0]);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        setUsers([]);
      }
    }, [])
  );

  const handleLogin = () => {
    try {
      if (!selectedUser) {
        Alert.alert('Erreur', 'Veuillez sélectionner un utilisateur');
        return;
      }
      if (!pin) {
        Alert.alert('Erreur', 'Veuillez saisir votre code PIN de sécurité');
        return;
      }

      const authenticatedUser = loginUser(pin, selectedUser.id);
      if (authenticatedUser) {
        if (!authenticatedUser.email) {
          router.push({
            pathname: '/email-setup',
            params: { userId: authenticatedUser.id }
          });
        } else {
          router.replace('/(tabs)');
        }
      } else {
        Alert.alert('Erreur', 'Code PIN incorrect. Veuillez réessayer.');
        setPin('');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleForgotPIN = () => {
    if (!selectedUser) {
      Alert.alert('Erreur', 'Veuillez d\'abord sélectionner un utilisateur');
      return;
    }

    router.push({
      pathname: '/forgot-password',
      params: { userId: selectedUser.id }
    });
  };

  const renderPinDots = () => {
    const dots = [];
    for (let i = 0; i < 4; i++) {
      dots.push(
        <View 
          key={i} 
          style={[
            styles.pinDot, 
            { backgroundColor: pin.length > i ? '#059669' : '#e5e7eb' }
          ]} 
        />
      );
    }
    return dots;
  };

  const renderUserItem = ({ item }: { item: UserType }) => (
    <TouchableOpacity
      style={[
        styles.userItem,
        selectedUser?.id === item.id && styles.userItemSelected
      ]}
      onPress={() => {
        setSelectedUser(item);
        setPin('');
      }}
    >
      <View style={[
        styles.userAvatar,
        selectedUser?.id === item.id && styles.userAvatarSelected
      ]}>
        <User size={24} color={selectedUser?.id === item.id ? 'white' : '#059669'} />
      </View>
      <Text style={[
        styles.userName,
        selectedUser?.id === item.id && styles.userNameSelected
      ]}>
        {item.username}
      </Text>
      <Text style={[
        styles.userRole,
        selectedUser?.id === item.id && styles.userRoleSelected
      ]}>
        {item.role === 'ADMIN' ? 'Administrateur' : 'Employé'}
      </Text>
    </TouchableOpacity>
  );

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
          <Text style={styles.subtitle}>Choisissez votre compte pour continuer</Text>
        </View>

        {users.length > 1 && (
          <View style={styles.userSelector}>
            <Text style={styles.selectorTitle}>Sélectionnez votre compte</Text>
            <FlatList
              data={users}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderUserItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.userList}
            />
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {selectedUser ? `Bonjour, ${selectedUser.username}` : 'Sélectionnez un utilisateur'}
          </Text>

          <View style={styles.pinDisplayContainer}>
            {renderPinDots()}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Lock size={24} color="#059669" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="PIN"
                keyboardType="numeric"
                secureTextEntry
                value={pin}
                onChangeText={setPin}
                maxLength={4}
                autoFocus
                selectionColor="#059669"
                editable={!!selectedUser}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, (!pin || !selectedUser) && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={!pin || !selectedUser}
          >
            <Text style={styles.buttonText}>Se connecter</Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotButton} 
            onPress={handleForgotPIN}
            disabled={!selectedUser}
          >
            <Text style={[styles.forgotButtonText, !selectedUser && styles.forgotButtonTextDisabled]}>
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.createAccountBtn} 
            onPress={() => router.push('/(auth)/register')}
          >
            <Plus size={16} color="#059669" />
            <Text style={styles.createAccountText}>Créer un compte administrateur</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>Comptabilité Chrétiens v1.3.0</Text>
          <Text style={styles.footerText}>© 2024 - Sécurisé par Smart Innovation</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  title: { fontSize: 18, color: '#4b5563', fontWeight: '500' },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#059669', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', paddingHorizontal: 20 },
  userSelector: { marginBottom: 20 },
  selectorTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 12, textAlign: 'center' },
  userList: { paddingHorizontal: 10 },
  userItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: 140
  },
  userItemSelected: {
    backgroundColor: '#059669',
    borderColor: '#047857'
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  userAvatarSelected: {
    backgroundColor: '#047857'
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4
  },
  userNameSelected: {
    color: 'white'
  },
  userRole: {
    fontSize: 11,
    color: '#6b7280'
  },
  userRoleSelected: {
    color: '#a7f3d0'
  },
  form: { backgroundColor: 'white', borderRadius: 25, padding: 25, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 } },
  formTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 20, textAlign: 'center' },
  pinDisplayContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  pinDot: { width: 20, height: 20, borderRadius: 10, marginHorizontal: 10, borderWidth: 1, borderColor: '#d1d5db' },
  inputGroup: { marginBottom: 20, alignItems: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#059669', borderRadius: 15, paddingHorizontal: 15, height: 65, backgroundColor: '#f0fdf4' },
  icon: { marginRight: 15 },
  input: { flex: 1, fontSize: 24, color: '#111827', fontWeight: 'bold', textAlign: 'center', letterSpacing: 10 },
  button: { backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 15, marginTop: 10, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  buttonDisabled: { backgroundColor: '#9ca3af', shadowOpacity: 0 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  forgotButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10
  },
  forgotButtonText: {
    color: '#059669',
    fontSize: 15,
    fontWeight: '600'
  },
  forgotButtonTextDisabled: {
    color: '#9ca3af'
  },
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
