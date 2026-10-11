import { GuardianService, DistressLevel } from './src/core/safety/guardian.service';
import { OracleService } from './src/core/safety/oracle.service';
import { OSPublisher } from './src/core/events/publisher';

// Mocks removed for native execution.


async function testRealFeatures() {
  console.log('--- Testing Real Guardian Service (LLM) ---');
  
  const testTranscripts = [
    "The weather is so nice today, I love this city.",
    "Hey! Stop the car! Let me out right now, you are scaring me!",
    "I'm a bit annoyed because we are stuck in traffic again."
  ];

  for (const transcript of testTranscripts) {
    console.log(`\nTranscript: "${transcript}"`);
    const level = await GuardianService.analyzeSentiment(transcript);
    console.log(`Resulting Distress Level: ${level}`);
    
    if (level === DistressLevel.CRITICAL) {
      try {
        await GuardianService.triggerIntervention({
          userId: 'u123',
          userName: 'Test User',
          rideId: 'r123',
          reason: 'testing',
          location: { lat: 6.5244, lng: 3.3792 }
        }, level);
      } catch (err) {
        console.warn('⚠️ Could not publish intervention (expected if EventBus/LiveKit are down):', err.message);
      }
    }
  }

  console.log('\n--- Testing Real Oracle Service (Weather + Time) ---');
  // Coordinates for Lagos, Nigeria
  console.log('Testing normal scenario...');
  await OracleService.analyzeEnvironment(6.5244, 3.3792, 'Ikeja City Mall');

  // Coordinates for London (might have different weather)
  console.log('Testing alternative location...');
  await OracleService.analyzeEnvironment(51.5072, 0.1276, 'London Eye');

  console.log('\n--- Test Complete ---');
  process.exit(0);
}

testRealFeatures();
