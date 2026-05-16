import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare, User as UserIcon, ArrowLeft, Plus, Clock, Check, CheckCheck } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getEmployees, getUser, getUnreadMessageCount, getMessagesWithUser, getCurrency } from '../src/database/database';
import type { User as UserType } from '../src/database/database';

interface Conversation {
  user: UserType;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function ChatListScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const loadConversations = useCallback(() => {
    const users = getEmployees();
    const me = getUser();
    setCurrentUser(me);

    const convs: Conversation[] = [];
    
    for (const user of users) {
      if (me && user.id === me.id) continue;
      
      const messages = getMessagesWithUser(user.id);
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        const unread = messages.filter(m => m.to_user_id === me?.id && m.is_read === 0).length;
        
        convs.push({
          user,
          lastMessage: lastMsg.content,
          lastMessageTime: lastMsg.created_at,
          unreadCount: unread
        });
      }
    }
    
    convs.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    setConversations(convs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#059669" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
        <View style={{ width: 40 }} />
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageSquare size={80} color="#d1d5db" />
          <Text style={styles.emptyText}>Aucune conversation</Text>
          <Text style={styles.emptySubtext}>Sélectionnez un employé pour discuter</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.user.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.conversationCard}
              onPress={() => router.push({
                pathname: '/chat',
                params: { userId: item.user.id }
              })}
            >
              <View style={[
                styles.avatar,
                { backgroundColor: item.user.role === 'ADMIN' ? '#059669' : '#3b82f6' }
              ]}>
                <Text style={styles.avatarText}>
                  {item.user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.convInfo}>
                <View style={styles.convHeader}>
                  <Text style={styles.userName}>{item.user.username}</Text>
                  <Text style={styles.timeText}>{formatTime(item.lastMessageTime)}</Text>
                </View>
                <View style={styles.messageRow}>
                  <Text style={styles.messageText} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#059669',
    paddingTop: 50
  },
  backBtn: { marginRight: 15 },
  title: { fontSize: 20, fontWeight: 'bold', color: 'white', flex: 1 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#4b5563', marginTop: 20 },
  emptySubtext: { fontSize: 14, color: '#9ca3af', marginTop: 8 },
  list: { padding: 15 },
  conversationCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  convInfo: { flex: 1 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  timeText: { fontSize: 12, color: '#9ca3af' },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4
  },
  messageText: { fontSize: 14, color: '#6b7280', flex: 1 },
  unreadBadge: {
    backgroundColor: '#059669',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  unreadText: { color: 'white', fontSize: 11, fontWeight: 'bold' }
});
