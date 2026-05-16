import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, Alert, ScrollView, TextInput, Share } from 'react-native';
import { ShoppingCart, Plus, Check, Calendar, Package, Search, X, Share2, Trash2, TrendingUp, TrendingDown, DollarSign, Receipt, MinusCircle } from 'lucide-react-native';
import { getProducts, recordSale, getSales, deleteSale, Product, Sale, getCurrency, getStats, getClients, Client } from '../src/database/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFocusEffect } from 'expo-router';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function SalesScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState('FCFA');
  const [paymentMethod, setPaymentMethod] = useState('Espèces');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [stats, setStats] = useState({ revenue: 0, grossProfit: 0, netProfit: 0, salesCount: 0 });

  const fetchData = useCallback(() => {
    try {
      setProducts(getProducts(searchQuery));
      setSales(getSales());
      setClients(getClients());
      setCurrency(getCurrency());
      const todayStats = getStats('TODAY');
      setStats(todayStats);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          Alert.alert('Erreur', 'Stock insuffisant');
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.product.stock) {
          Alert.alert('Erreur', 'Stock insuffisant');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getCartProfit = () => {
    return cart.reduce((sum, item) => 
      sum + ((item.product.price - item.product.purchase_price) * item.quantity), 0
    );
  };

  const handleSale = () => {
    if (cart.length === 0) {
      Alert.alert('Erreur', 'Le panier est vide');
      return;
    }

    try {
      cart.forEach(item => {
        if (item.product.stock < item.quantity) {
          Alert.alert('Erreur', `Stock insuffisant pour ${item.product.name}`);
          return;
        }
        const totalPrice = item.product.price * item.quantity;
        recordSale(item.product.id, item.quantity, totalPrice, item.product.purchase_price, paymentMethod);
      });
      
      setModalVisible(false);
      setCart([]);
      setSelectedClient(null);
      setPaymentMethod('Espèces');
      fetchData();
      Alert.alert('Succès', 'Vente enregistrée avec succès !');
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'enregistrer la vente");
    }
  };

  const handleShare = async (sale: Sale, product: Product | undefined) => {
    try {
      const message = `
🧾 *REÇU - COMPTABILITÉ CHRÉTIENS*
--------------------------------
📦 Produit: ${product?.name || 'Inconnu'}
🔢 Quantité: ${sale.quantity}
💰 Prix Total: ${sale.total_price.toFixed(2)} ${currency}
💳 Paiement: ${sale.payment_method}
📅 Date: ${format(new Date(sale.sale_date), 'dd MMM yyyy, HH:mm', { locale: fr })}
--------------------------------
Merci de votre confiance ! 🙏
      `;
      await Share.share({ message });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le reçu');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Annuler la vente',
      'Voulez-vous vraiment annuler cette vente ? Le stock sera restitué.',
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui, Annuler', 
          style: 'destructive', 
          onPress: () => {
            try {
              deleteSale(id);
              fetchData();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'annuler la vente');
            }
          }
        }
      ]
    );
  };

  const renderSaleItem = ({ item }: { item: Sale }) => {
    const product = products.find(p => p.id === item.product_id);
    const profit = item.total_price - (item.purchase_price_at_sale * item.quantity);

    return (
      <View style={styles.saleCard}>
        <View style={styles.saleIconContainer}>
          <ShoppingCart color="#3b82f6" size={24} />
        </View>
        <View style={styles.saleDetails}>
          <Text style={styles.saleTitle}>{product?.name || 'Produit supprimé'}</Text>
          <View style={styles.saleMeta}>
            <Calendar size={12} color="#9ca3af" />
            <Text style={styles.saleDate}>
              {format(new Date(item.sale_date), 'dd MMM yyyy, HH:mm', { locale: fr })}
            </Text>
          </View>
          <View style={styles.saleMeta}>
            <Text style={styles.paymentBadge}>{item.payment_method}</Text>
            <Text style={styles.profitBadge}>Profit: {profit.toFixed(2)} {currency}</Text>
          </View>
        </View>
        <View style={styles.saleAmountContainer}>
          <Text style={styles.saleQty}>x{item.quantity}</Text>
          <Text style={styles.salePrice}>{item.total_price.toFixed(2)} {currency}</Text>
          <View style={styles.saleActions}>
            <TouchableOpacity 
              style={styles.shareBtn} 
              onPress={() => handleShare(item, product)}
            >
              <Share2 size={16} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={() => handleDelete(item.id)}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ventes</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            setCart([]);
            setSelectedClient(null);
            setModalVisible(true);
          }}
        >
          <Plus color="white" size={24} />
          <Text style={styles.addButtonText}>Nouvelle Vente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <TrendingUp size={20} color="#10b981" />
          <Text style={styles.statValue}>{stats.revenue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>CA (Auj.)</Text>
        </View>
        <View style={styles.statCard}>
          <DollarSign size={20} color="#3b82f6" />
          <Text style={styles.statValue}>{stats.grossProfit.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Marge</Text>
        </View>
        <View style={styles.statCard}>
          <Receipt size={20} color="#f59e0b" />
          <Text style={styles.statValue}>{stats.salesCount}</Text>
          <Text style={styles.statLabel}>Ventes</Text>
        </View>
      </View>

      <FlatList
        data={sales}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSaleItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ShoppingCart size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucune vente enregistrée.</Text>
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
              <Text style={styles.modalTitle}>Panier ({cart.length})</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#6b7280" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Search color="#9ca3af" size={18} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <Text style={styles.label}>Produits ({products.length})</Text>
            <ScrollView style={styles.productSelector} horizontal showsHorizontalScrollIndicator={false}>
              {products.map((product) => {
                const inCart = cart.find(item => item.product.id === product.id);
                return (
                  <TouchableOpacity
                    key={product.id}
                    style={[
                      styles.productOption,
                      inCart && styles.productOptionSelected,
                      product.stock <= 0 && styles.productOptionDisabled
                    ]}
                    onPress={() => product.stock > 0 && addToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    <Package size={24} color={inCart ? 'white' : '#3b82f6'} />
                    <Text style={[
                      styles.productOptionTitle,
                      inCart && { color: 'white' }
                    ]} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={[
                      styles.productOptionStock,
                      inCart && { color: '#e0e7ff' },
                      product.stock < 5 && { color: '#ef4444' }
                    ]}>
                      Stock: {product.stock}
                    </Text>
                    {inCart && (
                      <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{inCart.quantity}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {cart.length > 0 && (
              <>
                <Text style={styles.label}>Votre panier</Text>
                <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
                  {cart.map((item) => (
                    <View key={item.product.id} style={styles.cartItem}>
                      <View style={styles.cartItemLeft}>
                        <Package size={24} color="#3b82f6" />
                        <View style={styles.cartItemInfo}>
                          <Text style={styles.cartItemName}>{item.product.name}</Text>
                          <Text style={styles.cartItemPrice}>{item.product.price.toFixed(2)} {currency} / unité</Text>
                        </View>
                      </View>
                      <View style={styles.cartItemRight}>
                        <View style={styles.quantityControlSmall}>
                          <TouchableOpacity 
                            style={styles.qtyBtnSmall}
                            onPress={() => updateCartQuantity(item.product.id, -1)}
                          >
                            <Text style={styles.qtyBtnTextSmall}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyValueSmall}>{item.quantity}</Text>
                          <TouchableOpacity 
                            style={styles.qtyBtnSmall}
                            onPress={() => updateCartQuantity(item.product.id, 1)}
                          >
                            <Text style={styles.qtyBtnTextSmall}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.cartItemTotal}>{(item.product.price * item.quantity).toFixed(2)}</Text>
                        <TouchableOpacity onPress={() => removeFromCart(item.product.id)}>
                          <Trash2 size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.paymentMethodContainer}>
                  <Text style={styles.paymentLabel}>Méthode de paiement :</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paymentOptions}>
                    {['Espèces', 'Orange Money', 'MTN Mobile Money', 'Moov Money', 'Carte Bancaire', 'Crédit'].map(method => (
                      <TouchableOpacity 
                        key={method} 
                        style={[styles.paymentBtn, paymentMethod === method && styles.paymentBtnActive]}
                        onPress={() => setPaymentMethod(method)}
                      >
                        <Text style={[styles.paymentBtnText, paymentMethod === method && styles.paymentBtnTextActive]}>
                          {method}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.clientSelector}>
                  <Text style={styles.paymentLabel}>Client (optionnel) :</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paymentOptions}>
                    <TouchableOpacity 
                      style={[styles.paymentBtn, !selectedClient && styles.paymentBtnActive]}
                      onPress={() => setSelectedClient(null)}
                    >
                      <Text style={[styles.paymentBtnText, !selectedClient && styles.paymentBtnTextActive]}>
                        Aucun
                      </Text>
                    </TouchableOpacity>
                    {clients.map(client => (
                      <TouchableOpacity 
                        key={client.id} 
                        style={[styles.paymentBtn, selectedClient?.id === client.id && styles.paymentBtnActive]}
                        onPress={() => setSelectedClient(client)}
                      >
                        <Text style={[styles.paymentBtnText, selectedClient?.id === client.id && styles.paymentBtnTextActive]}>
                          {client.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.totalContainer}>
                  <View>
                    <Text style={styles.totalLabel}>Total à payer</Text>
                    <Text style={styles.profitEstimate}>
                      Profit estimé: {getCartProfit().toFixed(2)} {currency}
                    </Text>
                  </View>
                  <Text style={styles.totalValue}>{getCartTotal().toFixed(2)} {currency}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={handleSale}
                >
                  <Check color="white" size={24} />
                  <Text style={styles.confirmButtonText}>Valider la vente</Text>
                </TouchableOpacity>
              </>
            )}
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
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#10b981',
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  saleCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  saleIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  saleDetails: {
    flex: 1,
  },
  saleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  saleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  saleDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  profitBadge: {
    fontSize: 11,
    color: '#16a34a',
    backgroundColor: '#f0fdf4',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    fontWeight: '600',
    marginLeft: 8,
  },
  paymentBadge: {
    fontSize: 11,
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    fontWeight: '600',
  },
  saleAmountContainer: {
    alignItems: 'flex-end',
  },
  saleQty: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  salePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  saleActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  shareBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  productSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  productOption: {
    width: 130,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f3f4f6',
    position: 'relative',
  },
  productOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  productOptionDisabled: {
    opacity: 0.5,
  },
  productOptionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 10,
    textAlign: 'center',
  },
  productOptionStock: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  cartItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemInfo: {
    marginLeft: 10,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  cartItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityControlSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qtyBtnTextSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  qtyValueSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 10,
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  paymentMethodContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  clientSelector: {
    marginBottom: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  paymentBtnActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  paymentBtnText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  paymentBtnTextActive: {
    color: 'white',
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  profitEstimate: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 2,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
