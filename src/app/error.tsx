"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-28 text-center">
      <h1 className="font-display text-4xl">A moment to reconnect.</h1>
      <p className="mt-6 text-muted">We couldn’t load this page. Please try again shortly.</p>
      <button onClick={reset} className="mt-8 bg-ink px-6 py-3 text-paper">
        Try again
      </button>
    </section>
  );
}
