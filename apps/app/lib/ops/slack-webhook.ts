export type SlackSeverity = "info" | "warning" | "critical";

function severityLabel(sev: SlackSeverity): string {
  if (sev === "critical") return "CRITICAL";
  if (sev === "warning") return "WARNING";
  return "INFO";
}

function envWebhookUrl(): string | null {
  const url = process.env.SLACK_OPS_WEBHOOK_URL?.trim();
  return url ? url : null;
}

export async function sendSlackOpsWebhook(params: {
  severity: SlackSeverity;
  title: string;
  text: string;
  fields?: Record<string, string | number | boolean | null | undefined>;
}): Promise<{ sent: boolean; status?: number; error?: string }> {
  const url = envWebhookUrl();
  if (!url) return { sent: false, error: "SLACK_OPS_WEBHOOK_URL is not configured" };

  const fields = params.fields ?? {};
  const fieldLines = Object.entries(fields)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `• *${k}*: ${v === null ? "null" : String(v)}`)
    .join("\n");

  const header = `*[H+][${severityLabel(params.severity)}]* ${params.title}`;
  const body = `${params.text}${fieldLines ? `\n\n${fieldLines}` : ""}`.trim();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `${header}\n${body}`.trim(),
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        sent: false,
        status: res.status,
        error: `Slack webhook failed: ${res.status} ${res.statusText}${errText ? ` - ${errText}` : ""}`,
      };
    }

    return { sent: true, status: res.status };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : String(e) };
  }
}

