import * as users from '../src/database/accounts/users';
import * as connection from '../src/database/connection';
import { getUserById } from '../src/database/accounts/users/reads';

describe("Test dates in the database", () => {
    it("connects to the database", async () => {
        expect(await connection.connect()).toBeTruthy();
    });

    it("should return a date", async () => {
        const user = await getUserById(1);

        expect(user).toBeTruthy();

        if (user) {
            expect(typeof user.created_at).toBe('object');
        }
    });

    it("disconnects from the database", async () => {
        expect(await connection.disconnect()).toBeTruthy();
    });
});