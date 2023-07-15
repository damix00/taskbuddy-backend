// Get the current user's information

import { Response } from "express";
import { authorize } from "../../../middleware/authorization";
import { getUserResponse } from "../../../utils/responses";
import { ExtendedRequest } from "../../../types/request";

export default [authorize, (req: ExtendedRequest, res: Response) => {
    res.status(200).json(getUserResponse(req.user));
}];