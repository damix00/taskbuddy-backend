// DELETE /v1/accounts/me/security/sessions/:id
// Deletes a login session

import { Response } from "express";
import { requireMethod } from "../../../../../../../middleware/require_method";
import { authorize } from "../../../../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../../../../types/request";
import {
    LoginReads,
    LoginWrites,
} from "../../../../../../../database/wrappers/accounts/logins/wrapper";

export default [
    requireMethod("DELETE"),
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const id: number = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    message: "Invalid id",
                });
            }

            const login = await LoginReads.getLoginById(id);

            if (!login) {
                return res.status(404).json({
                    message: "Login not found",
                });
            }

            if (login.user_id != req.user!.id) {
                return res.status(403).json({
                    message: "You do not have permission to delete this login",
                });
            }

            await LoginWrites.logout(login.id);

            res.status(200).json({
                message: "Successfully logged out",
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
