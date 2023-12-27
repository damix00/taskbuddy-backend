// PATCH /v1/accounts/me/fcm
// Update the user's FCM token

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { requireMethod } from "../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../types/request";
import { NotificationWrites } from "../../../../database/wrappers/accounts/notifications/wraper";

export default [
    authorize(true),
    requireMethod("PATCH"),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { fcm_token } = req.body;

            if (!fcm_token) {
                return res.status(400).json({
                    message: "Missing data",
                });
            }

            const r = await NotificationWrites.setLoginToken(
                req.user!.id,
                req.login_id,
                fcm_token
            );

            if (!r) {
                return res.status(500).json({
                    message: "Internal server error",
                });
            }

            return res.status(200).json({
                message: "OK",
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
