'use client';

import { Session, User, Mountain } from '@/types';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface SessionTableProps {
  sessions: (Session & { filmer?: User; rider?: User; mountain?: Mountain })[];
}

export function SessionTable({ sessions }: SessionTableProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'open':
        return 'success';
      case 'booked':
        return 'warning';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mountain
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Filmer
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rider
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rate
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sessions.map((session) => (
            <tr
              key={session.id}
              className={cn('hover:bg-gray-50', session.status === 'cancelled' && 'opacity-60')}
            >
              <td className="py-3 px-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(session.date)}</p>
                  <p className="text-xs text-gray-500">
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </p>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-900">
                  {session.mountain?.name || session.mountainId}
                </span>
              </td>
              <td className="py-3 px-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {session.filmer?.displayName || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">{session.filmer?.email}</p>
                </div>
              </td>
              <td className="py-3 px-4">
                {session.rider ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.rider.displayName}</p>
                    <p className="text-xs text-gray-500">{session.rider.email}</p>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </td>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-900">${session.rate}</span>
              </td>
              <td className="py-3 px-4">
                <Badge variant={getStatusVariant(session.status)}>{session.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
