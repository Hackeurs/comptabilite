import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { Plus, Minus, ArrowUpCircle, ArrowDownCircle, X, TrendingUp, TrendingDown, Tag, Wallet } from 'lucide-react-native';
import { getCashBalance, getCashTransactions, addCashTransaction, getCurrency, CashTransaction } from '../src/database/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFocusEffect } from 'expo-router';

const TRANSACTION_CATEGORIES = {
  IN: ['Vente', 'Remboursement', 'Investissement', 'Prêt', 'Autre Entrée'],
  OUT: ['Achat', 'Loyer', 'Salaire', 'Facture', 'Transport', 'Autre Sortie']
};

export default function CashScreen() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'IN' | 'OUT'>('IN');
  const [formData, setFormData] = useState({ amount: '', description: '', category: '' });
  const [currency, setCurrency] = useState('FCFA');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const fetchData = useCallback(() => {
    setBalance(getCashBalance());
    setTransactions(getCashTransactions());
    setCurrency(getCurrency());
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleSave = () => {
    if (!formData.amount || !formData.description) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      const desc = formData.category ? `${formData.category} - ${formData.description}` : formData.description;
      addCashTransaction(parseFloat(formData.amount), transactionType, desc);
      setModalVisible(false);
      setFormData({ amount: '', description: '', category: '' });
      setShowCategoryPicker(false);
      fetchData();
      Alert.alert('Succès', 'Transaction enregistrée');
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'enregistrer la transaction");
    }
  };

  const totalIn = transactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);

  const renderItem = ({ item }: { item: CashTransaction }) => (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: item.type === 'IN' ? '#ecfdf5' : '#fef2f2' }]}>
        {item.type === 'IN' ? <ArrowUpCircle color="#10b981" size={28} /> : <ArrowDownCircle color="#ef4444" size={28} />}
      </View>
      <View style={styles.details}>
        <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.date}>{format(new Date(item.date), 'dd MMM yyyy, HH:mm', { locale: fr })}</Text>
      </View>
      <Text style={[styles.amount, { color: item.type === 'IN' ? '#10b981' : '#ef4444' }]}>
        {item.type === 'IN' ? '+' : '-'}{item.amount.toFixed(2)} {currency}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Solde en Caisse</Text>
        <Text style={styles.balanceValue}>{balance.toFixed(2)} {currency}</Text>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <TrendingUp size={16} color="#10b981" />
            <Text style={styles.summaryLabelIn}>Entrées: {totalIn.toFixed(0)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <TrendingDown size={16} color="#ef4444" />
            <Text style={styles.summaryLabelOut}>Sorties: {totalOut.toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
            onPress={() => { 
              setTransactionType('IN'); 
              setFormData({ amount: '', description: '', category: '' });
              setModalVisible(true); 
            }}
          >
            <Plus color="white" size={20} />
            <Text style={styles.actionBtnText}>Entrée</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
            onPress={() => { 
              setTransactionType('OUT'); 
              setFormData({ amount: '', description: '', category: '' });
              setModalVisible(true); 
            }}
          >
            <Minus color="white" size={20} />
            <Text style={styles.actionBtnText}>Sortie</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Transactions Récentes</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Wallet size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucune transaction enregistrée.</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {transactionType === 'IN' ? 'Nouvelle Entrée' : 'Nouvelle Sortie'}
              </Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setShowCategoryPicker(false);
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Montant ({currency}) *</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputPrefix}>{currency}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={formData.amount}
                    onChangeText={(text) => setFormData({...formData, amount: text})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Catégorie</Text>
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Tag color="#9ca3af" size={20} style={styles.inputIcon} />
                  <Text style={styles.input}>
                    {formData.category || 'Sélectionner une catégorie'}
                  </Text>
                </TouchableOpacity>
                
                {showCategoryPicker && (
                  <View style={styles.categoryPicker}>
                    {TRANSACTION_CATEGORIES[transactionType].map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryItem,
                          formData.category === cat && styles.categoryItemSelected
                        ]}
                        onPress={() => {
                          setFormData({...formData, category: cat});
                          setShowCategoryPicker(false);
                        }}
                      >
                        <Text style={[
                          styles.categoryText,
                          formData.category === cat && styles.categoryTextSelected
                        ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={styles.inputArea}
                  value={formData.description}
                  onChangeText={(text) => setFormData({...formData, description: text})}
                  placeholder="Ex: Vente de marchandises, paiement loyer..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: transactionType === 'IN' ? '#10b981' : '#ef4444' }]} 
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafb' 
  },
  balanceCard: { 
    backgroundColor: '#059669', 
    padding: 24, 
    paddingTop: 32,
    alignItems: 'center', 
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32 
  },
  balanceLabel: { 
    color: 'white', 
    opacity: 0.85, 
    fontSize: 16 
  },
  balanceValue: { 
    color: 'white', 
    fontSize: 40, 
    fontWeight: 'bold', 
    marginVertical: 8 
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
    marginBottom: 16
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  summaryLabelIn: {
    color: '#a7f3d0',
    fontSize: 13,
    fontWeight: '600'
  },
  summaryLabelOut: {
    color: '#fecaca',
    fontSize: 13,
    fontWeight: '600'
  },
  actionButtons: { 
    flexDirection: 'row', 
    marginTop: 16, 
    gap: 16 
  },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  actionBtnText: { 
    color: 'white', 
    fontWeight: 'bold', 
    marginLeft: 8 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    color: '#1f2937' 
  },
  listContainer: { 
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  card: { 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  iconContainer: { 
    width: 52, 
    height: 52, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 14 
  },
  details: { 
    flex: 1 
  },
  description: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#1f2937' 
  },
  date: { 
    fontSize: 12, 
    color: '#9ca3af', 
    marginTop: 4 
  },
  amount: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 60 
  },
  emptyText: { 
    marginTop: 12, 
    color: '#9ca3af', 
    fontSize: 16 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    padding: 24,
    maxHeight: '85%'
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 24 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#111827'
  },
  inputGroup: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 8,
    color: '#374151'
  },
  inputContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5, 
    borderColor: '#e5e7eb', 
    borderRadius: 14, 
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    height: 52
  },
  inputPrefix: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 8
  },
  inputIcon: {
    marginRight: 12
  },
  input: { 
    flex: 1,
    fontSize: 16,
    color: '#111827'
  },
  inputArea: { 
    borderWidth: 1.5, 
    borderColor: '#e5e7eb', 
    borderRadius: 14, 
    padding: 16, 
    fontSize: 16,
    backgroundColor: '#f9fafb',
    minHeight: 100,
    textAlignVertical: 'top'
  },
  categoryPicker: {
    marginTop: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  categoryItemSelected: {
    backgroundColor: '#3b82f6'
  },
  categoryText: {
    fontSize: 14,
    color: '#374151'
  },
  categoryTextSelected: {
    color: 'white',
    fontWeight: '600'
  },
  saveButton: { 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 8
  },
  saveButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 18 
  }
});
