import { PostEditor } from "@/components/admin/post-editor";
import { getAdminSession } from "@/server/auth";
import { redirect } from "next/navigation";
export default async function NewArticlePage() { if (!await getAdminSession()) redirect("/admin/login"); return <PostEditor/>; }
