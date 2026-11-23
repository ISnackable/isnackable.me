import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ivLength = 12;
const tagLength = 16;

export function sealJson(value: object, key: Buffer) {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value)),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString(
    "base64url"
  );
}

export function openJson(sealed: string, key: Buffer): unknown {
  const bytes = Buffer.from(sealed, "base64url");
  const ciphertextOffset = ivLength + tagLength;
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    bytes.subarray(0, ivLength),
    { authTagLength: tagLength }
  );
  decipher.setAuthTag(bytes.subarray(ivLength, ciphertextOffset));
  const plaintext = Buffer.concat([
    decipher.update(bytes.subarray(ciphertextOffset)),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString());
}
