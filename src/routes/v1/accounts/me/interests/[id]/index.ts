// DELETE /v1/accounts/me/interests/:id
// Deletes an interest of the user

import { Response } from "express";
import { ExtendedRequest } from "../../../../../../types/request";
import { UserInterests } from "../../../../../../database/wrappers/algorithm/user_interests_wrapper";
import { authorize } from "../../../../../../middleware/authorization";

export default [
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const interestId = parseInt(req.params.id);

            if (isNaN(interestId)) {
                return res.status(400).json({
                    message: "Invalid interest id",
                });
            }

            await UserInterests.deleteInterest(req.user!.id, interestId);

            return res.status(200).json({
                message: "Interest deleted successfully",
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
