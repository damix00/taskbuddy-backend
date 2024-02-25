// Used for validating form input

const EMAIL_REGEX =
    /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const USERNAME_REGEX =
    /^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,30}(?:[A-Za-z0-9_]))?)$/;

// Validate an email address
export function validateEmail(email: string): boolean {
    return email.length <= 256 && EMAIL_REGEX.test(email);
}

// Validate a password
export function validatePassword(password: string): boolean {
    return password.length >= 6 && password.length < 50;
}

// Validate a name
export function validateName(name: string): boolean {
    return name.length >= 1 && name.length < 100;
}

// Validate a username
export function validateUsername(username: string): boolean {
    return (
        username.length >= 3 &&
        username.length <= 30 &&
        USERNAME_REGEX.test(username)
    );
}
