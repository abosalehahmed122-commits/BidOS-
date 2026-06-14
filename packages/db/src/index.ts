// Re-export the generated Prisma types & enums (Role, TenderStatus, Prisma, ...).
export * from '@prisma/client';

export { prisma } from './client';
export { forWorkspace, type TenantClient } from './tenant';
