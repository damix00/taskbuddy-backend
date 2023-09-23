import { Request } from "express";
import { User } from "../database/accounts/users";
import { UploadedFile } from "express-fileupload";

export interface ExtendedRequest extends Request {
    userAgent: string;
    user: User;
    files: { [key: string]: UploadedFile };
}
