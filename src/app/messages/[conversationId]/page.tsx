'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Conversation, Session, User, Message, SessionRequest } from '@/types';
import {
  getConversation,
  getSession,
  getUser,
  subscribeToMessages,
  sendMessage,
  getUserRequests,
  updateSessionRequest,
  updateSession,
} from '@/lib/firestore';
import { getMountainById } from '@/data/mountains';
import { Button, Card, StatusBadge } from '@/components/ui';
import { BackLink } from '@/components/layout/back-link';
import { formatDate, formatTimeRange, formatCurrency } from '@/lib/utils';
import { Send } from 'lucide-react';

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [request, setRequest] = useState<SessionRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [responding, setResponding] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);

      try {
        const convo = await getConversation(conversationId);
        if (!convo) return;
        setConversation(convo);

        const sessionData = await getSession(convo.sessionId);
        setSession(sessionData);

        const otherUserId = convo.participants.find((p) => p !== user.id);
        if (otherUserId) {
          const other = await getUser(otherUserId);
          setOtherUser(other);
        }

        // Find the request for this session
        const [riderRequests, filmerRequests] = await Promise.all([
          getUserRequests(user.id, false),
          getUserRequests(user.id, true),
        ]);
        const allRequests = [...riderRequests, ...filmerRequests];
        const sessionRequest = allRequests.find((r) => r.sessionId === convo.sessionId);
        setRequest(sessionRequest || null);
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [conversationId, user]);

  // Subscribe to messages
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setSending(true);
    try {
      await sendMessage(conversationId, user.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async () => {
    if (!request || !session) return;
    setResponding(true);
    try {
      await updateSessionRequest(request.id, { status: 'accepted' });
      await updateSession(session.id, { status: 'booked', riderId: request.riderId, requestId: request.id });
      setRequest({ ...request, status: 'accepted' });
      setSession({ ...session, status: 'booked' });
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setResponding(false);
    }
  };

  const handleDecline = async () => {
    if (!request) return;
    setResponding(true);
    try {
      await updateSessionRequest(request.id, { status: 'declined' });
      setRequest({ ...request, status: 'declined' });
    } catch (error) {
      console.error('Error declining request:', error);
    } finally {
      setResponding(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!conversation || !session || !otherUser || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackLink href="/messages" label="Back to Messages" />
        <p className="text-gray-600">Conversation not found.</p>
      </div>
    );
  }

  const mountain = getMountainById(session.mountainId);
  const isFilmer = user.id === session.filmerId;
  const showActions = isFilmer && request?.status === 'pending';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <BackLink href="/messages" label="Back to Messages" />
        <div className="text-right">
          <p className="font-medium text-gray-900">{otherUser.displayName}</p>
          <p className="text-sm text-gray-500">
            {formatDate(session.date)} • {mountain?.name}
          </p>
        </div>
      </div>

      {/* Request Status / Actions */}
      {request && (
        <Card className="mb-4">
          <div className="p-4 flex items-center justify-between">
            <div>
              <StatusBadge status={request.status} />
              <p className="font-medium mt-1">{formatCurrency(request.amount)}</p>
              <p className="text-sm text-gray-500">
                {formatDate(session.date)} • {formatTimeRange(session.startTime, session.endTime)}
              </p>
            </div>
            {showActions && (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleDecline} loading={responding}>
                  Decline
                </Button>
                <Button onClick={handleAccept} loading={responding}>
                  Accept
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</p>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isMe ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {formatMessageTime(msg.createdAt.toDate())}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" className="rounded-full px-4" disabled={!newMessage.trim()} loading={sending}>
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
