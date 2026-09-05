'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Image as ImageIcon, Loader2, MessageSquare } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/lib/auth-context';

interface InboxUIProps {
  userRole: 'CUSTOMER' | 'VENDOR';
  userId: string; // we'll use email for now, or fetch actual ID
}

export function InboxUI({ userRole, userId }: InboxUIProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  
  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
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
      let actualUserId = userId;
      
      const profileRes = await apiClient.get(`/${rolePath}/profile?email=${user?.email}`);
      actualUserId = profileRes.data.id;
      
      const res = await apiClient.get(`/conversations/${rolePath}/${actualUserId}`);
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConv = async (conv: any) => {
    setActiveConv(conv);
    try {
      const res = await apiClient.get(`/conversations/${conv.id}/messages`);
      setMessages(res.data);
      
      // Setup STOMP for this conversation
      setupStompClient(conv.id);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const setupStompClient = (conversationId: string) => {
    if (stompClient.current) {
      stompClient.current.deactivate();
    }
    
    const token = localStorage.getItem('token');
    
    const client = new Client({
      webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        client.subscribe(`/topic/conversation/${conversationId}`, (msg) => {
          if (msg.body) {
            const newMsg = JSON.parse(msg.body);
            setMessages(prev => [...prev, newMsg]);
          }
        });
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
    return <div className="flex h-[600px] items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
  }

  return (
    <div className="flex h-[600px] border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Sidebar: Conversations List */}
      <div className="w-1/3 border-r bg-slate-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="font-bold text-lg">Inbox</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No conversations found.</div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id} 
                onClick={() => handleSelectConv(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-slate-100 transition-colors ${activeConv?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
              >
                <div className="font-semibold">{userRole === 'CUSTOMER' ? 'Vendor ID: ' + conv.vendorId : 'Customer ID: ' + conv.customerId}</div>
                <div className="text-sm text-slate-500 line-clamp-1">{conv.lastMessage || 'No messages yet'}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main: Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConv ? (
          <>
            <div className="p-4 border-b flex items-center shadow-sm z-10">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {userRole === 'CUSTOMER' ? 'V' : 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold">{userRole === 'CUSTOMER' ? 'Vendor Chat' : 'Customer Chat'}</div>
                <div className="text-xs text-green-500">Online</div>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
              {messages.map((m, i) => {
                const isMine = m.senderRole === userRole;
                return (
                  <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border text-slate-800 rounded-tl-sm shadow-sm'}`}>
                      {m.content}
                      <div className={`text-[10px] mt-1 text-right ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-white border-t flex gap-2">
              <Button variant="outline" size="icon" className="shrink-0 text-slate-500">
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Input 
                placeholder="Type your message..." 
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 shrink-0">
                <Send className="w-4 h-4 mr-2" /> Send
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 flex-col">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
