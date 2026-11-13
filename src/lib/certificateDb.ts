export type CertificateRecord = {
  id: string;
  serial: number | null;
  recipient_name: string;
  country: string | null;
  quiz_name: string;
  score: number;
  total: number;
  score_text: string;
  issued_at: string;
};

const ENDPOINT = '/api/certificates';

export async function issueCertificate(params: {
  recipientName: string;
  country?: string;
  quizName: string;
  score: number;
  total: number;
}): Promise<CertificateRecord> {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error(`Failed to issue certificate (${response.status})`);
  const data = (await response.json()) as { certificate: CertificateRecord };
  return data.certificate;
}

const VERIFY_TIMEOUT_MS = 15000;
const VERIFY_ATTEMPTS = 3;

async function fetchCertificate(id: string): Promise<CertificateRecord | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);
  try {
    const response = await fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Failed to verify certificate (${response.status})`);
    const data = (await response.json()) as { certificate?: CertificateRecord | null } | null;
    return data?.certificate ?? null;
  } finally {
    clearTimeout(timer);
  }
}

// Retries transient failures (cold starts, flaky mobile connections) so the
// visitor gets an answer instead of an endless spinner or an error.
export async function verifyCertificate(id: string): Promise<CertificateRecord | null> {
  let lastError: unknown;
  for (let attempt = 0; attempt < VERIFY_ATTEMPTS; attempt++) {
    try {
      return await fetchCertificate(id);
    } catch (err) {
      lastError = err;
      if (attempt < VERIFY_ATTEMPTS - 1) await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  throw lastError;
}
