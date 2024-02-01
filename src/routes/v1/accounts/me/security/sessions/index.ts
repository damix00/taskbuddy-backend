// GET /v1/accounts/me/security/sessions
// Returns a list of logged in devices

import { Response } from "express";
import { authorize } from "../../../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../../../types/request";
import { LoginReads } from "../../../../../../database/wrappers/accounts/logins/wrapper";
import { getLoginResponse } from "../../../responses";

export default [
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const logins = await LoginReads.getLoginsByUserId(req.user!.id);

            res.status(200).json({
                logins: logins.map((login) => getLoginResponse(login)),
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
