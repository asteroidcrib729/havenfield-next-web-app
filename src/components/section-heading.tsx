export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="mb-5 text-[10px] tracking-[0.2em] uppercase text-brand">{eyebrow}</p>
      <h2 className="max-w-2xl font-display text-4xl leading-tight sm:text-5xl">{title}</h2>
      {description && <p className="mt-5 max-w-xl text-sm leading-7 text-muted">{description}</p>}
    </div>
  );
}
