"use client";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Property } from "@/lib/property-types";
import { PropertyCard } from "./property-card";
import { HomeChoiceLinks } from "./home-actions";
import { useHomeChoices } from "./use-home-choices";
const action = "min-h-11 rounded-full border border-line px-5 py-3 text-sm hover:border-brand";
export function SavedHomes({ properties }: { properties: Property[] }) {
  const choices = useHomeChoices();
  const homes = properties.filter((home) => choices.saved.includes(home.id));
  return (
    <div>
      <HomeChoiceLinks properties={properties} />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {homes.length} saved {homes.length === 1 ? "home" : "homes"}. These choices stay in this
          browser.
        </p>
        {choices.saved.length ? (
          <button className={action} onClick={() => choices.clear("saved")}>
            Clear saved homes
          </button>
        ) : null}
      </div>
      {homes.length ? (
        <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          {homes.map((home) => (
            <PropertyCard key={home.id} property={home} />
          ))}
        </div>
      ) : (
        <Empty
          title="A little room for possibility."
          text="Save homes from the collection and come back to them here. No account needed."
        />
      )}
    </div>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
      <h2 className="font-display text-3xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted">{text}</p>
      <Link
        href="/properties"
        className="mt-7 inline-flex rounded-full bg-ink px-6 py-3 text-sm text-paper"
      >
        Explore the collection
      </Link>
    </div>
  );
}
export function CompareHomes({ properties }: { properties: Property[] }) {
  const choices = useHomeChoices();
  const homes = choices.compare
    .map((id) => properties.find((home) => home.id === id))
    .filter((home) => home !== undefined);
  const rows = [
    [
      "Fictional guide price",
      (id: string) => formatPrice(properties.find((home) => home.id === id)!.price),
    ],
    ["Setting", (id: string) => properties.find((home) => home.id === id)!.region],
    ["Home type", (id: string) => properties.find((home) => home.id === id)!.type],
    ["Bedrooms", (id: string) => String(properties.find((home) => home.id === id)!.bedrooms)],
    ["Bathrooms", (id: string) => String(properties.find((home) => home.id === id)!.bathrooms)],
    ["Floor area", (id: string) => properties.find((home) => home.id === id)!.area + " m\u00b2"],
  ] as const;
  return (
    <div>
      <HomeChoiceLinks properties={properties} />
      <p className="mb-6 max-w-2xl text-sm leading-7 text-muted">
        Compare up to three fictional homes side by side. Prices and specifications are
        illustrative. Your selection stays in this browser.
      </p>
      {homes.length ? (
        <>
          <div className="mb-6 flex flex-wrap gap-4">
            <button className={action} onClick={() => choices.clear("compare")}>
              Clear comparison
            </button>
            <Link className={action} href="/properties">
              Choose another home
            </Link>
          </div>
          <p className="mb-3 text-xs text-muted">
            Scroll the table horizontally to compare every home.
          </p>
          <div
            role="region"
            aria-label="Home comparison table"
            tabIndex={0}
            className="min-w-0 overflow-x-auto rounded-2xl border border-line bg-white/60"
          >
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Comparison of {homes.length} selected fictional homes
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="w-36 p-5 align-top">
                    At a glance
                  </th>
                  {homes.map((home) => (
                    <th key={home.id} scope="col" className="min-w-48 p-5 align-top">
                      <Image
                        src={home.image}
                        alt=""
                        unoptimized={home.image.startsWith("https://")}
                        width={320}
                        height={213}
                        sizes="(max-width: 768px) 200px, 300px"
                        className="mb-4 aspect-[3/2] w-full rounded-lg object-cover"
                      />
                      <Link
                        href={"/properties/" + home.slug}
                        className="font-display text-xl font-normal underline-offset-4 hover:underline"
                      >
                        {home.name}
                      </Link>
                      <p className="mt-2 text-xs font-normal text-muted">{home.location}</p>
                      <button
                        className="mt-4 min-h-11 text-xs font-normal underline underline-offset-4"
                        aria-label={"Remove " + home.name + " from comparison"}
                        onClick={() => choices.toggle("compare", home.id)}
                      >
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label} className="border-t border-line">
                    <th scope="row" className="p-5 font-medium">
                      {label}
                    </th>
                    {homes.map((home) => (
                      <td key={home.id} className="p-5">
                        {value(home.id)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-line">
                  <th scope="row" className="p-5 align-top font-medium">
                    Thoughtful details
                  </th>
                  {homes.map((home) => (
                    <td key={home.id} className="p-5 align-top">
                      <ul className="space-y-2">
                        {home.features.slice(0, 4).map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Empty
          title="Consider them side by side."
          text="Choose Compare on up to three homes in the collection. Their details will appear together here."
        />
      )}
    </div>
  );
}
