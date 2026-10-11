import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Gift, AlertTriangle, Info, CheckCheck, MessageSquare } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useUser } from '../contexts/UserContext';

const iconMap = { promo: Gift, alert: AlertTriangle, info: Info, message: MessageSquare };

export default function NotificationsScreen({ navigation }) {
  const { notifications, markNotificationsRead } = useUser();

  const handleMarkRead = async () => {
    await markNotificationsRead();
    Alert.alert('Done', 'All notifications marked as read.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkRead}>
          <CheckCheck color={colors.gold.bright} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell color={colors.text.muted} size={48} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySub}>You're all caught up!</Text>
          </View>
        ) : (
          notifications.map((notif) => {
            const Icon = iconMap[notif.type] || Bell;
            return (
              <TouchableOpacity
                key={notif.id}
                style={[styles.notifRow, !notif.read && styles.unreadRow]}
                onPress={() => Alert.alert(notif.title, notif.message)}
              >
                <View style={styles.notifIcon}>
                  <Icon color={colors.gold.bright} size={18} />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
                  <Text style={styles.notifTime}>{notif.time || 'Just now'}</Text>
                </View>
                {!notif.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.text.primary },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text.primary, marginTop: 16 },
  emptySub: { color: colors.text.secondary, marginTop: 8 },
  notifRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.bg.surface, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border.gold },
  unreadRow: { backgroundColor: colors.gold.bright + '10', borderColor: colors.gold.bright },
  notifIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg.deep, justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: colors.gold.bright },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: 'bold', color: colors.text.primary },
  notifMessage: { color: colors.text.secondary, fontSize: 13, marginTop: 4, lineHeight: 18 },
  notifTime: { color: colors.text.muted, fontSize: 11, marginTop: 6 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold.bright, marginLeft: 8 },
});
