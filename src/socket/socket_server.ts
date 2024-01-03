import { Server } from "socket.io";
import { createAdapter } from "@socket.io/postgres-adapter";
import { executeQuery, getPool } from "../database/connection";
import authorizeSocket from "./authorization";

let io: Server;

export async function initSocketServer(server: any) {
    await executeQuery(`CREATE TABLE IF NOT EXISTS socket_io_attachments (
        id          bigserial UNIQUE,
        created_at  timestamptz DEFAULT NOW(),
        payload     bytea
    )`);

    io = new Server(server);
    io.adapter(createAdapter(getPool()));

    io.on("connection", async (socket) => {
        console.log("Socket connected");

        const headers = socket.handshake.headers;

        if (!headers.authorization) {
            socket.disconnect(true);
        }

        const user = await authorizeSocket(headers.authorization!);

        if (!user) {
            socket.disconnect(true);
        }

        console.log(`User ${user!.username} connected`);
        socket.join(user!.uuid);

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });
    });
}

export function emitToUser(uuid: string, event: string, ...args: any[]) {
    io.to(uuid).emit(event, ...args);
}
