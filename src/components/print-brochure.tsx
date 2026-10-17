"use client";
export function PrintBrochure() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-ink px-6 py-3 text-sm text-paper print:hidden"
    >
      Print / save PDF
    </button>
  );
}
