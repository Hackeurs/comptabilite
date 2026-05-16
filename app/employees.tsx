import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch, Modal } from 'react-native';
import { Users, Plus, Edit, Trash2, Save, ArrowLeft, Shield, UserCheck, UserX, Settings, Lock, Unlock, Eye, EyeOff, MessageSquare } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { 
  getEmployees, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee, 
  updateEmployeePIN, 
  isAdmin, 
  UserRole,
  DEFAULT_EMPLOYEE_PERMISSIONS,
  UserPermissions,
  setUserPermissions,
  updateEmployeeSalary,
  getCurrency,
  updateUserEmail
} from '../src/database/database';
import type { User as UserType } from '../src/database/database';

const PERMISSION_LABELS: Record<keyof UserPermissions, string> = {
  can_view_sales: 'Voir les ventes',
  can_create_sales: 'Créer des ventes',
  can_delete_sales: 'Supprimer des ventes',
  can_view_products: 'Voir le stock',
  can_create_products: 'Créer des produits',
  can_edit_products: 'Modifier les produits',
  can_delete_products: 'Supprimer des produits',
  can_view_expenses: 'Voir les dépenses',
  can_create_expenses: 'Créer des dépenses',
  can_edit_expenses: 'Modifier les dépenses',
  can_delete_expenses: 'Supprimer des dépenses',
  can_view_reports: 'Voir les rapports',
  can_view_clients: 'Voir les clients',
  can_manage_clients: 'Gérer les clients',
  can_view_suppliers: 'Voir les fournisseurs',
  can_manage_suppliers: 'Gérer les fournisseurs',
  can_view_cash: 'Voir la caisse',
  can_manage_cash: 'Gérer la caisse',
  can_view_credits: 'Voir les crédits',
  can_manage_credits: 'Gérer les crédits',
};

