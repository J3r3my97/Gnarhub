// Client-side helper to send notifications via API

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
    };

export async function notify(payload: NotificationPayload): Promise<void> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[Notify] Failed to send notification:', await response.text());
    }
  } catch (error) {
    // Don't block user flow if notification fails
    console.error('[Notify] Error sending notification:', error);
  }
}
