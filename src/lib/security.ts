import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

// Data encryption and decryption FOR SERVER
export function encryptData(data: string, secretKey: string): string {
	const iv = randomBytes(16);

	// Cast secretKey to Buffer (must be 32 bytes for AES-256)
	const keyBuffer = Buffer.from(secretKey.padEnd(32, "0").slice(0, 32));

	const cipher = createCipheriv("aes-256-gcm", keyBuffer, iv);
	let encrypted = cipher.update(data, "utf8", "hex");
	encrypted += cipher.final("hex");
	const authTag = cipher.getAuthTag();

	return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`;
}

export function decryptData(encryptedData: string, secretKey: string): string {
	const parts = encryptedData.split(":");

	// Check that we have all three parts
	if (parts.length !== 3) {
		throw new Error("Invalid encrypted data format");
	}

	const [ivHex, encrypted, authTagHex] = parts;

	// Check that none of the parts are empty
	if (!ivHex || !encrypted || !authTagHex) {
		throw new Error("Invalid encrypted data format");
	}

	const iv = Buffer.from(ivHex, "hex");
	const authTag = Buffer.from(authTagHex, "hex");

	// Cast secretKey to Buffer (must be 32 bytes for AES-256)
	const keyBuffer = Buffer.from(secretKey.padEnd(32, "0").slice(0, 32));

	const decipher = createDecipheriv("aes-256-gcm", keyBuffer, iv);
	decipher.setAuthTag(authTag);

	let decrypted = decipher.update(encrypted, "hex", "utf8");
	decrypted += decipher.final("utf8");

	return decrypted;
}

// Password hashing using SHA-256 (для Node.js с crypto)
export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString("hex");

	// Using HMAC-SHA256 with salt
	const hash = createHmac("sha256", salt).update(password).digest("hex");

	// Return salt and hash for later verification
	return `${salt}:${hash}`;
}

// Password check function
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	const [salt, originalHash] = hashedPassword.split(":");

	if (!salt || !originalHash) {
		return false;
	}

	const hash = createHmac("sha256", salt).update(password).digest("hex");

	return hash === originalHash;
}

// Data masking for logs
export function maskForLogs(data: Record<string, unknown>): Record<string, unknown> {
	const masked = { ...data };
	const patterns = {
		passport: /(\d{4})\d{6}/g,
		phone: /(\d{3})\d{7}/g,
		email: /(.{3}).*@(.{3})/g,
	};

	Object.keys(masked).forEach((key) => {
		const value = masked[key];

		if (typeof value === "string") {
			let maskedValue = value;

			// Passport masking
			maskedValue = maskedValue.replace(patterns.passport, "$1******");

			// Phone masking
			maskedValue = maskedValue.replace(patterns.phone, "$1*******");

			// Email masking
			maskedValue = maskedValue.replace(patterns.email, "$1***@$2***");

			masked[key] = maskedValue;
		}
	});

	return masked;
}

// =========================== Data encryption and decryption FOR BROWSER (Web Crypto API)
export async function encryptDataBrowser(data: string, secretKey: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secretKey.padEnd(32, "0").slice(0, 32)),
		{ name: "AES-GCM" },
		false,
		["encrypt"]
	);

	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encodedData = encoder.encode(data);

	const encrypted = await crypto.subtle.encrypt(
		{
			name: "AES-GCM",
			iv: iv,
		},
		key,
		encodedData
	);

	const encryptedArray = new Uint8Array(encrypted);
	const result = new Uint8Array(iv.length + encryptedArray.length);
	result.set(iv);
	result.set(encryptedArray, iv.length);

	return btoa(String.fromCharCode(...result));
}

export async function decryptDataBrowser(
	encryptedData: string,
	secretKey: string
): Promise<string> {
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secretKey.padEnd(32, "0").slice(0, 32)),
		{ name: "AES-GCM" },
		false,
		["decrypt"]
	);

	const data = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
	const iv = data.slice(0, 12);
	const encrypted = data.slice(12);

	const decrypted = await crypto.subtle.decrypt(
		{
			name: "AES-GCM",
			iv: iv,
		},
		key,
		encrypted
	);

	return decoder.decode(decrypted);
}
