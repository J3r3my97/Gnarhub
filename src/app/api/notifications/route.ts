import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';
import { emailTemplates } from '@/lib/email-templates';

type NotificationPayload =
  | {
      type: 'new_request';
      data: {
        filmerEmail: string;
        filmerName: string;
        riderName: string;
        sessionDate: string;
        mountain: string;
      };
    }
  | {
      type: 'request_accepted';
      data: {
        riderEmail: string;
        riderName: string;
        filmerName: string;
        sessionDate: string;
        mountain: string;
      };
    }
  | {
      type: 'request_declined';
      data: {
        riderEmail: string;
        riderName: string;
        filmerName: string;
        sessionDate: string;
      };
    }
  | {
      type: 'counter_offer';
      data: {
        riderEmail: string;
        riderName: string;
        filmerName: string;
        newTime: string;
        newRate: number;
      };
    }
  | {
      type: 'counter_offer_accepted';
      data: {
        filmerEmail: string;
        filmerName: string;
        riderName: string;
        sessionDate: string;
        mountain: string;
      };
    }
  | {
      type: 'session_reminder';
      data: {
        userEmail: string;
        userName: string;
        sessionDate: string;
        mountain: string;
        otherPartyName: string;
      };
    };

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as NotificationPayload;

    let to: string;
    let template: { subject: string; html: string };

    switch (payload.type) {
      case 'new_request':
        to = payload.data.filmerEmail;
        template = emailTemplates.newRequest(
          payload.data.filmerName,
          payload.data.riderName,
          payload.data.sessionDate,
          payload.data.mountain
        );
        break;

      case 'request_accepted':
        to = payload.data.riderEmail;
        template = emailTemplates.requestAccepted(
          payload.data.riderName,
          payload.data.filmerName,
          payload.data.sessionDate,
          payload.data.mountain
        );
        break;

      case 'request_declined':
        to = payload.data.riderEmail;
        template = emailTemplates.requestDeclined(
          payload.data.riderName,
          payload.data.filmerName,
          payload.data.sessionDate
        );
        break;

      case 'counter_offer':
        to = payload.data.riderEmail;
        template = emailTemplates.counterOffer(
          payload.data.riderName,
          payload.data.filmerName,
          payload.data.newTime,
          payload.data.newRate
        );
        break;

      case 'counter_offer_accepted':
        to = payload.data.filmerEmail;
        template = emailTemplates.counterOfferAccepted(
          payload.data.filmerName,
          payload.data.riderName,
          payload.data.sessionDate,
          payload.data.mountain
        );
        break;

      case 'session_reminder':
        to = payload.data.userEmail;
        template = emailTemplates.sessionReminder(
          payload.data.userName,
          payload.data.sessionDate,
          payload.data.mountain,
          payload.data.otherPartyName
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    const result = await sendNotification(to, template);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
