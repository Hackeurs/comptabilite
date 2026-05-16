import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, User as UserIcon, Check, CheckCheck } from 'lucide-react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { 
  getUser, 
  getEmployees, 
  getMessagesWithUser, 
  sendMessage, 
  markAllMessagesAsReadWithUser
} from '../src/database/database';
import type { User as UserType } from '../src/database/database';

export default function ChatScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [otherUser, setOtherUser] = useState<UserType | null>(null);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const loadMessages = useCallback(() => {
    if (!userId) return;
    
    const id = parseInt(userId);
    const users = getEmployees();
    const other = users.find(u => u.id === id);
    const me = getUser();
    
    setOtherUser(other || null);
    setCurrentUser(me);
    
    if (other) {
      const msgs = getMessagesWithUser(id);
      setMessages(msgs);
      markAllMessagesAsReadWithUser(id);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [loadMessages])
  );

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !otherUser) return;
    
    sendMessage(otherUser.id, inputText.trim());
    setInputText('');
    
    const newMessages = getMessagesWithUser(otherUser.id);
    setMessages(newMessages);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!otherUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Utilisateur non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#059669" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <View style={[
          styles.headerAvatar,
          { backgroundColor: otherUser.role === 'ADMIN' ? '#047857' : '#2563eb' }
        ]}>
          <Text style={styles.headerAvatarText}>
            {otherUser.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{otherUser.username}</Text>
          <Text style={styles.subtitle}>
            {otherUser.role === 'ADMIN' ? 'Administrateur' : 'Employé'} • {otherUser.is_active ? 'Actif' : 'Inactif'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Commencez la conversation</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            renderItem={({ item }) => (
              <View style={[
                styles.messageBubble,
                item.from_user_id === currentUser?.id ? styles.myMessage : styles.theirMessage
              ]}>
                <Text style={[
                  styles.messageText,
                  item.from_user_id === currentUser?.id ? styles.myMessageText : styles.theirMessageText
                ]}>
                  {item.content}
                </Text>
                <View style={styles.messageMeta}>
                  <Text style={[
                    styles.timeText,
                    item.from_user_id === currentUser?.id ? styles.myTimeText : styles.theirTimeText
                  ]}>
                    {formatTime(item.created_at)}
                  </Text>
                  {item.from_user_id === currentUser?.id && (
                    <View style={{ marginLeft: 4 }}>
                      {item.is_read ? (
                        <CheckCheck size={14} color="#94a3b8" />
                      ) : (
                        <Check size={14} color="#94a3b8" />
                      )}
                    </View>
                  )}
                </View>
              </View>
            )}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Écrivez un message..."
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputText.trim() && styles.sendBtnDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#059669',
    paddingTop: 45
  },
  backBtn: { marginRight: 12 },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  headerAvatarText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  headerInfo: { flex: 1 },
  title: { fontSize: 17, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 13, color: '#a7f3d0', marginTop: 2 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  emptyText: { fontSize: 16, color: '#9ca3af' },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 8
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#059669',
    borderBottomRightRadius: 4
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  messageText: { fontSize: 15, lineHeight: 22 },
  myMessageText: { color: 'white' },
  theirMessageText: { color: '#1e293b' },
  messageMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  timeText: { fontSize: 11 },
  myTimeText: { color: '#a7f3d0' },
  theirTimeText: { color: '#9ca3af' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    maxHeight: 120,
    fontSize: 16,
    marginRight: 10
  },
  sendBtn: {
    backgroundColor: '#059669',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  sendBtnDisabled: { backgroundColor: '#a7f3d0' }
});
