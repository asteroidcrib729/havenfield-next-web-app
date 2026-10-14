import {InquiryInbox} from "@/components/admin/inquiry-inbox";
import {getAdminSession} from "@/server/auth";
import {redirect} from "next/navigation";
export default async function InquiriesPage(){if(!await getAdminSession())redirect("/admin/login");return <InquiryInbox/>;}
