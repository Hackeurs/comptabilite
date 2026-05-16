import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { FileText, Plus, ArrowLeft, Edit, Trash2, Send, Check, Clock, DollarSign } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { 
  getInvoices, 
  addInvoice, 
  updateInvoiceStatus, 
  deleteInvoice, 
  Invoice, 
  getClients, 
  Client, 
  getCurrency 
} from '../src/database/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const getStatusColor = (status: Invoice['status']) => {
  switch (status) {
    case 'DRAFT': return '#9ca3af';
    case 'SENT': return '#3b82f6';
    case 'PAID': return '#10b981';
    case 'CANCELLED': return '#ef4444';
    default: return '#9ca3af';
  }
};

const getStatusBg = (status: Invoice['status']) => {
  switch (status) {
    case 'DRAFT': return '#f3f4f6';
    case 'SENT': return '#dbeafe';
    case 'PAID': return '#d1fae5';
    case 'CANCELLED': return '#fee2e2';
    default: return '#f3f4f6';
  }
};

const getStatusText = (status: Invoice['status']) => {
  switch (status) {
    case 'DRAFT': return 'Brouillon';
    case 'SENT': return 'Envoyée';
    case 'PAID': return 'Payée';
    case 'CANCELLED': return 'Annulée';
    default: return status;
  }
};

export default function InvoicesScreen() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currency, setCurrency] = useState('€');
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    clientId: undefined as number | undefined,
    clientName: '',
    totalAmount: '',
    notes: '',
    dueDate: ''
  });

  const loadData = useCallback(() => {
    setInvoices(getInvoices());
    setClients(getClients());
    setCurrency(getCurrency());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAddInvoice = () => {
    if (!formData.totalAmount) {
      Alert.alert('Erreur', 'Veuillez saisir le montant total');
      return;
    }

    try {
      const client = clients.find(c => c.id === formData.clientId);
      addInvoice(
        formData.clientId,
        client?.name || formData.clientName,
        parseFloat(formData.totalAmount),
        undefined,
        formData.notes,
        formData.dueDate || undefined
      );
      Alert.alert('Succès', 'Facture créée avec succès !');
      setModalVisible(false);
      setFormData({ clientId: undefined, clientName: '', totalAmount: '', notes: '', dueDate: '' });
      loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la facture');
    }
  };

  const handleUpdateStatus = (invoice: Invoice, newStatus: Invoice['status']) => {
    try {
      updateInvoiceStatus(invoice.id, newStatus);
      loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la facture');
    }
  };

  const handleDelete = (invoice: Invoice) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette facture ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            try {
              deleteInvoice(invoice.id);
              loadData();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la facture');
            }
          }
        }
      ]
    );
  };

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <View style={styles.invoiceCard}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceIcon}>
          <FileText size={20} color="#3b82f6" />
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceNumber}>{item.invoice_number}</Text>
          <Text style={styles.invoiceClient}>{item.client_name || 'Client non spécifié'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <View style={styles.invoiceDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Montant</Text>
          <Text style={styles.detailValue}>{item.total_amount.toFixed(2)} {currency}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Créée le</Text>
          <Text style={styles.detailValue}>
            {format(new Date(item.created_at), 'dd MMM yyyy', { locale: fr })}
          </Text>
        </View>
      </View>
      <View style={styles.invoiceActions}>
        {item.status === 'DRAFT' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.sendBtn]}
            onPress={() => handleUpdateStatus(item, 'SENT')}
          >
            <Send size={16} color="white" />
            <Text style={styles.actionBtnText}>Envoyer</Text>
          </TouchableOpacity>
        )}
        {item.status === 'SENT' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.paidBtn]}
            onPress={() => handleUpdateStatus(item, 'PAID')}
          >
            <Check size={16} color="white" />
            <Text style={styles.actionBtnText}>Marquer Payée</Text>
          </TouchableOpacity>
        )}
        {item.status !== 'CANCELLED' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={() => handleUpdateStatus(item, 'CANCELLED')}
          >
            <Clock size={16} color="white" />
            <Text style={styles.actionBtnText}>Annuler</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item)}
        >
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Factures</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Plus color="white" size={20} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderInvoiceItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FileText size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucune facture</Text>
            <Text style={styles.emptySubtext}>Créez votre première facture</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle Facture</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Client</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientSelector}>
                  <TouchableOpacity 
                    style={[styles.clientOption, !formData.clientId && styles.clientOptionActive]}
                    onPress={() => setFormData({ ...formData, clientId: undefined, clientName: '' })}
                  >
                    <Text style={[styles.clientOptionText, !formData.clientId && styles.clientOptionTextActive]}>
                      Aucun
                    </Text>
                  </TouchableOpacity>
                  {clients.map(client => (
                    <TouchableOpacity 
                      key={client.id} 
                      style={[styles.clientOption, formData.clientId === client.id && styles.clientOptionActive]}
                      onPress={() => setFormData({ ...formData, clientId: client.id, clientName: client.name })}
                    >
                      <Text style={[styles.clientOptionText, formData.clientId === client.id && styles.clientOptionTextActive]}>
                        {client.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Montant total *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.totalAmount}
                  onChangeText={(text) => setFormData({ ...formData, totalAmount: text })}
                  placeholder="Ex: 100000"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date d'échéance (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.dueDate}
                  onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
                  placeholder="Ex: 2024-12-31"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes (optionnel)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="Notes supplémentaires..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddInvoice}>
              <DollarSign size={20} color="white" />
              <Text style={styles.saveBtnText}>Créer la facture</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827', flex: 1 },
  addBtn: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContent: { padding: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#4b5563', marginTop: 15 },
  emptySubtext: { fontSize: 14, color: '#9ca3af', marginTop: 5 },
  invoiceCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  invoiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  invoiceInfo: { flex: 1 },
  invoiceNumber: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  invoiceClient: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '600' },
  invoiceDetails: { marginBottom: 12 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  detailLabel: { fontSize: 13, color: '#6b7280' },
  detailValue: { fontSize: 13, fontWeight: '500', color: '#111827' },
  invoiceActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6
  },
  sendBtn: { backgroundColor: '#3b82f6' },
  paidBtn: { backgroundColor: '#10b981' },
  cancelBtn: { backgroundColor: '#9ca3af' },
  deleteBtn: { backgroundColor: '#fef2f2' },
  actionBtnText: { color: 'white', fontSize: 13, fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  cancelText: { fontSize: 16, color: '#6b7280' },
  modalBody: { padding: 20, maxHeight: '70%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9fafb'
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  clientSelector: { flexDirection: 'row', gap: 8 },
  clientOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb'
  },
  clientOptionActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  clientOptionText: { fontSize: 13, fontWeight: '500', color: '#4b5563' },
  clientOptionTextActive: { color: 'white' },
  saveBtn: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    margin: 20,
    borderRadius: 15,
    gap: 10
  },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
