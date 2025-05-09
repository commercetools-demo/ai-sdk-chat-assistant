export interface AiAssistantProps {
  /**
   * Whether the chat is initially minimized
   * @default false
   */
  minimized?: boolean;
  
  /**
   * Additional class name for the container
   * @default ''
   */
  className?: string;
  
  /**
   * The URL of the API to connect to
   */
  apiUrl: string;
  
  /**
   * The title displayed in the chat header
   * @default 'AI Assistant'
   */
  headerTitle?: string;
  
  /**
   * The welcome message displayed when no messages exist
   * @default 'Hello! I\'m your AI assistant. How can I help you today?'
   */
  welcomeMessage?: string;
  
  /**
   * The placeholder text for the input field
   * @default 'Ask me anything'
   */
  placeholderText?: string;
  
  /**
   * Authentication token to be sent with requests
   */
  authToken?: string;
  
  /**
   * Callback for handling tool calls from the AI
   */
  onToolCall?: (toolCall: any) => any;
} 