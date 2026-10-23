import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export function generateAdminToken(password: string): string {
  return crypto
    .createHmac("sha256", "apple-garden-secret-salt-2026")
    .update(password)
    .digest("hex");
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token || !ADMIN_PASSWORD) return false;
  const expected = generateAdminToken(ADMIN_PASSWORD);
  return token === expected;
}

export function checkAdminPassword(password: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  return password === ADMIN_PASSWORD;
}
