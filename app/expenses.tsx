import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import { Plus, Receipt, DollarSign, X, Tag, Calendar, Edit2, Trash2, Check } from 'lucide-react-native';
import { getExpenses, addExpense, updateExpense, deleteExpense, Expense, getCurrency } from '../src/database/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFocusEffect } from 'expo-router';

const EXPENSE_CATEGORIES = [
  'Loyer',
  'Électricité',
  'Eau',
  'Internet',
  'Salaires',
  'Fournitures',
  'Transport',
  'Marketing',
  'Assurance',
  'Maintenance',
  'Général'
];

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({ 
    description: '', 
    amount: '', 
    category: 'Général',
    date: new Date().toISOString()
  });
  const [currency, setCurrency] = useState('FCFA');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const fetchExpenses = useCallback(() => {
    try {
      setExpenses(getExpenses());
      setCurrency(getCurrency());
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [fetchExpenses])
  );

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleSave = () => {
    if (!formData.description || !formData.amount) {
      Alert.alert('Erreur', 'Veuillez remplir la description et le montant');
      return;
    }

    try {
      if (editingExpense) {
        updateExpense(
          editingExpense.id,
          formData.description,
          parseFloat(formData.amount),
          formData.category,
          formData.date
        );
      } else {
        addExpense(
          formData.description,
          parseFloat(formData.amount),
          formData.category,
          formData.date
        );
      }
      setModalVisible(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'enregistrer la dépense");
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.expense_date
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette dépense ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            deleteExpense(id);
            fetchExpenses();
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setEditingExpense(null);
    setFormData({ 
      description: '', 
      amount: '', 
      category: 'Général',
      date: new Date().toISOString()
    });
    setShowCategoryPicker(false);
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseIconContainer}>
        <Receipt color="#ef4444" size={24} />
      </View>
      <View style={styles.expenseDetails}>
        <Text style={styles.expenseDesc}>{item.description}</Text>
        <View style={styles.expenseMeta}>
          <Tag size={12} color="#9ca3af" />
          <Text style={styles.expenseCategory}>{item.category}</Text>
          <Text style={styles.expenseDate}>
            • {format(new Date(item.expense_date), 'dd MMM yyyy', { locale: fr })}
          </Text>
        </View>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>-{item.amount.toFixed(2)} {currency}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
            <Edit2 size={16} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dépenses</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Plus color="white" size={24} />
          <Text style={styles.addButtonText}>Nouvelle Dépense</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total des dépenses</Text>
        <Text style={styles.summaryAmount}>{totalExpenses.toFixed(2)} {currency}</Text>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExpenseItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Receipt size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucune dépense enregistrée.</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingExpense ? 'Modifier la dépense' : 'Ajouter une dépense'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#6b7280" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <View style={styles.inputContainer}>
                  <Receipt color="#9ca3af" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Loyer, Électricité..."
                    value={formData.description}
                    onChangeText={(text) => setFormData({...formData, description: text})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Montant ({currency}) *</Text>
                <View style={styles.inputContainer}>
                  <DollarSign color="#ef4444" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={formData.amount}
                    onChangeText={(text) => setFormData({...formData, amount: text})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => {
                    const today = new Date().toISOString();
                    setFormData({...formData, date: today});
                  }}
                >
                  <Calendar color="#9ca3af" size={20} style={styles.inputIcon} />
                  <Text style={styles.input}>
                    {format(new Date(formData.date), 'dd MMMM yyyy', { locale: fr })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Catégorie</Text>
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Tag color="#9ca3af" size={20} style={styles.inputIcon} />
                  <Text style={styles.input}>{formData.category}</Text>
                </TouchableOpacity>
                
                {showCategoryPicker && (
                  <View style={styles.categoryPicker}>
                    {EXPENSE_CATEGORIES.map((cat) => (
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
                        {formData.category === cat && <Check size={16} color="#ffffff" />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {editingExpense ? 'Mettre à jour' : 'Enregistrer la dépense'}
                </Text>
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
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  summaryCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#991b1b',
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  expenseCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  expenseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDesc: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  expenseCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  categoryPicker: {
    marginTop: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryItemSelected: {
    backgroundColor: '#ef4444',
  },
  categoryText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#ef4444',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
