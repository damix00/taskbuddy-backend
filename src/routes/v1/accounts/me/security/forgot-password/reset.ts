// POST /v1/accounts/me/security/forgot-password/reset
// Reset password.

import { Response } from "express";
import { UserReads } from "../../../../../../database/wrappers/accounts/users/wrapper";
import { validatePassword } from "../../../../../../verification/validation";
import { verifyOTP } from "../../../../../../verification/phone";
import { ExtendedRequest } from "../../../../../../types/request";
import { ProfileReads } from "../../../../../../database/wrappers/accounts/profiles/wrapper";
import { getUserProfileResponse } from "../../../responses";
import setKillswitch from "../../../../../../middleware/killswitch";
import { KillswitchTypes } from "../../../../../../database/models/killswitch";
import { requireMethod } from "../../../../../../middleware/require_method";

export default [
    requireMethod("POST"),
    setKillswitch([KillswitchTypes.DISABLE_TWILIO]),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const email = req.body.email;
            const password = req.body.password;
            const code = req.body.code;

            if (!password || !code) {
                return res.status(400).json({
                    message: "Password is required",
                });
            }

            const user = await UserReads.getUserByEmail(email);

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            if (!validatePassword(password)) {
                return res.status(400).json({
                    message: "Invalid password",
                });
            }

            const result = await verifyOTP(user.uuid, code);

            if (result.status === "approved") {
                await user.changePassword(password);
                await user.setPhoneNumberVerified(true);

                const login = await user.addLogin(req.ip, req.userAgent);

                if (!login) {
                    return res.status(500).json({
                        message: "Internal server error",
                    });
                }

                const profile = await ProfileReads.getProfileByUid(user.id);

                if (profile) {
                    return res.status(200).json({
                        ...getUserProfileResponse(user, login.id, profile),
                        message: "OK",
                    });
                }

                res.status(500).json({
                    message: "Internal server error",
                });
            }

            res.status(403).json({
                message: "Invalid code",
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
