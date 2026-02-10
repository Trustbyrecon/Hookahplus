import { redirect } from "next/navigation";

export default function PricingPage() {
  // The app deployment should feel like an authenticated staff system.
  // Public pricing lives on the marketing site.
  redirect("https://hookahplus.net/pricing");
}
