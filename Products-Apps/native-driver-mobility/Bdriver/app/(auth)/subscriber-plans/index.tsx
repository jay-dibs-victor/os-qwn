import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthActionButton, AuthFlowShell, authColors } from '@/ui/AuthFlow';

const { width } = Dimensions.get('window');

const plans = [
  { id: 'basic', title: 'Basic', duration: '3 months', desc: '0% commission', price: '3,000', bgColor: '#FFF7DA', textColor: '#000', featureColor: '#555', icon: 'megaphone-outline', features: ['Zero commission charge', 'Full driver dashboard', 'Priority support', 'Weekly earnings report'] },
  { id: 'standard', title: 'Standard', duration: '6 months', desc: '5% commission', price: '6,000', bgColor: '#3B82F6', textColor: '#FFFFFF', featureColor: '#FFFFFF', icon: 'rocket-outline', features: ['5% commission charge', 'Full driver dashboard', 'Priority support', 'Weekly earnings report', 'Advanced analytics'] },
  { id: 'gold', title: 'Gold', duration: '9 months', desc: '8% commission', price: '10,000', bgColor: '#111111', textColor: '#FFFFFF', featureColor: '#FFFFFF', icon: 'diamond-outline', features: ['8% commission charge', 'Full driver dashboard', 'Priority support', 'Weekly earnings report', 'Advanced analytics', 'VIP status'] },
  { id: 'premium', title: 'Premium', duration: '12 months', desc: '12% commission', price: '30,000', bgColor: '#1F2937', textColor: '#FFFFFF', featureColor: '#FFFFFF', icon: 'star-outline', features: ['12% commission charge', 'Full driver dashboard', 'Priority support', 'Weekly earnings report', 'Advanced analytics', 'VIP status', 'Premium dispatch'] },
];

export default function SubscriberPlansScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [active, setActive] = useState(0);

  const goToNextPlan = () => {
    if (active < plans.length - 1) {
      const nextIndex = active + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActive(nextIndex);
    }
  };

  const goToPrevPlan = () => {
    if (active > 0) {
      const prevIndex = active - 1;
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
      setActive(prevIndex);
    }
  };

  const choosePlan = (plan: typeof plans[0]) => {
    router.push({
      pathname: '/(auth)/payment',
      params: { planId: plan.id, planTitle: plan.title, planPrice: plan.price, planDuration: plan.duration, planDesc: plan.desc },
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={plans}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActive(index);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width, backgroundColor: item.bgColor }]}>
            <View style={styles.content}>
              <Ionicons name={item.icon as any} size={80} color={item.textColor} style={styles.mainIcon} />
              <Text style={[styles.title, { color: item.textColor }]}>{item.title}</Text>
              <Text style={[styles.price, { color: item.textColor }]}>₦{item.price}</Text>
              <Text style={[styles.sub, { color: item.textColor, opacity: 0.8 }]}>{item.duration} / {item.desc}</Text>
              
              <View style={styles.features}>
                {item.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark" size={24} color={item.textColor} />
                    <Text style={[styles.feature, { color: item.featureColor }]}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      />
      
      <View style={styles.footer}>
        <View style={styles.navRow}>
          <Pressable style={styles.navArrow} onPress={goToPrevPlan}>
            <Ionicons name="arrow-back" size={32} color={active > 0 ? "#FFFFFF" : "#333333"} />
          </Pressable>
          
          <Pressable style={styles.navArrow} onPress={goToNextPlan}>
            <Ionicons name="arrow-forward" size={32} color={active < plans.length - 1 ? "#FFFFFF" : "#333333"} />
          </Pressable>
        </View>
        
        <Pressable style={styles.chooseButton} onPress={() => choosePlan(plans[active])}>
          <Text style={styles.chooseText}>Choose Plan</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  slide: { flex: 1, padding: 32, justifyContent: 'center' },
  content: { alignItems: 'center', width: '100%' },
  mainIcon: { marginBottom: 30 },
  title: { fontSize: 48, fontWeight: '900', marginBottom: 15 },
  price: { fontSize: 64, fontWeight: '900', marginBottom: 10 },
  sub: { fontSize: 20, marginBottom: 40 },
  features: { width: '100%', gap: 20, marginBottom: 60 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  feature: { fontSize: 18 },
  footer: { padding: 32, gap: 12, backgroundColor: '#000' },
  navRow: { flexDirection: 'row', gap: 20, justifyContent: 'center', marginBottom: 20 },
  navArrow: { padding: 15 },
  chooseButton: { paddingVertical: 20, borderRadius: 30, width: '100%', alignItems: 'center', backgroundColor: '#FFB800' },
  chooseText: { color: '#000', fontSize: 20, fontWeight: '900' },
});
