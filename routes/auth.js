const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const fetchuser = require("../midleware/fetchuser");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const JWT_token = "hello!@#mynameisvansh";

//Router 1: creating a user using: POST "/api/auth/createuser"
router.post(
  "/createuser",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("username", "Name should be 3 character long").isLength({ min: 3 }),
    body("password", "PAssword should be 8 character long").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    let success = false;
    //if error occurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      //check weather user with same email exist already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, errors: "A user alredy exsists with this email  " });
      }
      const salt = await bcrypt.genSalt(10);
      const cryptedpassword = await bcrypt.hash(req.body.password, salt);
      //create new user
      user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: cryptedpassword,
      });
      // .then(user => res.json(user)).catch(res.json({error: "Please enter a unique value"}))
      const data = {
        user: {
          id: user.id,
        },
      };
      const jwtdata = jwt.sign(data, JWT_token);
      console.log(jwtdata);
      success = true;
      res.json({ success, Authtoken: jwtdata });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("error occured! ");
    }
  }
);
//Router 2 : login a user using: GET api/auth/login
router.post(
  "/login",
  [
    body("email", "Enter an Email").isEmail(),
    body("password", "Password cant not be null").exists(),
  ],
  async (req, res) => {
    //if error occurs
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        res
          .status(400)
          .json({ success, error: "Please Enter Correct Credentials" });
      }

      const passwordcompare = await bcrypt.compare(password, user.password);
      if (!passwordcompare) {
        success = false;
        res
          .status(400)
          .json({ success, error: "Please Enter Correct Credentials" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const jwtdata = jwt.sign(data, JWT_token);
      success = true;
      res.json({ success, Authtoken: jwtdata });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Not Responding");
    }
  }
);

//Router 3 : Getting user details POST : api/auth/getuser
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    let userid = await req.user.id;
    const user = await User.findById(userid).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Not Responding");
  }
});

module.exports = router;
