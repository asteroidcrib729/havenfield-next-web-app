import Image from "next/image";
export function BrandDetail() {
  return (
    <div aria-hidden="true" className="relative mb-7 h-20 w-32 overflow-hidden rounded-xl">
      <Image
        src="/media/plan03/about-materials-480.webp"
        alt=""
        fill
        sizes="128px"
        className="object-cover"
      />
    </div>
  );
}
