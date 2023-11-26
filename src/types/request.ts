import { Request } from "express";
import { User } from "../database/wrappers/accounts/users";
import { UploadedFile } from "express-fileupload";
import { Profile } from "../database/wrappers/accounts/profiles";

export interface ExtendedRequest extends Request {
    userAgent: string;
    user?: User | null;
    login_id: number;
    profile?: Profile | null;
    files: { [key: string]: UploadedFile };
}
