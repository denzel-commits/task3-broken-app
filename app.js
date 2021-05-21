var express = require("express");
var app = express();
var db = require("./db");
var user = require("./controllers/usercontroller");
var game = require("./controllers/gamecontroller");

require("dotenv").config();

db.sequelize.sync();

app.use(express.json());

app.use("/api/auth", user);
app.use(require("./middleware/validate-session"));
app.use("/api/game", game);

app.listen(process.env.LISTEN_PORT, function () {
  console.log(
    `App is listening on http://localhost:${process.env.LISTEN_PORT}`
  );
});
