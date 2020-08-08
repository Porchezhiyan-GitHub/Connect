const bcrypt = require("bcryptjs");
const config = require("config");
const express = require("express");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");

const router = express.Router();

//@route POST /api/users
//@desc registers a user
//@access public
router.post(
  "/",
  [
    check("name", "name is required").not().isEmpty(),
    check("email", "enter a valid email").isEmail(),
    check("password", "password should be atleast 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        return res.status(400).json({
          errors: err.array(),
        });
      }

      const { name, email, password, date } = req.body;

      //check if email is already registered.
      const user = await User.exists({ email });
      if (user) {
        return res.status(400).json({
          errors: [
            {
              msg: "user already registered.",
            },
          ],
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPW = await bcrypt.hash(password, salt);

      //register user
      const newUser = User({
        name,
        email,
        password: hashedPW,
        date,
      });
      await newUser.save();

      const payLoad = {
        user: {
          id: newUser.id,
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
