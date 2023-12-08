import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../types/request";
import _update from "./_update";
import { CategoryReads } from "../../../../database/wrappers/posts/categories/wrapper";

export default [
    async (req: ExtendedRequest, res: Response) => {
        try {
            if (req.method.toUpperCase() === "GET") {
                const categories = await CategoryReads.fetchWithTags();

                if (!categories) {
                    return res.status(500).json({
                        message: "Internal server error",
                    });
                }

                const resp = categories.map((item) => {
                    return {
                        category_id: item.category.category_id,
                        translations: item.category.translations,
                        tags: item.tags.map((tag) => {
                            return {
                                tag_id: tag.tag_id,
                                translations: tag.translations,
                            };
                        }),
                    };
                });

                return res.status(200).json({ categories: resp });
            } else if (req.method.toUpperCase() === "UPDATE") {
                _update(req, res);
            } else {
                return res.status(405).json({
                    message: "Method Not Allowed",
                });
            }
        } catch (e) {
            console.error(e);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
