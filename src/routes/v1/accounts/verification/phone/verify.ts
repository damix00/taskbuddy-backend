import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../../types/request";
import * as phone from "../../../../../verification/phone";
import { requireMethod } from "../../../../../middleware/require_method";
import { KillswitchTypes } from "../../../../../database/models/killswitch";
import setKillswitch from "../../../../../middleware/killswitch";

export default [
    setKillswitch([KillswitchTypes.DISABLE_TWILIO]),
    requireMethod("POST"),
    authorize(false, false),
    async (req: ExtendedRequest, res: Response) => {
        if (!req.user) return;

        if (req.user!.phone_number_verified) {
            return res.status(400).json({
                message: "Phone number already verified",
            });
        }

        const code = req.query.code as string;

        if (!code) {
            return res.status(400).json({
                message: "Missing verification code",
            });
        }

        try {
            const result = await phone.verifyOTP(req.user!.uuid, code);

            if (result.status === "approved") {
                await req.user.setPhoneNumberVerified(true);

                return res.status(200).json({
                    message: "Phone number verified",
                });
            } else {
                return res.status(400).json({
                    message: "Invalid verification code",
                });
            }
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
