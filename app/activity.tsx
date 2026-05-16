import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, User, ArrowLeft, Package, ShoppingCart, TrendingDown, Users, Truck, Shield } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getActivityLogs, ActivityLog, isAdmin } from '../src/database/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const getActionIcon = (entityType: string) => {
  switch (entityType) {
    case 'PRODUCT':
      return <Package size={18} color="#f59e0b" />;
    case 'SALE':
      return <ShoppingCart size={18} color="#3b82f6" />;
    case 'EXPENSE':
      return <TrendingDown size={18} color="#ef4444" />;
    case 'CLIENT':
      return <Users size={18} color="#6366f1" />;
    case 'SUPPLIER':
      return <Truck size={18} color="#f97316" />;
    case 'USER':
      return <Shield size={18} color="#059669" />;
    default:
      return <Clock size={18} color="#9ca3af" />;
  }
};

const getActionText = (action: string, entityType: string) => {
  const map: Record<string, string> = {
    'CREATE_PRODUCT': 'Produit créé',
    'UPDATE_PRODUCT': 'Produit modifié',
    'DELETE_PRODUCT': 'Produit supprimé',
    'CREATE_SALE': 'Vente enregistrée',
    'DELETE_SALE': 'Vente annulée',
    'CREATE_EXPENSE': 'Dépense ajoutée',
    'UPDATE_EXPENSE': 'Dépense modifiée',
    'DELETE_EXPENSE': 'Dépense supprimée',
    'CREATE_CLIENT': 'Client ajouté',
    'UPDATE_CLIENT': 'Client modifié',
    'DELETE_CLIENT': 'Client supprimé',
    'CREATE_SUPPLIER': 'Fournisseur ajouté',
    'UPDATE_SUPPLIER': 'Fournisseur modifié',
    'DELETE_SUPPLIER': 'Fournisseur supprimé',
    'CREATE_USER': 'Utilisateur ajouté',
    'UPDATE_USER': 'Utilisateur modifié',
    'DELETE_USER': 'Utilisateur supprimé',
  };
  return map[action] || `${action} ${entityType}`;
};

export default function ActivityScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const loadLogs = useCallback(() => {
    const data = getActivityLogs(100);
    setLogs(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs])
  );

  if (!isAdmin()) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color="#111827" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Accès refusé</Text>
        </View>
        <View style={styles.centerContent}>
          <Shield size={64} color="#ef4444" />
          <Text style={styles.accessDeniedText}>Seuls les administrateurs peuvent accéder au journal</Text>
        </View>
      </View>
    );
  }

  const renderLogItem = ({ item }: { item: ActivityLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logIconContainer}>
        {getActionIcon(item.entity_type)}
      </View>
      <View style={styles.logDetails}>
        <Text style={styles.logAction}>{getActionText(item.action, item.entity_type)}</Text>
        {item.details && <Text style={styles.logDetailsText}>{item.details}</Text>}
        <View style={styles.logMeta}>
          <User size={12} color="#9ca3af" />
          <Text style={styles.logUser}>{item.username || 'Système'}</Text>
          <Clock size={12} color="#9ca3af" style={{ marginLeft: 10 }} />
          <Text style={styles.logDate}>
            {format(new Date(item.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Journal d'activité</Text>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLogItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Clock size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucune activité enregistrée</Text>
          </View>
        }
      />
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
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  accessDeniedText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40
  },
  listContent: { padding: 16 },
  logCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 1
  },
  logIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  logDetails: { flex: 1 },
  logAction: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  logDetailsText: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  logUser: { fontSize: 12, color: '#9ca3af', marginLeft: 4 },
  logDate: { fontSize: 12, color: '#9ca3af', marginLeft: 4 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80
  },
  emptyText: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 16
  }
});
