import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Volume2, VolumeX, Settings } from "lucide-react";

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState("en-US");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setConfidence(0);
  };

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "it-IT", name: "Italian" },
    { code: "pt-BR", name: "Portuguese" },
    { code: "ru-RU", name: "Russian" },
    { code: "ja-JP", name: "Japanese" },
    { code: "ko-KR", name: "Korean" },
    { code: "zh-CN", name: "Chinese" },
  ];

  if (!isSupported) {
    return (
      <Card className="quantum-card border-quantum-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <MicOff className="text-white" />
            </div>
            <span className="text-red-400">Voice Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-400">
              Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari for voice features.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="quantum-card border-quantum-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-quantum-primary rounded-lg flex items-center justify-center">
            <Mic className="text-quantum-dark" />
          </div>
          <span className="text-quantum-primary">Voice Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="flex space-x-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            className={`flex-1 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'quantum-gradient text-quantum-dark'
            } font-semibold`}
          >
            {isListening ? (
              <div className="flex items-center space-x-2">
                <MicOff className="w-4 h-4" />
                <span>Stop Listening</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4" />
                <span>Start Listening</span>
              </div>
            )}
          </Button>
          
          <Button
            onClick={isSpeaking ? stopSpeaking : () => speakText(transcript || "Hello, I am your voice assistant")}
            className="quantum-surface hover:bg-quantum-border text-quantum-primary"
            disabled={!transcript && !isSpeaking}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-quantum-primary">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 quantum-surface border border-quantum-border rounded-lg text-white focus:border-quantum-primary"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-quantum-surface">
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-sm text-quantum-muted">
              {isListening ? 'Listening...' : 'Ready'}
            </span>
          </div>
          
          {confidence > 0 && (
            <Badge variant="outline" className="text-quantum-primary border-quantum-primary">
              {Math.round(confidence * 100)}% confidence
            </Badge>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-quantum-primary">Transcript:</span>
              <Button
                onClick={clearTranscript}
                size="sm"
                variant="outline"
                className="text-quantum-muted border-quantum-border hover:bg-quantum-border"
              >
                Clear
              </Button>
            </div>
            <div className="quantum-surface rounded-lg p-3 max-h-32 overflow-y-auto">
              <p className="text-sm text-white">{transcript}</p>
            </div>
          </div>
        )}

        {/* Voice Commands Help */}
        <div className="quantum-surface rounded-lg p-4">
          <h4 className="text-sm font-semibold text-quantum-primary mb-2">Voice Commands:</h4>
          <ul className="text-xs text-quantum-muted space-y-1">
            <li>• "Upload file" - Opens file upload dialog</li>
            <li>• "Show data" - Displays current data visualization</li>
            <li>• "Create task [description]" - Adds a new task</li>
            <li>• "Export memory" - Downloads session data</li>
            <li>• "Clear logs" - Clears system logs</li>
          </ul>
        </div>

        {/* Real-time Features */}
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-quantum-muted" />
          <span className="text-xs text-quantum-muted">Real-time speech recognition active</span>
        </div>
      </CardContent>
    </Card>
  );
}