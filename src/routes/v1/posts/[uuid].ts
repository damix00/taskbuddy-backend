import { Response } from "express";
import { requireMethods } from "../../../middleware/require_method";
import { ExtendedRequest } from "../../../types/request";

export default [
    requireMethods(["GET", "POST", "UPDATE", "DELETE"]),
    async (req: ExtendedRequest, res: Response) => {
        res.status(200).json({
            message: "Hello world!",
        });
    },
];
