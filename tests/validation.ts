import * as validation from "../src/verification/validation";
import { describe, it, expect } from "@jest/globals";

describe("Email validation", () => {
    it("should return true for a valid email address", () => {
        expect(validation.validateEmail("test@example.com")).toBe(true);
    });

    it("should return false for an invalid email address", () => {
        expect(validation.validateEmail("invalid.email")).toBe(false);
    });

    const validEmails = [
        "john.doe@example.co.uk",
        "jane_doe123@example-domain.com",
        "bob.smith+work@example.com",
        "info@subdomain.example.org",
        "support@123-website.io",
        "user.name@example.travel",
        "sales@company-name.co",
        "jenny_2022@example.email",
        "1234567890@example.com",
        "email+with_plus@gmail.com",
        "contact@very-long-domain-name-with-many-characters-for-example.com",
        // 'admin@[IPv6:2001:db8::1]', // TODO: add support for IPv6 and IPv4
    ];

    const invalidEmails = [
        "user@example",
        "@example.com",
        "john@doe@company.com",
        "jane.doe@example..com",
        "user@-example.com",
        "user@example_domain.com",
        "user name@example.com",
        "user@com",
        "user@[IPv6:2001:db8:1::2]",
    ];

    for (const validEmail of validEmails) {
        it(`should return true for ${validEmail}`, () => {
            expect(validation.validateEmail(validEmail)).toBe(true);
        });
    }

    for (const invalidEmail of invalidEmails) {
        it(`should return false for ${invalidEmail}`, () => {
            expect(validation.validateEmail(invalidEmail)).toBe(false);
        });
    }
});
