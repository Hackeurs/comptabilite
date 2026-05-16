import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Calendar, Plus, ArrowLeft, Edit, Trash2, Check, Clock, Users } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { 
  getAppointments, 
  addAppointment, 
  updateAppointmentStatus, 
  deleteAppointment, 
  Appointment, 
  getClients, 
  Client 
} from '../src/database/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const getStatusColor = (status: Appointment['status']) => {
  switch (status) {
    case 'PENDING': return '#f59e0b';
    case 'CONFIRMED': return '#3b82f6';
    case 'COMPLETED': return '#10b981';
    case 'CANCELLED': return '#ef4444';
    default: return '#9ca3af';
  }
};

const getStatusBg = (status: Appointment['status']) => {
  switch (status) {
    case 'PENDING': return '#fffbeb';
    case 'CONFIRMED': return '#dbeafe';
    case 'COMPLETED': return '#d1fae5';
    case 'CANCELLED': return '#fee2e2';
    default: return '#f3f4f6';
  }
};

const getStatusText = (status: Appointment['status']) => {
  switch (status) {
    case 'PENDING': return 'En attente';
    case 'CONFIRMED': return 'Confirmé';
    case 'COMPLETED': return 'Terminé';
    case 'CANCELLED': return 'Annulé';
    default: return status;
  }
};

export default function AppointmentsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    clientId: undefined as number | undefined,
    clientName: ''
  });

  const loadData = useCallback(() => {
    setAppointments(getAppointments());
    setClients(getClients());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAddAppointment = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre');
      return;
    }
    if (!formData.date) {
      Alert.alert('Erreur', 'Veuillez saisir une date');
      return;
    }

    try {
      const client = clients.find(c => c.id === formData.clientId);
      addAppointment(
        formData.title,
        formData.date,
        formData.time || undefined,
        formData.clientId,
        client?.name || formData.clientName,
        formData.description
      );
      Alert.alert('Succès', 'Rendez-vous ajouté avec succès !');
      setModalVisible(false);
      setFormData({
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '',
        clientId: undefined,
        clientName: ''
      });
      loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le rendez-vous');
    }
  };

  const handleUpdateStatus = (appointment: Appointment, newStatus: Appointment['status']) => {
    try {
      updateAppointmentStatus(appointment.id, newStatus);
      loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le rendez-vous');
    }
  };

  const handleDelete = (appointment: Appointment) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce rendez-vous ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            try {
              deleteAppointment(appointment.id);
              loadData();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le rendez-vous');
            }
          }
        }
      ]
    );
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        {item.client_name && (
          <View style={styles.clientBadge}>
            <Users size={12} color="#4b5563" />
            <Text style={styles.clientText}>{item.client_name}</Text>
          </View>
        )}
      </View>
      <Text style={styles.appointmentTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.appointmentDescription}>{item.description}</Text>
      )}
      <View style={styles.appointmentMeta}>
        <View style={styles.metaItem}>
          <Calendar size={14} color="#6b7280" />
          <Text style={styles.metaText}>
            {format(new Date(item.date), 'dd MMM yyyy', { locale: fr })}
          </Text>
        </View>
        {item.time && (
          <View style={styles.metaItem}>
            <Clock size={14} color="#6b7280" />
            <Text style={styles.metaText}>{item.time}</Text>
          </View>
        )}
      </View>
      <View style={styles.appointmentActions}>
        {item.status === 'PENDING' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.confirmBtn]}
            onPress={() => handleUpdateStatus(item, 'CONFIRMED')}
          >
            <Check size={16} color="white" />
            <Text style={styles.actionBtnText}>Confirmer</Text>
          </TouchableOpacity>
        )}
        {item.status === 'CONFIRMED' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.completeBtn]}
            onPress={() => handleUpdateStatus(item, 'COMPLETED')}
          >
            <Check size={16} color="white" />
            <Text style={styles.actionBtnText}>Terminer</Text>
          </TouchableOpacity>
        )}
        {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && (
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
        <Text style={styles.title}>Rendez-vous</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Plus color="white" size={20} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAppointmentItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Calendar size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucun rendez-vous</Text>
            <Text style={styles.emptySubtext}>Planifiez votre premier rendez-vous</Text>
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
              <Text style={styles.modalTitle}>Nouveau Rendez-vous</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Titre *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Ex: Consultation"
                />
              </View>

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
                <Text style={styles.label}>Date *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder="Ex: 2024-12-31"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Heure (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.time}
                  onChangeText={(text) => setFormData({ ...formData, time: text })}
                  placeholder="Ex: 14:30"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (optionnel)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Détails supplémentaires..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddAppointment}>
              <Calendar size={20} color="white" />
              <Text style={styles.saveBtnText}>Ajouter le rendez-vous</Text>
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
    backgroundColor: '#8b5cf6',
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
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '600' },
  clientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#f3f4f6'
  },
  clientText: { fontSize: 11, fontWeight: '500', color: '#4b5563' },
  appointmentTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  appointmentDescription: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  appointmentMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: '#6b7280' },
  appointmentActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6
  },
  confirmBtn: { backgroundColor: '#3b82f6' },
  completeBtn: { backgroundColor: '#10b981' },
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
  clientOptionActive: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  clientOptionText: { fontSize: 13, fontWeight: '500', color: '#4b5563' },
  clientOptionTextActive: { color: 'white' },
  saveBtn: {
    backgroundColor: '#8b5cf6',
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
