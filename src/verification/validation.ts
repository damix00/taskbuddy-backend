const EMAIL_REGEX = /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const USERNAME_REGEX = /^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,30}(?:[A-Za-z0-9_]))?)$/;

export function validateEmail(email: string): boolean {
    return email.length <= 256 && EMAIL_REGEX.test(email);
}

export function validatePassword(password: string): boolean {
    return password.length >= 6 && password.length < 50;
}

export function validateName(name: string): boolean {
    return name.length >= 1 && name.length < 50;
}

export function validateUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 30 && USERNAME_REGEX.test(username);
}