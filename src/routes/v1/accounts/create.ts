// /v1/accounts/create - creates an account
// Uses Cloudflare's Turnstile captcha
import { Response } from "express";
import { ExtendedRequest } from "../../../types/request";
import { requireMethod } from "../../../middleware/require_method";
import * as validation from "../../../verification/validation";
import { checkCaptcha } from "../../../verification/captcha";
import { addUser } from "../../../database/accounts/users/writes";
import { generateUUID } from "../../../database/accounts/users/utils";
import * as bcrypt from "../../../utils/bcrypt";
import { getUserResponse } from "../../../utils/responses";
import {
    doesEmailExist,
    doesUsernameExist,
} from "../../../database/accounts/users/user_existence";

async function validate(
    ip: string,
    email: string,
    username: string,
    first_name: string,
    last_name: string,
    password: string,
    captcha: string
): Promise<boolean> {
    // Check if the email is valid
    if (!validation.validateEmail(email)) {
        return false;
    }

    // Check if the username is valid
    if (!validation.validateUsername(username)) {
        return false;
    }

    // Check if the first and last name are valid
    if (
        !validation.validateName(first_name) ||
        !validation.validateName(last_name)
    ) {
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

    return true;
}

async function checkExistence(email: string, username: string) {
    // Check if the email is already in use
    if (await doesEmailExist(email)) {
        return false;
    }

    // Check if the username is already in use
    if (await doesUsernameExist(username)) {
        return false;
    }

    return true;
}

export default [
    requireMethod("POST"),
    async (req: ExtendedRequest, res: Response) => {
        // Get the fields from the request body
        const {
            email,
            username,
            phone_number,
            first_name,
            last_name,
            password,
            captcha,
        } = req.body;

        const fields = [
            email,
            username,
            phone_number,
            first_name,
            last_name,
            password,
            captcha,
        ]; // Array of fields to check

        // Check if all fields are present
        for (const field of fields) {
            if (!field || typeof field !== "string") {
                return res.status(400).json({
                    message: "Invalid field types",
                });
            }
        }

        // Some fields are missing
        if (fields.length !== 7) {
            return res.status(400).json({
                message: "Invalid field count",
            });
        }

        // Validate the fields
        if (
            !(await validate(
                req.ip,
                email,
                username,
                first_name,
                last_name,
                password,
                captcha
            ))
        ) {
            return res.status(400).json({
                message: "Invalid field values",
            });
        }

        try {
            if (!(await checkExistence(email, username))) {
                return res.status(403).json({
                    message: "Email or username already in use",
                });
            }

            const uuid = await generateUUID();
            const passwordHash = await bcrypt.hashPassword(password);

            const result = await addUser({
                uuid,
                email,
                phone_number,
                username,
                first_name,
                last_name,
                password_hash: passwordHash,
                role: "user",
                auth_provider: "taskbuddy",
            });

            if (!result) {
                return res.status(500).json({
                    message: "Internal server error",
                });
            }

            res.status(200).json(getUserResponse(result));
        } catch (e) {
            console.error(e);

            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
