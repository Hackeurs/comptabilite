import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { Plus, Check, User, Truck, X, Search, Calendar, DollarSign } from 'lucide-react-native';
import { getCredits, addCredit, markCreditRepaid, getClients, getSuppliers, getCurrency, Credit, Client, Supplier } from '../src/database/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFocusEffect } from 'expo-router';

export default function CreditsScreen() {
  const [type, setType] = useState<'CLIENT' | 'SUPPLIER'>('CLIENT');
  const [credits, setCredits] = useState<Credit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Client | Supplier | null>(null);
  const [formData, setFormData] = useState({ amount: '', description: '' });
  const [currency, setCurrency] = useState('€');

  const fetchData = useCallback(() => {
    setCredits(getCredits(type));
    setClients(getClients());
    setSuppliers(getSuppliers());
    setCurrency(getCurrency());
  }, [type]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleSave = () => {
    if (!selectedPerson || !formData.amount) {
      Alert.alert('Erreur', 'Veuillez sélectionner une personne et un montant');
      return;
    }

    try {
      addCredit(selectedPerson.id, parseFloat(formData.amount), type, formData.description);
      setModalVisible(false);
      setSelectedPerson(null);
      setFormData({ amount: '', description: '' });
      fetchData();
      Alert.alert('Succès', 'Crédit enregistré');
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'enregistrer le crédit");
    }
  };

  const handleRepay = (id: number) => {
    Alert.alert(
      'Confirmer le remboursement',
      'Le crédit a-t-il été remboursé ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Oui, remboursé', onPress: () => {
          markCreditRepaid(id);
          fetchData();
        }}
      ]
    );
  };

  const renderItem = ({ item }: { item: Credit }) => {
    const person = type === 'CLIENT' 
      ? clients.find(c => c.id === item.person_id)
      : suppliers.find(s => s.id === item.person_id);

    return (
      <View style={[styles.card, item.is_repaid && styles.repaidCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.personName}>{person?.name || 'Inconnu'}</Text>
          <Text style={[styles.amount, item.is_repaid && styles.repaidText]}>
            {item.amount.toFixed(2)} {currency}
          </Text>
        </View>
        <Text style={styles.description}>{item.description || 'Aucune description'}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.dateContainer}>
            <Calendar size={14} color="#9ca3af" />
            <Text style={styles.date}>{format(new Date(item.date), 'dd MMM yyyy', { locale: fr })}</Text>
          </View>
          {!item.is_repaid && (
            <TouchableOpacity style={styles.repayBtn} onPress={() => handleRepay(item.id)}>
              <Check size={16} color="white" />
              <Text style={styles.repayBtnText}>Remboursé</Text>
            </TouchableOpacity>
          )}
          {item.is_repaid && (
            <View style={styles.repaidBadge}>
              <Check size={14} color="#10b981" />
              <Text style={styles.repaidBadgeText}>Remboursé</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, type === 'CLIENT' && styles.activeTab]}
          onPress={() => setType('CLIENT')}
        >
          <User size={20} color={type === 'CLIENT' ? 'white' : '#6b7280'} />
          <Text style={[styles.tabText, type === 'CLIENT' && styles.activeTabText]}>Crédits Clients</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, type === 'SUPPLIER' && styles.activeTab]}
          onPress={() => setType('SUPPLIER')}
        >
          <Truck size={20} color={type === 'SUPPLIER' ? 'white' : '#6b7280'} />
          <Text style={[styles.tabText, type === 'SUPPLIER' && styles.activeTabText]}>Crédits Fournisseurs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>{type === 'CLIENT' ? 'Crédits Clients' : 'Crédits Fournisseurs'}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Plus color="white" size={20} />
          <Text style={styles.addButtonText}>Nouveau</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={credits}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <DollarSign size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucun crédit enregistré.</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouveau Crédit</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#6b7280" /></TouchableOpacity>
            </View>

            <Text style={styles.label}>Sélectionner {type === 'CLIENT' ? 'un client' : 'un fournisseur'}</Text>
            <ScrollView horizontal style={styles.selector} showsHorizontalScrollIndicator={false}>
              {(type === 'CLIENT' ? clients : suppliers).map((p) => (
                <TouchableOpacity 
                  key={p.id}
                  style={[styles.option, selectedPerson?.id === p.id && styles.selectedOption]}
                  onPress={() => setSelectedPerson(p)}
                >
                  <Text style={[styles.optionText, selectedPerson?.id === p.id && styles.selectedOptionText]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Montant ({currency})</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={formData.amount}
                onChangeText={(text) => setFormData({...formData, amount: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Note / Description</Text>
              <TextInput
                style={styles.input}
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Enregistrer le crédit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  tabs: { flexDirection: 'row', backgroundColor: 'white', padding: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, gap: 8 },
  activeTab: { backgroundColor: '#10b981' },
  tabText: { color: '#6b7280', fontWeight: 'bold' },
  activeTabText: { color: 'white' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  addButton: { backgroundColor: '#10b981', flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, alignItems: 'center' },
  addButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 5 },
  listContainer: { padding: 16 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  repaidCard: { backgroundColor: '#f9fafb', opacity: 0.7 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  personName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  amount: { fontSize: 16, fontWeight: 'bold', color: '#ef4444' },
  repaidText: { color: '#10b981' },
  description: { color: '#6b7280', fontSize: 14, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  date: { color: '#9ca3af', fontSize: 12 },
  repayBtn: { backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, gap: 5 },
  repayBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  repaidBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  repaidBadgeText: { color: '#10b981', fontWeight: 'bold', fontSize: 12 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: '#9ca3af' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  selector: { flexDirection: 'row', marginBottom: 20 },
  option: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, backgroundColor: '#f3f4f6', marginRight: 10 },
  selectedOption: { backgroundColor: '#10b981' },
  optionText: { color: '#6b7280' },
  selectedOptionText: { color: 'white' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12 },
  saveButton: { backgroundColor: '#10b981', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});