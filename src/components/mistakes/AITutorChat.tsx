"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

interface AITutorChatProps {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
}

export function AITutorChat({ questionId, questionText, userAnswer, correctAnswer }: AITutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, promptOverride?: string) => {
    e?.preventDefault();
    const messageToSend = (promptOverride || input).trim();
    if (!messageToSend || isLoading) return;

    if (!promptOverride) {
      setInput("");
    }
    setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          questionText,
          userAnswer,
          correctAnswer,
          userMessage: messageToSend
        })
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
      } else {
        throw new Error("Invalid format");
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "ai", content: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const preFabPrompts = [
    "Explain why my answer is wrong",
    "Explain the formula/rule",
    "Give me another example",
    "Teach me the concept step-by-step"
  ];

  return (
    <div className="max-h-96 flex flex-col overflow-hidden bg-slate-50/50 rounded-b-xl border-t border-slate-200/60 p-4">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-sm text-slate-400 mt-2">
            Ask the AI Tutor why your answer was wrong or about the core concept.
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-csc-blue-dark text-white" : "bg-emerald-500 text-white"}`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`p-3 rounded-xl text-sm max-w-[85%] ${
              msg.role === "user" 
                ? "bg-csc-blue-light/20 text-slate-800" 
                : "!bg-white/70 !backdrop-blur-md shadow-sm border border-slate-200/50 text-slate-700"
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 flex-row">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-xl !bg-white/70 !backdrop-blur-md shadow-sm border border-slate-200/50 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-csc-blue-dark" />
              <span className="text-xs text-slate-500 animate-pulse">AI is typing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-auto border-t border-slate-200/50 pt-3">
        {/* Pre-fab Quick Prompts */}
        <div className="flex flex-wrap gap-2">
          {preFabPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(undefined, prompt)}
              disabled={isLoading}
              className="text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full hover:border-csc-blue-mid hover:text-csc-blue-dark hover:bg-csc-blue-light/30 transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-csc-blue-dark/50"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="bg-csc-blue-dark hover:bg-csc-blue-dark/90 text-white flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
