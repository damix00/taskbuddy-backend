import { User } from "../src/database/wrappers/accounts/users";
import { generateUUID } from "../src/database/wrappers/accounts/users/queries/utils";
import * as connection from "../src/database/connection";
import {
    UserReads,
    UserWrites,
} from "../src/database/wrappers/accounts/users/wrapper";

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
        user = new User(
            (await UserWrites.addUser({
                uuid: uuid as string,
                email: "test@gmail.com",
                phone_number: "1234567890",
                username: "testuser",
                password_hash: "password",
                first_name: "Test",
                last_name: "User",
            }))!
        );

        expect(user).toBeTruthy();
    });

    it("gets a user by ID", async () => {
        const userById = await UserReads.getUserById(user.id);

        expect(userById).toBeTruthy();
        expect(userById?.id).toBe(user.id);
    });

    it("gets a user by UUID", async () => {
        const userByUUID = await UserReads.getUserByUUID(user.uuid);
        expect(userByUUID).toBeTruthy();
        expect(userByUUID?.uuid).toBe(user.uuid);
    });

    it("gets a user by email", async () => {
        const userByEmail = await UserReads.getUserByEmail(user.email);
        expect(userByEmail).toBeTruthy();
        expect(userByEmail?.email).toBe(user.email);
    });

    it("gets a user by username", async () => {
        const userByPhoneNumber = await UserReads.getUserByUsername(
            user.username
        );
        expect(userByPhoneNumber).toBeTruthy();
        expect(userByPhoneNumber?.username).toBe(user.username);
    });

    it("changes a user's password", async () => {
        const current = user.password_hash;
        const newPass = "newPassword";

        expect(await user.changePassword(newPass)).toBeTruthy();
        expect(user.password_hash).not.toBe(current);
    });

    it("deletes a user", async () => {
        expect(await user.deleteUser()).toBeTruthy();
    });

    // This test is disabled because it causes the test suite to hang

    // it("disconnects from the database", async () => {
    //     expect(await connection.disconnect()).toBeTruthy();
    // });
});
