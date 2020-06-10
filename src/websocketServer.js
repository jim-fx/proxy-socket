const db = require("./database");

const WebSocket = require("ws");
const url = require("url");

const wss = new WebSocket.Server({ noServer: true });
const dashboard = new WebSocket.Server({ noServer: true });

function broadcast(server, data, ws) {
  const msg = JSON.stringify(data);

  server.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

const handleMessage = (data) => {
  let { teamname = data.team } = data;
  if (!teamname) teamname = "unknown";
  data.teamname = teamname;

  if (data.keep === true) {
    db.save(data, teamname);
  }

  broadcast(wss, data);
  broadcast(dashboard, data);
};

const listen = (server) =>
  server.on("upgrade", (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;

    if (pathname === "/") {
      wss.handleUpgrade(request, socket, head, function done(ws) {
        ws.send(`{ "connected": true }`);

        ws.on("message", function incoming(msg) {
          try {
            const data = JSON.parse(msg);

            if (data.keep || data.display) {
              broadcast(dashboard, data);
            }

            let { teamname = data.team } = data;
            if (!teamname) teamname = "unknown";
            data.teamname = teamname;

            if (data.keep === true) {
              db.save(data, teamname);
            }

            broadcast(wss, data, ws);
          } catch (error) {
            console.log(error);
          }
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
