const db = {};

module.exports = {
  save: (msg, teamname) => {
    console.log("save", msg, teamname);
    msg.created_at = Date.now();
    if (teamname in db) db[teamname].push(msg);
    else db[teamname] = [msg];
  },
  get: (teamname) => {
    return db[teamname];
  },
};
