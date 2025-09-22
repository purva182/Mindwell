import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Bot, User, Clock, CheckCircle } from "lucide-react";

interface Message {
  id: number;
  sender: "user" | "bot" | "counselor";
  content: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

const initialMessages: Message[] = [
  {
    id: 1,
    sender: "bot",
    content: "Hello! I'm here to provide mental health support and resources. How are you feeling today?",
    timestamp: "2:30 PM"
  },
  {
    id: 2,
    sender: "user",
    content: "I've been feeling a bit anxious lately about work.",
    timestamp: "2:31 PM",
    status: "read"
  },
  {
    id: 3,
    sender: "bot",
    content: "I understand that work-related anxiety can be challenging. Would you like to try a quick breathing exercise, or would you prefer to talk about what's specifically causing you stress?",
    timestamp: "2:32 PM"
  }
];

const quickResponses = [
  "I'm feeling anxious",
  "I need coping strategies",
  "Can you help me relax?",
  "I want to practice mindfulness",
  "Connect me with a counselor"
];

const ChatSessions = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        sender: "bot",
        content: getBotResponse(content),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("anxious") || lowerMessage.includes("anxiety")) {
      return "Anxiety is very common and manageable. Try the 5-4-3-2-1 grounding technique: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Would you like me to guide you through a breathing exercise?";
    } else if (lowerMessage.includes("stress") || lowerMessage.includes("overwhelmed")) {
      return "Feeling stressed is a normal response to challenging situations. Let's work on some strategies together. Have you tried breaking down your tasks into smaller, manageable steps?";
    } else if (lowerMessage.includes("sad") || lowerMessage.includes("depression")) {
      return "I hear that you're going through a difficult time. Remember that it's okay to feel this way, and you're not alone. Consider reaching out to a mental health professional. In the meantime, small acts of self-care can help.";
    } else if (lowerMessage.includes("sleep") || lowerMessage.includes("tired")) {
      return "Sleep issues can significantly impact mental health. Try establishing a consistent bedtime routine, avoiding screens before bed, and creating a calm sleep environment. How has your sleep been lately?";
    } else {
      return "Thank you for sharing that with me. Your feelings are valid, and I'm here to support you. Would you like to explore some coping strategies, or is there something specific you'd like to talk about?";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "sent": return <Clock className="h-3 w-3 text-muted-foreground" />;
      case "delivered": return <CheckCircle className="h-3 w-3 text-primary" />;
      case "read": return <CheckCircle className="h-3 w-3 text-success" />;
      default: return null;
    }
  };

  return (
    <Card className="shadow-soft h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          Mental Health Support Chat
          <Badge className="ml-auto bg-success text-white">
            Online
          </Badge>
        </CardTitle>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.sender !== "user" && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {message.sender === "bot" ? <Bot className="h-4 w-4" /> : "C"}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={`max-w-[70%] ${message.sender === "user" ? "order-first" : ""}`}>
              <div
                className={`p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : message.sender === "bot"
                    ? "bg-muted"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}>
                <span>{message.timestamp}</span>
                {message.status && getStatusIcon(message.status)}
              </div>
            </div>

            {message.sender === "user" && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Quick Responses */}
      <div className="px-4 py-2 border-t bg-muted/20">
        <div className="flex flex-wrap gap-2">
          {quickResponses.map((response, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => sendMessage(response)}
              className="text-xs h-7"
            >
              {response}
            </Button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sendMessage(newMessage);
              }
            }}
          />
          <Button
            onClick={() => sendMessage(newMessage)}
            disabled={!newMessage.trim() || isTyping}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💡 This is an AI-powered support chat. For crisis situations, please contact emergency services or call 988.
        </p>
      </div>
    </Card>
  );
};

export default ChatSessions;