// POST /v1/accounts/me/security/change-password
// Change password

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { requireMethod } from "../../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../../types/request";
import { validatePassword } from "../../../../../verification/validation";

export default [
    requireMethod("POST"),
    authorize(),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const currentPassword = req.body.current_password;
            const newPassword = req.body.new_password;

            // Check if current password is correct
            const isPasswordCorrect = await req.user!.comparePassword(
                currentPassword
            );

            if (!isPasswordCorrect) {
                return res.status(403).send({
                    message: "Current password is incorrect",
                });
            }

            // Validate password
            if (!validatePassword(newPassword)) {
                return res.status(400).send({
                    message: "Invalid password",
                });
            }

            // Change password
            await req.user!.changePassword(newPassword);

            res.status(200).send({
                message: "Password changed successfully",
            });
        } catch (err) {
            console.log(err);
            res.status(500).send({
                message: "Internal server error",
            });
        }
    },
];
