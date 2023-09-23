// /v1/accounts/create - creates an account
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
import setKillswitch from "../../../middleware/killswitch";
import { KillswitchTypes } from "../../../database/models/killswitch";
import { addProfile } from "../../../database/accounts/profiles/writes";
import { User } from "../../../database/accounts/users";
import FirebaseStorage from "../../../firebase/storage/files";
import uniqueFilename from "unique-filename";
import os from "os";
import path from "path";
import fs from "fs";

async function validate(
    ip: string,
    email: string,
    username: string,
    first_name: string,
    last_name: string,
    password: string
    // captcha: string
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
    // if (await checkCaptcha(captcha, ip)) {
    //     return false;
    // }

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
    // Killswitches (can be disabled in the admin panel)
    setKillswitch([
        KillswitchTypes.DISABLE_AUTH,
        KillswitchTypes.DISABLE_REGISTRATION,
    ]),
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
            bio,
            // captcha,
        } = req.body;

        const fields = [
            email,
            username,
            phone_number,
            first_name,
            last_name,
            password,
            bio,
            // captcha,
        ]; // Array of fields to check

        const { profile_picture } = req.files || {};

        // Check if all fields are present
        for (const field of fields) {
            if (!field || typeof field !== "string") {
                return res.status(400).json({
                    message: "Invalid field types",
                });
            }
        }

        // Some fields are missing
        if (fields.length !== 8) {
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
                password
                // captcha
            ))
        ) {
            return res.status(400).json({
                message: "Invalid field values",
            });
        }

        try {
            let pfp = "";

            if (profile_picture) {
                // Update the file to firebase storage and get the URL
                const filename = uniqueFilename(os.tmpdir(), "pfp__");
                const ext = path.extname(profile_picture.name).toLowerCase();
                const mvfilename = `${filename}${ext}`;

                // Temporarily save the file to the server
                await profile_picture.mv(mvfilename);

                const upload = await FirebaseStorage.uploadFile(
                    mvfilename,
                    profile_picture.mimetype,
                    ext
                );

                // Delete the file from the server
                fs.rmSync(mvfilename);

                // Check if the upload was successful
                if (!upload) {
                    return res.status(500).json({
                        message: "Internal server error",
                    });
                }

                // Get the URL
                pfp = upload[0].metadata.mediaLink;
            }

            if (!(await checkExistence(email, username))) {
                return res.status(403).json({
                    message: "Email or username already in use",
                });
            }

            const uuid = await generateUUID();
            const passwordHash = await bcrypt.hashPassword(password);

            // Create a new account
            let result = await addUser({
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

            // Check if the account was created
            // If not, return an error
            if (!result) {
                return res.status(500).json({
                    message: "Internal server error",
                });
            }

            // Create a new user instance from the result
            result = new User(result);

            // Create a new profile for the user
            const profile = await addProfile({
                user_id: result.id,
                profile_picture: pfp,
                bio: bio || "",
                location_text: "",
                location_lat: 0,
                location_lon: 0,
                is_private: false,
            });

            // Check if the profile was created
            // If not, delete the user and return an error
            if (!profile) {
                // Delete the user
                await result.deleteUser();

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
