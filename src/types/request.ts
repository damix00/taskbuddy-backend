import { Request } from 'express';
import { User } from '../database/accounts/users';

export interface ExtendedRequest extends Request {
    userAgent: string;
    user: User;
};