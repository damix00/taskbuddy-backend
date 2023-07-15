// GET /v1/ping - Checks server status

import { requireMethod } from "../../middleware/require_method";
import { Request, Response } from "express";

export default [requireMethod("GET"), (req: Request, res: Response) => {
    res.status(200).json({
        uptime: process.uptime(),
        ip: req.ip,
        server_time: Date.now()
    });
}];