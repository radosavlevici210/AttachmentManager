import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { setAuthHeaders } from "@/lib/auth-utils";
import { ChatMessage } from "@/types";
import { Bot, Send, Mic, MicOff, User } from "lucide-react";

interface AiAssistantProps {
  data: any[];
}

export function AiAssistant({ data }: AiAssistantProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory, refetch: refetchHistory } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/history"],
    queryFn: async () => {
      const response = await fetch("/api/chat/history?limit=20", {
        headers: setAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch chat history");
      return response.json();
    },
  });

  const chatMutation = useMutation({
    mutationFn: async ({ message, context }: { message: string; context?: any }) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...setAuthHeaders(),
        },
        body: JSON.stringify({ message, response: "", context }),
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      refetchHistory();
      setMessage("");
    },
  });

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      chatMutation.mutate({
        message: message.trim(),
        context: data.length > 0 ? { dataRows: data.length, columns: Object.keys(data[0] || {}) } : undefined
      });
    }
  };

  const startVoiceRecognition = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopVoiceRecognition = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const quickCommands = [
    { text: "summary", label: "Summarize data" },
    { text: "columns", label: "List columns" },
    { text: "insights", label: "Get insights" },
    { text: "trends", label: "Show trends" },
  ];

  return (
    <Card className="quantum-card border-quantum-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-quantum-primary rounded-lg flex items-center justify-center">
            <Bot className="text-quantum-dark" />
          </div>
          <span className="text-quantum-primary">AI Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Interface */}
        <div className="quantum-surface rounded-lg p-4 h-64 overflow-y-auto space-y-3">
          {!chatHistory || chatHistory.length === 0 ? (
            <div className="text-center text-quantum-muted italic">
              <Bot className="w-8 h-8 mx-auto mb-2 text-quantum-primary" />
              <p>AI Assistant is ready to help you analyze your data...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chatHistory.slice().reverse().map((chat) => (
                <div key={chat.id} className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <User className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                    <div className="quantum-card rounded-lg p-3 flex-1 border-l-4 border-blue-400">
                      <p className="text-sm text-white">{chat.message}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Bot className="w-4 h-4 text-quantum-primary mt-1 flex-shrink-0" />
                    <div className="quantum-surface rounded-lg p-3 flex-1 border-l-4 border-quantum-primary">
                      <p className="text-sm text-quantum-primary">{chat.response}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me about your data..."
            className="quantum-surface border-quantum-border focus:border-quantum-primary resize-none"
            rows={3}
          />
          
          <div className="flex space-x-2">
            <Button
              type="submit"
              className="flex-1 quantum-gradient text-quantum-dark font-semibold"
              disabled={chatMutation.isPending || !message.trim()}
            >
              {chatMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-quantum-dark border-t-transparent rounded-full animate-spin"></div>
                  <span>Thinking...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Ask</span>
                </div>
              )}
            </Button>
            
            {recognition && (
              <Button
                type="button"
                onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                className={`p-3 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'quantum-surface hover:bg-quantum-border'} text-quantum-primary`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </form>

        {chatMutation.error && (
          <Alert className="border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-400">
              {chatMutation.error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Commands */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-quantum-primary">Quick Commands:</h4>
          <div className="flex flex-wrap gap-2">
            {quickCommands.map((command) => (
              <Badge
                key={command.text}
                variant="outline"
                className="cursor-pointer hover:bg-quantum-primary hover:text-quantum-dark transition-colors border-quantum-primary text-quantum-primary"
                onClick={() => setMessage(command.text)}
              >
                {command.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* AI Tips */}
        <div className="quantum-surface rounded-lg p-4">
          <h4 className="text-sm font-semibold text-quantum-primary mb-2">Tips:</h4>
          <ul className="text-xs text-quantum-muted space-y-1">
            <li>• Ask for data summaries and insights</li>
            <li>• Request specific column analysis</li>
            <li>• Get recommendations for your data</li>
            <li>• Use voice input for hands-free interaction</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
