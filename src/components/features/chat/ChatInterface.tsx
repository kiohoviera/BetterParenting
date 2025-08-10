import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Clock, ArrowLeft, AlertTriangle } from "lucide-react";

interface ChatInterfaceProps {
  onBack: () => void;
  onUpgrade: () => void;
  remainingMessages: number;
  totalFreeMessages: number;
  onSendMessage: () => void;
  childName?: string;
  childAge?: number;
  personalityProfile?: string;
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

export const ChatInterface = ({ 
  onBack, 
  onUpgrade, 
  remainingMessages, 
  totalFreeMessages,
  onSendMessage,
  childName = "your child",
  childAge = 0,
  personalityProfile = "No personality profile available yet."
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm a general parenting assistant. I can provide basic advice, but for personalized guidance specifically tailored to your child's needs and your family values, consider upgrading to get your dedicated WhatsApp coach!",
      type: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Load chat from localStorage on component mount
  useEffect(() => {
    const savedChat = localStorage.getItem('freeTrialChat');
    if (savedChat) {
      try {
        const parsedChat = JSON.parse(savedChat);
        setMessages(parsedChat.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Error loading saved chat:', error);
      }
    }
  }, []);

  // Save chat to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 1) { // Don't save just the welcome message
      localStorage.setItem('freeTrialChat', JSON.stringify(messages));
    }
  }, [messages]);

  const usedMessages = totalFreeMessages - remainingMessages;
  const progressPercentage = (usedMessages / totalFreeMessages) * 100;

  const handleSendMessage = async () => {
    if (!inputValue.trim() || remainingMessages <= 0) return;

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
      let assistantContent: string;

      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable not found');
      }

      // Chunk and summarize conversation history if it's getting long
      let conversationContext = "";
      const allMessages = [...messages, userMessage];

      if (allMessages.length > 10) {
        // Create conversation chunks (excluding the welcome message and recent messages)
        const messagesToChunk = allMessages.slice(1, -4); // Skip welcome message and last 4 messages
        const chunks = [];
        let currentChunk = "";

        for (const msg of messagesToChunk) {
          const messageText = `${msg.type === 'user' ? 'Parent' : 'Coach'}: ${msg.content}`;
          if ((currentChunk + messageText).length > 1500) {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = messageText + "\n";
          } else {
            currentChunk += messageText + "\n";
          }
        }
        if (currentChunk) chunks.push(currentChunk);

        // Summarize each chunk
        const summarizedChunks = await Promise.all(chunks.map(async (chunk) => {
          try {
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
                    content: `Summarize this conversation between a parent and parenting coach about their child. Extract the key behavioral patterns, what's been tried, family context, and main concerns. Keep it conversational and natural: ${chunk}`
                  }
                ],
                temperature: 0.3,
              })
            });

            if (response.ok) {
              const data = await response.json();
              return data.choices[0].message.content.trim();
            }
            return "Previous conversation about parenting topics.";
          } catch {
            return "Previous conversation about parenting topics.";
          }
        }));

        // Build context with summaries + recent messages (excluding incomplete responses)
        const conversationSummary = summarizedChunks.join(' ');
        const recentMessages = allMessages
          .slice(-4) // Last 4 messages for immediate context
          .filter(msg => msg.type === 'user' || !msg.content.includes('💡 This is general advice')) // Filter out incomplete AI responses
          .map(msg => `${msg.type === 'user' ? 'Parent' : 'Coach'}: ${msg.content.replace(/💡 This is general advice.*$/, '').trim()}`)
          .join('\n');

        conversationContext = `Previous conversation summary: ${conversationSummary}\n\nRecent conversation:\n${recentMessages}`;
      } else {
        // Use recent messages if conversation is still short (excluding incomplete responses)
        conversationContext = allMessages
          .slice(1) // Skip welcome message
          .filter(msg => msg.type === 'user' || !msg.content.includes('💡 This is general advice')) // Filter out incomplete AI responses
          .map(msg => `${msg.type === 'user' ? 'Parent' : 'Coach'}: ${msg.content.replace(/💡 This is general advice.*$/, '').trim()}`)
          .join('\n');
      }

      // Create personalized system prompt
      const systemPrompt = `You're a warm, experienced parent chatting with another parent about their child ${childName} (${childAge} years old). 

Here's what you know about ${childName}: ${personalityProfile}

Previous conversation:
${conversationContext}

You're a supportive parent friend who gives practical, actionable advice. When someone shares a specific situation or concern, give them helpful suggestions right away based on what you know about their child and situation.

Only ask follow-up questions if their message is vague or generic (like just saying "help" or "he's being difficult" without any details). If they give you enough context about a specific situation, jump right into helpful advice.

For specific concerns, offer 2-3 practical suggestions that fit their child's personality and age. When giving suggestions, write them naturally in paragraph form without formatting.

Write like you're texting a close friend - warm, conversational, and helpful. NEVER use asterisks, bullet points, numbered lists, bold text, italics, or any special formatting. Write everything in plain conversational sentences. Instead of using formatting to emphasize ideas, use natural language like "One thing you could try is..." or "Another approach might be..." or "I'd also suggest..."

Be supportive but get to the point. Parents need solutions, not just questions.

IMPORTANT: This is a new message from the parent. Respond to their latest concern directly. Do not continue any previous response.`;

      // Use OpenAI API for responses
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
            },
            {
              role: 'user',
              content: currentInput
            }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        assistantContent = data.choices[0].message.content + "\n\n💡 This is general advice. For personalized guidance tailored to your specific situation, consider upgrading to our premium WhatsApp coach!";
      } else {
        throw new Error('OpenAI API call failed');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantContent,
        type: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Decrement message count
      onSendMessage();
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "API KEY ERROR: OpenAI API key not found in environment variables or API call failed. Please check that OPENAI_API_KEY is properly set in Secrets.",
        type: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);

      // Still decrement message count even on error
      onSendMessage();
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">Free Trial Preview</h1>
              <p className="text-sm text-muted-foreground">Generic coach (limited responses)</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {remainingMessages} messages left
              </p>
              <div className="w-24 mt-1">
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
            {remainingMessages <= 2 && (
              <Button variant="accent" size="sm" onClick={onUpgrade}>
                <Sparkles className="w-4 h-4" />
                Upgrade
              </Button>
            )}
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
          {remainingMessages > 0 ? (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Describe your parenting situation or question..."
                  className="flex-1 border-border/50 focus:border-primary transition-gentle resize-none"
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
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
              {remainingMessages <= 2 && (
                <div className="text-center">
                  <Button variant="accent" size="sm" onClick={onUpgrade}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade for Unlimited Access
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="p-6 text-center bg-accent-soft/50 border-accent/20">
              <h3 className="font-semibold text-foreground mb-2">
                Free trial complete
              </h3>
              <p className="text-gentle mb-4">
                Ready for personalized advice? Get your private WhatsApp number and a coach who knows your child.
              </p>
              <Button variant="accent" onClick={onUpgrade}>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Your WhatsApp Coach
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};