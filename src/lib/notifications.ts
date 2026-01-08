const FROM_EMAIL = process.env.NOTIFICATION_FROM_EMAIL || 'Gnarhub <noreply@gnarhub.com>';

// Dynamic import to avoid build-time errors when API key isn't set
async function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  const { Resend } = await import('resend');
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendNotification(
  to: string,
  template: { subject: string; html: string }
): Promise<{ success: boolean; error?: string }> {
  // Don't send in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_DEV_EMAILS) {
    console.log('[Email] Would send:', template.subject, 'to', to);
    return { success: true };
  }

  const client = await getResendClient();
  if (!client) {
    console.error('[Email] RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('[Email] Send failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Send failed:', message);
    return { success: false, error: message };
  }
}
