"use strict";
//@ts-nocheck
const { useSocketServer } = require("socket-controllers");
const { Server } = require("socket.io");
const socketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
        },
    });
    // io.on("connection", (socket) => {
    // });
    useSocketServer(io, { controllers: [__dirname + "/api/controllers/*.ts"] });
    return io;
};
module.exports = socketServer;
