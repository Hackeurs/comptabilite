import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowLeft, Check, RefreshCw } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { resetUserPIN, getUser } from '../src/database/database';
import type { User as UserType } from '../src/database/database';

type Step = 'email' | 'code' | 'new-pin';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [user, setUser] = useState<UserType | null>(null);

  React.useEffect(() => {
    if (userId) {
      const u = getUser();
      setUser(u);
      if (u?.email) {
        setEmail(u.email);
      }
    }
  }, [userId]);

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    return code;
  };

  const API_BASE_URL = 'http://localhost:3000/api';

  const handleSendCode = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez saisir une adresse email valide');
      return;
    }

    const code = generateCode();
    
    try {
      const response = await fetch(`${API_BASE_URL}/send-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: code,
          username: user?.username
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.code) {
          Alert.alert(
            'Code envoyé !',
            `Un code de vérification a été envoyé à ${email}.\n\nMode démo : le code est ${data.code}`,
            [
              {
                text: 'OK',
                onPress: () => setStep('code')
              }
            ]
          );
        } else {
          Alert.alert(
            'Code envoyé !',
            `Un code de vérification a été envoyé à ${email}. Veuillez vérifier votre boîte mail.`,
            [
              {
                text: 'OK',
                onPress: () => setStep('code')
              }
            ]
          );
        }
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur API:', error);
      Alert.alert(
        'Code généré !',
        `Mode hors-ligne : le code de vérification est ${code}`,
        [
          {
            text: 'OK',
            onPress: () => setStep('code')
          }
        ]
      );
    }
  };

  const handleVerifyCode = () => {
    if (!code.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le code de vérification');
      return;
    }

    if (code !== verificationCode) {
      Alert.alert('Erreur', 'Code incorrect. Veuillez réessayer.');
      return;
    }

    setStep('new-pin');
  };

  const handleSetNewPin = () => {
    if (!newPin || newPin.length !== 4) {
      Alert.alert('Erreur', 'Veuillez saisir un code PIN de 4 chiffres');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Erreur', 'Les codes PIN ne correspondent pas');
      return;
    }

    if (!userId) {
      Alert.alert('Erreur', 'Utilisateur non trouvé');
      return;
    }

    try {
      resetUserPIN(parseInt(userId), newPin);
      Alert.alert(
        'Succès !',
        'Votre code PIN a été réinitialisé ! Vous pouvez maintenant vous connecter.',
        [
          {
            text: 'Se connecter',
            onPress: () => router.replace('/(auth)/login')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de réinitialiser le PIN');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <>
            <Text style={styles.stepTitle}>Réinitialiser votre PIN</Text>
            <Text style={styles.stepDescription}>
              Entrez votre adresse email pour recevoir un code de vérification.
            </Text>

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
              onPress={handleSendCode}
              disabled={!email}
            >
              <Text style={styles.buttonText}>Envoyer le code</Text>
              <RefreshCw size={20} color="white" />
            </TouchableOpacity>
          </>
        );

      case 'code':
        return (
          <>
            <Text style={styles.stepTitle}>Code de vérification</Text>
            <Text style={styles.stepDescription}>
              Entrez le code à 6 chiffres que vous avez reçu par email.
            </Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Lock size={24} color="#059669" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  keyboardType="numeric"
                  value={code}
                  onChangeText={setCode}
                  maxLength={6}
                  selectionColor="#059669"
                  autoFocus
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, code.length !== 6 && styles.buttonDisabled]} 
              onPress={handleVerifyCode}
              disabled={code.length !== 6}
            >
              <Text style={styles.buttonText}>Vérifier</Text>
              <Check size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendButton} onPress={handleSendCode}>
              <Text style={styles.resendText}>Renvoyer le code</Text>
            </TouchableOpacity>
          </>
        );

      case 'new-pin':
        return (
          <>
            <Text style={styles.stepTitle}>Nouveau PIN</Text>
            <Text style={styles.stepDescription}>
              Créez votre nouveau code PIN de sécurité.
            </Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Lock size={24} color="#059669" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nouveau PIN"
                  keyboardType="numeric"
                  secureTextEntry
                  value={newPin}
                  onChangeText={setNewPin}
                  maxLength={4}
                  selectionColor="#059669"
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Lock size={24} color="#059669" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmer le PIN"
                  keyboardType="numeric"
                  secureTextEntry
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  maxLength={4}
                  selectionColor="#059669"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, (!newPin || !confirmPin || newPin !== confirmPin) && styles.buttonDisabled]} 
              onPress={handleSetNewPin}
              disabled={!newPin || !confirmPin || newPin !== confirmPin}
            >
              <Text style={styles.buttonText}>Enregistrer</Text>
              <Check size={20} color="white" />
            </TouchableOpacity>
          </>
        );
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {renderStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollContent: { flexGrow: 1 },
  header: { padding: 20, paddingTop: 40 },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  content: {
    padding: 30,
    paddingTop: 10
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
    textAlign: 'center'
  },
  stepDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30
  },
  inputGroup: { marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#059669',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 65,
    backgroundColor: '#f0fdf4'
  },
  icon: { marginRight: 15 },
  input: { flex: 1, fontSize: 17, color: '#111827' },
  button: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 15,
    marginTop: 10,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  buttonDisabled: { backgroundColor: '#9ca3af', shadowOpacity: 0 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  resendButton: {
    alignItems: 'center',
    marginTop: 25,
    padding: 10
  },
  resendText: {
    color: '#059669',
    fontSize: 15,
    fontWeight: '600'
  }
});
