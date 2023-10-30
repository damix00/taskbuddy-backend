import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../../types/request";
import * as phone from "../../../../../verification/phone";
import setKillswitch from "../../../../../middleware/killswitch";
import { KillswitchTypes } from "../../../../../database/models/killswitch";

export default [
    setKillswitch([KillswitchTypes.DISABLE_TWILIO]),
    authorize(false),
    async (req: ExtendedRequest, res: Response) => {
        if (!req.user) return;

        if (req.user!.phone_number_verified) {
            return res.status(400).json({
                message: "Phone number already verified",
            });
        }

        try {
            await phone.sendOTP(req.user!.uuid);

            return res.json({
                message: "Verification code sent",
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
