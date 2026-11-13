import type { Config } from "@netlify/functions";
import { createHash, timingSafeEqual } from "node:crypto";
import { ANSWER_KEY_CSV_BASE64, ANSWER_KEY_XLSX_BASE64 } from "../lib/answer-key-files.js";

const PASSWORD_ENV = "KUNCI_JAWABAN_PASSWORD";

const FILES = {
  xlsx: {
    data: ANSWER_KEY_XLSX_BASE64,
    name: "kunci-jawaban-kuis.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  csv: {
    data: ANSWER_KEY_CSV_BASE64,
    name: "kunci-jawaban-kuis.csv",
    type: "text/csv; charset=utf-8",
  },
} as const;

const NO_STORE = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};

function passwordMatches(input: string, expected: string) {
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

function page(message = "", status = 200) {
  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Unduh Kunci Jawaban</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b1026;color:#e8ecff;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  form{width:min(92vw,380px);background:#141b3d;border:1px solid #2a3570;border-radius:14px;padding:28px}
  h1{font-size:1.25rem;margin:0 0 6px}
  p{margin:0 0 18px;color:#aab3e0;font-size:.9rem}
  label{display:block;font-size:.85rem;margin:14px 0 6px}
  input,select{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid #3a4685;background:#0b1026;color:#fff;font-size:1rem}
  button{margin-top:20px;width:100%;padding:11px;border:0;border-radius:8px;background:#6d5dfc;color:#fff;font-weight:600;font-size:1rem;cursor:pointer}
  .err{color:#ff8a9a;margin:12px 0 0;font-size:.9rem}
</style>
</head>
<body>
<form method="post">
  <h1>Kunci Jawaban Kuis</h1>
  <p>Masukkan kata sandi untuk mengunduh file.</p>
  <label for="pw">Kata sandi</label>
  <input id="pw" name="password" type="password" required autofocus autocomplete="current-password">
  <label for="fmt">Format file</label>
  <select id="fmt" name="format">
    <option value="xlsx">Excel (.xlsx)</option>
    <option value="csv">CSV (.csv)</option>
  </select>
  <button type="submit">Unduh</button>
  ${message ? `<div class="err">${message}</div>` : ""}
</form>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { ...NO_STORE, "Content-Type": "text/html; charset=utf-8" },
  });
}

export default async (req: Request) => {
  const expected = process.env[PASSWORD_ENV];
  if (!expected) {
    return page("Unduhan belum diaktifkan: kata sandi belum diatur.", 503);
  }

  if (req.method === "GET") return page();
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const form = await req.formData().catch(() => null);
  const password = String(form?.get("password") ?? "");
  const format = form?.get("format") === "csv" ? "csv" : "xlsx";

  if (!password || !passwordMatches(password, expected)) {
    // Small delay to slow down guessing.
    await new Promise((r) => setTimeout(r, 800));
    return page("Kata sandi salah.", 401);
  }

  const file = FILES[format];
  return new Response(Buffer.from(file.data, "base64"), {
    headers: {
      ...NO_STORE,
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename="${file.name}"`,
    },
  });
};

export const config: Config = {
  path: "/unduh-kunci-jawaban",
  method: ["GET", "POST"],
};
