import { redirect } from "next/navigation";

/**
 * /codigo root — redirect to operator floor (primary pilot surface).
 */
export default function CodigoPage() {
  redirect("/codigo/operator");
}
