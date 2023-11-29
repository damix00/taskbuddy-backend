import checkExistence from "./v1/accounts/check-existence";
import create from "./v1/accounts/create";
import login from "./v1/accounts/login";
import me from "./v1/accounts/me";
import profile from "./v1/accounts/me/profile";
import callPhone from "./v1/accounts/verification/phone/call";
import sendPhone from "./v1/accounts/verification/phone/send";
import verifyPhone from "./v1/accounts/verification/phone/verify";
import ping from "./v1/ping";
import tags from "./v1/posts/tags";

export type route = {
    path: string;
    handler: any;
};

const postRoutes: route[] = [
    {
        path: "/v1/posts/tags",
        handler: tags,
    },
];

const meRoutes: route[] = [
    {
        path: "/v1/accounts/me/profile",
        handler: profile,
    },
];

const verificationRoutes: route[] = [
    {
        path: "/v1/accounts/verification/phone/send",
        handler: sendPhone,
    },
    {
        path: "/v1/accounts/verification/phone/call",
        handler: callPhone,
    },
    {
        path: "/v1/accounts/verification/phone/verify",
        handler: verifyPhone,
    },
];

const userRoutes: route[] = [
    ...meRoutes,
    ...verificationRoutes,
    {
        path: "/v1/accounts/me/",
        handler: me,
    },
    {
        path: "/v1/accounts/login",
        handler: login,
    },
    {
        path: "/v1/accounts/create",
        handler: create,
    },
    {
        path: "/v1/accounts/check-existence",
        handler: checkExistence,
    },
];

const routes: route[] = [
    ...userRoutes,
    ...postRoutes,
    {
        path: "/v1/ping",
        handler: ping,
    },
];

export default routes;
