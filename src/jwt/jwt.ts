import jwt from 'jsonwebtoken';

export type UserPayload = {
    id: number; // User ID
    uuid: string; // Unique identifier
    email: string; // Email address
    phone_number: string; // Phone number
    password_hash: string; // Password hash
    token_version: number; // Token version
    created_at: Date; // Creation date
};

export function signToken(payload: UserPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload {
    return jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
}