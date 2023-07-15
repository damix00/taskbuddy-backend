// /v1/accounts/create - creates an account
// Uses Cloudflare's Turnstile captcha
import { Response } from "express";
import { ExtendedRequest } from "../../../types/request";
import { requireMethod } from "../../../middleware/require_method";
import * as validation from "../../../verification/validation";
import * as numbers from "../../../verification/numbers";
import { checkCaptcha } from "../../../verification/captcha";
import { addUser } from "../../../database/accounts/users";
import { generateUUID } from "../../../database/accounts/users/utils";
import * as bcrypt from '../../../utils/bcrypt';
import { getUserResponse } from "../../../utils/responses";

async function validate(ip: string,
                        email: string,
                        phone_number: string,
                        first_name: string,
                        last_name: string,
                        password: string,
                        captcha: string): Promise<boolean> {

    // Check if the email is valid
    if (!validation.validateEmail(email)) {
        return false;
    }

    // Check if the first and last name are valid
    if (!validation.validateName(first_name) || !validation.validateName(last_name)) {
        return false;
    }

    // Check if the password is valid
    if (!validation.validatePassword(password)) {
        return false;
    }

    // Check if the captcha is valid
    if (await checkCaptcha(captcha, ip)) {
        return false;
    }

    // Check if the phone number is valid
    // Doing this last because it's the most expensive check
    // Also, we don't want to do this check if the captcha is invalid
    if (!numbers.doesNumberExist(phone_number) || !numbers.isVoIPNumber(phone_number)) {
        return false;
    }

    return true;
}


export default [requireMethod("POST"), async (req: ExtendedRequest, res: Response) => {
    // Get the fields from the request body
    const { email, phone_number, first_name, last_name, password, captcha } = req.body;

    const fields = [email, phone_number, first_name, last_name, password, captcha]; // Array of fields to check

    // Check if all fields are present
    for (const field of fields) {
        if (!field || typeof field !== "string") {
            return res.status(400).json({
                message: "Invalid field types"
            });
        }
    }

    // Some fields are missing
    if (fields.length !== 6) {
        return res.status(400).json({
            message: "Invalid field count"
        });
    }

    // Validate the fields
    if (!await validate(req.ip, email, phone_number, first_name, last_name, password, captcha)) {
        return res.status(400).json({
            message: "Invalid field values"
        });
    }

    try {
        const uuid = await generateUUID();
        const passwordHash = await bcrypt.hashPassword(password);

        const result = await addUser({
            uuid,
            email,
            phone_number,
            first_name,
            last_name,
            password_hash: passwordHash,
            auth_provider: 'swoop'
        });

        if (!result) {
            return res.status(500).json({
                message: 'Internal server error'
            });
        }

        res.status(200).json(getUserResponse(result));
    }

    catch (e) {
        console.error(e);

        res.status(500).json({
            message: 'Internal server error'
        });
    }

}];