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
  createCounterOffer,
  acceptCounterOffer,
  declineCounterOffer,
} from '@/lib/firestore';
import { getMountainById } from '@/data/mountains';
import { notify } from '@/lib/notify';
import { Button, Card, StatusBadge, Modal, Input, Textarea } from '@/components/ui';
import { BackLink } from '@/components/layout/back-link';
import { formatDate, formatTimeRange, formatCurrency } from '@/lib/utils';
import { Send, ArrowRight } from 'lucide-react';

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

  // Counter offer state
  const [counterOfferModalOpen, setCounterOfferModalOpen] = useState(false);
  const [counterStartTime, setCounterStartTime] = useState('');
  const [counterEndTime, setCounterEndTime] = useState('');
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
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

      // Initialize counter offer form with session defaults
      if (sessionData) {
        setCounterStartTime(sessionData.startTime);
        setCounterEndTime(sessionData.endTime);
        setCounterAmount(sessionData.rate.toString());
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    if (!request || !session || !otherUser) return;
    setResponding(true);
    try {
      await updateSessionRequest(request.id, { status: 'accepted' });
      await updateSession(session.id, { status: 'booked', riderId: request.riderId, requestId: request.id });

      // Notify rider that request was accepted
      const mountain = getMountainById(session.mountainId);
      notify({
        type: 'request_accepted',
        data: {
          riderEmail: otherUser.email,
          riderName: otherUser.displayName,
          filmerName: user!.displayName,
          sessionDate: session.date,
          mountain: mountain?.name || 'Unknown',
        },
      });

      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setResponding(false);
    }
  };

  const handleDecline = async () => {
    if (!request || !session || !otherUser) return;
    setResponding(true);
    try {
      await updateSessionRequest(request.id, { status: 'declined' });

      // Notify rider that request was declined
      notify({
        type: 'request_declined',
        data: {
          riderEmail: otherUser.email,
          riderName: otherUser.displayName,
          filmerName: user!.displayName,
          sessionDate: session.date,
        },
      });

      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error declining request:', error);
    } finally {
      setResponding(false);
    }
  };

  const handleSendCounterOffer = async () => {
    if (!request || !otherUser) return;
    setResponding(true);
    try {
      await createCounterOffer(request.id, {
        startTime: counterStartTime,
        endTime: counterEndTime,
        amount: parseFloat(counterAmount),
        message: counterMessage,
      });
      // Send a message about the counter offer
      await sendMessage(
        conversationId,
        user!.id,
        `I'd like to suggest a different time: ${counterStartTime} - ${counterEndTime} for ${formatCurrency(parseFloat(counterAmount))}. ${counterMessage}`
      );

      // Notify rider about counter offer
      notify({
        type: 'counter_offer',
        data: {
          riderEmail: otherUser.email,
          riderName: otherUser.displayName,
          filmerName: user!.displayName,
          newTime: `${counterStartTime} - ${counterEndTime}`,
          newRate: parseFloat(counterAmount),
        },
      });

      setCounterOfferModalOpen(false);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error sending counter offer:', error);
    } finally {
      setResponding(false);
    }
  };

  const handleAcceptCounterOffer = async () => {
    if (!request || !session || !otherUser) return;
    setResponding(true);
    try {
      await acceptCounterOffer(request.id);

      // Notify filmer that counter offer was accepted
      const mountain = getMountainById(session.mountainId);
      notify({
        type: 'counter_offer_accepted',
        data: {
          filmerEmail: otherUser.email,
          filmerName: otherUser.displayName,
          riderName: user!.displayName,
          sessionDate: session.date,
          mountain: mountain?.name || 'Unknown',
        },
      });

      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error accepting counter offer:', error);
    } finally {
      setResponding(false);
    }
  };

  const handleDeclineCounterOffer = async () => {
    if (!request) return;
    setResponding(true);
    try {
      await declineCounterOffer(request.id);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error declining counter offer:', error);
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
  const isRider = user.id === request?.riderId;
  const showFilmerActions = isFilmer && request?.status === 'pending';
  const showRiderCounterOfferActions = isRider && request?.status === 'counter_offered' && request?.counterOffer?.status === 'pending';

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
          <div className="p-4">
            {/* Original Request Info */}
            <div className="flex items-center justify-between">
              <div>
                <StatusBadge status={request.status} />
                <p className="font-medium mt-1">{formatCurrency(request.amount)}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(session.date)} • {formatTimeRange(session.startTime, session.endTime)}
                </p>
              </div>

              {/* Filmer actions - pending request */}
              {showFilmerActions && (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleDecline} loading={responding}>
                    Decline
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setCounterOfferModalOpen(true)}
                    disabled={responding}
                  >
                    Suggest Change
                  </Button>
                  <Button onClick={handleAccept} loading={responding}>
                    Accept
                  </Button>
                </div>
              )}
            </div>

            {/* Counter Offer Display */}
            {request.counterOffer && request.status === 'counter_offered' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-orange-600 mb-2">Counter Offer Suggested</p>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Original:</span>
                      <span className="ml-2">{formatTimeRange(session.startTime, session.endTime)}</span>
                      <span className="ml-2">{formatCurrency(request.amount)}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="font-medium">
                      <span className="text-gray-500">New:</span>
                      <span className="ml-2">{formatTimeRange(request.counterOffer.startTime, request.counterOffer.endTime)}</span>
                      <span className="ml-2">{formatCurrency(request.counterOffer.amount)}</span>
                    </div>
                  </div>
                  {request.counterOffer.message && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{request.counterOffer.message}"</p>
                  )}
                </div>

                {/* Rider actions - counter offer pending */}
                {showRiderCounterOfferActions && (
                  <div className="flex gap-2 mt-3">
                    <Button variant="ghost" onClick={handleDeclineCounterOffer} loading={responding}>
                      Decline
                    </Button>
                    <Button onClick={handleAcceptCounterOffer} loading={responding}>
                      Accept New Time
                    </Button>
                  </div>
                )}

                {/* Status after rider responds */}
                {request.counterOffer.status === 'accepted' && (
                  <p className="text-sm text-green-600 mt-2">Counter offer accepted!</p>
                )}
                {request.counterOffer.status === 'declined' && (
                  <p className="text-sm text-red-600 mt-2">Counter offer declined.</p>
                )}
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

      {/* Counter Offer Modal */}
      <Modal
        isOpen={counterOfferModalOpen}
        onClose={() => setCounterOfferModalOpen(false)}
        title="Suggest Different Details"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCounterOfferModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendCounterOffer} loading={responding}>
              Send Suggestion
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <strong>Original Request:</strong>
            </p>
            <p className="text-sm text-gray-600">
              {formatDate(session.date)} • {formatTimeRange(session.startTime, session.endTime)} • {formatCurrency(request?.amount || 0)}
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Suggest alternative details below. The rider can accept or decline.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={counterStartTime}
                onChange={(e) => setCounterStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={counterEndTime}
                onChange={(e) => setCounterEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Input
            label="Rate ($)"
            type="number"
            value={counterAmount}
            onChange={(e) => setCounterAmount(e.target.value)}
            min={0}
          />

          <Textarea
            label="Message (optional)"
            value={counterMessage}
            onChange={(e) => setCounterMessage(e.target.value)}
            placeholder="Explain why you're suggesting this change..."
            rows={2}
          />
        </div>
      </Modal>
    </div>
  );
}

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
