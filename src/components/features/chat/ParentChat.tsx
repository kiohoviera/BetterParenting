import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import {
  saveChatMessage,
  checkMessageCredits,
  saveConversationSummary,
  getConversationSummaries
} from "@/lib/chatStorage";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, Send, User as UserIcon, Heart } from "lucide-react";

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

type ParentMode = 'parents';

interface ParentChatProps {
  user: User;
  selectedChild: ChildProfile;
  userData: any;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentSessionId: string | null;
  parentMode: ParentMode;
  onBackToChildren: () => void;
}

export const ParentChat = ({
  user,
  selectedChild,
  userData,
  messages,
  setMessages,
  currentSessionId,
  parentMode,
  onBackToChildren
}: ParentChatProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get mode-specific styling and content
  const getModeConfig = (mode: ParentMode) => {
    return {
      title: `Dad & Mom Mode: ${selectedChild.name}`,
      subtitle: "Comprehensive parenting guidance for both parents",
      placeholder: `Share your parenting perspective about ${selectedChild.name}...`,
      icon: <Heart className="w-5 h-5" />,
      headerClass: "bg-purple-50 border-purple-200",
      messageClass: "border-purple-200"
    };
  };

  const config = getModeConfig(parentMode);

  // Generate conversation summary when needed (local implementation)
  const generateConversationSummary = async (messagesToSummarize: Message[]): Promise<string> => {
    try {
      // Create a simple local summary based on message content
      const conversationText = messagesToSummarize
        .map(msg => `${msg.type === 'user' ? 'Parent' : 'Coach'}: ${msg.content}`)
        .join(' ');

      // Extract key topics and themes (simple keyword-based approach)
      const keywords = ['behavior', 'challenge', 'progress', 'school', 'sleep', 'eating', 'emotion', 'friend', 'sibling', 'development'];
      const mentionedTopics = keywords.filter(keyword => 
        conversationText.toLowerCase().includes(keyword)
      );

      const summary = `Recent conversation covered: ${mentionedTopics.length > 0 ? mentionedTopics.join(', ') : 'general parenting topics'}. Last ${messagesToSummarize.length} messages in this session.`;
      
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Recent conversation summary unavailable.';
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

      // Fetch additional user data from Firebase (use cached data if available)
      let currentUserData = userData;
      if (!currentUserData) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          currentUserData = userDocSnap.data();
        }
      }

      // Get parent email from Firebase Auth and fallback to Firebase document
      const parentEmail = user.email || currentUserData?.email || 'No email available';

      // Extract child details from Firebase data
      const childName = selectedChild.name;
      const childAge = selectedChild.age;
      const personalityProfile = selectedChild.personalityProfile || "No personality profile available yet.";
      const interests = selectedChild.interests && selectedChild.interests.length > 0
        ? selectedChild.interests
        : [];

      // Get all conversation summaries for additional context
      const summaries = currentSessionId ? await getConversationSummaries(user.uid, selectedChild.id, currentSessionId) : [];
      const previousContext = summaries.length > 0 ? summaries.join(' ') : 'No previous context available.';

      // Prepare webhook payload following the specified flow
      const webhookPayload = {
        parent: {
          email: parentEmail,
          uid: user.uid
        },
        child: {
          id: selectedChild.id,
          name: childName,
          age: childAge,
          personalityProfile: personalityProfile,
          interests: interests
        },
        latestMessage: currentInput
      };

      // Send POST request to webhook (Parents Chat URL)
      const response = await fetch('https://sandbox-n8n.fly.dev/webhook/b3875fc7-b44a-4ad5-9bcd-2625d746a78d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      let assistantContent: string;
      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          assistantContent = data[0]?.Reponse || data[0]?.Response || JSON.stringify(data);
        } else if (data && typeof data === 'object') {
          assistantContent = data.Reponse || data.Response || JSON.stringify(data);
        } else {
          assistantContent = typeof data === 'string' ? data : JSON.stringify(data);
        }
      } else {
        const errorText = await response.text();
        console.error("Webhook Error Response:", errorText);
        throw new Error(`Webhook call failed with status ${response.status}: ${errorText}`);
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

      // Check if we need to generate a summary (every 10 messages)
      const totalMessages = messages.length + 2; // +2 for user and assistant messages we just added
      if (totalMessages > 10 && totalMessages % 10 === 0) {
        const messagesToSummarize = [...messages, userMessage, assistantMessage].slice(-10); // Last 10 messages
        const summary = await generateConversationSummary(messagesToSummarize);
        
        if (summary && currentSessionId) {
          await saveConversationSummary(user.uid, selectedChild.id, currentSessionId, summary);
        }
      }

    } catch (error) {
      console.error('Error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm having trouble connecting right now. Please try again later. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Chat Header */}
      <div className={`bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 ${config.headerClass}`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBackToChildren}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              {config.icon}
              <div>
                <h1 className="font-semibold text-foreground">{config.title}</h1>
                <p className="text-sm text-muted-foreground">{config.subtitle}</p>
              </div>
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
            <div className={`${message.type === 'user' ? 'message-user' : 'message-assistant'} ${config.messageClass}`}>
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
            <div className={`message-assistant ${config.messageClass}`}>
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
      <div className={`bg-card/80 backdrop-blur-sm border-t border-border/50 p-4 ${config.headerClass}`}>
        <div className="container mx-auto">
          <div className="flex space-x-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={config.placeholder}
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
};
