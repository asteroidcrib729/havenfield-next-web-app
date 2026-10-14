import {MediaLibrary} from "@/components/admin/media-library";
import {getAdminSession} from "@/server/auth";
import {redirect} from "next/navigation";
export default async function MediaPage(){if(!await getAdminSession())redirect("/admin/login");return <MediaLibrary/>;}
