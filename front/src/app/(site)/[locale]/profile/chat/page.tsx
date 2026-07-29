'use client';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowLeft, Send, Package, ShoppingBag, User } from 'lucide-react';
import { useChat, type Message } from '@/lib/chat-context';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/i18n-context';
import { cn } from '@/lib/utils';
import { useDirection } from '@/components/ui/direction';
import { useTranslations } from 'next-intl';

export default function ChatPage() {
  const tChat = useTranslations('chat')
  const tCommon = useTranslations('common')
  const { isAuthenticated } = useAuth();
  const { conversations, activeConversation, openChat, closeChat, sendMessage } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessage(messageInput.trim());
    setMessageInput('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <MessageSquare className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" />
          <h1 className="text-2xl font-black mb-2">{tChat('title')}</h1>
          <p className="text-muted-foreground mb-6">{tChat('auth_warning')}</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all">
            {tCommon('login')} <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <MessageSquare className="w-8 h-8" /> {tChat('title')}
        </h1>
        <p className="text-muted-foreground mb-8">
          {tChat('help_text_title')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className="lg:col-span-1 bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold text-sm">{tChat('products')}</h2>
            </div>

            {conversations.length > 0 ? (
              <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => openChat({
                      id: conv.productId,
                      title: conv.productTitle,
                      image: conv.productImage,
                      sellerId: conv.sellerId,
                      sellerName: conv.sellerName,
                    })}
                    className={cn(
                      'w-full text-left p-4 hover:bg-muted/50 transition-colors',
                      activeConversation?.id === conv.id && 'bg-primary/5 border-l-2 border-primary'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-lg shrink-0">
                        {conv.productTitle.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-sm truncate">{conv.sellerName}</h3>
                          {conv.isOnline && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.productTitle}</p>
                        {conv.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage.text}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{tChat('no_conversations')}</p>
                <p className="text-xs text-muted-foreground mt-1">{tChat('click_product')}</p>
                <Link href="/products"
                  className="inline-flex items-center gap-1 mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
                  <ShoppingBag className="w-4 h-4" /> {tCommon('products')}
                </Link>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl flex flex-col min-h-[60vh]">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-linear-to-r from-violet-500/10 to-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-lg">
                      {activeConversation.sellerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{activeConversation.sellerName}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {activeConversation.isOnline ? (
                          <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {tChat('online')}</>
                        ) : (
                          <><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /> {tChat('offline')}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground px-3 py-1 bg-muted rounded-lg">
                      <Package className="w-3 h-3 inline" /> {activeConversation.productTitle}
                    </span>
                    <button onClick={closeChat} className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[50vh]">
                  {activeConversation.messages.map((msg: Message) => (
                    <div key={msg.id} className={`flex ${msg.senderId === 'current_user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2.5',
                        msg.senderId === 'current_user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      )}>
                        {msg.senderId !== 'current_user' && (
                          <p className="text-xs font-bold text-primary mb-0.5">{msg.senderName}</p>
                        )}
                        <p className="text-sm">{msg.text}</p>
                        <p className={cn(
                          'text-[10px] mt-1',
                          msg.senderId === 'current_user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                        )}>
                          {new Date(msg.createdAt).toLocaleTimeString(tCommon('lan'), { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder={tChat('type_message')}
                    className="flex-1 h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="h-11 w-11 rounded-xl bg-linear-to-r from-violet-500 to-blue-500 text-white flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{tChat('title')}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {conversations.length > 0
                      ? tChat('help_have_chat')
                      : tChat('help_havent_chat')
                    }
                  </p>
                  {conversations.length === 0 && (
                    <Link href="/products"
                      className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
                      <ShoppingBag className="w-4 h-4" /> {tCommon('products')}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
