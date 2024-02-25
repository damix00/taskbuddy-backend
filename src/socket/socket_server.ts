import { Server } from "socket.io";
import { createAdapter } from "@socket.io/postgres-adapter";
import { executeQuery, getPool } from "../database/connection";
import authorizeSocket from "./authorization";

let io: Server;

export async function initSocketServer(server: any) {
    // Create the table if it doesn't exist
    // This is for making load balancing work with socket.io using the Postgres adapter
    await executeQuery(`CREATE TABLE IF NOT EXISTS socket_io_attachments (
        id          bigserial UNIQUE,
        created_at  timestamptz DEFAULT NOW(),
        payload     bytea
    )`);

    io = new Server(server); // Create the socket.io server
    io.adapter(createAdapter(getPool())); // Use the Postgres adapter for socket.io

    io.on("connection", async (socket) => {
        console.log("Socket connected");

        const headers = socket.handshake.headers;

        if (!headers.authorization) {
            // Disconnect the socket if the authorization header is not present
            socket.disconnect(true);
        }

        const user = await authorizeSocket(headers.authorization!); // Authorize the user

        if (!user) {
            socket.disconnect(true); // Disconnect the socket if the user is not authorized
            return;
        }

        console.log(`User ${user!.username} connected`);
        socket.join(user!.uuid); // Join the room with the user's UUID

        socket.on("disconnect", () => {
            console.log(
                `Socket disconnected from user ${user?.username || "unknown"}`
            );
        });
    });
}

export function emitToUser(uuid: string, event: string, ...args: any[]) {
    io.to(uuid).emit(event, ...args); // Emit the event to the user's room
}
