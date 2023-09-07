import checkExistence from "./v1/accounts/check-existence";
import create from "./v1/accounts/create";
import login from "./v1/accounts/login";
import me from "./v1/accounts/me";
import ping from "./v1/ping";

export type route = {
    path: string;
    handler: any;
};

const userRoutes: route[] = [
    {
        path: "/v1/accounts/me",
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
    {
        path: "/v1/ping",
        handler: ping,
    },
    ...userRoutes,
];

export default routes;
