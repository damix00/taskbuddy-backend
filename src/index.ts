import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
import logger from "./middleware/global/logger";
import cluster from "cluster";
import os from "os";
import * as connection from "./database/connection";
import userAgent from "./middleware/global/user_agent";
import route_killswitch from "./middleware/global/route_killswitch";
import * as killswitches from "./utils/global_killswitches";
import fileUpload from "express-fileupload";
import initFirebase from "./firebase/config";
import { createServer } from "http";
import { initSocketServer } from "./socket/socket_server";

dotenv.config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 9500;

// Initialize killswitches
killswitches.init();

// Initialize Firebase
initFirebase();

// File upload handler
app.use(
    fileUpload({
        useTempFiles: true,
        // The OS temp directory
        // for example, on windows %TEMP% (C:\Users\Username\AppData\Local\Temp)
        // on linux /tmp
        tempFileDir: os.tmpdir(),
        limits: {
            fileSize: 1024 * 1024 * 1024, // 1 GB
        },
    })
);
app.use(
    cors({
        origin: "*",
    })
);
app.use(route_killswitch); // Check if route is disabled
app.use(logger);
app.use(express.json());
app.disable("etag"); // Disable 304 responses
// @ts-ignore
app.use(userAgent); // add user agent to request

for (const route of routes) {
    app.use(route.path, route.handler);
}

app.all("*", (req, res) => {
    res.status(404).json({
        message: "Not Found",
    });
});

async function start() {
    console.log("Connecting to database");
    await connection.connect();
    console.log("Connected to database");

    await initSocketServer(server);

    server.listen(PORT, () => {
        console.log(`Server is running in http://localhost:${PORT}`);
    });
}

if (cluster.isMaster) {
    for (
        let i = 0;
        i <
        (process.env?.PRODUCTION_MODE?.toLowerCase() == "true"
            ? os.cpus().length
            : 1);
        i++
    ) {
        cluster.fork();
    }
} else {
    start();
}
