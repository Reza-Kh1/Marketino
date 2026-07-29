'use client';
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  lastMessage?: Message;
  messages: Message[];
  isOnline: boolean;
  createdAt: string;
}

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  unreadCount: number;
  openChat: (product: { id: string; title: string; image: string; sellerId: string; sellerName: string }) => void;
  closeChat: () => void;
  sendMessage: (text: string) => void;
  productId: string | null;
}

const ChatContext = createContext<ChatContextType | null>(null);

// Persistence keys
const CHAT_STORAGE_KEY = '__bazarche_chat';

function loadFromStorage(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CHAT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(conversations: Conversation[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage full - ignore
  }
}

let mockId = 0;
function generateId() { mockId++; return `msg_${Date.now()}_${mockId}`; }

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [productId, setProductId] = useState<string | null>(null);

  // Load persisted conversations on mount
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved.length > 0) {
      setConversations(saved);
    }
  }, []);

  // Persist conversations when they change
  useEffect(() => {
    if (conversations.length > 0) {
      saveToStorage(conversations);
    }
  }, [conversations]);

  const unreadCount = conversations.reduce((sum, c) =>
    sum + c.messages.filter(m => !m.isRead && m.senderId !== 'current_user').length, 0
  );

  const openChat = useCallback((product: { id: string; title: string; image: string; sellerId: string; sellerName: string }) => {
    setProductId(product.id);
    // Find existing or create new conversation
    let conv = conversations.find(c => c.productId === product.id);
    if (!conv) {
      conv = {
        id: `conv_${product.id}`,
        productId: product.id,
        productTitle: product.title,
        productImage: product.image,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        sellerAvatar: undefined,
        buyerId: 'current_user',
        buyerName: 'شما',
        messages: [
          {
            id: generateId(),
            text: `سلام! درباره "${product.title}" سوال داشتم.`,
            senderId: 'current_user',
            senderName: 'شما',
            createdAt: new Date().toISOString(),
            isRead: true,
          },
        ],
        isOnline: Math.random() > 0.5,
        createdAt: new Date().toISOString(),
      };
      setConversations(prev => {
        const updated = [conv!, ...prev];
        return updated;
      });
    }
    setActiveConversation(conv);
  }, [conversations]);

  const closeChat = useCallback(() => {
    setActiveConversation(null);
    setProductId(null);
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!activeConversation || !text.trim()) return;

    const newMsg: Message = {
      id: generateId(),
      text: text.trim(),
      senderId: 'current_user',
      senderName: 'شما',
      createdAt: new Date().toISOString(),
      isRead: true,
    };

    const updatedConv = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMsg],
      lastMessage: newMsg,
    };

    setActiveConversation(updatedConv);

    setConversations(prev => {
      const updated = prev.map(c =>
        c.id === activeConversation.id ? updatedConv : c
      );
      saveToStorage(updated);
      return updated;
    });

    // Simulate seller reply after 1-3 seconds
    setTimeout(() => {
      const autoReply: Message = {
        id: generateId(),
        text: `سلام! ممنون از پیامتون. چطور می‌تونم درباره ${activeConversation.productTitle} کمکتون کنم؟`,
        senderId: activeConversation.sellerId,
        senderName: activeConversation.sellerName,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      setActiveConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, autoReply],
        lastMessage: autoReply,
      } : null);

      setConversations(prev => {
        const updated = prev.map(c =>
          c.id === activeConversation.id
            ? { ...c, messages: [...c.messages, autoReply], lastMessage: autoReply }
            : c
        );
        saveToStorage(updated);
        return updated;
      });
    }, 1000 + Math.random() * 2000);
  }, [activeConversation]);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      unreadCount,
      openChat,
      closeChat,
      sendMessage,
      productId,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
