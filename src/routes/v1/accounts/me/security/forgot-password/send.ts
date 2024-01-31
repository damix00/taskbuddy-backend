// POST /v1/accounts/me/security/forgot-password/send
// Send forgot password OTP to phone number.

import { Response } from "express";
import { ExtendedRequest } from "../../../../../../types/request";
import { UserReads } from "../../../../../../database/wrappers/accounts/users/wrapper";
import { sleep } from "../../../../../../utils/utils";
import { sendOTP } from "../../../../../../verification/phone";
import setKillswitch from "../../../../../../middleware/killswitch";
import { KillswitchTypes } from "../../../../../../database/models/killswitch";
import { requireMethod } from "../../../../../../middleware/require_method";

export default [
    requireMethod("POST"),
    setKillswitch([KillswitchTypes.DISABLE_TWILIO]),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const email = req.body.email;

            if (!email) {
                return res.status(400).json({
                    message: "Email is required",
                });
            }

            const user = await UserReads.getUserByEmail(email);

            if (!user) {
                await sleep(500);

                return res.status(200).json({
                    message: "Code sent.",
                });
            }

            await sendOTP(user.uuid);

            res.status(200).json({
                message: "Code sent.",
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
