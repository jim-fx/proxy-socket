const assert = require("assert");
const { url } = require("inspector");
const MongoClient = require("mongodb").MongoClient;

// Connection URL
const { MONGO_URL = "mongodb://localhost:27017" } = process.env;

// Create a new MongoClient
const client = new MongoClient(MONGO_URL, {
  useUnifiedTopology: true,
});

let db = new Promise((resolve, reject) => {
  // Use connect method to connect to the Server
  client.connect(function (err) {
    if (err) {
      console.error(err);
      reject(err);
    } else {
      console.log("[MONGODB]: connected to " + new URL(MONGO_URL).hostname);
      resolve(client.db("dbName"));
    }
  });
});

module.exports = {
  save: async (msg, teamname = "unknown") => {
    // Make sure we dont work on a reference
    const obj = JSON.parse(JSON.stringify(msg));
    obj.created_at = Date.now();

    await db;

    db.collection(teamname + "_msgs").insertOne(obj);
  },
  get: async (teamname) => {
    await db;
    return db.find({ teamname });
  },
};
