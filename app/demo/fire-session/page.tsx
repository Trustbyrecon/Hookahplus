import { PrepCard } from "@/components/boh/PrepCard";
import { RunCard } from "@/components/foh/RunCard";

export default function Page() {
  const id = "sess_demo";
  
  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Fire Session Demo</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <PrepCard id={id} />
        <RunCard id={id} />
      </div>
      <p className="text-xs text-neutral-400">
        State is in-memory for demo. API: /api/sessions/[id]/command
      </p>
    </div>
  );
}
