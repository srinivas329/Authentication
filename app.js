const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const bcrypt = require("bcrypt");
app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initializeDbAndServer();

app.post("/register/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = bcrypt.hash(password, 10);
  const sqlQuery = `SELECT * FROM user WHERE username = ${username}`;
  const result = await db.get(sqlQuery);
  if (result === undefined) {
    if (password.length >= 5) {
      const createUser = `INSERT INTO user (username, name, password, gender, location) VALUES ('${username}','${name}','${hashedPassword}','${gender}','${location}')`;
      await db.run(createUser);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});
