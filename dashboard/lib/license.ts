import { randomUUID } from "crypto";

export function generateLicenseKey(): string {
  return `HQ-${randomUUID().replace(/-/g, "").slice(0, 24).toUpperCase()}`;
}
