import { PostEditor } from "@/components/admin/post-editor";
import { getAdminSession } from "@/server/auth";
import { redirect } from "next/navigation";
export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) redirect("/admin/login");
  const { id } = await params;
  return <PostEditor id={id} />;
}
