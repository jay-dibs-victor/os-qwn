import { StyleSheet, Text, View } from 'react-native';

export default function FindingTrips() {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.text}>Finding trips</Text>
        <View style={styles.toggleTrack}>
          <Text style={styles.onlineText}>Online</Text>
          <View style={styles.toggleOn} />
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.opportunity}>
        <Text style={styles.oppTitle}>Opportunity nearby</Text>
        <Text style={styles.oppSubtitle}>More requests than usual</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 16,
    paddingBottom: 22,
    paddingHorizontal: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    color: '#0F1A2B',
    fontSize: 18,
    fontWeight: '900',
  },
  toggleTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleOn: {
    width: 18,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#219653',
  },
  onlineText: {
    color: '#219653',
    fontSize: 12,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 14,
  },
  opportunity: {
    marginTop: 14,
  },
  oppTitle: {
    color: '#FFB800',
    fontSize: 18,
    fontWeight: '900',
  },
  oppSubtitle: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});
