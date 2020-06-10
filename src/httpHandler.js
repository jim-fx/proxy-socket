const express = require("express");
const path = require("path");
const app = express();
const ws = require("./websocketServer");
const db = require("./database");
const bodyParser = require("body-parser");

// Handle static website
app.use(express.static(path.resolve(__dirname, "../static")));

app.use(bodyParser.json());

app.post("/api/:teamname", (req, res) => {
  const { teamname = false } = req.params;
  if (!teamname || teamname.length === 0) {
    res
      .json({
        message:
          "Teamname seems to be missing or malformed, pls post /api/{teamname}",
      })
      .status(400);
  } else {
    req.body.teamname = teamname;
    ws.handleMessage(req.body);

    res.json({
      teamname,
      received: true,
    });
  }
});

app.get("/api/:teamname", (req, res) => {
  const { teamname = false } = req.params;
  if (!teamname || teamname.length === 0) {
    res
      .json({
        message:
          "Teamname seems to be missing or malformed, pls get /api/{teamname}",
      })
      .status(400);
  } else {
    res.json(db.get(teamname));
  }
});

const listeners = {};

module.exports = {
  handler: app,
  on: (event, cb) => {
    listeners[event] = event in listeners ? [...listeners.event, cb] : [cb];
  },
};
