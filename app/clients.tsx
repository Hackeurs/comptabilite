import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { Plus, User, Phone, MapPin, X, Search, Edit3 } from 'lucide-react-native';
import { getClients, addClient, Client, getCurrency } from '../src/database/database';
import { useFocusEffect } from 'expo-router';

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const fetchClients = useCallback(() => {
    try {
      setClients(getClients(searchQuery));
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchClients();
    }, [fetchClients])
  );

  const handleSave = () => {
    if (!formData.name) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }

    try {
      addClient(formData.name, formData.phone, formData.address);
      setModalVisible(false);
      setFormData({ name: '', phone: '', address: '' });
      fetchClients();
      Alert.alert('Succès', 'Client ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'ajouter le client");
    }
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.row}>
          <Phone size={14} color="#6b7280" />
          <Text style={styles.subText}>{item.phone || 'Non renseigné'}</Text>
        </View>
        <View style={styles.row}>
          <MapPin size={14} color="#6b7280" />
          <Text style={styles.subText}>{item.address || 'Non renseignée'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Clients</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus color="white" size={20} />
          <Text style={styles.addButtonText}>Nouveau Client</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#9ca3af" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un client..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderClientItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <User size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucun client trouvé.</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter un client</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#6b7280" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Jean Dupont"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: +225 01020304"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Abidjan, Cocody"
                value={formData.address}
                onChangeText={(text) => setFormData({...formData, address: text})}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 20, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  addButton: { backgroundColor: '#10b981', flexDirection: 'row', padding: 10, borderRadius: 10, alignItems: 'center' },
  addButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 5 },
  searchContainer: { margin: 16, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 45 },
  listContainer: { padding: 16 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 15, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  subText: { marginLeft: 5, color: '#6b7280' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: '#9ca3af' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, height: 45 },
  saveButton: { backgroundColor: '#10b981', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});