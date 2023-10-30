// Get the current user's information

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { getUserProfileResponse } from "../../../../utils/responses";
import { ExtendedRequest } from "../../../../types/request";

export default [
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        res.status(200).json(
            getUserProfileResponse(req.user!, req.login_id, req.profile!)
        );
    },
];
