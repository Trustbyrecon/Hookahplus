import { redirect } from "next/navigation";

export default function RoiCalculatorPage() {
  // The app deployment should feel like an authenticated staff system.
  // Public ROI lives on the marketing site.
  redirect("https://hookahplus.net/pricing");
}

