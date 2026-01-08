'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Conversation, Session, User, SessionRequest } from '@/types';
import { getUserConversations, getSession, getUser, getUserRequests } from '@/lib/firestore';
import { getMountainById } from '@/data/mountains';
import { Avatar, StatusBadge, Card, CardContent } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [users, setUsers] = useState<Record<string, User>>({});
  const [requests, setRequests] = useState<Record<string, SessionRequest>>({});
  const [loading, setLoading] = useState(true);

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
        const convos = await getUserConversations(user.id);
        setConversations(convos);

        // Fetch related data
        const sessionsData: Record<string, Session> = {};
        const usersData: Record<string, User> = {};
        const requestsData: Record<string, SessionRequest> = {};

        // Get all requests for the user
        const [riderRequests, filmerRequests] = await Promise.all([
          getUserRequests(user.id, false),
          getUserRequests(user.id, true),
        ]);
        [...riderRequests, ...filmerRequests].forEach((req) => {
          requestsData[req.sessionId] = req;
        });
        setRequests(requestsData);

        await Promise.all(
          convos.map(async (convo) => {
            // Fetch session
            if (!sessionsData[convo.sessionId]) {
              const session = await getSession(convo.sessionId);
              if (session) sessionsData[convo.sessionId] = session;
            }

            // Fetch other participant
            const otherUserId = convo.participants.find((p) => p !== user.id);
            if (otherUserId && !usersData[otherUserId]) {
              const otherUser = await getUser(otherUserId);
              if (otherUser) usersData[otherUserId] = otherUser;
            }
          })
        );

        setSessions(sessionsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No conversations yet.</p>
          <p className="text-gray-500 mt-2">Request a session to start chatting with filmers!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((convo) => {
            const session = sessions[convo.sessionId];
            const otherUserId = convo.participants.find((p) => p !== user.id);
            const otherUser = otherUserId ? users[otherUserId] : null;
            const request = requests[convo.sessionId];
            const mountain = session ? getMountainById(session.mountainId) : null;

            if (!session || !otherUser) return null;

            return (
              <Link key={convo.id} href={`/messages/${convo.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar src={otherUser.profilePhoto} alt={otherUser.displayName} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{otherUser.displayName}</h3>
                          <span className="text-sm text-gray-500">
                            {formatRelativeTime(convo.lastMessageAt.toDate())}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDate(session.date)} • {mountain?.name}
                        </p>
                        {request && (
                          <div className="mt-1">
                            <StatusBadge status={request.status} />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date.toISOString().split('T')[0]);
}
