const express = require("express");
const path = require("path");
const app = express();
const ws = require("./websocketServer");
const db = require("./database");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(cors());

// Handle static website
app.use(express.static(path.resolve(__dirname, "../static")));

app.use(bodyParser.json());

function assureTeamname(req, res, next) {
  const { teamname = false } = req.params;
  if (!teamname || teamname.length === 0) {
    res
      .json({
        message:
          "Teamname seems to be missing or malformed, pls post /api/{teamname}",
      })
      .status(400);
  } else {
    next();
  }
}

app.post("/api/:teamname", assureTeamname, (req, res) => {
  const { teamname } = req.params;
  req.body.teamname = teamname;

  ws.handleMessage(req.body);

  res.json({
    teamname,
    received: true,
  });
});

app.get("/api/:teamname", assureTeamname, async (req, res) => {
  const { teamname } = req.params;

  const msgs = await db.get(teamname);

  res.json(msgs);
});

module.exports = {
  handler: app,
};
