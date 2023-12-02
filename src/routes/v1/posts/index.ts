// POST /v1/posts - Create a new post

import { Response } from "express";
import { ExtendedRequest } from "../../../types/request";
import { authorize } from "../../../middleware/authorization";
import { requireMethod } from "../../../middleware/require_method";
import { UploadedFile } from "express-fileupload";

export default [
    authorize(false),
    requireMethod("POST"),
    (req: ExtendedRequest, res: Response) => {
        try {
            const {
                job_type,
                title,
                description,
                location_lat,
                location_lon,
                location_name,
                is_remote,
                is_urgent,
                price,
                suggestion_radius,
                start_date,
                end_date,
                tags,
            } = req.body;

            const media: UploadedFile[] = [];

            for (const key in req.files) {
                media.push(req.files[key] as UploadedFile);
            }

            console.log(req.body);

            if (
                job_type === undefined ||
                !title ||
                !description ||
                is_remote === undefined ||
                is_urgent === undefined ||
                !price ||
                !suggestion_radius ||
                !start_date ||
                !end_date ||
                !tags ||
                !media ||
                media.length < 3 ||
                media.length > 20
            ) {
                return res
                    .status(400)
                    .json({ message: "Missing required fields" });
            }
        } catch (err) {
            return res.status(400).json({ message: "Internal server error" });
        }
    },
];
