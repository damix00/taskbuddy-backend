// /v1/accounts/login - Checks e-mail and password combo
// Uses Cloudflare's Turnstile captcha
import { Response } from "express";
import { requireMethod } from "../../../middleware/require_method";
import { sleep } from "../../../utils/utils";
import { comparePassword } from "../../../utils/bcrypt";
import { getUserProfileResponse } from "../../../utils/responses";
import { ExtendedRequest } from "../../../types/request";
import { checkCaptcha } from "../../../verification/captcha";
import { User } from "../../../database/accounts/users";
import setKillswitch from "../../../middleware/killswitch";
import { KillswitchTypes } from "../../../database/models/killswitch";
import * as killswitches from "../../../utils/global_killswitches";
import { Profile } from "../../../database/accounts/profiles";
import { ProfileReads } from "../../../database/accounts/profiles/wrapper";
import { UserReads } from "../../../database/accounts/users/wrapper";

export default [
    setKillswitch([
        KillswitchTypes.DISABLE_AUTH,
        KillswitchTypes.DISABLE_LOGIN,
    ]),
    requireMethod("POST"),
    async (req: ExtendedRequest, res: Response) => {
        const { email, password } = req.body;

        let time = Date.now();

        if (!email || !password) {
            return res.status(400).json({
                message: "Missing required parameters",
            });
        }

        // if (!checkCaptcha(captcha, req.ip)) {
        //     return res.status(400).json({
        //         message: "Invalid captcha",
        //     });
        // }

        try {
            const user = await UserReads.getUserByEmail(email);

            if (!user) {
                await sleep(200); // Prevent timing attacks
                return res.status(401).json({
                    message: "Invalid email or password",
                });
            }

            if (!(await comparePassword(password, user.password_hash))) {
                return res.status(401).json({
                    message: "Invalid email or password",
                });
            }

            let current = Date.now();

            // We add a fake delay because people do not trust instant logins
            if (
                !killswitches.isKillswitchEnabled(
                    KillswitchTypes.DISABLE_FAKE_DELAY
                ) &&
                Date.now() - current < 1000
            ) {
                await sleep(1000 - (Date.now() - current));
            }

            user.addLogin(req.ip, req.userAgent);

            const profile = await ProfileReads.getProfileByUid(user.id);

            if (profile) {
                return res.status(200).json({
                    ...getUserProfileResponse(user, profile),
                    message: "OK",
                });
            }

            res.status(500).json({
                message: "Internal server error",
            });
        } catch (e) {
            console.error(e);

            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
