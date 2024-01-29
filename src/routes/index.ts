import checkExistence from "./v1/accounts/check-existence";
import create from "./v1/accounts/create";
import login from "./v1/accounts/login";
import me from "./v1/accounts/me";
import profile from "./v1/accounts/me/profile";
import callPhone from "./v1/accounts/verification/phone/call";
import sendPhone from "./v1/accounts/verification/phone/send";
import verifyPhone from "./v1/accounts/verification/phone/verify";
import ping from "./v1/ping";
import posts from "./v1/posts";
import tags from "./v1/posts/tags";
import mePosts from "./v1/accounts/me/posts";
import post_slug from "./v1/posts/[uuid]";
import search from "./v1/search";
import nearby from "./v1/posts/nearby";
import follow from "./v1/accounts/[uuid]/follow";
import accounts from "./v1/accounts/[uuid]";
import getAccountPosts from "./v1/accounts/[uuid]/posts";
import like from "./v1/posts/[uuid]/interactions/like";
import bookmark from "./v1/posts/[uuid]/interactions/bookmark";
import meBookmarks from "./v1/accounts/me/posts/bookmarks";
import share from "./v1/posts/[uuid]/interactions/share";
import fcm from "./v1/accounts/me/fcm";
import test_fcm from "./v1/accounts/me/test_fcm";
import initiate from "./v1/channels/posts/[post_uuid]/initiate";
import post_channel from "./v1/channels/posts/[post_uuid]";
import get_channel from "./v1/channels/[uuid]";
import get_channel_messages from "./v1/channels/[uuid]/messages";
import send_message from "./v1/channels/[uuid]/messages/send";
import incoming from "./v1/channels/incoming";
import outgoing from "./v1/channels/outgoing";
import seen from "./v1/channels/[uuid]/seen";
import message_uuid from "./v1/channels/[uuid]/messages/[message_uuid]";
import worker from "./v1/channels/[uuid]/actions/worker";
import status from "./v1/channels/[uuid]/messages/[message_uuid]/status";
import cancel from "./v1/channels/[uuid]/actions/cancel";
import price from "./v1/channels/[uuid]/actions/negotiate/price";
import date from "./v1/channels/[uuid]/actions/negotiate/date";
import complete from "./v1/channels/[uuid]/actions/complete";
import review from "./v1/channels/[uuid]/messages/[message_uuid]/review";
import meReviews from "./v1/accounts/me/reviews";
import reviews from "./v1/accounts/[uuid]/reviews";
import feedPosts from "./v1/sessions/[id]/posts";
import sessionId from "./v1/sessions/[id]";
import sessionsHandler from "./v1/sessions";
import block from "./v1/accounts/[uuid]/block";
import blocked from "./v1/accounts/me/blocked";
import friends from "./v1/accounts/me/friends";
import interests from "./v1/accounts/me/interests";
import handleInterest from "./v1/accounts/me/interests/[id]";

export type route = {
    path: string;
    handler: any;
};

const postRoutes: route[] = [
    {
        path: "/v1/posts/tags",
        handler: tags,
    },
    {
        path: "/v1/posts/nearby",
        handler: nearby,
    },
    {
        path: "/v1/posts/:uuid/interactions/like",
        handler: like,
    },
    {
        path: "/v1/posts/:uuid/interactions/bookmark",
        handler: bookmark,
    },
    {
        path: "/v1/posts/:uuid/interactions/share",
        handler: share,
    },
    {
        path: "/v1/posts/:uuid",
        handler: post_slug,
    },
    {
        path: "/v1/posts",
        handler: posts,
    },
];

const meRoutes: route[] = [
    {
        path: "/v1/accounts/me/posts/bookmarks",
        handler: meBookmarks,
    },
    {
        path: "/v1/accounts/me/posts",
        handler: mePosts,
    },
    {
        path: "/v1/accounts/me/reviews",
        handler: meReviews,
    },
    {
        path: "/v1/accounts/me/profile",
        handler: profile,
    },
    {
        path: "/v1/accounts/me/fcm",
        handler: fcm,
    },
    {
        path: "/v1/accounts/me/blocked",
        handler: blocked,
    },
    {
        path: "/v1/accounts/me/friends",
        handler: friends,
    },
    {
        path: "/v1/accounts/me/interests",
        handler: interests,
    },
    {
        path: "/v1/accounts/me/interests/:id",
        handler: handleInterest,
    },
    {
        path: "/v1/accounts/me/test_fcm",
        handler: test_fcm,
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
    {
        path: "/v1/accounts/:uuid/follow",
        handler: follow,
    },
    {
        path: "/v1/accounts/:uuid/block",
        handler: block,
    },
    {
        path: "/v1/accounts/:uuid/posts",
        handler: getAccountPosts,
    },
    {
        path: "/v1/accounts/:uuid/reviews",
        handler: reviews,
    },
    {
        path: "/v1/accounts/:uuid",
        handler: accounts,
    },
];

const messageRoutes: route[] = [
    {
        path: "/v1/channels/:uuid/messages/send",
        handler: send_message,
    },
    {
        path: "/v1/channels/:uuid/messages/:message_uuid/status",
        handler: status,
    },
    {
        path: "/v1/channels/:uuid/messages/:message_uuid/review",
        handler: review,
    },
    {
        path: "/v1/channels/:uuid/messages/:message_uuid",
        handler: message_uuid,
    },
    {
        path: "/v1/channels/:uuid/messages",
        handler: get_channel_messages,
    },
];

const channelActions: route[] = [
    {
        path: "/v1/channels/:uuid/actions/worker",
        handler: worker,
    },
    {
        path: "/v1/channels/:uuid/actions/cancel",
        handler: cancel,
    },
    {
        path: "/v1/channels/:uuid/actions/complete",
        handler: complete,
    },
    {
        path: "/v1/channels/:uuid/actions/negotiate/price",
        handler: price,
    },
    {
        path: "/v1/channels/:uuid/actions/negotiate/date",
        handler: date,
    },
];

const channelRoutes: route[] = [
    {
        path: "/v1/channels/posts/:post_uuid/initiate",
        handler: initiate,
    },
    {
        path: "/v1/channels/posts/:post_uuid",
        handler: post_channel,
    },
    {
        path: "/v1/channels/:uuid/seen",
        handler: seen,
    },
    {
        path: "/v1/channels/incoming",
        handler: incoming,
    },
    {
        path: "/v1/channels/outgoing",
        handler: outgoing,
    },
    ...channelActions,
    {
        path: "/v1/channels/:uuid",
        handler: get_channel,
    },
];

const sessions: route[] = [
    {
        path: "/v1/sessions/:id/posts",
        handler: feedPosts,
    },
    {
        path: "/v1/sessions/:id",
        handler: sessionId,
    },
    {
        path: "/v1/sessions",
        handler: sessionsHandler,
    },
];

const routes: route[] = [
    ...messageRoutes,
    ...channelRoutes,
    ...userRoutes,
    ...postRoutes,
    ...sessions,
    {
        path: "/v1/ping",
        handler: ping,
    },
    {
        path: "/v1/search",
        handler: search,
    },
];

export default routes;
