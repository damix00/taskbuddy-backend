import { v4 as uuidv4 } from "uuid";
import { doesUUIDExist } from "./user_existence";

/**
 * Generate a UUID with a prefix to prevent collisions with existing UUIDs
 * @param prefix
 * @returns {Promise<string>} UUID
 */
export async function generateUUID(prefix: string = "sw_") { // prefix is to prevent collisions
    let u: string; // uuid

    do {
        u = prefix + uuidv4();
    }
    while (await doesUUIDExist(u));

    return u;
}