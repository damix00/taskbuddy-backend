import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../../types/request";
import { getProfileResponse } from "../../responses";
import _update from "./_update";

export default [
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        if (req.method.toUpperCase() === "GET") {
            return res.status(200).json(getProfileResponse(req.profile!));
        } else if (req.method.toUpperCase() === "PATCH") {
            return _update(req, res);
        } else {
            return res.status(405).json({
                message: "Method not allowed",
            });
        }
    },
];
