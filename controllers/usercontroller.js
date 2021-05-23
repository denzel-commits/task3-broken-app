var router = require("express").Router();
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

const { sequelize, Sequelize, sync } = require("../db");

const User = require("../models/user")(sequelize, Sequelize.DataTypes);

router.post("/signup", async (req, res) => {
  const userWithEmail = await User.findOne({
    where: { email: req.body.user.email },
  });
  if (userWithEmail) {
    return res.status(409).json({ message: "Email is already taken." });
  }

  const userWithUsername = await User.findOne({
    where: { username: req.body.user.username },
  });
  if (userWithUsername) {
    return res.status(409).json({ message: "Username is already taken." });
  }

  User.create({
    full_name: req.body.user.full_name,
    username: req.body.user.username,
    passwordHash: bcrypt.hashSync(req.body.user.password, 10),
    email: req.body.user.email,
  }).then(
    function signupSuccess(user) {
      let token = jwt.sign({ id: user.id }, "lets_play_sum_games_man", {
        expiresIn: 60 * 60 * 24,
      });
      res.status(200).json({
        token: token,
      });
    },

    function signupFail(err) {
      res.status(500).send(err.message);
    }
  );
});

router.post("/signin", (req, res) => {
  User.findOne({ where: { username: req.body.user.username } }).then((user) => {
    if (user) {
      bcrypt.compare(
        req.body.user.password,
        user.passwordHash,
        function (err, matches) {
          if (matches) {
            var token = jwt.sign({ id: user.id }, "lets_play_sum_games_man", {
              expiresIn: 60 * 60 * 24,
            });
            res.json({
              message: "Successfully authenticated.",
              sessionToken: token,
            });
          } else {
            res.status(502).send({ error: "Passwords do not match." });
          }
        }
      );
    } else {
      res.status(403).send({ error: "User not found." });
    }
  });
});

module.exports = router;
