import { createHash, randomInt } from 'node:crypto';
import { prisma } from '@bid-os/db';
import { sendSms } from './sms';

const TTL_MS = 10 * 60_000; // 10 minutes
const MAX_ATTEMPTS = 5;

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

/** Generate a 6-digit code, store its hash, and send it by SMS. */
export async function issuePhoneOtp(phone: string): Promise<void> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await prisma.phoneOtp.create({
    data: { phone, codeHash: hashCode(code), expiresAt: new Date(Date.now() + TTL_MS) },
  });
  await sendSms({ to: phone, body: `رمز التحقق في Bid OS: ${code}` });
}

/** Verify a code against the latest unconsumed OTP for the phone. */
export async function verifyPhoneOtp(phone: string, code: string): Promise<boolean> {
  const otp = await prisma.phoneOtp.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp || otp.attempts >= MAX_ATTEMPTS) return false;

  if (otp.codeHash !== hashCode(code)) {
    await prisma.phoneOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return false;
  }
  await prisma.phoneOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  return true;
}
