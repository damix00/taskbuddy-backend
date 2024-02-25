// This is for the bcrypt utility functions

import bcrypt from "bcrypt";

// How many rounds to use for hashing the password
// The higher the number, the more secure it is, but it also takes longer to hash
const SALT_ROUNDS = 11;

export function hashPassword(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS); // Hash the password
}

export function comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash); // Compare the password with the hash
}
