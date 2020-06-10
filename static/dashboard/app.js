// Get all the elements
var logs = document.getElementById("logs");
var form = document.querySelector("form");
var teamname = document.getElementById("teamname");
if ("teamname" in localStorage)
  teamname.value = localStorage.getItem("teamname");
var msg = document.getElementById("msg");
if ("msg" in localStorage) msg.value = localStorage.getItem("msg");

//Helper function
function EventEmitter() {
  var cbs = {};

  return {
    on: function (event, cb) {
      cbs[event] = event in cbs ? [...cbs[event], cb] : [cb];
    },

    emit: function (event, data) {
      if (event in cbs) {
        for (var i = 0; i < cbs[event].length; i++) {
          cbs[event][i](data);
        }
      }
    },
  };
}

// Create all the websocket connections
function createWSConnection(url, _listener) {
  var ws = new WebSocket(url);

  var listener = _listener || EventEmitter();

  ws.onopen = function () {
    listener.emit("open");
  };
  ws.onmessage = function (msg) {
    listener.emit("msg", msg);
  };

  listener.send = function (msg) {
    ws.send(msg);
  };

  ws.onclose = function () {
    ws.onopen = undefined;
    ws.onmessage = undefined;
    setTimeout(function () {
      listener.send = undefined;
      console.log("socket " + url + " has disconnected, reconnecting...");
      createWSConnection(url, listener);
    }, 1000);
  };

  return listener;
}

var socketServer =
  (window.location.protocol.includes("s") ? "wss://" : "ws://") +
  window.location.host;

var dashws = createWSConnection(socketServer + "/db");
dashws.on("open", function () {
  console.log("dashboard connected");
});

dashws.on("msg", function (msg) {
  logs.innerHTML += msg.data + "<br>";
});

var ws = createWSConnection(socketServer);
ws.on("open", function () {
  console.log("normal connected");
});

// Listen to all the form events
form.addEventListener("submit", function (ev) {
  ev.preventDefault();

  let m = msg.value;
  var name = teamname.value;

  try {
    m = JSON.parse(m);
  } catch (err) {
    //ignore this
  }

  localStorage.setItem("teamname", name);
  localStorage.setItem("msg", msg.value);

  if (typeof m === "object") {
    m.display = true;
    m.teamname = name;
    ws.send(JSON.stringify(m));
  } else {
    ws.send(
      JSON.stringify({
        display: true,
        teamname: teamname,
        msg: m,
      })
    );
  }
});
