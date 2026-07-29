'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Send, User, Package, Search, ArrowRight, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { messagesApi } from '@/lib/api';

interface Message {
  id: string; text: string; senderId: string; createdAt: string;
}

interface Conversation {
  id: string; buyer?: { id: string; firstName?: string; username?: string; avatar?: string };
  product?: { id: string; title: string };
  lastMessage?: { text: string; createdAt: string; senderId: string };
  unreadCount?: number;
}

export default function SellerMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await messagesApi.conversations();
      const convos = Array.isArray(data) ? data : (data as any)?.conversations || [];
      setConversations(convos);
    } catch {
      setError(true);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const loadMessages = useCallback(async (convId: string) => {
    setMsgsLoading(true);
    try {
      const data = await messagesApi.getMessages(convId);
      const msgs = data?.messages || data || [];
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch {
      setMessages([]);
    } finally {
      setMsgsLoading(false);
    }
  }, []);

  const handleSelectChat = (convId: string) => {
    setActiveChat(convId);
    loadMessages(convId);
  };

  const handleSend = async () => {
    if (!messageText.trim() || !activeChat || sending) return;
    setSending(true);
    try {
      const res = await messagesApi.sendMessage(activeChat, messageText.trim());
      const sentMsg: Message = {
        id: res?.message?.id || Date.now().toString(),
        text: messageText.trim(),
        senderId: user?.id || '',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, sentMsg]);
      setMessageText('');
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ارسال پیام');
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeChat);
  const buyerName = activeConversation?.buyer?.firstName || activeConversation?.buyer?.username || 'خریدار';
  const productName = activeConversation?.product?.title || 'محصول';
  const buyerInitial = buyerName.charAt(0);

  const filteredConversations = conversations.filter(c => {
    const name = c.buyer?.firstName || c.buyer?.username || '';
    const product = c.product?.title || '';
    const lastMsg = c.lastMessage?.text || '';
    return name.includes(search) || product.includes(search) || lastMsg.includes(search);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" /> پیام‌ها
        </h2>
        <button onClick={loadConversations} disabled={loading}
          className="text-xs text-primary hover:underline">
          {loading ? '...' : 'بروزرسانی'}
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations List */}
          <div className={`w-full lg:w-80 border-l border-border flex flex-col ${activeChat ? 'hidden lg:flex' : ''}`}>
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="جستجوی پیام..."
                  className="w-full h-9 pr-9 pl-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-12 px-4">
                  <p className="text-sm text-muted-foreground mb-3">خطا در دریافت پیام‌ها</p>
                  <button onClick={loadConversations} className="text-sm text-primary font-bold hover:underline">تلاش مجدد</button>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">پیامی یافت نشد</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">هنوز هیچ خریداری با شما گفتگو نکرده است</p>
                </div>
              ) : (
                filteredConversations.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectChat(c.id)}
                    className={cn(
                      'w-full text-right p-3 border-b border-border/40 hover:bg-accent/30 transition-colors',
                      activeChat === c.id && 'bg-accent/50',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-700 shrink-0 text-sm">
                        {c.buyer?.firstName?.charAt(0) || c.buyer?.username?.charAt(0) || '؟'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{c.buyer?.firstName || c.buyer?.username || 'کاربر'}</span>
                          {c.lastMessage?.createdAt && (
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.lastMessage.createdAt).toLocaleDateString('fa-IR')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.product?.title || ''}</p>
                        <p className="text-xs text-muted-foreground truncate mt-1">{c.lastMessage?.text || ''}</p>
                      </div>
                      {(c.unreadCount ?? 0) > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 mt-2">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${activeChat ? 'flex' : 'hidden lg:flex'}`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-border flex items-center gap-3">
                  <button onClick={() => { setActiveChat(null); setMessages([]); }} className="lg:hidden p-1">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center font-bold text-sm text-emerald-700">
                    {buyerInitial}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{buyerName}</p>
                    <p className="text-xs text-muted-foreground">{productName}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {msgsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">هنوز پیامی در این گفتگو ثبت نشده</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMine = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                          <div className={cn(
                            'max-w-[75%] rounded-2xl px-4 py-2.5',
                            isMine
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md',
                          )}>
                            <p className="text-sm">{msg.text}</p>
                            <p className={cn('text-[10px] mt-1', isMine ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border flex items-center gap-2">
                  <input
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="پیام خود را بنویسید..."
                    className="flex-1 h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button onClick={handleSend} disabled={!messageText.trim() || sending}
                    className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40">
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="font-bold">یک گفتگو را انتخاب کنید</p>
                  <p className="text-sm mt-1">پیام‌های خریداران خود را اینجا مشاهده کنید</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
