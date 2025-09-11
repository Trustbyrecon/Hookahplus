import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const p = path.join(process.cwd(), "config", "badges.json");
  const raw = fs.readFileSync(p, "utf-8");
  const data = JSON.parse(raw) as Array<{ id: string; label: string; scope: string; rule: any; active?: boolean }>;
  for (const b of data) {
    await prisma.badge.upsert({
      where: { id: b.id },
      update: { label: b.label, scope: b.scope, rule: b.rule, active: b.active ?? true },
      create: { id: b.id, label: b.label, scope: b.scope, rule: b.rule, active: b.active ?? true },
    });
  }
  console.log(`Seeded ${data.length} badges`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
