// Checks the captcha response with Cloudflare's API

import { turnstileSecret } from "../config";

export async function checkCaptcha(
    token: string,
    ip?: string
): Promise<boolean> {
    try {
        // Prepare the request body
        const formData = new FormData();
        formData.append("secret", turnstileSecret);
        formData.append("response", token);
        if (ip) formData.append("remoteip", ip);

        // Send the request
        const data = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                body: formData,
            }
        );

        // Return false if the request failed
        if (!data.ok) return false;

        // Return the captcha check result
        const json = await data.json();
        return json.success;
    } catch (e) {
        console.error(e);
        return false;
    }
}
