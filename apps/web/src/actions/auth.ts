'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma, type Prisma } from '@bid-os/db';
import {
  createSession,
  destroySession,
  hashPassword,
  SESSION_COOKIE_NAME,
  verifyPassword,
} from '@bid-os/auth';
import { loginSchema, registerSchema } from '@bid-os/core';

export interface AuthFormState {
  error?: string;
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return base.length >= 2 ? base : 'workspace';
}

async function uniqueSlug(tx: Prisma.TransactionClient, base: string): Promise<string> {
  let slug = base;
  let n = 1;
  while (await tx.workspace.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function sessionMeta() {
  const h = headers();
  return { userAgent: h.get('user-agent'), ip: h.get('x-forwarded-for') };
}

function setSessionCookie(token: string, expiresAt: Date) {
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  });
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    workspaceName: formData.get('workspaceName'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' };
  }
  const { name, email, password, workspaceName } = parsed.data;

  if (await prisma.user.findUnique({ where: { email } })) {
    return { error: 'البريد الإلكتروني مستخدم مسبقاً' };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name, email, passwordHash, emailVerified: new Date() },
    });
    const workspace = await tx.workspace.create({
      data: { name: workspaceName, slug: await uniqueSlug(tx, slugify(workspaceName)) },
    });
    await tx.membership.create({
      data: { userId: created.id, workspaceId: workspace.id, role: 'OWNER' },
    });
    const trial = await tx.plan.findUnique({ where: { code: 'trial' } });
    if (trial) {
      await tx.subscription.create({
        data: {
          workspaceId: workspace.id,
          planId: trial.id,
          status: 'TRIALING',
          currentPeriodEnd: new Date(Date.now() + 14 * 86_400_000),
        },
      });
    }
    return created;
  });

  const { token, expiresAt } = await createSession(user.id, sessionMeta());
  setSessionCookie(token, expiresAt);
  redirect('/dashboard');
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: 'بيانات الدخول غير صحيحة' };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.isActive || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
  }

  const { token, expiresAt } = await createSession(user.id, sessionMeta());
  setSessionCookie(token, expiresAt);
  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  await destroySession(token);
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}
