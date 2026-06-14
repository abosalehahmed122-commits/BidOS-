import { prisma } from '@bid-os/db';
import { can } from '@bid-os/core';
import { requireSession } from '@/lib/session';
import { Card, CardContent } from '@/components/ui/card';
import { WorkspaceForm } from '@/components/settings/workspace-form';

export const metadata = { title: 'مساحة العمل — Bid OS' };

export default async function WorkspaceSettingsPage() {
  const { membership } = await requireSession();
  const workspace = await prisma.workspace.findUnique({ where: { id: membership.workspaceId } });
  if (!workspace) return null;

  const canEdit = can(membership.role, 'workspace:update');

  return (
    <Card className="max-w-2xl">
      <CardContent className="space-y-4 p-6">
        <h2 className="font-semibold text-slate-100">إعدادات مساحة العمل</h2>
        <WorkspaceForm
          workspace={{
            name: workspace.name,
            vatNumber: workspace.vatNumber,
            crNumber: workspace.crNumber,
            brandColor: workspace.brandColor,
          }}
          canEdit={canEdit}
        />
      </CardContent>
    </Card>
  );
}
