import { BrandDetail } from "@/components/brand-detail";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Terms of the demonstration",
  description: "The scope and limitations of the fictional Havenfield portfolio website.",
  alternates: { canonical: "/terms" },
};
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <BrandDetail />
      <p className="text-xs uppercase tracking-[0.2em] text-brand">Project information</p>
      <h1 className="mt-4 font-display text-4xl sm:text-5xl">Terms of the demonstration</h1>
      <div className="mt-10 space-y-8 leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-2xl text-ink">A fictional collection</h2>
          <p className="mt-3">
            Havenfield is an original portfolio concept. Its brand, properties, locations,
            specifications, and guide prices are invented. Concept imagery is illustrative. Nothing
            on this website is an offer to sell, rent, reserve, or finance a property.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ink">Editorial information</h2>
          <p className="mt-3">
            Journal articles discuss design and the home experience for demonstration purposes. They
            are not legal, financial, surveying, or investment advice. Published content may change
            as the author develops the project.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ink">Trying the forms</h2>
          <p className="mt-3">
            Inquiry submissions create demonstration records when a database is configured. They do
            not create an appointment, reservation, customer relationship, or guarantee of a
            response. Use fictional data and submit only content you have permission to share.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ink">Responsible access</h2>
          <p className="mt-3">
            The publishing dashboard is restricted to authorized administrators. Do not attempt to
            access other people’s records, bypass authentication, or submit harmful content. Public
            availability of this portfolio does not grant access to private publishing tools.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ink">Before a real launch</h2>
          <p className="mt-3">
            A business adopting this software must replace these demonstration statements with
            policies that reflect its actual services, jurisdiction, privacy practices, and support
            channels. This page does not claim to be a reviewed legal agreement for a real estate
            business.
          </p>
        </section>
      </div>
    </div>
  );
}
