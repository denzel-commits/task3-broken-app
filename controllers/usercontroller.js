const router = require("express").Router();
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { sequelize, Sequelize } = require("../db");

const User = require("../models/user")(sequelize, Sequelize.DataTypes);

router.post("/signup", async (req, res) => {
  const userWithEmail = await User.findOne({
    where: { email: req.body.user.email },
  });
  if (userWithEmail) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ message: "Email is already taken." });
  }

  const userWithUsername = await User.findOne({
    where: { username: req.body.user.username },
  });
  if (userWithUsername) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ message: "Username is already taken." });
  }

  User.create({
    full_name: req.body.user.full_name,
    username: req.body.user.username,
    passwordHash: bcrypt.hashSync(req.body.user.password, 10),
    email: req.body.user.email,
  }).then(
    function signupSuccess(user) {
      res.status(StatusCodes.CREATED).json({
        user: user,
      });
    },

    function signupFail(err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
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
            const token = jwt.sign({ id: user.id }, "lets_play_sum_games_man", {
              expiresIn: 60 * 60 * 24,
            });
            res.json({
              message: "Successfully authenticated.",
              sessionToken: token,
            });
          } else {
            res
              .status(StatusCodes.NOT_FOUND)
              .send({ error: "Passwords do not match." });
          }
        }
      );
    } else {
      res
        .status(StatusCodes.NOT_FOUND)
        .send({ error: ReasonPhrases.NOT_FOUND });
    }
  });
});

module.exports = router;
