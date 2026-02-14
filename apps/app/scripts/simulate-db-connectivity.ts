import { prisma } from "../lib/db";

async function main() {
  try {
    await (prisma as any).$queryRawUnsafe("SELECT 1");
    console.log(JSON.stringify({ ok: true }));
  } catch (e: any) {
    console.log(
      JSON.stringify({
        ok: false,
        code: e?.code || null,
        name: e?.name || null,
        message: String(e?.message || e),
      }),
    );
    process.exit(1);
  } finally {
    try {
      await (prisma as any).$disconnect();
    } catch {}
  }
}

main();
