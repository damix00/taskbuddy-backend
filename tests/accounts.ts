import * as users from './database/accounts/users';
import { generateUUID } from '../src/database/accounts/users/utils';
import { User } from './database/accounts/users';
import * as connection from '../src/database/connection';

describe("Account database queries", () => {
    it("connects to the database", async () => {
        expect(await connection.connect()).toBeTruthy();
    });

    let user: User;
    let uuid: any;

    it("generates a UUID for a new user", async () => {
        uuid = await generateUUID();
        expect(uuid).toBeTruthy();
    });

    it("adds a user to the database", async () => {
        user = (await users.addUser({
            uuid: uuid as string,
            email: "test@gmail.com",
            password_hash: "password",
            first_name: "Test",
            last_name: "User",
            phone_number: "1234567890"
        }))!;

        expect(user).toBeTruthy();
    });

    it("gets a user by ID", async () => {
        const userById = await users.getUserById(user.id);
        expect(userById).toBeTruthy();
        expect(userById?.id).toBe(user.id);
    });

    it("gets a user by UUID", async () => {
        const userByUUID = await users.getUserByUUID(user.uuid);
        expect(userByUUID).toBeTruthy();
        expect(userByUUID?.uuid).toBe(user.uuid);
    });

    it("gets a user by email", async () => {
        const userByEmail = await users.getUserByEmail(user.email);
        expect(userByEmail).toBeTruthy();
        expect(userByEmail?.email).toBe(user.email);
    });

    it("gets a user by phone number", async () => {
        const userByPhoneNumber = await users.getUserByPhoneNumber(user.phone_number);
        expect(userByPhoneNumber).toBeTruthy();
        expect(userByPhoneNumber?.phone_number).toBe(user.phone_number);
    });

    it("verifies a user's phone number", async () => {
       expect(await user.verifyPhoneNumber()).toBeTruthy(); 
    });

    it("changes a user's password", async () => {
        const current = user.password_hash;
        const newPass = "newPassword";

        expect(await user.changePassword(newPass)).toBeTruthy();
        expect(user.password_hash).not.toBe(current);
    });

    it('soft-deletes an account', async () => {
        expect(await user.delete()).toBeTruthy();  
    });

    it("disconnects from the database", async () => {
        expect(await connection.disconnect()).toBeTruthy();
    });
});