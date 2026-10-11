import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageSquare, ChevronDown, ChevronUp, Send, Scale } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { api } from '../lib/api';
import { validateRequired, sanitizeInput } from '../lib/validation';
import { analytics } from '../lib/analytics';

export default function SupportScreen({ navigation }) {
  useEffect(() => { analytics.trackScreen('Support'); }, []);
  const [faqs, setFaqs] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getFaqs();
        setFaqs(data);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async () => {
    const subjectError = validateRequired(subject, 'Subject');
    const messageError = validateRequired(message, 'Message');
    if (subjectError || messageError) {
      return Alert.alert('Required', subjectError || messageError);
    }
    analytics.trackAction('support_ticket_submitted', { subject });
    setSending(true);
    const safeSubject = sanitizeInput(subject);
    const safeMessage = sanitizeInput(message);
    try {
      await api.createTicket({ subject: safeSubject, message: safeMessage });
      Alert.alert('Submitted', 'We will get back to you within 24 hours.');
      setSubject('');
      setMessage('');
    } catch {
      Alert.alert('Error', 'Failed to submit ticket. Try again.');
    }
    setSending(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.contactCard}>
          <MessageSquare color={colors.gold.bright} size={24} />
          <Text style={styles.contactTitle}>Contact Us</Text>
          <Text style={styles.contactSub}>We typically respond within 24 hours</Text>
        </View>

        <Text style={styles.sectionTitle}>FAQs</Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.gold.bright} style={{ marginVertical: 20 }} />
        ) : (
          faqs.map((faq, i) => (
            <TouchableOpacity
              key={faq.id || i}
              style={styles.faqRow}
              onPress={() => setExpanded(expanded === i ? null : i)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                {expanded === i ? <ChevronUp color={colors.gold.bright} size={18} /> : <ChevronDown color={colors.gold.bright} size={18} />}
              </View>
              {expanded === i && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={styles.disputeLink} onPress={() => navigation.navigate('DisputeResolution')}>
          <Scale color={colors.gold.bright} size={20} />
          <View style={{ flex: 1 }}>
            <Text style={styles.disputeLinkTitle}>Dispute a Charge</Text>
            <Text style={styles.disputeLinkSub}>Fight an unfair fare or trip charge</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Submit a Ticket</Text>
        <TextInput
          style={styles.subjectInput}
          placeholder="Subject"
          placeholderTextColor={colors.text.muted}
          value={subject}
          onChangeText={setSubject}
        />
        <TextInput
          style={styles.messageInput}
          placeholder="Describe your issue..."
          placeholderTextColor={colors.text.muted}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, sending && styles.sendingBtn]} onPress={handleSubmit} disabled={sending}>
          <Send color={colors.bg.deep} size={18} />
          <Text style={styles.sendBtnText}>{sending ? 'Sending...' : 'Send'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.deep, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.text.primary },
  contactCard: { alignItems: 'center', padding: 24, backgroundColor: colors.bg.surface, borderRadius: 24, borderWidth: 1.5, borderColor: colors.gold.bright, marginBottom: 24 },
  contactTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text.primary, marginTop: 12 },
  contactSub: { color: colors.text.secondary, fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.gold.bright, marginBottom: 12, marginTop: 16, letterSpacing: 0.5 },
  faqRow: { backgroundColor: colors.bg.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border.gold },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 15, fontWeight: '700', color: colors.text.primary, flex: 1, marginRight: 12 },
  faqAnswer: { color: colors.text.secondary, fontSize: 13, marginTop: 12, lineHeight: 20 },
  subjectInput: { padding: 16, backgroundColor: colors.bg.surface, borderRadius: 14, fontSize: 16, color: colors.text.primary, marginBottom: 12, borderWidth: 1.5, borderColor: colors.gold.bright, outlineStyle: 'none' },
  messageInput: { padding: 16, backgroundColor: colors.bg.surface, borderRadius: 14, fontSize: 15, color: colors.text.primary, marginBottom: 16, minHeight: 120, borderWidth: 1.5, borderColor: colors.gold.bright, outlineStyle: 'none' },
  disputeLink: { flexDirection: 'row', alignItems: 'center', padding: 18, backgroundColor: colors.bg.surface, borderRadius: 16, borderWidth: 1.5, borderColor: colors.gold.bright, marginBottom: 24, gap: 14 },
  disputeLinkTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text.primary },
  disputeLinkSub: { fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.gold.bright, paddingVertical: 16, borderRadius: 14, boxShadow: '0px 4px 14px rgba(255,193,7,0.3)' },
  sendingBtn: { opacity: 0.7 },
  sendBtnText: { color: colors.bg.deep, fontSize: 16, fontWeight: 'bold' },
});
