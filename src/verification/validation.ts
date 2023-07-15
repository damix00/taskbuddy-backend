const EMAIL_REGEX = /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export function validateEmail(email: string): boolean {
    return email.length <= 256 && EMAIL_REGEX.test(email);
}

export function validatePassword(password: string): boolean {
    return password.length >= 6 && password.length < 50;
}

export function validateName(name: string): boolean {
    return name.length >= 1 && name.length < 50;
}