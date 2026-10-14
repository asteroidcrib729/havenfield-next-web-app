import {SystemPanel} from "@/components/admin/system-panel";
import {getAdminSession} from "@/server/auth";
import {redirect} from "next/navigation";
export default async function OperationsPage(){if(!await getAdminSession())redirect("/admin/login");return <SystemPanel/>;}