export default function EmployeesScreen() {
  const router = useRouter();
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [currency, setCurrency] = useState('€');
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<UserType | null>(null);
  const [permissionsEmployee, setPermissionsEmployee] = useState<UserType | null>(null);
  const [employeePermissions, setEmployeePermissions] = useState<UserPermissions>(DEFAULT_EMPLOYEE_PERMISSIONS);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    role: 'EMPLOYEE' as UserRole,
    isActive: 1,
    pin: '',
    confirmPin: '',
    salary: ''
  });

  const loadEmployees = useCallback(() => {
    const data = getEmployees();
    setEmployees(data);
    setCurrency(getCurrency());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEmployees();
    }, [loadEmployees])
  );

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      username: '',
      phone: '',
      email: '',
      role: 'EMPLOYEE',
      isActive: 1,
      pin: '',
      confirmPin: '',
      salary: ''
    });
    setModalVisible(true);
  };

  const openEditModal = (employee: UserType) => {
    setEditingEmployee(employee);
    setFormData({
      username: employee.username,
      phone: employee.phone || '',
      email: employee.email || '',
      role: employee.role,
      isActive: employee.is_active,
      pin: '',
      confirmPin: '',
      salary: employee.salary?.toString() || ''
    });
    setModalVisible(true);
  };

  const openPermissionsModal = (employee: UserType) => {
    setPermissionsEmployee(employee);
    if (employee.permissions) {
      try {
        setEmployeePermissions({ ...DEFAULT_EMPLOYEE_PERMISSIONS, ...JSON.parse(employee.permissions) });
      } catch {
        setEmployeePermissions(DEFAULT_EMPLOYEE_PERMISSIONS);
      }
    } else {
      setEmployeePermissions(DEFAULT_EMPLOYEE_PERMISSIONS);
    }
    setPermissionsModalVisible(true);
  };

  const handleSavePermissions = () => {
    if (permissionsEmployee) {
      try {
        setUserPermissions(permissionsEmployee.id, employeePermissions);
        Alert.alert('Succès', 'Permissions mises à jour !');
        setPermissionsModalVisible(false);
        loadEmployees();
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de mettre à jour les permissions');
      }
    }
  };

  const handleSave = () => {
    if (!formData.username.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom d\'utilisateur');
      return;
    }

    if (!editingEmployee) {
      if (!formData.pin || formData.pin.length !== 4) {
        Alert.alert('Erreur', 'Veuillez saisir un code PIN de 4 chiffres');
        return;
      }
      if (formData.pin !== formData.confirmPin) {
        Alert.alert('Erreur', 'Les codes PIN ne correspondent pas');
        return;
      }

      try {
        const newEmployeeId = addEmployee(formData.username, formData.pin, formData.phone, formData.role);
        if (formData.salary) {
          updateEmployeeSalary(newEmployeeId, parseFloat(formData.salary));
        }
        if (formData.email) {
          updateUserEmail(newEmployeeId, formData.email);
        }
        Alert.alert('Succès', 'Employé ajouté avec succès !');
        setModalVisible(false);
        loadEmployees();
      } catch (error) {
        Alert.alert('Erreur', 'Impossible d\'ajouter l\'employé');
      }
    } else {
      try {
        updateEmployee(
          editingEmployee.id,
          formData.username,
          formData.phone,
          formData.role,
          formData.isActive
        );

        if (formData.pin) {
          if (formData.pin.length !== 4) {
            Alert.alert('Erreur', 'Le code PIN doit contenir 4 chiffres');
            return;
          }
          if (formData.pin !== formData.confirmPin) {
            Alert.alert('Erreur', 'Les codes PIN ne correspondent pas');
            return;
          }
          updateEmployeePIN(editingEmployee.id, formData.pin);
        }
        
        if (formData.salary) {
          updateEmployeeSalary(editingEmployee.id, parseFloat(formData.salary));
        }

        if (formData.email) {
          updateUserEmail(editingEmployee.id, formData.email);
        }

        Alert.alert('Succès', 'Employé mis à jour avec succès !');
        setModalVisible(false);
        loadEmployees();
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de mettre à jour l\'employé');
      }
    }
  };

  const handleDelete = (employee: UserType) => {
    Alert.alert(
      'Confirmation',
      `Êtes-vous sûr de vouloir supprimer ${employee.username} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            try {
              deleteEmployee(employee.id);
              Alert.alert('Succès', 'Employé supprimé avec succès !');
              loadEmployees();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'employé');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Gestion des Employés</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Plus color="white" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {employees.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucun employé</Text>
            <Text style={styles.emptySubtext}>Ajoutez votre premier employé</Text>
          </View>
        ) : (
          employees.map((employee) => (
            <View key={employee.id} style={styles.employeeCard}>
              <View style={styles.employeeInfo}>
                <View style={[
                  styles.avatar,
                  { backgroundColor: employee.role === 'ADMIN' ? '#059669' : '#3b82f6' }
                ]}>
                  <Text style={styles.avatarText}>
                    {employee.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.employeeDetails}>
                  <Text style={styles.employeeName}>{employee.username}</Text>
                  <View style={styles.badges}>
                    <View style={[
                      styles.roleBadge,
                      { backgroundColor: employee.role === 'ADMIN' ? '#d1fae5' : '#dbeafe' }
                    ]}>
                      <Text style={[
                        styles.roleText,
                        { color: employee.role === 'ADMIN' ? '#065f46' : '#1e40af' }
                      ]}>
                        {employee.role === 'ADMIN' ? 'Administrateur' : 'Employé'}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: employee.is_active ? '#d1fae5' : '#fee2e2' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: employee.is_active ? '#065f46' : '#991b1b' }
                      ]}>
                        {employee.is_active ? 'Actif' : 'Inactif'}
                      </Text>
                    </View>
                  </View>
                  {employee.phone && (
                    <Text style={styles.employeePhone}>{employee.phone}</Text>
                  )}
                  {employee.salary && (
                    <Text style={styles.employeeSalary}>
                      {employee.salary.toLocaleString()} {currency}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.employeeActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.chatBtn]}
                  onPress={() => router.push({
                    pathname: '/chat',
                    params: { userId: employee.id }
                  })}
                >
                  <MessageSquare size={18} color="#059669" />
                </TouchableOpacity>
                {employee.role !== 'ADMIN' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.permissionsBtn]}
                    onPress={() => openPermissionsModal(employee)}
                  >
                    <Settings size={18} color="#3b82f6" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openEditModal(employee)}
                >
                  <Edit size={18} color="#4b5563" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(employee)}
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingEmployee ? 'Modifier l\'employé' : 'Ajouter un employé'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom d'utilisateur *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.username}
                  onChangeText={(text) => setFormData({ ...formData, username: text })}
                  placeholder="Ex: Jean Dupont"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Téléphone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Ex: +237 6XX XXX XXX"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Ex: nom@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rôle</Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      formData.role === 'EMPLOYEE' && styles.roleOptionActive
                    ]}
                    onPress={() => setFormData({ ...formData, role: 'EMPLOYEE' })}
                  >
                    <UserCheck size={16} color={formData.role === 'EMPLOYEE' ? 'white' : '#4b5563'} />
                    <Text style={[
                      styles.roleOptionText,
                      formData.role === 'EMPLOYEE' && styles.roleOptionTextActive
                    ]}>
                      Employé
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      formData.role === 'ADMIN' && styles.roleOptionActive
                    ]}
                    onPress={() => setFormData({ ...formData, role: 'ADMIN' })}
                  >
                    <Shield size={16} color={formData.role === 'ADMIN' ? 'white' : '#4b5563'} />
                    <Text style={[
                      styles.roleOptionText,
                      formData.role === 'ADMIN' && styles.roleOptionTextActive
                    ]}>
                      Administrateur
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Salaire</Text>
                <TextInput
                  style={styles.input}
                  value={formData.salary}
                  onChangeText={(text) => setFormData({ ...formData, salary: text })}
                  placeholder={`Ex: 50000 ${currency}`}
                  keyboardType="numeric"
                />
              </View>

              {editingEmployee && (
                <View style={styles.inputGroup}>
                  <View style={styles.switchRow}>
                    <View style={styles.switchLabelContainer}>
                      <UserCheck size={20} color="#4b5563" />
                      <Text style={styles.label}>Compte actif</Text>
                    </View>
                    <Switch
                      value={formData.isActive === 1}
                      onValueChange={(value) => setFormData({ ...formData, isActive: value ? 1 : 0 })}
                      trackColor={{ false: '#d1d5db', true: '#10b981' }}
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {editingEmployee ? 'Nouveau code PIN (optionnel)' : 'Code PIN *'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.pin}
                  onChangeText={(text) => setFormData({ ...formData, pin: text })}
                  placeholder="4 chiffres"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {editingEmployee ? 'Confirmer le nouveau PIN' : 'Confirmer le PIN *'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.confirmPin}
                  onChangeText={(text) => setFormData({ ...formData, confirmPin: text })}
                  placeholder="4 chiffres"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Save size={20} color="white" />
              <Text style={styles.saveBtnText}>
                {editingEmployee ? 'Mettre à jour' : 'Ajouter'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={permissionsModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Permissions</Text>
              <TouchableOpacity onPress={() => setPermissionsModalVisible(false)}>
                <Text style={styles.cancelText}>Fermer</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                <View key={key} style={styles.permissionItem}>
                  <View style={styles.permissionLabelContainer}>
                    {employeePermissions[key as keyof UserPermissions] ? (
                      <Unlock size={18} color="#10b981" />
                    ) : (
                      <Lock size={18} color="#ef4444" />
                    )}
                    <Text style={styles.permissionLabel}>{label}</Text>
                  </View>
                  <Switch
                    value={employeePermissions[key as keyof UserPermissions]}
                    onValueChange={(value) => setEmployeePermissions({ 
                      ...employeePermissions, 
                      [key]: value 
                    })}
                    trackColor={{ false: '#d1d5db', true: '#10b981' }}
                  />
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSavePermissions}>
              <Save size={20} color="white" />
              <Text style={styles.saveBtnText}>Enregistrer les permissions</Text>
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
    backgroundColor: '#059669',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: { padding: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#4b5563', marginTop: 15 },
  emptySubtext: { fontSize: 14, color: '#9ca3af', marginTop: 5 },
  employeeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 }
  },
  employeeInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  employeeDetails: { flex: 1 },
  employeeName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  badges: { flexDirection: 'row', marginTop: 4, gap: 8 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  roleText: { fontSize: 11, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '600' },
  employeePhone: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  employeeSalary: { fontSize: 13, color: '#059669', fontWeight: '600', marginTop: 4 },
  employeeActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chatBtn: { backgroundColor: '#d1fae5' },
  permissionsBtn: { backgroundColor: '#eff6ff' },
  deleteBtn: { backgroundColor: '#fef2f2' },
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
  roleSelector: { flexDirection: 'row', gap: 10 },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb'
  },
  roleOptionActive: { backgroundColor: '#059669', borderColor: '#059669' },
  roleOptionText: { fontSize: 14, fontWeight: '600', color: '#4b5563' },
  roleOptionTextActive: { color: 'white' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  switchLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  permissionLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  permissionLabel: { fontSize: 14, color: '#374151', flex: 1 },
  saveBtn: {
    backgroundColor: '#059669',
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
