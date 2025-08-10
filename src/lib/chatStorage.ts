
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  getDoc,
  serverTimestamp,
  limit
} from "firebase/firestore";
import { db } from "../firebase";

// Local storage keys
const CHAT_SESSIONS_KEY = 'chatSessions';
const CHAT_MESSAGES_KEY = 'chatMessages';

export interface ChatMessage {
  id?: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: any;
  childId: string;
  userId: string;
}

export interface ChatSession {
  id?: string;
  childId: string;
  userId: string;
  title: string;
  createdAt: any;
  lastMessage?: string;
  messageCount: number;
}

// Local storage helpers
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

const getFromLocalStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return null;
  }
};

// Create a new chat session
export const createChatSession = async (userId: string, childId: string, title: string = "New Chat") => {
  try {
    const sessionsRef = collection(db, "users", userId, "children", childId, "chatSessions");
    const docRef = await addDoc(sessionsRef, {
      title,
      createdAt: serverTimestamp(),
      messageCount: 0,
      lastMessage: ""
    });

    // Save to local storage as backup
    const localSessions = getFromLocalStorage(CHAT_SESSIONS_KEY) || {};
    const userKey = `${userId}_${childId}`;
    if (!localSessions[userKey]) {
      localSessions[userKey] = [];
    }
    localSessions[userKey].push({
      id: docRef.id,
      title,
      createdAt: new Date().toISOString(),
      messageCount: 0,
      lastMessage: ""
    });
    saveToLocalStorage(CHAT_SESSIONS_KEY, localSessions);

    return docRef.id;
  } catch (error) {
    console.error("Error creating chat session:", error);
    
    // Fallback to local storage only
    const sessionId = `local_${Date.now()}`;
    const localSessions = getFromLocalStorage(CHAT_SESSIONS_KEY) || {};
    const userKey = `${userId}_${childId}`;
    if (!localSessions[userKey]) {
      localSessions[userKey] = [];
    }
    localSessions[userKey].push({
      id: sessionId,
      title,
      createdAt: new Date().toISOString(),
      messageCount: 0,
      lastMessage: ""
    });
    saveToLocalStorage(CHAT_SESSIONS_KEY, localSessions);
    
    return sessionId;
  }
};

