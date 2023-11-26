import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../types/request";
import _update from "./_update";
import { CategoryReads } from "../../../../database/wrappers/posts/categories/wrapper";

export default [
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        if (req.method.toUpperCase() === "GET") {
            const categories = await CategoryReads.fetchWithTags();

            return res.status(200).json({
                categories,
            });
        } else if (req.method.toUpperCase() === "UPDATE") {
            _update(req, res);
        } else {
            return res.status(405).json({
                message: "Method Not Allowed",
            });
        }
    },
];
