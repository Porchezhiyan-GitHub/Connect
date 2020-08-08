const config = require("config");
const express = require("express");
const { check, validationResult, body } = require("express-validator");
const request = require("request");

const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { response, json } = require("express");

const router = express.Router();

//@route DELETE /api/profile
//@desc Deletes the current user including the profile, and posts.
//@access protected
router.delete("/", auth, async (req, res) => {
  try {
    //@To-do : delete users posts

    //delete user's profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //delete user's profile
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "user deleted successfully..." });
  } catch (err) {
    console.error(err);
    res.status(500).send("server error...");
  }
});

//@route DELETE /api/profile/experience/:expId
//@desc Deletes the experience corresponding to expId
//@access protected
router.delete("/experience/:expId", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experiences = profile.experiences.filter(
      (exp) => exp.id != req.params.expId
    );
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send("server error...");
  }
});

//@route PUT /api/profile/education
//@desc Updates the education field of the user profile.
//@access protected
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required.").not().isEmpty(),
      check("degree", "Degree is required.").not().isEmpty(),
      check("fieldOfStudy", "Field of Study is required.").not().isEmpty(),
      check("from", "From is required.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) res.status(400).json({ errors: err.array() });

    const {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err);
      res.status(500).send("server error.");
    }
  }
);

//@route DELETE /api/profile/education/:eduId
//@desc Deletes the education corresponding to eduId
//@access protected
router.delete("/education/:eduId", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education = profile.education.filter(
      (edu) => edu.id != req.params.eduId
    );
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send("server error...");
  }
});

//@route PUT /api/profile/experience
//@desc Updates the experience field of the user profile.
//@access protected
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required.").not().isEmpty(),
      check("company", "Company is required.").not().isEmpty(),
      check("from", "From is required.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) res.status(400).json({ errors: err.array() });

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      console.log(profile);
      console.log(newExperience);
      profile.experiences.unshift(newExperience);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err);
      res.status(500).send("server error.");
    }
  }
);

//@route GET /api/profile
//@desc gets all the profiles.
//@access public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name"]);
    return res.json(profiles);
  } catch (error) {
    res.status(500).send("server error");
  }
});

//@route GET /api/profile/me
//@desc gets the profile of the current user.
//@access protected
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name"]);
    if (!profile)
      return res.status(400).send({ msg: "Profile not found for the user." });
    return res.json(profile);
  } catch (error) {
    res.status(500).send("server error");
  }
});

//@route GET /api/profile/gitHub/:gitHubUN
//@desc gets the gitHub repos of the given git hub user name.
//@access public
router.get("/gitHub/:gitHubUN", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.gitHubUN}/repos?authorization_request=${config.gitHubToken}`,
      method: "GET",
      headers : {"user-agent" : "node.js"}
    };
    console.log(options.uri);
    request(options, (err, response, body) => {
      if (err) console.log(err);

      console.log(response.statusCode);
      if (response.statusCode != 200) {
        return res.status(404).send("GitHub user not found.");
      }
      res.json(JSON.parse(body));
    });
  } catch (error) {
    res.status(500).send("server error");
  }
});

//@route GET /api/profile/user/:user_id
//@desc gets the profile of the user id.
//@access public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name"]);
    if (!profile) return res.status(400).send({ msg: "Profile not found." });
    return res.json(profile);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId")
      return res.status(400).send({ msg: "Profile not found." });
    res.status(500).send("server error");
  }
});

//@route POST /api/profile/
//@desc creates/updates the user profile.
//@access protected
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required.").exists(),
      check("skills", "Skills is required").exists(),
    ],
  ],
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        console.log(err);
        return res.status(400).json({ err: err.array() });
      }

      const {
        user,
        company,
        location,
        status,
        skills,
        website,
        bio,
        gitHubUsrName,
        socialMediaLinks,
      } = req.body;

      const profileFields = {};
      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (location) profileFields.location = location;
      if (status) profileFields.status = status;
      if (skills) {
        profileFields.skills = skills.split(",").map((skill) => skill.trim());
      }
      if (website) profileFields.website = website;
      if (bio) profileFields.bio = bio;
      if (gitHubUsrName) profileFields.gitHubUsrName = gitHubUsrName;
      if (socialMediaLinks) {
        profileFields.socialMediaLinks = {};
        if (socialMediaLinks.faceBook)
          profileFields.socialMediaLinks.faceBook = socialMediaLinks.faceBook;
        if (socialMediaLinks.twitter)
          profileFields.socialMediaLinks.twitter = socialMediaLinks.twitter;
        if (socialMediaLinks.linkedIn)
          profileFields.socialMediaLinks.linkedIn = socialMediaLinks.linkedIn;
        if (socialMediaLinks.instagram)
          profileFields.socialMediaLinks.instagram = socialMediaLinks.instagram;
      }
      console.log(profileFields);

      //check if user exists
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //update
        console.log("updating profile");

        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          profileFields,
          {
            new: true,
            useFindAndModify: false,
          }
        );

        console.log(profile);
      } else {
        //create
        console.log("creating new profile");

        profile = new Profile(profileFields);
        profile = await profile.save();
      }
      if (!profile) throw err;
      res.json(profile);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
