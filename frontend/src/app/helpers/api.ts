import { Message } from "../hooks/useUIState";

export type ApiCallParams = {
  searchQuery: string;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  abortController: AbortController | null;
  setAbortController: (controller: AbortController | null) => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const makeApiCall = async ({
  searchQuery,
  setMessages,
  setIsLoading,
  abortController,
  setAbortController,
}: ApiCallParams) => {
  try {
    if (abortController) {
      abortController.abort();
    }

    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    setIsLoading(true);

    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      // If no token, use a demo mode
      console.warn('No auth token found, using demo mode');
      simulateDemoResponse(searchQuery, setMessages);
      setIsLoading(false);
      setAbortController(null);
      return;
    }

    const response = await fetch(`${API_URL}/api/v1/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: searchQuery,
      }),
      signal: newAbortController.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const decoder = new TextDecoder();
    const stream = response.body?.getReader();

    if (!stream) {
      throw new Error("response.body not found");
    }

    let streamResponse = "";

    while (true) {
      const { done, value } = await stream.read();
      const chunk = decoder.decode(value, { stream: !done });

      streamResponse += chunk;
      
      // Update the last message (assistant's response)
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: streamResponse
          };
        }
        return newMessages;
      });

      if (done) {
        break;
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Request aborted');
    } else {
      console.error("Error in makeApiCall:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: "I'm sorry, I encountered an error. Please try again."
          };
        }
        return newMessages;
      });
    }
  } finally {
    setIsLoading(false);
    setAbortController(null);
  }
};

// Demo mode simulation for when no auth token is available
function simulateDemoResponse(query: string, setMessages: (updater: (prev: Message[]) => Message[]) => void) {
  const demoResponse = `Hello! I'm Martin++, your AI assistant. I received your message: "${query}"\n\nTo use the full features of this application, please log in with your credentials. In demo mode, I can only provide this simulated response.\n\nOnce logged in, I can help you with:\n- Managing your emails and inbox\n- Scheduling calendar events\n- Creating and tracking tasks\n- Answering questions and providing assistance\n- Voice interactions\n\nPlease sign in to get started!`;
  
  let currentText = '';
  let index = 0;
  
  const interval = setInterval(() => {
    if (index < demoResponse.length) {
      currentText += demoResponse[index];
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: currentText
          };
        }
        return newMessages;
      });
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

