import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { styles } from './homeStyles';

export default function ChatModal({ showChat, setShowChat, chatHistory, chatMessage, setChatMessage, handleSendMessage }) {
  return (
    <Modal visible={showChat} transparent animationType={Platform.OS === 'ios' ? 'slide' : 'none'} onRequestClose={() => setShowChat(false)}>
      <View style={styles.chatOverlay}>
        <View style={styles.chatCard}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Chat with Tunde</Text>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <X color={colors.text.secondary} size={22} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.chatContent} contentContainerStyle={{ paddingBottom: 10 }}>
            {chatHistory.map((msg, i) => (
              <View
                key={i}
                style={[
                  styles.chatBubble,
                  msg.sender === 'passenger' ? styles.userBubble : styles.driverBubble,
                ]}
              >
                <Text style={[styles.chatText, msg.sender === 'passenger' ? styles.userChatText : styles.driverChatText]}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.chatInputWrapper}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.text.secondary}
              value={chatMessage}
              onChangeText={setChatMessage}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendMessage}>
              <Text style={styles.chatSendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
