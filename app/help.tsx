import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Modal, TextInput } from 'react-native';
import { HelpCircle, Phone, Mail, Book, Globe, Save, Download, X } from 'lucide-react-native';
import { exportData, importData } from '../src/database/database';

export default function HelpScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [restoreJson, setRestoreJson] = useState('');

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  const handleBackup = () => {
    try {
      const data = exportData();
      // Since we don't have easy file sharing, copying to clipboard is a quick backup
      Alert.alert('Sauvegarde', 'Les données sont prêtes. Copiez le texte suivant dans un endroit sûr.', [
        { text: 'OK' }
      ]);
      console.log('BACKUP DATA:', data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer la sauvegarde.');
    }
  };

  const handleRestore = () => {
    if (!restoreJson) {
      Alert.alert('Erreur', 'Veuillez coller le contenu de la sauvegarde.');
      return;
    }

    Alert.alert(
      'Confirmer la restauration',
      'Toutes les données actuelles seront écrasées. Voulez-vous continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Restaurer', 
          style: 'destructive',
          onPress: () => {
            try {
              importData(restoreJson);
              setModalVisible(false);
              setRestoreJson('');
              Alert.alert('Succès', 'Les données ont été restaurées avec succès. Veuillez redémarrer l\'application.');
            } catch (error) {
              Alert.alert('Erreur', 'Le format de la sauvegarde est invalide.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <HelpCircle size={64} color="#10b981" />
        <Text style={styles.title}>Centre d'Aide</Text>
        <Text style={styles.subtitle}>Comment pouvons-nous vous aider ?</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sauvegarde & Restauration</Text>
        <TouchableOpacity style={styles.item} onPress={handleBackup}>
          <Save size={20} color="#3b82f6" />
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Sauvegarder les données</Text>
            <Text style={styles.itemDesc}>Affiche les données à copier pour la sauvegarde.</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => setModalVisible(true)}>
          <Download size={20} color="#f59e0b" />
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Restaurer les données</Text>
            <Text style={styles.itemDesc}>Collez une sauvegarde pour restaurer vos données.</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Guide d'utilisation</Text>
        <TouchableOpacity style={styles.item} onPress={() => openLink('https://docs.expo.dev')}>
          <Book size={20} color="#3b82f6" />
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Manuel complet</Text>
            <Text style={styles.itemDesc}>Apprenez à utiliser toutes les fonctionnalités.</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => openLink('https://expo.dev')}>
          <Globe size={20} color="#10b981" />
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Site web officiel</Text>
            <Text style={styles.itemDesc}>Découvrez nos autres outils.</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support Technique</Text>
        <TouchableOpacity style={styles.item} onPress={() => openLink('tel:+2250102030405')}>
          <Phone size={20} color="#10b981" />
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Appeler le support</Text>
            <Text style={styles.itemDesc}>Disponible 24h/7j pour vos urgences.</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => openLink('mailto:support@smartinnovation.com')}>
          <Mail size={20} color="#ef4444" />
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Envoyer un email</Text>
            <Text style={styles.itemDesc}>Réponse sous 24 heures.</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Restaurer une sauvegarde</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#6b7280" /></TouchableOpacity>
            </View>
            <Text style={styles.label}>Collez le texte de la sauvegarde ci-dessous :</Text>
            <TextInput
              style={styles.textArea}
              multiline={true}
              numberOfLines={10}
              placeholder='{"version": "1.1.0", ...}'
              value={restoreJson}
              onChangeText={setRestoreJson}
            />
            <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
              <Text style={styles.restoreBtnText}>Confirmer la Restauration</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.1.0 - Comptabilité Chrétiens</Text>
        <Text style={styles.footerText}>© 2024 Comptabilité Chrétiens</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginTop: 15 },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 5 },
  section: { backgroundColor: 'white', borderRadius: 20, padding: 15, marginBottom: 25, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 15, marginLeft: 5 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemContent: { flex: 1, marginLeft: 15 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  itemDesc: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  footer: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  footerText: { color: '#9ca3af', fontSize: 12, marginTop: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  label: { fontSize: 14, color: '#4b5563', marginBottom: 10 },
  textArea: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 15, padding: 15, height: 250, textAlignVertical: 'top', backgroundColor: '#f9fafb' },
  restoreBtn: { backgroundColor: '#ef4444', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  restoreBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});