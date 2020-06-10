const http = require("http");

const httpHandler = require("./src/httpHandler");
const websocketServer = require("./src/websocketServer");

const server = http.Server(httpHandler.handler);

websocketServer.listen(server);

const { PORT = 8080 } = process.env;
server.listen(PORT, function () {
  console.log("listening on *:" + PORT);
});
