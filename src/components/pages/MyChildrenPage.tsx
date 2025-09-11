
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
import { Plus, Edit2, Trash2, Settings, MessageCircle, Heart } from "lucide-react";

import { ChildMessageCredits } from "@/components/shared/ChildMessageCredits";
import { PersonalityEvaluation } from "@/components/shared/PersonalityEvaluation";
import { ChildrenChat } from "@/components/features/chat/ChildrenChat";
import { ParentChat } from "@/components/features/chat/ParentChat";


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
  whatsappNumber?: string;
  remainingMessages?: number;
  isFrozen?: boolean;
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

type ChatMode = 'children' | 'parents' | null;

export const MyChildrenPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userPlanId, setUserPlanId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null); // Additional user data from Firebase

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
  const [chatMode, setChatMode] = useState<ChatMode>(null);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Separate state for parent chat
  const [parentMessages, setParentMessages] = useState<Message[]>([]);
  const [parentSessionId, setParentSessionId] = useState<string | null>(null);
  
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

        // Fetch user's planId and additional user data
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const firebaseUserData = userDocSnap.data();
          const planId = firebaseUserData?.planId || "free";
          setUserPlanId(planId);
          setUserData(firebaseUserData); 

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

  const handleStartChat = async (child: ChildProfile, mode: ChatMode = 'children') => {
    if (!user) return;

    setSelectedChild(child);
    setChatMode(mode);

    try {
      const hasPreviousSessions = childrenWithSessions.has(child.id);
      
      // Use separate session IDs and message histories for different chat modes
      const isParentMode = mode === 'parents';

      if (hasPreviousSessions) {
        // Get existing sessions and continue with the most recent one for this specific mode
        const existingSessions = await getChatSessions(user.uid, child.id);
        if (existingSessions && existingSessions.length > 0) {
          // Filter sessions by mode to get mode-specific history
          const modeFilteredSessions = existingSessions.filter(session => 
            isParentMode ? session.title.includes('Dad & Mom') : !session.title.includes('Dad & Mom')
          );
          
          if (modeFilteredSessions.length > 0) {
            const mostRecentSession = modeFilteredSessions[0];
            
            if (isParentMode) {
              setParentSessionId(mostRecentSession.id);
            } else {
              setCurrentSessionId(mostRecentSession.id);
            }

            // Load existing messages from the most recent session for this mode
            const existingMessages = await getChatMessages(user.uid, child.id, mostRecentSession.id);
            
            const formattedMessages: Message[] = existingMessages.map(msg => ({
              id: msg.id,
              content: msg.content,
              type: msg.type,
              timestamp: msg.timestamp
            }));

            if (isParentMode) {
              setParentMessages(formattedMessages);
            } else {
              setMessages(formattedMessages);
            }
            return;
          }
        }
      }

      // Create new chat session (first time or no existing sessions for this mode)
      const sessionId = await createChatSession(
        user.uid,
        child.id,
        `${mode === 'parents' ? 'Dad & Mom' : mode.charAt(0).toUpperCase() + mode.slice(1)} Chat with ${child.name} - ${new Date().toLocaleDateString()}`
      );
      
      if (isParentMode) {
        setParentSessionId(sessionId);
      } else {
        setCurrentSessionId(sessionId);
      }

      const welcomeMessages = {
        children: `Hi! I'm here to help you with ${child.name}. How can I support you today?`,
        parents: `Welcome to Dad and Mom Mode! I'm here to provide immediate assistance/emergency response to any problem about your child. What would you like to ask?`
      };

      const welcomeMessage: Message = {
        id: '1',
        content: welcomeMessages[mode] || welcomeMessages.children,
        type: 'assistant',
        timestamp: new Date()
      };

      // Save welcome message to Firebase
      await saveChatMessage(user.uid, child.id, sessionId, {
        content: welcomeMessage.content,
        type: 'assistant'
      });

      if (isParentMode) {
        setParentMessages([welcomeMessage]);
      } else {
        setMessages([welcomeMessage]);
      }

      // Update the sessions set to include this child
      setChildrenWithSessions(prev => new Set([...prev, child.id]));
    } catch (error) {
      console.error("Error starting chat:", error);
      // Fallback to local-only chat
      const fallbackWelcome = mode === 'parents' 
        ? `Welcome to Dad and Mom Mode! I'm here to provide immediate assistance/emergency response to any problem about your child. What would you like to ask?`
        : `Hi! I'm here to help you with ${child.name}. How can I support you today?`;
        
      const fallbackMessage = {
        id: '1',
        content: fallbackWelcome,
        type: 'assistant' as const,
        timestamp: new Date()
      };
      
      if (mode === 'parents') {
        setParentMessages([fallbackMessage]);
      } else {
        setMessages([fallbackMessage]);
      }
    }
  };

  const handleBackToChildren = () => {
    setChatMode(null);
    setSelectedChild(null);
    setMessages([]);
    setParentMessages([]);
    setCurrentSessionId(null);
    setParentSessionId(null);
  };

  // Chat functionality has been moved to separate components: ChildrenChat and ParentChat


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

  // Chat Interface Routing
  if (chatMode && selectedChild && user) {
    if (chatMode === 'children') {
      return (
        <ChildrenChat
          user={user}
          selectedChild={selectedChild}
          userData={userData}
          messages={messages}
          setMessages={setMessages}
          currentSessionId={currentSessionId}
          onBackToChildren={handleBackToChildren}
        />
      );
    } else if (chatMode === 'parents') {
      return (
        <ParentChat
          user={user}
          selectedChild={selectedChild}
          userData={userData}
          messages={parentMessages}
          setMessages={setParentMessages}
          currentSessionId={parentSessionId}
          parentMode="parents"
          onBackToChildren={handleBackToChildren}
        />
      );
    }
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

                <div className="space-y-2">
                  <Button
                    variant="warm"
                    className="w-full"
                    onClick={() => handleStartChat(child, 'children')}
                    disabled={!child.personalityProfile}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {childrenWithSessions.has(child.id) ? 'Continue Chat' : 'Start Chat'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStartChat(child, 'parents')}
                    disabled={!child.personalityProfile}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Dad & Mom Mode
                  </Button>
                </div>
                
                {!child.personalityProfile && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
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
