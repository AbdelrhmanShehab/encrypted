import { redirect } from "next/navigation";

// Policies, FAQs and contact now live under "Get To Know Us".
export default function PolicyPage() {
  redirect("/about?tab=shipping");
}
