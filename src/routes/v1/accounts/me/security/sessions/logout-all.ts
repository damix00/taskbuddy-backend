// POST /v1/accounts/me/security/sessions/logout-all
// Logs out all sessions

import { Response } from "express";
import { authorize } from "../../../../../../middleware/authorization";
import { requireMethod } from "../../../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../../../types/request";
import { LoginWrites } from "../../../../../../database/wrappers/accounts/logins/wrapper";

export default [
    requireMethod("POST"),
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const result = await req.user?.logOutOfAllDevices();

            if (!result) {
                res.status(500).json({
                    message: "Internal server error",
                });
            }

            const deleted = await LoginWrites.deleteAll(req.user!.id);

            if (!deleted) {
                res.status(500).json({
                    message: "Internal server error",
                });
            }

            res.status(200).json({
                message: "Successfully logged out of all devices",
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
