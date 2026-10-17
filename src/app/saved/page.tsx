import type { Metadata } from "next";
import { SavedHomes } from "@/components/home-shortlist";
export const metadata: Metadata = {
  title: "Saved homes",
  description: "Return to the fictional homes you have saved in this browser.",
  alternates: { canonical: "/saved" },
  robots: { index: false, follow: true },
};
export default function SavedPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
      <p className="text-xs tracking-[0.2em] uppercase text-brand">Your collection</p>
      <h1 className="mt-4 mb-10 font-display text-5xl sm:text-7xl">Room to come back to.</h1>
      <SavedHomes />
    </div>
  );
}
