"use client";

import { useEffect, useRef } from "react";
import { useUIState } from "./hooks/useUIState";
import { ChatMessage } from "./components/ChatMessage";
import { VoiceButton } from "./components/VoiceButton";
import { Loader } from "./components/Loader";

const Page = () => {
  const { state, actions } = useUIState();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [state.query]);

  const handleSubmit = () => {
    if (state.query.trim() && !state.isLoading) {
      actions.makeApiCall(state.query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceClick = () => {
    if (!state.isVoiceListening) {
      // Start voice recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          actions.setIsVoiceListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          actions.setQuery(transcript);
          actions.setIsVoiceListening(false);
        };

        recognition.onerror = () => {
          actions.setIsVoiceListening(false);
        };

        recognition.onend = () => {
          actions.setIsVoiceListening(false);
        };

        recognition.start();
      } else {
        alert('Speech recognition is not supported in your browser.');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Martin++</h1>
              <p className="text-xs text-gray-500">AI Personal Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {state.messages.length > 0 && (
              <button
                onClick={actions.clearMessages}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear Chat
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">U</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {state.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-xl mb-6">
                <span className="text-white text-4xl font-bold">M</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome to Martin++
              </h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Your intelligent AI assistant powered by GPT-4. Ask me anything, and I'll help you with tasks, information, and more.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                {[
                  "Help me organize my day",
                  "Draft an email response",
                  "Explain a complex topic",
                  "Create a task list",
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      actions.setQuery(suggestion);
                      actions.makeApiCall(suggestion);
                    }}
                    className="px-4 py-3 text-left text-sm text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all hover:shadow-md"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {state.messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  isStreaming={
                    index === state.messages.length - 1 &&
                    message.role === 'assistant' &&
                    state.isLoading
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-none min-h-[52px] max-h-[200px]"
                value={state.query}
                placeholder="Type your message... (Shift+Enter for new line)"
                onChange={({ target: { value } }) => actions.setQuery(value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              {state.query.length > 0 && (
                <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                  {state.query.length}
                </div>
              )}
            </div>
            <VoiceButton
              isListening={state.isVoiceListening}
              onClick={handleVoiceClick}
              disabled={state.isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={state.query.trim().length === 0 || state.isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-w-[100px] h-[52px] flex items-center justify-center"
            >
              {state.isLoading ? <Loader /> : "Send"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Martin++ can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;

