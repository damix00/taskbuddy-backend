import dotenv from "dotenv";
dotenv.config();

export const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
export const authToken = process.env.TWILIO_AUTH_TOKEN as string;
export const verifySid = process.env.TWILIO_VERIFY_SID as string;

export const turnstileSecret = process.env.CF_TURNSTILE_SECRET as string;
export const turnstileSiteKey = process.env.CF_TURNSTILE_SITEKEY as string;
