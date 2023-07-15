import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../types/request";

export default function userAgent(req: ExtendedRequest, res: Response, next: NextFunction) {
    req.userAgent = req.get('User-Agent') || '';
    next();
}