import { PropertyEditor } from "@/components/admin/property-editor";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <PropertyEditor id={(await params).id} />;
}
