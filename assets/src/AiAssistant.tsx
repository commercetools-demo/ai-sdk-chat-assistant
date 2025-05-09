import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import ChatBubble from './components/ChatBubble';
import styles from './styles.module.css';
import { AiAssistantProps } from './types';

export const AiAssistant: React.FC<AiAssistantProps> = ({
  minimized = false,
  className = '',
  apiUrl,
  headerTitle = 'AI Assistant',
  welcomeMessage = 'Hello! I\'m your AI assistant. How can I help you today?',
  placeholderText = 'Ask me anything',
  authToken,
  onToolCall,
}) => {
  const [isOpen, setIsOpen] = useState(!minimized);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Set up headers for authentication if token is provided
  const headers: Record<string, string> = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: apiUrl,
    headers,
    onToolCall: onToolCall ? ({ toolCall }) => onToolCall(toolCall) : undefined,
  });

  // Scroll to bottom of chat container when messages change
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={`${styles.assistantContainer} ${className}`}>
      {/* Toggle button - only shown when minimized */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className={styles.toggleButton}
          aria-label="Open chat assistant"
        >
          <span className={styles.iconWrapper}>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2C16.75 2 21 6.25 21 11.5Z" 
                stroke="currentColor" 
                strokeWidth="2"
              />
              <path 
                d="M22 22L20 20" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </span>
        </button>
      )}

      {/* Chat container */}
      {isOpen && (
        <div className={styles.chatContainer}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <span className={styles.chatHeaderText}>{headerTitle}</span>
            <button
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M18 6L6 18" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M6 6L18 18" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Messages container */}
          <div ref={chatContainerRef} className={styles.messagesContainer}>
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className={styles.welcomeMessage}>
                <p>{welcomeMessage}</p>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                isUserMessage={message.role === 'user'}
              >
                {message.parts.map((part, partIndex) => {
                  if (part.type === 'text') {
                    return (
                      <div key={partIndex} className={styles.messageBubble}>
                        {part.text}
                      </div>
                    );
                  }
                  return null;
                })}
              </ChatBubble>
            ))}

            {/* Loading indicator */}
            {status !== 'ready' && status !== 'error' && (
              <div className={styles.loadingIndicator}>
                <div className={styles.loadingDots}>
                  <div className={styles.loadingDot}></div>
                  <div
                    className={styles.loadingDot}
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className={styles.loadingDot}
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={placeholderText}
              disabled={status !== 'ready'}
              className={styles.input}
            />
            <button
              type="submit"
              disabled={status !== 'ready' || !input.trim()}
              className={`${styles.submitButton} ${
                !input.trim() || status !== 'ready' ? styles.submitButtonDisabled : ''
              }`}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M22 2L11 13" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M22 2L15 22L11 13L2 9L22 2Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AiAssistant; 