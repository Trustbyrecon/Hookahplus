export async function fireReflex(detail: any) {
  try {
    window.dispatchEvent(new CustomEvent("reflex:event", { detail }));
  } catch {}
  try {
    await fetch("/api/reflex/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detail),
      keepalive: true,
    });
  } catch {}
}
