// scripts/codex-sync.ts
import fs from "fs";
import { execSync } from "child_process";

const routePath = "app/operator/page.tsx";
const prompt = `
You're a UI/UX Reflex Optimization Assistant.
Evaluate the following React page and suggest:
1. Reflex trust signal display enhancements
2. UI/UX improvements based on session state
3. Minimizing build latency patterns

Only output code that could be directly pasted into page.tsx.
`;

const fileContent = fs.readFileSync(routePath, "utf-8");
const fullPrompt = prompt + "\n\n" + fileContent;

fs.writeFileSync("tmp_codex_input.txt", fullPrompt);

// Run OpenAI CLI — assumes you’ve installed and authed with `openai` CLI
execSync(`openai api chat.completions.create -m gpt-4o -g assistant -i @tmp_codex_input.txt > tmp_codex_output.txt`);

console.log("✅ Codex feedback saved to tmp_codex_output.txt");
