import { BufferMemory } from 'langchain/memory';

const sessions = new Map<string, BufferMemory>();
const longTermMemory = new Map<string, any>(); // userId -> { preferences, aliases }

export function getMemory(sessionId: string): BufferMemory {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, new BufferMemory({
      memoryKey: 'chat_history',
      returnMessages: true,
      inputKey: 'input',
      outputKey: 'output',
    }));
  }
  return sessions.get(sessionId)!;
}

export function clearMemory(sessionId: string): void {
  sessions.delete(sessionId);
}

// 🧠 LONG-TERM MEMORY (LTM)
export function savePreference(userId: string, key: string, value: any): void {
    if (!longTermMemory.has(userId)) longTermMemory.set(userId, { preferences: {}, aliases: {} });
    longTermMemory.get(userId).preferences[key] = value;
}

export function saveLocationAlias(userId: string, alias: string, coords: any): void {
    if (!longTermMemory.has(userId)) longTermMemory.set(userId, { preferences: {}, aliases: {} });
    longTermMemory.get(userId).aliases[alias.toLowerCase()] = coords;
}

export function getLTM(userId: string): any {
    return longTermMemory.get(userId) || { preferences: {}, aliases: {} };
}
