const bcrypt = require("bcryptjs");
const config = require("config");
const express = require("express");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const auth = require("../../middleware/auth");
const User = require("../../models/User");

const router = express.Router();

//@route /api/auth
//@method GET
//@access Protected
router.get("/", auth, async (req, res) => {
  try {
    console.log(req.user);
    res.json(await User.findById(req.user.id).select("-password"));
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
});

//@route POST /api/auth
//@desc Logs in a user. (gets jwt from email and password)
//@access public
router.post(
  "/",
  [
    check("email", "enter a valid email.").isEmail(),
    check("password", "password is required.").exists(),
  ],
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        return res.status(400).json({
          errors: err.array(),
        });
      }
      console.log(req.body);
      const { email, password } = req.body;

      //check if email is already registered.
      const isUserExists = await User.exists({ email: email });
      if (!isUserExists) {
        return res.status(400).json({
          errors: [
            {
              msg: "invalid credentials",
            },
          ],
        });
      }

      const user = await User.findOne({ email });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          errors: [
            {
              msg: "invalid credentials",
            },
          ],
        });
      }

      const payLoad = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payLoad,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.log(error);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
