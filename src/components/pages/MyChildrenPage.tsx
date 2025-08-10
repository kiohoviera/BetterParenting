
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, deleteDoc, doc, updateDoc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { fetchChildrenForUser } from "@/lib/FetchChildren";
import {
  createChatSession,
  saveChatMessage,
  getChatMessages,
  checkMessageCredits,
  getChatSessions,
  saveConversationSummary,
  getConversationSummaries
} from "@/lib/chatStorage";

import { User } from "firebase/auth";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Settings, MessageCircle, ArrowLeft, Clock, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import { ChildMessageCredits } from "@/components/shared/ChildMessageCredits";
import { PersonalityEvaluation } from "@/components/shared/PersonalityEvaluation";


const personalityDescriptions: Record<string, string> = {
  "ESTJ": "The Executive - Organized, decisive, and natural leaders who enjoy taking charge.",
  "ENTJ": "The Commander - Strategic thinkers who are natural born leaders and love challenges.",
  "ESFJ": "The Consul - Warm-hearted and popular, always eager to help others.",
  "ENFJ": "The Protagonist - Charismatic and inspiring leaders who care deeply about others.",
  "ESTP": "The Entrepreneur - Energetic and spontaneous, they love being active and social.",
  "ENTP": "The Debater - Curious and clever, always looking for new possibilities.",
  "ESFP": "The Entertainer - Spontaneous and enthusiastic, they love being around people.",
  "ENFP": "The Campaigner - Creative and enthusiastic, with a strong people focus.",
  "ISTJ": "The Logistician - Practical and methodical, they value tradition and reliability.",
  "INTJ": "The Architect - Imaginative and strategic thinkers with a plan for everything.",
  "ISFJ": "The Protector - Warm and considerate, always ready to help those they care about.",
  "INFJ": "The Advocate - Creative and insightful, inspired by their values and beliefs.",
  "ISTP": "The Virtuoso - Bold and practical, they love to experiment and explore.",
  "INTP": "The Thinker - Innovative and curious, they love exploring theoretical concepts.",
  "ISFP": "The Adventurer - Flexible and charming, they are guided by their values.",
  "INFP": "The Mediator - Idealistic and loyal, they value inner harmony and personal values."
};


