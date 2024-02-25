import { Request } from "express";
import { User } from "../database/wrappers/accounts/users";
import { UploadedFile } from "express-fileupload";
import { Profile } from "../database/wrappers/accounts/profiles";

// This is the extended request object that we will use throughout the application
export interface ExtendedRequest extends Request {
    userAgent: string; // This is the user agent of the request
    user?: User | null; // This is the user object of the request if the user is authenticated
    login_id: number; // This is the login id of the user
    profile?: Profile | null; // This is the profile object of the request if the user is authenticated
    files: { [key: string]: UploadedFile }; // This is the files object of the request
}
