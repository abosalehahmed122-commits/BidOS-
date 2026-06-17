export interface SmsMessage {
  to: string; // E.164, e.g. +9665XXXXXXXX
  body: string;
}

/**
 * SMS port (provider-agnostic). `console` (default) logs to stdout — fine for
 * dev and a soft launch. Set SMS_DRIVER=unifonic + UNIFONIC_APP_SID for real
 * delivery (any provider can be dropped in behind this function).
 */
export async function sendSms(msg: SmsMessage): Promise<void> {
  const driver = process.env.SMS_DRIVER ?? 'console';

  if (driver === 'unifonic' && process.env.UNIFONIC_APP_SID) {
    await fetch('https://el.cloud.unifonic.com/rest/SMS/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        AppSid: process.env.UNIFONIC_APP_SID,
        Recipient: msg.to.replace(/^\+/, ''),
        Body: msg.body,
        SenderID: process.env.SMS_SENDER ?? 'BidOS',
      }),
    });
    return;
  }

  // console driver — the code is visible in server logs.
  console.log(`[SMS → ${msg.to}] ${msg.body}`);
}
