export type JobHandler<T> = () => Promise<T>;

/**
 * Queue port. The default `inline` driver runs the job in-process (no Redis
 * needed). With `QUEUE_DRIVER=redis`, jobs are pushed to BullMQ and executed by
 * a separate always-on worker — the recommended topology for long AI/document
 * jobs (Vercel's serverless limits are unsuitable for them).
 */
export async function enqueue<T>(_name: string, handler: JobHandler<T>): Promise<T> {
  // Future: if process.env.QUEUE_DRIVER === 'redis', add to a BullMQ queue and
  // let the worker process it. For now the inline driver awaits the handler.
  return handler();
}
