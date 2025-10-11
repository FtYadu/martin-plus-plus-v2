import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, isStreaming }) => {
  const isUser = role === 'user';
  
  return (
    <div className={`flex w-full mb-4 message-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-900 border border-gray-200'
      }`}>
        <div className="flex items-start gap-3">
          {!isUser && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-xs font-bold">M</span>
            </div>
          )}
          <div className="flex-1">
            <div className="text-sm whitespace-pre-wrap break-words">
              {content}
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse"></span>
              )}
            </div>
          </div>
          {isUser && (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-xs font-bold">U</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

