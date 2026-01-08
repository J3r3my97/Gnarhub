// Email templates for Gnarhub notifications

export const emailTemplates = {
  newRequest: (filmerName: string, riderName: string, sessionDate: string, mountain: string) => ({
    subject: `New session request from ${riderName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">New Session Request</h2>
        <p>Hey ${filmerName},</p>
        <p><strong>${riderName}</strong> wants to book a session with you!</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Date:</strong> ${sessionDate}</p>
          <p style="margin: 8px 0 0;"><strong>Mountain:</strong> ${mountain}</p>
        </div>
        <p>Log in to Gnarhub to review and respond to this request.</p>
        <p style="color: #666; font-size: 14px;">- The Gnarhub Team</p>
      </div>
    `,
  }),

  requestAccepted: (riderName: string, filmerName: string, sessionDate: string, mountain: string) => ({
    subject: `${filmerName} accepted your request!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Session Confirmed!</h2>
        <p>Hey ${riderName},</p>
        <p>Great news! <strong>${filmerName}</strong> accepted your session request.</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Date:</strong> ${sessionDate}</p>
          <p style="margin: 8px 0 0;"><strong>Mountain:</strong> ${mountain}</p>
        </div>
        <p>You can message ${filmerName} through Gnarhub to coordinate meeting details.</p>
        <p style="color: #666; font-size: 14px;">- The Gnarhub Team</p>
      </div>
    `,
  }),

  requestDeclined: (riderName: string, filmerName: string, sessionDate: string) => ({
    subject: `Session request update`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Session Request Declined</h2>
        <p>Hey ${riderName},</p>
        <p>Unfortunately, <strong>${filmerName}</strong> declined your session request for ${sessionDate}.</p>
        <p>Don't worry - there are plenty of other filmers available! Check out other open sessions on Gnarhub.</p>
        <p style="color: #666; font-size: 14px;">- The Gnarhub Team</p>
      </div>
    `,
  }),

  counterOffer: (riderName: string, filmerName: string, newTime: string, newRate: number) => ({
    subject: `${filmerName} suggested a different time`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Counter Offer Received</h2>
        <p>Hey ${riderName},</p>
        <p><strong>${filmerName}</strong> is interested but suggested a different time or rate.</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Proposed Time:</strong> ${newTime}</p>
          <p style="margin: 8px 0 0;"><strong>Proposed Rate:</strong> $${newRate}</p>
        </div>
        <p>Log in to Gnarhub to accept or decline this counter offer.</p>
        <p style="color: #666; font-size: 14px;">- The Gnarhub Team</p>
      </div>
    `,
  }),

  counterOfferAccepted: (filmerName: string, riderName: string, sessionDate: string, mountain: string) => ({
    subject: `${riderName} accepted your counter-offer!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Counter Offer Accepted!</h2>
        <p>Hey ${filmerName},</p>
        <p><strong>${riderName}</strong> accepted your counter offer. The session is now confirmed!</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Date:</strong> ${sessionDate}</p>
          <p style="margin: 8px 0 0;"><strong>Mountain:</strong> ${mountain}</p>
        </div>
        <p>You can message ${riderName} through Gnarhub to coordinate meeting details.</p>
        <p style="color: #666; font-size: 14px;">- The Gnarhub Team</p>
      </div>
    `,
  }),

  sessionReminder: (userName: string, sessionDate: string, mountain: string, otherPartyName: string) => ({
    subject: `Reminder: Session tomorrow at ${mountain}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Session Reminder</h2>
        <p>Hey ${userName},</p>
        <p>Just a reminder that you have a session coming up tomorrow!</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Date:</strong> ${sessionDate}</p>
          <p style="margin: 8px 0 0;"><strong>Mountain:</strong> ${mountain}</p>
          <p style="margin: 8px 0 0;"><strong>With:</strong> ${otherPartyName}</p>
        </div>
        <p>Make sure to coordinate meeting details through your Gnarhub messages if you haven't already!</p>
        <p style="color: #666; font-size: 14px;">- The Gnarhub Team</p>
      </div>
    `,
  }),
};

export type NotificationType = keyof typeof emailTemplates;
