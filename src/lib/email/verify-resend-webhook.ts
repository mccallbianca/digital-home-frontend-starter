const DEFAULT_TOLERANCE_SECONDS = 5 * 60;

function decodeBase64(input: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(input, "base64"));
  }

  const binary = atob(input);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function normalizeSecret(secret: string): Uint8Array {
  const raw = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  return decodeBase64(raw);
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}

export async function verifyResendWebhookSignature(input: {
  secret: string;
  body: string;
  id: string;
  timestamp: string;
  signatureHeader: string;
  now?: number;
  toleranceSeconds?: number;
}): Promise<boolean> {
  const {
    secret,
    body,
    id,
    timestamp,
    signatureHeader,
    now = Date.now(),
    toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
  } = input;

  const parsedTimestamp = Number(timestamp);
  if (!Number.isFinite(parsedTimestamp)) {
    return false;
  }

  if (Math.abs(Math.floor(now / 1000) - parsedTimestamp) > toleranceSeconds) {
    return false;
  }

  const signedContent = new TextEncoder().encode(`${id}.${timestamp}.${body}`);
  const secretBytes = normalizeSecret(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(secretBytes),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const signatures = signatureHeader
    .trim()
    .split(/\s+/)
    .map((entry) => entry.split(","))
    .filter(([version, value]) => version === "v1" && Boolean(value))
    .map(([, value]) => value);

  for (const signature of signatures) {
    try {
      const signatureBytes = decodeBase64(signature);
      const valid = await crypto.subtle.verify(
        "HMAC",
        key,
        toArrayBuffer(signatureBytes),
        toArrayBuffer(signedContent)
      );

      if (valid) {
        return true;
      }
    } catch {
      // Ignore malformed signatures and continue checking the rest.
    }
  }

  return false;
}