// Save a message to a chat session
export const saveChatMessage = async (
  userId: string, 
  childId: string, 
  sessionId: string, 
  message: Omit<ChatMessage, 'id' | 'timestamp' | 'childId' | 'userId'>
) => {
  const messageId = `msg_${Date.now()}`;
  const timestamp = new Date();
  
  try {
    // Add message to Firebase
    const messagesRef = collection(db, "users", userId, "children", childId, "chatSessions", sessionId, "messages");
    await addDoc(messagesRef, {
      ...message,
      timestamp: serverTimestamp(),
      childId,
      userId
    });

    // Update session metadata in Firebase
    const sessionRef = doc(db, "users", userId, "children", childId, "chatSessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (sessionDoc.exists()) {
      const currentCount = sessionDoc.data().messageCount || 0;
      await updateDoc(sessionRef, {
        lastMessage: message.content.substring(0, 100),
        messageCount: currentCount + 1
      });
    }

    // Update child's remaining messages if it's a user message
    if (message.type === 'user') {
      const childRef = doc(db, "users", userId, "children", childId);
      const childDoc = await getDoc(childRef);
      
      if (childDoc.exists()) {
        const remainingMessages = childDoc.data().remainingMessages || 0;
        if (remainingMessages !== -1 && remainingMessages > 0) {
          await updateDoc(childRef, {
            remainingMessages: remainingMessages - 1
          });
        }
      }
    }

    // Save to local storage as backup
    const localMessages = getFromLocalStorage(CHAT_MESSAGES_KEY) || {};
    const sessionKey = `${userId}_${childId}_${sessionId}`;
    if (!localMessages[sessionKey]) {
      localMessages[sessionKey] = [];
    }
    localMessages[sessionKey].push({
      id: messageId,
      content: message.content,
      type: message.type,
      timestamp: timestamp.toISOString(),
      childId,
      userId
    });
    saveToLocalStorage(CHAT_MESSAGES_KEY, localMessages);

    // Update local session metadata
    const localSessions = getFromLocalStorage(CHAT_SESSIONS_KEY) || {};
    const userKey = `${userId}_${childId}`;
    if (localSessions[userKey]) {
      const session = localSessions[userKey].find((s: any) => s.id === sessionId);
      if (session) {
        session.lastMessage = message.content.substring(0, 100);
        session.messageCount = (session.messageCount || 0) + 1;
        saveToLocalStorage(CHAT_SESSIONS_KEY, localSessions);
      }
    }

  } catch (error) {
    console.error("Error saving chat message to Firebase, saving to local storage:", error);
    
    // Save to local storage as fallback
    const localMessages = getFromLocalStorage(CHAT_MESSAGES_KEY) || {};
    const sessionKey = `${userId}_${childId}_${sessionId}`;
    if (!localMessages[sessionKey]) {
      localMessages[sessionKey] = [];
    }
    localMessages[sessionKey].push({
      id: messageId,
      content: message.content,
      type: message.type,
      timestamp: timestamp.toISOString(),
      childId,
      userId
    });
    saveToLocalStorage(CHAT_MESSAGES_KEY, localMessages);

    // Update local session metadata
    const localSessions = getFromLocalStorage(CHAT_SESSIONS_KEY) || {};
    const userKey = `${userId}_${childId}`;
    if (localSessions[userKey]) {
      const session = localSessions[userKey].find((s: any) => s.id === sessionId);
      if (session) {
        session.lastMessage = message.content.substring(0, 100);
        session.messageCount = (session.messageCount || 0) + 1;
        saveToLocalStorage(CHAT_SESSIONS_KEY, localSessions);
      }
    }
  }
};

// Get chat messages for a session
export const getChatMessages = async (userId: string, childId: string, sessionId: string) => {
  try {
    const messagesRef = collection(db, "users", userId, "children", childId, "chatSessions", sessionId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as ChatMessage[];
  } catch (error) {
    console.error("Error getting chat messages from Firebase, trying local storage:", error);
    
    // Fallback to local storage
    const localMessages = getFromLocalStorage(CHAT_MESSAGES_KEY) || {};
    const sessionKey = `${userId}_${childId}_${sessionId}`;
    const messages = localMessages[sessionKey] || [];
    
    return messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    })) as ChatMessage[];
  }
};

// Get chat sessions for a child
export const getChatSessions = async (userId: string, childId: string) => {
  try {
    const sessionsRef = collection(db, "users", userId, "children", childId, "chatSessions");
    const q = query(sessionsRef, orderBy("createdAt", "desc"), limit(10));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as ChatSession[];
  } catch (error) {
    console.error("Error getting chat sessions from Firebase, trying local storage:", error);
    
    // Fallback to local storage
    const localSessions = getFromLocalStorage(CHAT_SESSIONS_KEY) || {};
    const userKey = `${userId}_${childId}`;
    const sessions = localSessions[userKey] || [];
    
    return sessions
      .map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt)
      }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10) as ChatSession[];
  }
};

// Check if user has remaining message credits
export const checkMessageCredits = async (userId: string, childId: string): Promise<boolean> => {
  try {
    const childRef = doc(db, "users", userId, "children", childId);
    const childDoc = await getDoc(childRef);
    
    if (childDoc.exists()) {
      const remainingMessages = childDoc.data().remainingMessages || 0;

      if (remainingMessages === -1){
        return true
      }
      
      return remainingMessages > 0;
    }
    return false;
  } catch (error) {
    console.error("Error checking message credits:", error);
    return false;
  }
};

