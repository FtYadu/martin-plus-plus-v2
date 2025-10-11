import React, { useEffect, useRef, useState } from 'react';

interface VoiceButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ isListening, onClick, disabled }) => {
  const [isLayercodeAvailable, setIsLayercodeAvailable] = useState(false);

  useEffect(() => {
    // Check if Layercode SDK is available
    // In a full implementation, you would load the Layercode SDK here
    // For now, we'll use browser's native speech recognition as fallback
    const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsLayercodeAvailable(hasWebSpeech);
  }, []);

  return (
    <button
      onClick={onClick}
      disabled={disabled || !isLayercodeAvailable}
      className={`p-3 rounded-full transition-all duration-200 ${
        isListening
          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
          : 'bg-purple-600 hover:bg-purple-700'
      } text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
      title={
        !isLayercodeAvailable
          ? 'Voice input not available in this browser'
          : isListening
          ? 'Stop listening'
          : 'Start voice input'
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isListening ? (
          <>
            <rect x="9" y="2" width="6" height="20" rx="3" />
          </>
        ) : (
          <>
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </>
        )}
      </svg>
    </button>
  );
};

