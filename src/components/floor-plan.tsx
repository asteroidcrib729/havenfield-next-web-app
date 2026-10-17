import { matchingFloorPlan } from "@/content/floor-plans";
import type { Property } from "@/lib/property-types";
export function FloorPlan({ property }: { property: Property }) {
  const plan = matchingFloorPlan(property);
  if (!plan) return null;
  return (
    <figure className="mt-10 break-inside-avoid rounded-xl border border-line bg-white p-4 sm:p-6 print:mt-5">
      <figcaption className="mb-5">
        <h2 className="font-display text-2xl">An illustrative arrangement</h2>
        <p className="mt-2 text-xs leading-6 text-muted">
          Concept diagram, not to scale. Room positions are imagined; this is not a measured plan or
          a reconstruction of the generated photographs. Shared circulation is omitted.
        </p>
      </figcaption>
      <svg
        role="img"
        aria-label={`Concept arrangement for ${property.name}: ${plan.rooms.map((r) => r.label).join(", ")}`}
        viewBox="-4 -4 608 408"
        className="h-auto w-full text-ink"
      >
        {plan.rooms.map((r, index) => (
          <g key={r.label}>
            <rect
              x={r.x + 3}
              y={r.y + 3}
              width={r.w - 6}
              height={r.h - 6}
              className={r.outdoor ? "fill-soft stroke-brand" : "fill-paper stroke-ink"}
              strokeWidth="2"
            />
            <text
              x={r.x + r.w / 2}
              y={r.y + r.h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="hidden fill-ink text-[13px] sm:block print:block"
            >
              {r.label}
            </text>
            <text
              x={r.x + r.w / 2}
              y={r.y + r.h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-ink text-[24px] sm:hidden print:hidden"
            >
              {index + 1}
            </text>
          </g>
        ))}
      </svg>
      <ol className="mt-4 grid grid-cols-2 gap-2 text-xs sm:hidden print:hidden">
        {plan.rooms.map((room, index) => (
          <li key={room.label}>
            {index + 1}. {room.label}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-muted">
        Illustrative interior area: {property.area} m² · {property.bedrooms} bedrooms ·{" "}
        {property.bathrooms} bathrooms. Outdoor blocks are excluded from the interior-area figure.
      </p>
    </figure>
  );
}
