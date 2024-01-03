import { Server } from "socket.io";
import { createAdapter } from "@socket.io/postgres-adapter";
import { executeQuery, getPool } from "../database/connection";

let io: Server;

export async function initSocketServer(server: any) {
    await executeQuery(`CREATE TABLE IF NOT EXISTS socket_io_attachments (
        id          bigserial UNIQUE,
        created_at  timestamptz DEFAULT NOW(),
        payload     bytea
    )`);

    io = new Server(server);
    io.adapter(createAdapter(getPool()));

    io.on("connection", (socket) => {
        console.log("Socket connected");

        const headers = socket.handshake.headers;

        if (!headers.authorization) {
            socket.disconnect(true);
        }

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        setInterval(() => {
            socket.emit("test", { message: "Hello" });
        }, 1000);
    });
}
