'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Session, SessionRequest, User, TerrainTag } from '@/types';
import {
  getFilmerSessions,
  getUserRequests,
  getSession,
  getUser,
  updateSession,
  cancelSession,
  deleteSession,
  sessionHasRequests,
  getUserConversations,
} from '@/lib/firestore';
import { getMountainById } from '@/data/mountains';
import {
  Button,
  Card,
  CardContent,
  StatusBadge,
  TerrainBadge,
  Modal,
  ConfirmDialog,
  Input,
  Textarea,
  Checkbox,
} from '@/components/ui';
import { formatDate, formatTimeRange, formatCurrency } from '@/lib/utils';
import { Plus, MessageSquare, MoreVertical, Pencil, Trash2, X, Copy } from 'lucide-react';

type TabType = 'rider' | 'filmer';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('rider');
  const [loading, setLoading] = useState(true);

  // Rider data
  const [riderRequests, setRiderRequests] = useState<SessionRequest[]>([]);
  const [riderSessions, setRiderSessions] = useState<Record<string, Session>>({});
  const [filmers, setFilmers] = useState<Record<string, User>>({});

  // Filmer data
  const [filmerSessions, setFilmerSessions] = useState<Session[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<SessionRequest[]>([]);

  // Conversations mapped by sessionId
  const [conversationsBySession, setConversationsBySession] = useState<Record<string, string>>({});

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch rider data
      const requests = await getUserRequests(user.id, false);
      setRiderRequests(requests);

      // Fetch sessions and filmers for those requests
      const sessionsData: Record<string, Session> = {};
      const filmersData: Record<string, User> = {};

      await Promise.all(
        requests.map(async (req) => {
          if (!sessionsData[req.sessionId]) {
            const session = await getSession(req.sessionId);
            if (session) sessionsData[req.sessionId] = session;
          }
          if (!filmersData[req.filmerId]) {
            const filmer = await getUser(req.filmerId);
            if (filmer) filmersData[req.filmerId] = filmer;
          }
        })
      );

      setRiderSessions(sessionsData);
      setFilmers(filmersData);

      // Fetch conversations to map sessionId -> conversationId
      const conversations = await getUserConversations(user.id);
      const convoMap: Record<string, string> = {};
      conversations.forEach((convo) => {
        convoMap[convo.sessionId] = convo.id;
      });
      setConversationsBySession(convoMap);

      // Fetch filmer data (if user is a filmer)
      if (user.isFilmer) {
        const sessions = await getFilmerSessions(user.id);
        setFilmerSessions(sessions);

        const filmerRequests = await getUserRequests(user.id, true);
        setIncomingRequests(filmerRequests.filter((r) => r.status === 'pending' || r.status === 'counter_offered'));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchData();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const pendingRequests = riderRequests.filter((r) => r.status === 'pending');
  const acceptedRequests = riderRequests.filter((r) => r.status === 'accepted');
  const pastRequests = riderRequests.filter((r) => r.status === 'completed');

  const openSessions = filmerSessions.filter((s) => s.status === 'open');
  const bookedSessions = filmerSessions.filter((s) => s.status === 'booked');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {user.isFilmer && (
          <Link href="/dashboard/post">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post Session
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('rider')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'rider' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          As Rider
        </button>
        <button
          onClick={() => setActiveTab('filmer')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'filmer' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          As Filmer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : activeTab === 'rider' ? (
        <RiderDashboard
          pending={pendingRequests}
          accepted={acceptedRequests}
          past={pastRequests}
          sessions={riderSessions}
          filmers={filmers}
          conversationsBySession={conversationsBySession}
        />
      ) : (
        <FilmerDashboard
          user={user}
          openSessions={openSessions}
          bookedSessions={bookedSessions}
          incomingRequests={incomingRequests}
          conversationsBySession={conversationsBySession}
          onSessionUpdated={fetchData}
        />
      )}
    </div>
  );
}

function RiderDashboard({
  pending,
  accepted,
  past,
  sessions,
  filmers,
  conversationsBySession,
}: {
  pending: SessionRequest[];
  accepted: SessionRequest[];
  past: SessionRequest[];
  sessions: Record<string, Session>;
  filmers: Record<string, User>;
  conversationsBySession: Record<string, string>;
}) {
  if (pending.length === 0 && accepted.length === 0 && past.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No sessions yet.</p>
        <Link href="/browse">
          <Button>Find a Session</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {accepted.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
          <div className="space-y-4">
            {accepted.map((request) => {
              const session = sessions[request.sessionId];
              const filmer = filmers[request.filmerId];
              if (!session || !filmer) return null;
              const mountain = getMountainById(session.mountainId);
              const conversationId = conversationsBySession[request.sessionId];
              return (
                <RequestCard
                  key={request.id}
                  request={request}
                  session={session}
                  otherUser={filmer}
                  mountain={mountain}
                  conversationId={conversationId}
                />
              );
            })}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Requests</h2>
          <div className="space-y-4">
            {pending.map((request) => {
              const session = sessions[request.sessionId];
              const filmer = filmers[request.filmerId];
              if (!session || !filmer) return null;
              const mountain = getMountainById(session.mountainId);
              const conversationId = conversationsBySession[request.sessionId];
              return (
                <RequestCard
                  key={request.id}
                  request={request}
                  session={session}
                  otherUser={filmer}
                  mountain={mountain}
                  conversationId={conversationId}
                />
              );
            })}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Sessions</h2>
          <div className="space-y-4">
            {past.map((request) => {
              const session = sessions[request.sessionId];
              const filmer = filmers[request.filmerId];
              if (!session || !filmer) return null;
              const mountain = getMountainById(session.mountainId);
              const conversationId = conversationsBySession[request.sessionId];
              return (
                <RequestCard
                  key={request.id}
                  request={request}
                  session={session}
                  otherUser={filmer}
                  mountain={mountain}
                  conversationId={conversationId}
                  showReviewButton
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function FilmerDashboard({
  user,
  openSessions,
  bookedSessions,
  incomingRequests,
  conversationsBySession,
  onSessionUpdated,
}: {
  user: User;
  openSessions: Session[];
  bookedSessions: Session[];
  incomingRequests: SessionRequest[];
  conversationsBySession: Record<string, string>;
  onSessionUpdated: () => void;
}) {
  if (!user.isFilmer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Set up your filmer profile to start posting sessions.</p>
        <Link href="/dashboard/filmer-setup">
          <Button>Become a Filmer</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {incomingRequests.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Incoming Requests ({incomingRequests.length})
          </h2>
          <div className="space-y-4">
            {incomingRequests.map((request) => {
              const conversationId = conversationsBySession[request.sessionId];
              return (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <StatusBadge status={request.status} />
                        <p className="text-gray-600 mt-2">{request.message}</p>
                        <p className="font-medium mt-2">{formatCurrency(request.amount)}</p>
                      </div>
                      <Link href={conversationId ? `/messages/${conversationId}` : '/messages'}>
                        <Button size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {bookedSessions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booked Sessions</h2>
          <div className="space-y-4">
            {bookedSessions.map((session) => {
              const mountain = getMountainById(session.mountainId);
              return (
                <FilmerSessionCard
                  key={session.id}
                  session={session}
                  mountain={mountain}
                  onUpdated={onSessionUpdated}
                  isBooked
                />
              );
            })}
          </div>
        </section>
      )}

      {openSessions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Open Sessions</h2>
          <div className="space-y-4">
            {openSessions.map((session) => {
              const mountain = getMountainById(session.mountainId);
              return (
                <FilmerSessionCard
                  key={session.id}
                  session={session}
                  mountain={mountain}
                  onUpdated={onSessionUpdated}
                />
              );
            })}
          </div>
        </section>
      )}

      {openSessions.length === 0 && bookedSessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No sessions posted yet.</p>
          <Link href="/dashboard/post">
            <Button>Post Your First Session</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
  session,
  otherUser,
  mountain,
  conversationId,
  showReviewButton,
}: {
  request: SessionRequest;
  session: Session;
  otherUser: User;
  mountain?: { name: string } | null;
  conversationId?: string;
  showReviewButton?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">{otherUser.displayName}</span>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-gray-600">
              {formatDate(session.date)} • {formatTimeRange(session.startTime, session.endTime)}
            </p>
            {mountain && <p className="text-sm text-gray-500">{mountain.name}</p>}
            <p className="font-medium mt-2">{formatCurrency(request.amount)}</p>
          </div>
          <div className="flex gap-2">
            <Link href={conversationId ? `/messages/${conversationId}` : '/messages'}>
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </Link>
            {showReviewButton && request.status === 'completed' && (
              <Link href={`/review/${session.id}`}>
                <Button size="sm">Leave Review</Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilmerSessionCard({
  session,
  mountain,
  onUpdated,
  isBooked = false,
}: {
  session: Session;
  mountain?: { name: string } | null;
  onUpdated: () => void;
  isBooked?: boolean;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasRequests, setHasRequests] = useState(false);

  // Edit form state
  const [editStartTime, setEditStartTime] = useState(session.startTime);
  const [editEndTime, setEditEndTime] = useState(session.endTime);
  const [editRate, setEditRate] = useState(session.rate.toString());
  const [editNotes, setEditNotes] = useState(session.notes || '');
  const [editTerrainTags, setEditTerrainTags] = useState<TerrainTag[]>(session.terrainTags);

  useEffect(() => {
    // Check if session has requests when opening menu
    if (menuOpen) {
      sessionHasRequests(session.id).then(setHasRequests);
    }
  }, [menuOpen, session.id]);

  const handleEdit = async () => {
    setActionLoading(true);
    try {
      await updateSession(session.id, {
        startTime: editStartTime,
        endTime: editEndTime,
        rate: parseFloat(editRate),
        notes: editNotes || null,
        terrainTags: editTerrainTags,
      });
      setEditModalOpen(false);
      onUpdated();
    } catch (error) {
      console.error('Error updating session:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await cancelSession(session.id);
      setCancelDialogOpen(false);
      onUpdated();
    } catch (error) {
      console.error('Error cancelling session:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteSession(session.id);
      setDeleteDialogOpen(false);
      onUpdated();
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = () => {
    // Navigate to post page with session data as query params
    const params = new URLSearchParams({
      mountainId: session.mountainId,
      startTime: session.startTime,
      endTime: session.endTime,
      rate: session.rate.toString(),
      terrainTags: session.terrainTags.join(','),
      notes: session.notes || '',
    });
    router.push(`/dashboard/post?${params.toString()}`);
    setMenuOpen(false);
  };

  const handleTerrainToggle = (tag: TerrainTag) => {
    setEditTerrainTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={session.status} />
              </div>
              <p className="font-medium text-gray-900">
                {formatDate(session.date)} • {formatTimeRange(session.startTime, session.endTime)}
              </p>
              {mountain && <p className="text-sm text-gray-500">{mountain.name}</p>}
              <div className="flex gap-1 mt-2">
                {session.terrainTags.map((tag) => (
                  <TerrainBadge key={tag} terrain={tag} />
                ))}
              </div>
              <p className="font-medium mt-2">{formatCurrency(session.rate)}</p>
            </div>

            {/* Actions menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => {
                        setEditModalOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Session
                    </button>
                    <button
                      onClick={handleDuplicate}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </button>
                    <hr className="my-1" />
                    {isBooked || hasRequests ? (
                      <button
                        onClick={() => {
                          setCancelDialogOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel Session
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setDeleteDialogOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Session
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Session"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <strong>{formatDate(session.date)}</strong> at{' '}
              <strong>{mountain?.name || session.mountainId}</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">Date and mountain cannot be changed</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Input
            label="Rate ($)"
            type="number"
            value={editRate}
            onChange={(e) => setEditRate(e.target.value)}
            min={0}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terrain</label>
            <div className="flex flex-wrap gap-3">
              <Checkbox
                label="Park"
                checked={editTerrainTags.includes('park')}
                onChange={() => handleTerrainToggle('park')}
              />
              <Checkbox
                label="All-Mountain"
                checked={editTerrainTags.includes('all-mountain')}
                onChange={() => handleTerrainToggle('all-mountain')}
              />
              <Checkbox
                label="Groomers"
                checked={editTerrainTags.includes('groomers')}
                onChange={() => handleTerrainToggle('groomers')}
              />
            </div>
          </div>

          <Textarea
            label="Notes (optional)"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            placeholder="Any additional info..."
            rows={3}
          />

          {hasRequests && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                This session has pending requests. Changes will be visible to riders.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Session"
        message={
          isBooked
            ? 'This session is booked. Cancelling will notify the rider. Are you sure?'
            : 'This session has pending requests. Cancelling will decline all requests. Are you sure?'
        }
        confirmLabel="Cancel Session"
        confirmVariant="danger"
        loading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Session"
        message="This will permanently delete this session. This action cannot be undone."
        confirmLabel="Delete Session"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </>
  );
}
