// POST /v1/accounts/me/logout
// Log out

import { Response } from "express";
import { requireMethod } from "../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../types/request";
import { authorize } from "../../../../middleware/authorization";
import { LoginWrites } from "../../../../database/wrappers/accounts/logins/wrapper";
import {
    NotificationReads,
    NotificationWrites,
} from "../../../../database/wrappers/accounts/notifications/wraper";

export default [
    requireMethod("POST"),
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const token = await NotificationReads.getLoginToken(req.login_id);

            if (token) {
                const tokenResult = await NotificationWrites.deleteToken(
                    token.token
                );

                if (!tokenResult) {
                    console.error("Failed to delete token");

                    return res.status(500).json({
                        message: "Internal server error",
                    });
                }
            }

            const logoutResult = await LoginWrites.logout(req.login_id);

            if (!logoutResult) {
                console.error("Failed to log out");

                return res.status(500).json({
                    message: "Internal server error",
                });
            }

            return res.status(200).json({
                message: "OK",
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