interface ChildProfile {
  id: string;
  name: string;
  age: number;
  personalityProfile?: string;
  interests?: string[];
  remainingMessages?: number;
  isFrozen?: boolean;
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

export const MyChildrenPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userPlanId, setUserPlanId] = useState<string | null>(null);

  const [children, setChildren] = useState<ChildProfile[]>([]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [newChild, setNewChild] = useState({
    name: "",
    age: 0,
    personalityProfile: "",
    interests: ""
  });
  const [loading, setLoading] = useState(true);
  const [personalityEvalChild, setPersonalityEvalChild] = useState<ChildProfile | null>(null);
  const [chatMode, setChatMode] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [childrenWithSessions, setChildrenWithSessions] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // Protect page from unauthenticated users
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      // Sync any offline data to Firebase when user logs in
      try {
        const { syncLocalDataToFirebase } = await import('@/lib/chatStorage');
        await syncLocalDataToFirebase(user.uid);
      } catch (error) {
        console.error("Error syncing offline data:", error);
      }

      try {
        // Fetch children
        const childrenData = await fetchChildrenForUser(user.uid);
        setChildren(childrenData);

        // Check for existing chat sessions for each child
        const sessionsSet = new Set<string>();
        for (const child of childrenData) {
          try {
            const sessions = await getChatSessions(user.uid, child.id);
            if (sessions && sessions.length > 0) {
              sessionsSet.add(child.id);
            }
          } catch (error) {
            console.error(`Error checking sessions for child ${child.id}:`, error);
          }
        }
        setChildrenWithSessions(sessionsSet);

        // Fetch user's planId
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const planId = userDocSnap.data()?.planId || "free";
          setUserPlanId(planId);

          //  Fetch plan data
          const planDocRef = doc(db, "plans", planId);
          const planDocSnap = await getDoc(planDocRef);
          const planData = planDocSnap.exists() ? planDocSnap.data() : null;

          const maxChildren = planData?.maxChildren ?? 1;

          //  Check for frozen children and unfreeze if needed
          let unfrozenCount = 0;
          for (const child of childrenData) {
            if (!child.isFrozen) {
              unfrozenCount++;
            }
          }

          // If we can unfreeze some:
          if (unfrozenCount < maxChildren) {
            const childrenToUnfreeze = childrenData
              .filter(c => c.isFrozen)
              .slice(0, maxChildren - unfrozenCount);

            for (const child of childrenToUnfreeze) {
              const childRef = doc(db, "users", user.uid, "children", child.id);
              await updateDoc(childRef, {
                isFrozen: false
              });
            }

            // Re-fetch updated children
            const refreshedChildren = await fetchChildrenForUser(user.uid);
            setChildren(refreshedChildren);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);



  const handleAddChild = async () => {
    const currentUser = auth.currentUser; // Use currentUser from state
    if (!currentUser || !newChild.name || !newChild.age) return;

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const planId = userDocSnap.exists() ? userDocSnap.data().planId || "free" : "free";

      const planDocRef = doc(db, "plans", planId);
      const planDocSnap = await getDoc(planDocRef);
      const planData = planDocSnap.exists() ? planDocSnap.data() : null;

      const maxChildren = planData?.maxChildren ?? 1;
      const maxConversations = planData?.maxConversations ?? 0;

      const childrenRef = collection(db, "users", currentUser.uid, "children");
      const currentChildrenSnap = await getDocs(childrenRef);
      const currentCount = currentChildrenSnap.size;

      if (currentCount >= maxChildren) {
        alert(`You've reached the child limit (${maxChildren}) for your plan.`);
        return;
      }

      await addDoc(childrenRef, {
        name: newChild.name,
        age: Number(newChild.age),
        personalityProfile: newChild.personalityProfile,
        interests: newChild.interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        remainingMessages: maxConversations,
      });

      const updatedChildren = await fetchChildrenForUser(currentUser.uid);
      setChildren(updatedChildren);
      setNewChild({ name: "", age: 0, personalityProfile: "", interests: "" });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add child:", error);
    }
  };



  const handleEditChild = async () => {
    const currentUser = auth.currentUser; // Use currentUser from state
    if (!currentUser || !editingChild) return;

    try {
      const childRef = doc(db, "users", currentUser.uid, "children", editingChild.id);
      await updateDoc(childRef, {
        name: editingChild.name,
        age: editingChild.age,
        personalityProfile: editingChild.personalityProfile,
        interests: editingChild.interests || [],
      });

      // Refresh children list
      const updatedChildren = await fetchChildrenForUser(currentUser.uid);
      setChildren(updatedChildren);
      setEditingChild(null);
    } catch (error) {
      console.error("Failed to update child:", error);
    }
  };

  const handleDeleteChild = async (childId: string) => {
    const currentUser = auth.currentUser; // Use currentUser from state
    if (!currentUser) return;

    if (confirm("Are you sure you want to delete this child's profile?")) {
      try {
        const childRef = doc(db, "users", currentUser.uid, "children", childId);
        await deleteDoc(childRef);

        // Refresh children list
        const updatedChildren = await fetchChildrenForUser(currentUser.uid);
        setChildren(updatedChildren);
      } catch (error) {
        console.error("Failed to delete child:", error);
      }
    }
  };

  const handlePersonalityComplete = async (personalityType: string) => {
    if (!personalityEvalChild) return;

    // Handle case where we're evaluating a new child (temp child)
    if (personalityEvalChild.id === 'temp') {
      setNewChild(prev => ({
        ...prev,
        personalityProfile: personalityType
      }));

      try {
        const tempDocRef = doc(db, "users", user.uid, "children", "temp");
        await deleteDoc(tempDocRef);
        console.log("Temp child deleted from Firestore after evaluation.");
      } catch (err) {
        console.error("Failed to delete temp child:", err);
      }
      
      setPersonalityEvalChild(null);
      return;
    }

    // Handle case where we're evaluating an existing child being edited
    if (editingChild && editingChild.id === personalityEvalChild.id) {
      setEditingChild(prev => prev ? {
        ...prev,
        personalityProfile: personalityType
      } : null);
      setPersonalityEvalChild(null);
      return;
    }

    // Handle regular child update
    const idx = children.findIndex(c => c.id === personalityEvalChild.id);
    if (idx !== -1) {
      const updated = [...children];
      updated[idx].personalityProfile = personalityType;
      setChildren(updated);
    }

    setPersonalityEvalChild(null);
  };

  const handleStartChat = async (child: ChildProfile) => {
    if (!user) return;

    setSelectedChild(child);
    setChatMode(true);

    try {
      const hasPreviousSessions = childrenWithSessions.has(child.id);

      if (hasPreviousSessions) {
        // Get existing sessions and continue with the most recent one
        const existingSessions = await getChatSessions(user.uid, child.id);
        if (existingSessions && existingSessions.length > 0) {
          const mostRecentSession = existingSessions[0];
          setCurrentSessionId(mostRecentSession.id);

          // Load existing messages from the most recent session
          const existingMessages = await getChatMessages(user.uid, child.id, mostRecentSession.id);
          const formattedMessages: Message[] = existingMessages.map(msg => ({
            id: msg.id,
            content: msg.content,
            type: msg.type,
            timestamp: msg.timestamp
          }));

          setMessages(formattedMessages);
          return;
        }
      }

      // Create new chat session (first time or no existing sessions)
      const sessionId = await createChatSession(
        user.uid,
        child.id,
        `Chat with ${child.name} - ${new Date().toLocaleDateString()}`
      );
      setCurrentSessionId(sessionId);

      const welcomeMessage: Message = {
        id: '1',
        content: `Hi! I'm here to help you with ${child.name}. How can I support you today?`,
        type: 'assistant',
        timestamp: new Date()
      };

      // Save welcome message to Firebase
      await saveChatMessage(user.uid, child.id, sessionId, {
        content: welcomeMessage.content,
        type: 'assistant'
      });

      setMessages([welcomeMessage]);

      // Update the sessions set to include this child
      setChildrenWithSessions(prev => new Set([...prev, child.id]));
    } catch (error) {
      console.error("Error starting chat:", error);
      // Fallback to local-only chat
      setMessages([
        {
          id: '1',
          content: `Hi! I'm here to help you with ${child.name}. How can I support you today?`,
          type: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleBackToChildren = () => {
    setChatMode(false);
    setSelectedChild(null);
    setMessages([]);
    setInputValue("");
    setCurrentSessionId(null);
  };

  // Generate conversation summary when needed
  const generateConversationSummary = async (messagesToSummarize: Message[]): Promise<string> => {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not found');
      }

      const conversationText = messagesToSummarize
        .map(msg => `${msg.type === 'user' ? 'Parent' : 'Coach'}: ${msg.content}`)
        .join('\n');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: `Get the most valuable information from this conversation about the child that can be used as context for further questions. Provide 2-3 sentences summarizing key insights about the child's behavior, challenges, progress, or important family context:\n\n${conversationText}`
            }
          ],
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content.trim();
      }
      return '';
    } catch (error) {
      console.error('Error generating summary:', error);
      return '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedChild || !user) return;

    // Check message credits first
    const hasCredits = await checkMessageCredits(user.uid, selectedChild.id);
    if (!hasCredits) {
      alert("No message credits remaining for this child. Please upgrade your plan.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // Save user message to Firebase
      if (currentSessionId) {
        await saveChatMessage(user.uid, selectedChild.id, currentSessionId, {
          content: currentInput,
          type: 'user'
        });
      }

      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable not found');
      }

      // Check if we need to generate a summary (every 10 messages)
      const totalMessages = messages.length + 1; // +1 for the message we just added
      if (totalMessages > 10 && totalMessages % 10 === 0) {
        const messagesToSummarize = messages.slice(-10); // Last 10 messages
        const summary = await generateConversationSummary(messagesToSummarize);
        
        if (summary && currentSessionId) {
          await saveConversationSummary(user.uid, selectedChild.id, currentSessionId, summary);
        }
      }

      // Get all conversation summaries for context
      const summaries = currentSessionId ? await getConversationSummaries(user.uid, selectedChild.id, currentSessionId) : [];
      const valuableInformation = summaries.length > 0 ? summaries.join(' ') : 'No previous context available.';

      // Extract child details
      const childAge = selectedChild.age;
      const personalityProfile = selectedChild.personalityProfile
        ? (selectedChild.personalityProfile.includes('|')
          ? selectedChild.personalityProfile.split('|')[1]
          : `MBTI Type: ${selectedChild.personalityProfile}`)
        : "No personality profile available yet.";
      
      const interests = selectedChild.interests && selectedChild.interests.length > 0
        ? selectedChild.interests.join(', ')
        : 'No specific interests recorded.';

      // Create the new system prompt
      const systemPrompt = `You are a personal parenting coach continuing a conversation:

This is the latest message: ${currentInput}
This is the valuable information from the conversations: ${valuableInformation}
This is the basic details of the child: Age ${childAge}, Personality: ${personalityProfile}, Interests: ${interests}

Send a reply that sounds like a real human. Write naturally like you're texting a friend. Do NOT use asterisks, bullet points, numbered lists, or any formatting. No **bold text**, no *italics*, no special symbols. Just write in plain conversational text with normal sentences and paragraphs.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      let assistantContent: string;
      if (response.ok) {
        const data = await response.json();
        assistantContent = data.choices[0].message.content;
      } else {
        throw new Error('API call failed');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantContent,
        type: 'assistant',
        timestamp: new Date()
      };

      // Save assistant message to Firebase
      if (currentSessionId) {
        await saveChatMessage(user.uid, selectedChild.id, currentSessionId, {
          content: assistantContent,
          type: 'assistant'
        });
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please check that the OpenAI API key is properly set up and try again.",
        type: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 pt-20 text-center">
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Please log in to access your children's profiles</h2>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  // Chat Interface
  if (chatMode && selectedChild) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex flex-col">
        {/* Chat Header */}
        <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={handleBackToChildren}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-foreground">{selectedChild.name}'s Coach</h1>
                <p className="text-sm text-muted-foreground">Personalized guidance for age {selectedChild.age}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 container mx-auto p-4 space-y-6 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} fade-in-gentle`}
            >
              <div className={message.type === 'user' ? 'message-user' : 'message-assistant'}>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start fade-in-gentle">
              <div className="message-assistant">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-card/80 backdrop-blur-sm border-t border-border/50 p-4">
          <div className="container mx-auto">
            <div className="flex space-x-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Tell me about ${selectedChild.name} or ask a question...`}
                className="flex-1 border-border/50 focus:border-primary transition-gentle resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
                rows={2}
              />
              <Button
                variant="warm"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <div className="container max-w-4xl mx-auto px-4 pt-10 pb-20 fade-in-gentle">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Children</h1>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-warm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Child
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Child</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Child's Name"
                  value={newChild.name}
                  onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Age"
                  min={0}
                  max={99}
                  value={newChild.age.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = Number(val);
                    if (!isNaN(num) && num >= 0 && num <= 99) {
                      setNewChild({ ...newChild, age: num });
                    }
                  }}
                />

                {newChild.personalityProfile ? (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          Personality Profile: {newChild.personalityProfile.includes('|') ?
                            newChild.personalityProfile.split('|')[0] : newChild.personalityProfile}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {personalityDescriptions[newChild.personalityProfile.includes('|') ?
                            newChild.personalityProfile.split('|')[0] : newChild.personalityProfile]}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const tempChild: ChildProfile = {
                            id: 'temp',
                            name: newChild.name || 'New Child',
                            age: Number(newChild.age) || 0,
                            personalityProfile: newChild.personalityProfile,
                            interests: newChild.interests.split(",").map(s => s.trim()).filter(Boolean)
                          };
                          setPersonalityEvalChild(tempChild);
                        }}
                        className="text-xs ml-2"
                      >
                        Update
                      </Button>
                    </div>
                    {newChild.personalityProfile.includes('|') && (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        ✓ Enhanced with AI Analysis
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full mb-3 justify-start text-left"
                    onClick={() => {
                      const tempChild: ChildProfile = {
                        id: 'temp',
                        name: newChild.name || 'New Child',
                        age: Number(newChild.age) || 0,
                        personalityProfile: newChild.personalityProfile,
                        interests: newChild.interests.split(",").map(s => s.trim()).filter(Boolean)
                      };
                      setPersonalityEvalChild(tempChild);
                    }}
                  >
                    Evaluate Personality Profile
                  </Button>
                )}
                <Input
                  placeholder="Interests (comma-separated)"
                  value={newChild.interests}
                  onChange={(e) => setNewChild({ ...newChild, interests: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddChild} className="btn-warm flex-1">
                    Add Child
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {children.length === 0 ? (
          <Card className="p-8 text-center shadow-gentle">
            <h2 className="text-xl font-semibold mb-4">No Children Added Yet</h2>
            <p className="text-muted-foreground mb-6">
              Add your first child to start receiving personalized parenting advice.
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="btn-warm"
            >
              Add Your First Child
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <Card key={child.id} className="p-6 shadow-gentle">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{child.name || 'Unnamed Child'}</h3>
                    <p className="text-muted-foreground">Age: {child.age || 'Not specified'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingChild(child)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteChild(child.id)}
                      disabled={child.isFrozen}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {child.personalityProfile && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          Personality Profile: {child.personalityProfile.includes('|') ?
                            child.personalityProfile.split('|')[0] : child.personalityProfile}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {personalityDescriptions[child.personalityProfile.includes('|') ?
                            child.personalityProfile.split('|')[0] : child.personalityProfile]}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPersonalityEvalChild(child)}
                        className="text-xs ml-2"
                      >
                        Update
                      </Button>
                    </div>
                    {child.personalityProfile.includes('|') && (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        ✓ Enhanced with AI Analysis
                      </div>
                    )}
                  </div>
                )}


                {child.interests && child.interests.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-foreground">Interests:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {child.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <ChildMessageCredits childId={child.id} />
                </div>

                <Button
                  variant="warm"
                  className="w-full"
                  onClick={() => handleStartChat(child)}
                  disabled={!child.personalityProfile}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {childrenWithSessions.has(child.id) ? 'Continue Chat' : 'Start Chat'}
                </Button>
                {!child.personalityProfile && (
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    Complete personality profile to start chatting
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Edit Child Dialog */}
        <Dialog open={!!editingChild} onOpenChange={() => setEditingChild(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Child</DialogTitle>
            </DialogHeader>
            {editingChild && (
              <div className="space-y-4">
                <Input
                  placeholder="Child's Name"
                  value={editingChild.name}
                  onChange={(e) => setEditingChild({ ...editingChild, name: e.target.value })}
                />

                <Input
                  type="number"
                  placeholder="Age"
                  min={0}
                  max={99}
                  value={editingChild.age.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = Number(val);
                    if (!isNaN(num) && num >= 0 && num <= 99) {
                      setEditingChild({ ...editingChild, age: num });
                    }
                  }}
                />


                {editingChild.personalityProfile ? (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          Personality Profile: {editingChild.personalityProfile.includes('|') ?
                            editingChild.personalityProfile.split('|')[0] : editingChild.personalityProfile}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {personalityDescriptions[editingChild.personalityProfile.includes('|') ?
                            editingChild.personalityProfile.split('|')[0] : editingChild.personalityProfile]}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPersonalityEvalChild(editingChild)}
                        className="text-xs ml-2"
                      >
                        Update
                      </Button>
                    </div>
                    {editingChild.personalityProfile.includes('|') && (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        ✓ Enhanced with AI Analysis
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full mb-3 justify-start text-left"
                    onClick={() => {
                      setPersonalityEvalChild(editingChild);
                    }}
                  >
                    Evaluate Personality Profile
                  </Button>
                )}
                <Input
                  placeholder="Interests (comma-separated)"
                  value={editingChild.interests?.join(", ") || ""}
                  onChange={(e) => setEditingChild({
                    ...editingChild,
                    interests: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  })}
                />
                <div className="flex gap-2">
                  <Button onClick={handleEditChild} className="btn-warm flex-1" disabled={editingChild.isFrozen}>
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingChild(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Account Settings Section */}
        <Card className="mt-12 p-6 shadow-gentle">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Account Settings</h2>
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                if (userPlanId) {
                  navigate(`/account-update?plan=${userPlanId}`);
                } else {
                  alert("Plan information is still loading. Please try again.");
                }
              }}
            >
              Update Account Information
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/pricing")}
            >
              Manage Subscription
            </Button>
          </div>
        </Card>
      </div>

      <Footer />

      {/* Personality Evaluation Dialog */}
      <PersonalityEvaluation
        isOpen={!!personalityEvalChild}
        onClose={() => setPersonalityEvalChild(null)}
        onComplete={handlePersonalityComplete}
        childName={personalityEvalChild?.name || ''}
        userId={user?.uid || ''}
        childId={personalityEvalChild?.id || ''}
      />
    </div>
  );
};