// Save conversation summary
export const saveConversationSummary = async (
  userId: string, 
  childId: string, 
  sessionId: string, 
  summary: string
) => {
  try {
    const summariesRef = collection(db, "users", userId, "children", childId, "chatSessions", sessionId, "summaries");
    await addDoc(summariesRef, {
      summary,
      timestamp: serverTimestamp()
    });
    
    console.log('Conversation summary saved successfully');
  } catch (error) {
    console.error("Error saving conversation summary:", error);
    
    // Fallback to local storage
    const localSummaries = getFromLocalStorage('conversationSummaries') || {};
    const summaryKey = `${userId}_${childId}_${sessionId}`;
    if (!localSummaries[summaryKey]) {
      localSummaries[summaryKey] = [];
    }
    localSummaries[summaryKey].push({
      summary,
      timestamp: new Date().toISOString()
    });
    saveToLocalStorage('conversationSummaries', localSummaries);
  }
};

// Get conversation summaries for context
export const getConversationSummaries = async (
  userId: string, 
  childId: string, 
  sessionId: string
): Promise<string[]> => {
  try {
    const summariesRef = collection(db, "users", userId, "children", childId, "chatSessions", sessionId, "summaries");
    const q = query(summariesRef, orderBy("timestamp", "asc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data().summary);
  } catch (error) {
    console.error("Error getting conversation summaries from Firebase, trying local storage:", error);
    
    // Fallback to local storage
    const localSummaries = getFromLocalStorage('conversationSummaries') || {};
    const summaryKey = `${userId}_${childId}_${sessionId}`;
    const summaries = localSummaries[summaryKey] || [];
    
    return summaries.map((item: any) => item.summary);
  }
};

// Sync local storage data to Firebase (call when connection is restored)
export const syncLocalDataToFirebase = async (userId: string) => {
  try {
    // Sync sessions
    const localSessions = getFromLocalStorage(CHAT_SESSIONS_KEY) || {};
    const localMessages = getFromLocalStorage(CHAT_MESSAGES_KEY) || {};

    for (const userKey in localSessions) {
      if (userKey.startsWith(userId)) {
        const [uid, childId] = userKey.split('_');
        if (uid === userId) {
          const sessions = localSessions[userKey];
          
          for (const session of sessions) {
            if (session.id.startsWith('local_')) {
              // This is a local-only session, sync to Firebase
              try {
                const sessionsRef = collection(db, "users", userId, "children", childId, "chatSessions");
                const docRef = await addDoc(sessionsRef, {
                  title: session.title,
                  createdAt: serverTimestamp(),
                  messageCount: session.messageCount || 0,
                  lastMessage: session.lastMessage || ""
                });

                // Update session messages
                const sessionKey = `${userId}_${childId}_${session.id}`;
                const messages = localMessages[sessionKey] || [];
                
                for (const message of messages) {
                  const messagesRef = collection(db, "users", userId, "children", childId, "chatSessions", docRef.id, "messages");
                  await addDoc(messagesRef, {
                    content: message.content,
                    type: message.type,
                    timestamp: serverTimestamp(),
                    childId,
                    userId
                  });
                }

                console.log(`Synced session ${session.id} to Firebase as ${docRef.id}`);
              } catch (error) {
                console.error(`Error syncing session ${session.id}:`, error);
              }
            }
          }
        }
      }
    }

    // Sync conversation summaries
    const localSummaries = getFromLocalStorage('conversationSummaries') || {};
    for (const summaryKey in localSummaries) {
      if (summaryKey.startsWith(userId)) {
        const [uid, childId, sessionId] = summaryKey.split('_');
        if (uid === userId) {
          const summaries = localSummaries[summaryKey];
          
          for (const summaryData of summaries) {
            try {
              const summariesRef = collection(db, "users", userId, "children", childId, "chatSessions", sessionId, "summaries");
              await addDoc(summariesRef, {
                summary: summaryData.summary,
                timestamp: serverTimestamp()
              });
            } catch (error) {
              console.error(`Error syncing summary for session ${sessionId}:`, error);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error syncing local data to Firebase:", error);
  }
};
