'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Image as ImageIcon, Loader2, MessageSquare } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/lib/auth-context';

interface InboxUIProps {
  userRole: 'CUSTOMER' | 'VENDOR';
  userId: string; // we'll use email for now, or fetch actual ID
}

interface PresenceInfo {
  online: boolean;
  lastSeenAt?: string | null;
}

// Identity (email) of the other party in a conversation, used to key presence.
function getCounterpartId(conv: any, userRole: 'CUSTOMER' | 'VENDOR'): string | undefined {
  return userRole === 'CUSTOMER' ? conv?.vendorId : conv?.customerId;
}

function formatLastSeen(iso?: string | null): string {
  if (!iso) return 'Offline';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Last seen just now';
  if (diffMin < 60) return `Last seen ${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Last seen ${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `Last seen ${diffDay}d ago`;
}

export function InboxUI({ userRole, userId }: InboxUIProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceInfo>>({});

  const stompClient = useRef<Client | null>(null);
  const conversationSubRef = useRef<StompSubscription | null>(null);
  const activeConvIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    connectStomp();
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // Wait, we need actual DB userId for this endpoint, or we can use email if backend supports it.
      // Let's first try to get the real User object.
      // But we can get it from profile.
      const rolePath = userRole === 'CUSTOMER' ? 'customer' : 'vendor';
      const actualUserId = user?.email || userId;
      
      const res = await apiClient.get(`/conversations/${rolePath}/${actualUserId}`);
      setConversations(res.data);

      const counterpartIds = res.data
        .map((conv: any) => getCounterpartId(conv, userRole))
        .filter(Boolean);
      fetchPresence(counterpartIds);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPresence = async (ids: string[]) => {
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;
    try {
      const res = await apiClient.get('/presence', { params: { userIds: uniqueIds.join(',') } });
      setPresenceMap(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error('Failed to fetch presence', err);
    }
  };

  const handleSelectConv = async (conv: any) => {
    setActiveConv(conv);
    activeConvIdRef.current = conv.id;
    try {
      const res = await apiClient.get(`/conversations/${conv.id}/messages`);
      setMessages(res.data);

      // Live presence + new messages share one persistent WS connection;
      // just point its conversation subscription at the newly opened chat.
      if (stompClient.current?.connected) {
        subscribeToConversation(conv.id);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const subscribeToConversation = (conversationId: string) => {
    conversationSubRef.current?.unsubscribe();
    conversationSubRef.current = stompClient.current!.subscribe(`/topic/conversation/${conversationId}`, (msg) => {
      if (msg.body) {
        const newMsg = JSON.parse(msg.body);
        setMessages(prev => [...prev, newMsg]);
      }
    });
  };

  // Establishes a single WebSocket connection for the lifetime of the inbox:
  // it carries real-time messages for whichever conversation is open, and a
  // standing subscription to /topic/presence for live online/offline status.
  const connectStomp = () => {
    const token = localStorage.getItem('authToken');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const wsUrl = apiUrl.replace('/api', '/ws');

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        client.subscribe('/topic/presence', (msg) => {
          if (!msg.body) return;
          const update = JSON.parse(msg.body);
          setPresenceMap(prev => ({
            ...prev,
            [update.userId]: { online: update.status === 'ONLINE', lastSeenAt: update.lastSeenAt }
          }));
        });

        // Reconnects (e.g. after a network blip) need their conversation
        // subscription re-established too.
        if (activeConvIdRef.current) {
          subscribeToConversation(activeConvIdRef.current);
        }
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      }
    });

    client.activate();
    stompClient.current = client;
  };

  const sendMessage = () => {
    if (!inputMsg.trim() || !activeConv || !stompClient.current?.connected) return;
    
    const msgPayload = {
      conversationId: activeConv.id,
      senderId: user?.email, // Backend can resolve or we can pass actual ID
      senderRole: userRole,
      content: inputMsg,
      type: 'TEXT'
    };
    
    stompClient.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(msgPayload)
    });
    
    setInputMsg('');
  };

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center bg-[#FDFBF7] rounded-3xl border border-[#CDC0B0]">
        <div className="w-8 h-8 border-4 border-[#CDC0B0] border-t-[#2C2621] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] border border-[#CDC0B0] rounded-3xl overflow-hidden bg-white shadow-warm-md">
      {/* Sidebar: Conversations List */}
      <div className="w-1/3 border-r border-[#CDC0B0]/50 bg-[#FDFBF7] flex flex-col">
        <div className="p-5 border-b border-[#CDC0B0]/50 bg-[#FDFBF7]">
          <h2 className="font-heading font-bold text-xl text-[#2C2621]">Inbox</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-[#6B5E54] font-body">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 text-[#CDB79E]" />
              <p>No conversations found.</p>
            </div>
          ) : (
            conversations.map(conv => {
              const isOnline = presenceMap[getCounterpartId(conv, userRole) || '']?.online;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConv(conv)}
                  className={`p-4 border-b border-[#CDC0B0]/30 cursor-pointer transition-colors ${activeConv?.id === conv.id ? 'bg-[#EEDDCC] border-l-4 border-l-[#C4975A]' : 'hover:bg-[#EEDDCC]/40'}`}
                >
                  <div className="font-heading font-semibold text-[#2C2621] mb-1 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-[#8A9A5B]' : 'bg-[#CDC0B0]'}`} />
                    {userRole === 'CUSTOMER'
                      ? conv.vendorStoreName || conv.vendorName || conv.vendorId
                      : conv.customerName || conv.customerId}
                  </div>
                  <div className="text-sm font-body text-[#6B5E54] line-clamp-1">
                    {conv.lastMessage || 'No messages yet'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main: Chat Area */}
      <div className="flex-1 flex flex-col bg-white relative">
        {activeConv ? (
          <>
            <div className="p-4 border-b border-[#CDC0B0]/50 flex items-center shadow-sm z-10 bg-white">
              <Avatar className="h-10 w-10 mr-4 border border-[#CDC0B0]">
                <AvatarFallback className="bg-[#FDFBF7] text-[#C4975A] font-heading font-bold">
                  {userRole === 'CUSTOMER' 
                    ? (activeConv.vendorStoreName || activeConv.vendorName || 'V').charAt(0).toUpperCase() 
                    : (activeConv.customerName || 'C').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-heading font-bold text-[#2C2621]">
                  {userRole === 'CUSTOMER' 
                    ? activeConv.vendorStoreName || activeConv.vendorName || activeConv.vendorId 
                    : activeConv.customerName || activeConv.customerId}
                </div>
                {(() => {
                  const presence = presenceMap[getCounterpartId(activeConv, userRole) || ''];
                  const isOnline = !!presence?.online;
                  return (
                    <div className={`text-xs font-body flex items-center gap-1 mt-0.5 ${isOnline ? 'text-[#8A9A5B]' : 'text-[#9C8E82]'}`}>
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#8A9A5B]' : 'bg-[#CDC0B0]'}`}></span>
                      {isOnline ? 'Online' : formatLastSeen(presence?.lastSeenAt)}
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto bg-[#FDFBF7] space-y-6">
              {messages.map((m, i) => {
                const isMine = m.senderRole === userRole;
                return (
                  <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${isMine ? 'bg-[#C4975A] text-white rounded-tr-sm' : 'bg-white border border-[#CDC0B0] text-[#2C2621] rounded-tl-sm'}`}>
                      <div className="font-body text-[15px] leading-relaxed">{m.content}</div>
                      <div className={`text-[11px] mt-1 text-right font-medium ${isMine ? 'text-white/80' : 'text-[#9C8E82]'}`}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-white border-t border-[#CDC0B0]/50 flex gap-3">
              <Button variant="outline" size="icon" className="shrink-0 text-[#6B5E54] border-[#CDC0B0] hover:bg-[#FDFBF7] hover:text-[#C4975A] rounded-xl h-12 w-12">
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Input 
                placeholder="Type your message..." 
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                className="flex-1 h-12 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body text-[#2C2621]"
              />
              <Button onClick={sendMessage} className="bg-[#C4975A] hover:bg-[#B38549] text-white shrink-0 rounded-xl h-12 px-6 shadow-warm-sm font-body">
                <Send className="w-4 h-4 mr-2" /> Send
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#9C8E82] flex-col bg-[#FDFBF7]">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#CDC0B0]">
              <MessageSquare className="w-8 h-8 text-[#CDB79E]" />
            </div>
            <p className="font-heading font-medium text-lg text-[#2C2621]">Your Inbox</p>
            <p className="font-body text-[#6B5E54] mt-1">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
