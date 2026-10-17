import type { Metadata } from "next";
import { StudioDemo } from "@/components/studio-demo";
export const metadata: Metadata = {
  title: "Explore the editorial studio",
  description: "A read-only tour of Havenfield's property, journal, media and inquiry workflows.",
  alternates: { canonical: "/studio-demo" },
  robots: { index: false, follow: true },
};
export default function Page() {
  return <StudioDemo />;
}
