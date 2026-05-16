import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Alert, Share } from 'react-native';
import { PieChart, TrendingUp, TrendingDown, DollarSign, Users, Truck, ArrowRight, ArrowLeft, Package, BarChart2, Download } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

import { getDetailedReport, getCurrency, getProducts, getSales, getExpenses, getClients, getSuppliers, getCredits } from '../src/database/database';
import { useFocusEffect } from 'expo-router';

const generateCSV = (data: any[], headers: string[], filename: string) => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header.toLowerCase().replace(/ /g, '_')] || row[header] || '';
        return `"${String(cell).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

const handleExport = async () => {
  try {
    const csvExports: { name: string; content: string }[] = [];
    
    const products = getProducts();
    if (products.length > 0) {
      const productsCSV = generateCSV(products, ['id', 'name', 'description', 'price', 'purchase_price', 'stock', 'category'], 'produits');
      csvExports.push({ name: 'Produits', content: productsCSV });
    }
    
    const sales = getSales();
    if (sales.length > 0) {
      const salesCSV = generateCSV(sales, ['id', 'product_id', 'quantity', 'total_price', 'purchase_price_at_sale', 'payment_method', 'sale_date'], 'ventes');
      csvExports.push({ name: 'Ventes', content: salesCSV });
    }
    
    const expenses = getExpenses();
    if (expenses.length > 0) {
      const expensesCSV = generateCSV(expenses, ['id', 'description', 'amount', 'category', 'expense_date'], 'depenses');
      csvExports.push({ name: 'Dépenses', content: expensesCSV });
    }
    
    const clients = getClients();
    if (clients.length > 0) {
      const clientsCSV = generateCSV(clients, ['id', 'name', 'phone', 'address'], 'clients');
      csvExports.push({ name: 'Clients', content: clientsCSV });
    }
    
    const suppliers = getSuppliers();
    if (suppliers.length > 0) {
      const suppliersCSV = generateCSV(suppliers, ['id', 'name', 'phone', 'address'], 'fournisseurs');
      csvExports.push({ name: 'Fournisseurs', content: suppliersCSV });
    }

    if (csvExports.length === 0) {
      Alert.alert('Info', 'Aucune donnée à exporter');
      return;
    }

    const message = csvExports.map(exp => `--- ${exp.name} ---\n${exp.content}`).join('\n\n');
    
    await Share.share({
      message,
      title: 'Export Comptabilité Chrétiens'
    });

  } catch (error) {
    Alert.alert('Erreur', 'Impossible d\'exporter les données');
  }
};

export default function ReportsScreen() {
  const [report, setReport] = useState<any>(null);
  const [currency, setCurrency] = useState('€');
  const [period, setPeriod] = useState('ALL');

  const fetchReport = useCallback(() => {
    try {
      const data = getDetailedReport(period);
      setReport(data);
      setCurrency(getCurrency());
    } catch (error) {
      console.error('Failed to fetch report:', error);
    }
  }, [period]);

  useFocusEffect(
    useCallback(() => {
      fetchReport();
    }, [fetchReport])
  );

  if (!report) {
    return (
      <View style={styles.container}>
        <Text>Chargement du bilan...</Text>
      </View>
    );
  }

  const periods = [
    { id: 'ALL', label: 'Tout' },
    { id: 'TODAY', label: 'Aujourd\'hui' },
    { id: 'WEEK', label: '7 jours' },
    { id: 'MONTH', label: 'Mois' },
    { id: 'YEAR', label: 'Année' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bilan Financier</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Download size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.periodSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodScroll}>
          {periods.map((p) => (
            <TouchableOpacity 
              key={p.id} 
              style={[styles.periodBtn, period === p.id && styles.periodBtnActive]}
              onPress={() => setPeriod(p.id)}
            >
              <Text style={[styles.periodBtnText, period === p.id && styles.periodBtnTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Résultat Net */}
        <View style={[styles.mainCard, report.netProfit >= 0 ? styles.profitCard : styles.lossCard]}>
          <Text style={styles.mainCardTitle}>Résultat Net</Text>
          <Text style={styles.mainCardValue}>
            {report.netProfit > 0 ? '+' : ''}{report.netProfit.toFixed(2)} {currency}
          </Text>
          <Text style={styles.mainCardSub}>
            {report.netProfit >= 0 ? 'Entreprise rentable' : 'Déficit en cours'}
          </Text>
        </View>

        <View style={styles.grid}>
          {/* Chiffre d'Affaires */}
          <View style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
              <TrendingUp color="#10b981" size={24} />
            </View>
            <Text style={styles.itemLabel}>Chiffre d'Affaires</Text>
            <Text style={styles.itemValue}>{report.revenue.toFixed(2)} {currency}</Text>
          </View>

          {/* Dépenses */}
          <View style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
              <TrendingDown color="#ef4444" size={24} />
            </View>
            <Text style={styles.itemLabel}>Dépenses (Charges)</Text>
            <Text style={styles.itemValue}>{report.expenses.toFixed(2)} {currency}</Text>
          </View>

          {/* Coût d'achat des ventes */}
          <View style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: '#fffbeb' }]}>
              <ArrowLeft color="#f59e0b" size={24} />
            </View>
            <Text style={styles.itemLabel}>Coût d'Achat (Vendus)</Text>
            <Text style={styles.itemValue}>{report.purchaseCost.toFixed(2)} {currency}</Text>
          </View>

          {/* Bénéfice Brut */}
          <View style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
              <DollarSign color="#3b82f6" size={24} />
            </View>
            <Text style={styles.itemLabel}>Bénéfice Brut</Text>
            <Text style={styles.itemValue}>{report.grossProfit.toFixed(2)} {currency}</Text>
          </View>
        </View>

        {/* Sales Chart */}
        <Text style={styles.sectionTitle}>Ventes des 7 derniers jours</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <BarChart2 size={18} color="#3b82f6" />
            <Text style={styles.chartTitle}>Évolution du CA</Text>
          </View>
          <View style={styles.barChart}>
            {report.dailySales.length > 0 ? (
              report.dailySales.map((day: any, index: number) => {
                const maxVal = Math.max(...report.dailySales.map((d: any) => d.total));
                const height = maxVal > 0 ? (day.total / maxVal) * 100 : 0;
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={[styles.bar, { height: `${height}%` }]} />
                    <Text style={styles.barLabel}>{day.date.split('-')[2]}/{day.date.split('-')[1]}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyChartText}>Pas assez de données pour le graphique</Text>
            )}
          </View>
        </View>

        <View style={styles.row}>
          {/* Top Products */}
          <View style={[styles.halfSection, { marginRight: 8 }]}>
            <Text style={styles.sectionTitle}>Top Produits</Text>
            <View style={styles.miniListCard}>
              {report.topProducts.length > 0 ? (
                report.topProducts.map((p: any, i: number) => (
                  <View key={i} style={styles.miniListItem}>
                    <Text style={styles.miniItemName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.miniItemVal}>{p.quantity} vds</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Aucune vente</Text>
              )}
            </View>
          </View>

          {/* Expense Breakdown */}
          <View style={[styles.halfSection, { marginLeft: 8 }]}>
            <Text style={styles.sectionTitle}>Dépenses / Cat.</Text>
            <View style={styles.miniListCard}>
              {report.expenseBreakdown.length > 0 ? (
                report.expenseBreakdown.map((e: any, i: number) => (
                  <View key={i} style={styles.miniListItem}>
                    <Text style={styles.miniItemName} numberOfLines={1}>{e.category}</Text>
                    <Text style={[styles.miniItemVal, { color: '#ef4444' }]}>{e.total.toFixed(0)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Aucune dépense</Text>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Trésorerie & Créances</Text>
        
        <View style={styles.listCard}>
          <View style={styles.listItem}>
            <View style={styles.listIconContainer}>
              <DollarSign color="#059669" size={20} />
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listLabel}>Solde Caisse</Text>
              <Text style={styles.listDesc}>Liquidité disponible</Text>
            </View>
            <Text style={[styles.listAmount, { color: '#059669' }]}>
              {report.cashBalance.toFixed(2)} {currency}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.listItem}>
            <View style={styles.listIconContainer}>
              <Users color="#6366f1" size={20} />
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listLabel}>Crédits Clients</Text>
              <Text style={styles.listDesc}>Argent attendu</Text>
            </View>
            <Text style={[styles.listAmount, { color: '#6366f1' }]}>
              {report.creditsClient.toFixed(2)} {currency}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.listItem}>
            <View style={styles.listIconContainer}>
              <Truck color="#f97316" size={20} />
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listLabel}>Crédits Fournisseurs</Text>
              <Text style={styles.listDesc}>Dettes à payer</Text>
            </View>
            <Text style={[styles.listAmount, { color: '#f97316' }]}>
              {report.creditsSupplier.toFixed(2)} {currency}
            </Text>
          </View>
        </View>

        <View style={styles.statsFooter}>
          <Text style={styles.footerText}>Nombre total de ventes: {report.salesCount}</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  exportBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 12 },
  periodSelector: { backgroundColor: 'white', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  periodScroll: { paddingHorizontal: 15 },
  periodBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 10 },
  periodBtnActive: { backgroundColor: '#10b981' },
  periodBtnText: { fontSize: 13, color: '#6b7280', fontWeight: 'bold' },
  periodBtnTextActive: { color: 'white' },
  scrollContent: { padding: 16 },
  mainCard: { padding: 25, borderRadius: 20, alignItems: 'center', marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1 },
  profitCard: { backgroundColor: '#10b981' },
  lossCard: { backgroundColor: '#ef4444' },
  mainCardTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  mainCardValue: { color: 'white', fontSize: 36, fontWeight: 'bold' },
  mainCardSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  gridItem: { width: '48%', backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#f3f4f6', elevation: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  itemLabel: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  itemValue: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 10, marginTop: 5 },
  chartCard: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#f3f4f6', elevation: 1 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  chartTitle: { fontSize: 14, fontWeight: 'bold', color: '#4b5563', marginLeft: 8 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 120, paddingBottom: 10 },
  barContainer: { alignItems: 'center', width: 35 },
  bar: { width: 12, backgroundColor: '#3b82f6', borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 9, color: '#9ca3af', marginTop: 8 },
  emptyChartText: { color: '#9ca3af', fontSize: 12, textAlign: 'center', width: '100%', marginBottom: 40 },
  row: { flexDirection: 'row', marginBottom: 20 },
  halfSection: { flex: 1 },
  miniListCard: { backgroundColor: 'white', borderRadius: 15, padding: 12, borderWidth: 1, borderColor: '#f3f4f6', elevation: 1 },
  miniListItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  miniItemName: { fontSize: 12, color: '#4b5563', flex: 1 },
  miniItemVal: { fontSize: 12, fontWeight: 'bold', color: '#1f2937', marginLeft: 5 },
  emptyText: { color: '#9ca3af', fontSize: 12, textAlign: 'center', paddingVertical: 10 },
  listCard: { backgroundColor: 'white', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#f3f4f6', elevation: 1 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  listIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  listInfo: { flex: 1 },
  listLabel: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  listDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  listAmount: { fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 5 },
  statsFooter: { marginTop: 20, alignItems: 'center', paddingBottom: 20 },
  footerText: { color: '#9ca3af', fontSize: 14 }
});
