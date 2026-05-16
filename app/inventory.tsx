import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Plus, Package, X, Search, Edit3, Trash2, MinusCircle, PlusCircle, TrendingUp, AlertTriangle, Tag, Check } from 'lucide-react-native';
import { getProducts, addProduct, updateProduct, deleteProduct, adjustStock, Product as ProductType, getCurrency, getLowStockCount, getStockCount } from '../src/database/database';
import { useFocusEffect } from 'expo-router';

const PRODUCT_CATEGORIES = [
  'Alimentation',
  'Boissons',
  'Électronique',
  'Textile',
  'Maison',
  'Bureau',
  'Santé',
  'Beauté',
  'Sport',
  'Jouets',
  'Services',
  'Autre'
];

export default function InventoryScreen() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', purchase_price: '', stock: '', category: 'Autre' });
  const [currency, setCurrency] = useState('FCFA');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [stockStats, setStockStats] = useState({ totalProducts: 0, totalValue: 0, lowStockCount: 0 });

  const fetchProducts = useCallback(() => {
    setLoading(true);
    try {
      const data = getProducts(searchQuery);
      setProducts(data);
      setCurrency(getCurrency());
      
      const stats = getStockCount();
      const lowStock = getLowStockCount(5);
      setStockStats({
        totalProducts: stats.total_stock,
        totalValue: stats.total_stock_value,
        lowStockCount: lowStock
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAdjustStock = (product: ProductType, quantity: number) => {
    const newStock = product.stock + quantity;
    if (newStock < 0) {
      Alert.alert('Erreur', 'Le stock ne peut pas être négatif');
      return;
    }
    
    adjustStock(product.id, quantity);
    fetchProducts();
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.purchase_price || !formData.stock) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (editingProduct) {
        updateProduct(
          editingProduct.id,
          formData.name,
          formData.description,
          parseFloat(formData.price),
          parseFloat(formData.purchase_price),
          parseInt(formData.stock),
          formData.category
        );
      } else {
        addProduct(
          formData.name,
          formData.description,
          parseFloat(formData.price),
          parseFloat(formData.purchase_price),
          parseInt(formData.stock),
          formData.category
        );
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'enregistrer le produit");
    }
  };

  const handleDelete = () => {
    if (!editingProduct) return;
    
    Alert.alert(
      'Confirmer la suppression',
      'Voulez-vous vraiment supprimer ce produit ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive', 
          onPress: () => {
            try {
              deleteProduct(editingProduct.id);
              closeModal();
              fetchProducts();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le produit');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (product: ProductType) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      purchase_price: product.purchase_price?.toString() || '0',
      stock: product.stock.toString(),
      category: product.category || 'Autre'
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', purchase_price: '', stock: '', category: 'Autre' });
    setShowCategoryPicker(false);
  };

  const renderProductItem = ({ item }: { item: ProductType }) => (
    <View style={styles.productCard}>
      <View style={styles.productIconContainer}>
        <Package color={item.stock < 5 ? '#ef4444' : '#3b82f6'} size={28} />
      </View>
      <View style={styles.productInfo}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category || 'Autre'}</Text>
        </View>
        <Text style={styles.productName}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.productDescription} numberOfLines={1}>{item.description}</Text>
        ) : null}
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{item.price.toFixed(2)} {currency}</Text>
          <Text style={styles.marginText}>
            Marge: {(item.price - item.purchase_price).toFixed(2)} {currency}
          </Text>
        </View>
      </View>
      <View style={styles.productRight}>
        <View style={styles.stockContainer}>
          <TouchableOpacity 
            style={styles.stockButton}
            onPress={() => handleAdjustStock(item, -1)}
          >
            <MinusCircle size={20} color="#6b7280" />
          </TouchableOpacity>
          <Text style={[styles.productStock, item.stock < 5 ? styles.lowStock : null]}>
            {item.stock}
          </Text>
          <TouchableOpacity 
            style={styles.stockButton}
            onPress={() => handleAdjustStock(item, 1)}
          >
            <PlusCircle size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
            <Edit3 size={16} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              setEditingProduct(item);
              handleDelete();
            }} 
            style={styles.actionButton}
          >
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search color="#9ca3af" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color="#9ca3af" size={20} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <TrendingUp size={20} color="#3b82f6" />
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>Produits</Text>
        </View>
        <View style={styles.statCard}>
          <Package size={20} color="#16a34a" />
          <Text style={styles.statValue}>{stockStats.totalValue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Valeur</Text>
        </View>
        <View style={[styles.statCard, stockStats.lowStockCount > 0 ? styles.statCardWarning : null]}>
          <AlertTriangle size={20} color={stockStats.lowStockCount > 0 ? '#ef4444' : '#9ca3af'} />
          <Text style={[styles.statValue, stockStats.lowStockCount > 0 ? styles.statValueWarning : null]}>
            {stockStats.lowStockCount}
          </Text>
          <Text style={styles.statLabel}>Stock faible</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Package size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>Aucun produit enregistré.</Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <X color="#6b7280" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom du produit *</Text>
                <View style={styles.inputContainer}>
                  <Package color="#9ca3af" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Cahier, Stylo..."
                    value={formData.name}
                    onChangeText={(text) => setFormData({...formData, name: text})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Fournitures de bureau..."
                    value={formData.description}
                    onChangeText={(text) => setFormData({...formData, description: text})}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Prix d'achat ({currency}) *</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputPrefix}>{currency}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      keyboardType="numeric"
                      value={formData.purchase_price}
                      onChangeText={(text) => setFormData({...formData, purchase_price: text})}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Prix de vente ({currency}) *</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputPrefix}>{currency}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      keyboardType="numeric"
                      value={formData.price}
                      onChangeText={(text) => setFormData({...formData, price: text})}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Stock *</Text>
                <View style={styles.inputContainer}>
                  <Package color="#9ca3af" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={formData.stock}
                    onChangeText={(text) => setFormData({...formData, stock: text})}
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
                  <Text style={styles.input}>{formData.category}</Text>
                </TouchableOpacity>
                
                {showCategoryPicker && (
                  <View style={styles.categoryPicker}>
                    {PRODUCT_CATEGORIES.map((cat) => (
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
                          styles.categoryTextPicker,
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
                  {editingProduct ? 'Mettre à jour' : 'Enregistrer'}
                </Text>
              </TouchableOpacity>

              {editingProduct && (
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={handleDelete}
                >
                  <Trash2 size={20} color="#ef4444" />
                  <Text style={styles.deleteButtonText}>Supprimer le produit</Text>
                </TouchableOpacity>
              )}
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
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb', 
    gap: 12 
  },
  searchBar: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f3f4f6', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    height: 48 
  },
  searchInput: { 
    flex: 1, 
    height: '100%', 
    marginLeft: 8, 
    fontSize: 16, 
    color: '#1f2937' 
  },
  addButton: { 
    width: 48, 
    height: 48, 
    backgroundColor: '#3b82f6', 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#3b82f6', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 4 
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  statCardWarning: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2'
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4
  },
  statValueWarning: {
    color: '#dc2626'
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2
  },
  listContainer: { 
    padding: 16,
    paddingTop: 0 
  },
  productCard: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#e5e7eb',
    alignItems: 'center'
  },
  productIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  productInfo: { 
    flex: 1 
  },
  categoryBadge: { 
    backgroundColor: '#f3f4f6', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 6, 
    alignSelf: 'flex-start', 
    marginBottom: 4 
  },
  categoryText: { 
    fontSize: 11, 
    color: '#6b7280', 
    fontWeight: '600' 
  },
  productName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#111827', 
    marginBottom: 2 
  },
  productDescription: { 
    fontSize: 13, 
    color: '#9ca3af' 
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12
  },
  productPrice: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#3b82f6' 
  },
  marginText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500'
  },
  productRight: {
    alignItems: 'flex-end'
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 6,
    paddingHorizontal: 8
  },
  stockButton: {
    padding: 4
  },
  productStock: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1f2937',
    minWidth: 30,
    textAlign: 'center'
  },
  lowStock: { 
    color: '#ef4444' 
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12
  },
  actionButton: {
    padding: 4
  },
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 80 
  },
  emptyText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: '#9ca3af' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24, 
    maxHeight: '90%' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  inputGroup: { 
    marginBottom: 16 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#374151', 
    marginBottom: 8 
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
  inputIcon: { 
    marginRight: 12 
  },
  input: { 
    flex: 1, 
    height: '100%', 
    fontSize: 16, 
    color: '#111827' 
  },
  inputPrefix: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 8
  },
  row: { 
    flexDirection: 'row' 
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  categoryItemSelected: {
    backgroundColor: '#3b82f6'
  },
  categoryTextPicker: {
    fontSize: 14,
    color: '#374151'
  },
  categoryTextSelected: {
    color: 'white',
    fontWeight: '600'
  },
  saveButton: { 
    backgroundColor: '#3b82f6', 
    height: 56, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 24, 
    shadowColor: '#3b82f6', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 10, 
    elevation: 6 
  },
  saveButtonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  deleteButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 16, 
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fef2f2'
  },
  deleteButtonText: { 
    color: '#ef4444', 
    fontSize: 14, 
    fontWeight: '600', 
    marginLeft: 8 
  },
});
