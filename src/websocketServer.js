const db = require("./database");

const WebSocket = require("ws");
const url = require("url");

const wss = new WebSocket.Server({ noServer: true });
const dashboard = new WebSocket.Server({ noServer: true });

function broadcast(socketServer, data, socket) {
  const msg = JSON.stringify(data);
  socketServer.clients.forEach(function each(client) {
    if (client !== socket && client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

const handleMessage = (data, socket) => {
  let { teamname = data.team } = data;
  if (!teamname) teamname = "unknown";
  data.teamname = teamname;

  console.log(data, typeof data);

  if (data.keep === true) {
    db.save(data, teamname);
  }

  broadcast(wss, data, socket);
  broadcast(dashboard, data, socket);
};

const listen = (server) =>
  server.on("upgrade", (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;

    console.log("[SOCKET] server connected on " + pathname);

    if (pathname === "/") {
      wss.handleUpgrade(request, socket, head, function done(ws) {
        ws.send(`{ "connected": true }`);
        ws.on("message", (msg) => {
          try {
            handleMessage(JSON.parse(msg), ws);
          } catch (error) {}
        });
      });
    } else if (pathname === "/db") {
      dashboard.handleUpgrade(request, socket, head, function done(ws) {
        ws.send(`{ "connected": true }`);
      });
    } else {
      socket.destroy();
    }
  });

module.exports = {
  listen,
  handleMessage,
};
