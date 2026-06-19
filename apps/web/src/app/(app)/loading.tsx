// Shown instantly during in-app navigation — no blank wait between pages.
export default function AppLoading() {
  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="h-7 w-48 animate-pulse rounded-lg bg-white/5" />
      <div className="mt-3 h-4 w-72 animate-pulse rounded bg-white/5" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]"
          />
        ))}
      </div>
    </div>
  );
}
