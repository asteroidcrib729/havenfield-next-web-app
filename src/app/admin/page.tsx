import { PostList } from "@/components/admin/post-list";
import { getAdminSession } from "@/server/auth";
import { redirect } from "next/navigation";
export default async function AdminPage() { if (!await getAdminSession()) redirect("/admin/login"); return <PostList/>; }
