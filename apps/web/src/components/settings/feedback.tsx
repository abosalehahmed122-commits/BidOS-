export function Feedback({ state }: { state: { error?: string; success?: string } }) {
  if (state.error) {
    return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.error}</p>;
  }
  if (state.success) {
    return (
      <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
        {state.success}
      </p>
    );
  }
  return null;
}
