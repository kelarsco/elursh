/**
 * Generate a base32 secret for manager TOTP login.
 * Add MANAGER_TOTP_SECRET to .env, then add this secret to Google Authenticator / Authy (manual entry or scan QR).
 * Run: node scripts/generate-totp-secret.js
 */
import speakeasy from "speakeasy";

const secret = speakeasy.generateSecret({ name: "Elursh Manager", length: 20 });
const base32 = secret.base32;

console.log("\nAdd this to your .env file:\n");
console.log("MANAGER_TOTP_SECRET=" + base32);
console.log("\nThen add the secret to your authenticator app:");
console.log("  - Google Authenticator: Add account → Enter a setup key → paste the secret above");
console.log("  - Authy: Add account → Enter key manually → paste the secret above");
console.log("\nOr scan this QR code (open in browser to show QR):");
console.log("  https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(secret.otpauth_url));
console.log("\nSecret (base32): " + base32 + "\n");
