import type { Config } from "@netlify/functions";
import { eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { certificates } from "../../db/schema.js";

// New global IDs: ARIJU-001, ARIJU-002, ... (grows past 999 automatically).
// Legacy IDs (AS-2026-123456) issued before the global counter stay verifiable.
const ID_PATTERN = /^(ARIJU-\d{3,9}|AS-\d{4}-\d{4,6})$/;
const SHEETS_TIMEOUT_MS = 8000;

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function formatGlobalId(serial: number) {
  return `ARIJU-${String(serial).padStart(3, "0")}`;
}

function toRecord(row: typeof certificates.$inferSelect) {
  return {
    id: row.id,
    serial: row.serial,
    recipient_name: row.recipientName,
    country: row.country ?? null,
    quiz_name: row.quizName,
    score: row.score,
    total: row.total,
    score_text: row.scoreText,
    issued_at: row.issuedAt.toISOString(),
  };
}

// Mirrors every issued certificate to the owner's Google Sheet through a
// Google Apps Script web app. The database stays the source of truth, so a
// slow or misconfigured sheet never blocks a participant's certificate.
async function syncToGoogleSheets(record: ReturnType<typeof toRecord>) {
  const url = Netlify.env.get("GOOGLE_SHEETS_WEBHOOK_URL");
  if (!url) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SHEETS_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      // text/plain avoids a CORS preflight and is read via e.postData.contents.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        secret: Netlify.env.get("GOOGLE_SHEETS_SECRET") ?? "",
        no: record.serial,
        id: record.id,
        name: record.recipient_name,
        country: record.country ?? "",
        quiz: record.quiz_name,
        score: record.score_text,
        timestamp: record.issued_at,
      }),
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error(`Google Sheets sync failed for ${record.id}: HTTP ${response.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Google Sheets sync failed for ${record.id}`, err);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export default async (req: Request) => {
  if (req.method === "GET") {
    const id = (new URL(req.url).searchParams.get("id") ?? "").trim().toUpperCase();
    if (!ID_PATTERN.test(id)) return json({ certificate: null });
    const [row] = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
    return json({ certificate: row ? toRecord(row) : null });
  }

  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    const recipientName =
      typeof body.recipientName === "string" ? body.recipientName.replace(/\s+/g, " ").trim().slice(0, 60) : "";
    const country =
      typeof body.country === "string" ? body.country.replace(/\s+/g, " ").trim().slice(0, 60) : "";
    const quizName = typeof body.quizName === "string" ? body.quizName.trim().slice(0, 100) : "";
    const score = Number(body.score);
    const total = Number(body.total);
    if (
      !recipientName ||
      !quizName ||
      !Number.isInteger(score) ||
      !Number.isInteger(total) ||
      total <= 0 ||
      total > 100 ||
      score < 0 ||
      score > total ||
      score < total * 0.75
    ) {
      return json({ error: "Invalid certificate data" }, 400);
    }
    const percent = Math.round((score / total) * 100);
    const scoreText = `${score} / ${total} (${percent}%)`;

    // nextval() is atomic across all concurrent requests worldwide, so every
    // participant receives a unique, strictly increasing number.
    const result = await db.execute<{ serial: string | number }>(
      sql`select nextval('certificate_serial_seq') as serial`
    );
    const rows = (Array.isArray(result) ? result : (result as { rows: { serial: string | number }[] }).rows) ?? [];
    const serial = Number(rows[0]?.serial);
    if (!Number.isSafeInteger(serial) || serial < 1) {
      return json({ error: "Could not allocate certificate ID" }, 500);
    }

    const [inserted] = await db
      .insert(certificates)
      .values({ id: formatGlobalId(serial), serial, recipientName, country: country || null, quizName, score, total, scoreText })
      .returning();
    const record = toRecord(inserted);
    const sheetSynced = await syncToGoogleSheets(record);
    return json({ certificate: record, sheetSynced }, 201);
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config: Config = {
  path: "/api/certificates",
};
