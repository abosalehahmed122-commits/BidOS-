import { ROLE_LABELS } from '@bid-os/core';
import { requireSession } from '@/lib/session';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileForm } from '@/components/settings/profile-form';
import { PasswordForm } from '@/components/settings/password-form';

export const metadata = { title: 'حسابي — Bid OS' };

export default async function AccountPage() {
  const { user, membership } = await requireSession();
  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-100">الملف الشخصي</h2>
            <Badge variant="gold">{ROLE_LABELS[membership.role]}</Badge>
          </div>
          <ProfileForm name={user.name} email={user.email} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold text-slate-100">تغيير كلمة المرور</h2>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
