import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { Settings as SettingsIcon, DollarSign, Store, Bell, Shield, Save, ArrowLeft, Users, Clock, Download, AlertTriangle, Upload } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { 
  getAllSettings, 
  updateSetting, 
  isAdmin, 
  backupDatabase, 
  importData,
  exportData,
  requestNotificationPermissions, 
  checkAndNotifyLowStock 
} from '../src/database/database';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [shopName, setShopName] = useState('Comptabilité Chrétiens');
  const [currency, setCurrency] = useState('€');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const data = getAllSettings();
    setSettings(data);
    if (data.shopName) setShopName(data.shopName);
    if (data.currency) setCurrency(data.currency);
    if (data.notifications) setNotifications(data.notifications === 'true');
  }, []);

  const handleSave = () => {
    try {
      updateSetting('shopName', shopName);
      updateSetting('currency', currency);
      updateSetting('notifications', notifications.toString());
      Alert.alert('Succès', 'Paramètres enregistrés avec succès !');
      router.back();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer les paramètres.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Général</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Store size={20} color="#4b5563" />
              <Text style={styles.settingLabel}>Nom du Commerce</Text>
            </View>
            <TextInput
              style={styles.input}
              value={shopName}
              onChangeText={setShopName}
              placeholder="Ex: Ma Boutique"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <DollarSign size={20} color="#4b5563" />
              <Text style={styles.settingLabel}>Devise</Text>
            </View>
            <TextInput
              style={styles.input}
              value={currency}
              onChangeText={setCurrency}
              placeholder="Ex: FCFA, €, $"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          
          <View style={styles.settingItemRow}>
            <View style={styles.settingLabelContainer}>
              <Bell size={20} color="#4b5563" />
              <Text style={styles.settingLabel}>Notifications de stock</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#d1d5db', true: '#10b981' }}
            />
          </View>
        </View>

        {isAdmin() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gestion des Utilisateurs</Text>
            <TouchableOpacity style={styles.settingItemRow} onPress={() => router.push('/employees')}>
              <View style={styles.settingLabelContainer}>
                <Users size={20} color="#4b5563" />
                <Text style={styles.settingLabel}>Employés et Administrateurs</Text>
              </View>
              <Text style={styles.linkText}>Gérer →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItemRow} onPress={() => router.push('/activity')}>
              <View style={styles.settingLabelContainer}>
                <Clock size={20} color="#4b5563" />
                <Text style={styles.settingLabel}>Journal d'activité</Text>
              </View>
              <Text style={styles.linkText}>Voir →</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          <TouchableOpacity style={styles.settingItemRow}>
            <View style={styles.settingLabelContainer}>
              <Shield size={20} color="#4b5563" />
              <Text style={styles.settingLabel}>Code de verrouillage</Text>
            </View>
            <Text style={styles.linkText}>Désactivé</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sauvegarde & Restauration</Text>
          
          <TouchableOpacity 
            style={styles.settingItemRow} 
            onPress={async () => {
              try {
                const jsonData = exportData();
                const fileName = `backup_comptabilite_${Date.now()}.json`;
                const filePath = `${FileSystem.documentDirectory}${fileName}`;
                await FileSystem.writeAsStringAsync(filePath, jsonData);
                
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(filePath, {
                    mimeType: 'application/json',
                    dialogTitle: 'Sauvegarder la base de données',
                    UTI: 'public.json'
                  });
                  Alert.alert('Succès', 'Sauvegarde prête à partager !');
                } else {
                  Alert.alert('Succès', `Sauvegarde créée: ${fileName}`);
                }
              } catch (error) {
                console.error('Backup error:', error);
                Alert.alert('Erreur', 'Impossible de sauvegarder');
              }
            }}
          >
            <View style={styles.settingLabelContainer}>
              <Download size={20} color="#4b5563" />
              <Text style={styles.settingLabel}>Sauvegarder & Partager</Text>
            </View>
            <Text style={styles.linkText}>Sauvegarder →</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItemRow}
            onPress={() => {
              Alert.alert(
                'Restauration',
                'Pour restaurer: ouvrez le fichier .json de sauvegarde avec cette application, ou utilisez un explorateur de fichiers pour sélectionner le fichier.',
                [
                  { text: 'OK', style: 'default' }
                ]
              );
            }}
          >
            <View style={styles.settingLabelContainer}>
              <Upload size={20} color="#4b5563" />
              <Text style={styles.settingLabel}>Restaurer une sauvegarde</Text>
            </View>
            <Text style={styles.linkText}>Info →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <TouchableOpacity 
            style={styles.settingItemRow} 
            onPress={async () => {
              const granted = await requestNotificationPermissions();
              if (granted) {
                await checkAndNotifyLowStock();
                Alert.alert('Succès', 'Notifications activées !');
              } else {
                Alert.alert('Erreur', 'Veuillez autoriser les notifications');
              }
            }}
          >
            <View style={styles.settingLabelContainer}>
              <AlertTriangle size={20} color="#4b5563" />
              <Text style={styles.settingLabel}>Tester les notifications</Text>
            </View>
            <Text style={styles.linkText}>Tester →</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Save size={20} color="white" />
          <Text style={styles.saveBtnText}>Enregistrer les modifications</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb',
    paddingTop: 50
  },
  backBtn: { marginRight: 15 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  content: { padding: 20 },
  section: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#f3f4f6' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
  settingItem: { marginBottom: 15 },
  settingItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  settingLabelContainer: { flexDirection: 'row', alignItems: 'center' },
  settingLabel: { fontSize: 16, color: '#374151', marginLeft: 10, fontWeight: '500' },
  input: { 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 10, 
    padding: 12, 
    marginTop: 8, 
    fontSize: 16,
    backgroundColor: '#f9fafb'
  },
  linkText: { color: '#6b7280', fontSize: 14 },
  saveBtn: { 
    backgroundColor: '#10b981', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 18, 
    borderRadius: 15, 
    marginTop: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});
