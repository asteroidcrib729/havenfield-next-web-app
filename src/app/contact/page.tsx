import { getPublicProperties } from "@/server/properties";
import { propertySummary } from "@/lib/property-types";
import Image from "next/image";
import type { Metadata } from "next";
import { InquiryForm } from "@/components/inquiry-form";
import { ArrowUpRight, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get in touch",
  description: "Explore the Havenfield demonstration inquiry workflow with fictional details.",
  alternates: { canonical: "/contact" },
};
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  const { property } = await searchParams;
  const properties = (await getPublicProperties()).map(propertySummary);
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-24">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-brand">Get in touch</p>
        <h1 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">
          Every home starts with a conversation.
        </h1>
        <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted">
          Explore how an inquiry could feel: personal, clear, and considered. Tell this fictional
          studio what caught your eye.
        </p>
        <div className="relative mt-8 aspect-[3/2] overflow-hidden rounded-2xl">
          <Image
            src="/media/plan03/contact-studio.webp"
            alt="Open studio doorway and garden bench in an invented courtyard"
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="mt-10 space-y-8 border-t border-line pt-8">
          <div className="flex gap-4">
            <MessageCircle className="mt-1 shrink-0 text-brand" size={22} />
            <div>
              <h2 className="font-medium">A working demonstration</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                A configured database stores accepted inquiries and returns a receipt. There is no
                real sales office, phone line, or automated email service.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <ShieldCheck className="mt-1 shrink-0 text-brand" size={22} />
            <div>
              <h2 className="font-medium">Use fictional details</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Please avoid real personal information. This project demonstrates the interaction
                without asking you to become a customer.
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/properties"
          className="mt-10 inline-flex items-center gap-2 text-sm underline underline-offset-4"
        >
          Find a home in the collection
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <InquiryForm propertyId={property} properties={properties} />
    </div>
  );
}
