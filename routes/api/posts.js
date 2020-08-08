const express = require("express");
const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const User = require("../../models/User");
const request = require("request");

const router = express.Router();

//@route POST /api/posts
//@desc save the user's post to DB
//@access private
router.post(
  "/",
  [auth, [check("postContent", "post content is required.").notEmpty()]],
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        console.log(err);
        res.status(400).json({ error: err.array() });
      }
      const user = await User.findById(req.user.id).select("-password");
      const post = new Post({
        user: req.user.id,
        postContent: req.body.postContent,
        userName: user.name,
        avatar: user.avatar,
      });
      const newPost = await post.save();
      res.send(newPost);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error...");
    }
  }
);

//@route GET /api/posts
//@desc gets all the posts
//@access private
router.get("/", [auth], async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error...");
  }
});

//@route GET /api/posts/:id
//@desc gets a post by id
//@access private
router.get("/:id", [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ msg: "Post not found." });
    }
    res.json(post);
  } catch (err) {
    if (err.kind === "ObjectId") {
      res.status(404).json({ msg: "Post not found." });
    }
    console.log(err);
    res.status(500).send("Server error...");
  }
});

//@route DELETE /api/posts/:id
//@desc deletes a post
//@access private
router.delete("/:id", [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ msg: "Post not found." });
    }
    if (post.user.toString() !== req.user.id) {
      res.status(401).json({ msg: "User not authorized." });
    }
    post.remove();
    res.json({ msg: "Post deleted successfully." });
  } catch (err) {
    if (err.kind === "ObjectId") {
      res.status(404).json({ msg: "Post not found." });
    }
    console.log(err);
    res.status(500).send("Server error...");
  }
});

//@route PUT /api/posts/like/:id
//@desc add like to a post
//@access private
router.put("/like/:id", [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ msg: "Post not found." });
    }
    if (
      post.likes.map((like) => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).send("Post is already liked.");
    }
    post.likes.unshift({ user: req.user.id });
    post.save();
    res.json(post.likes);
  } catch (err) {
    if (err.kind === "ObjectId") {
      res.status(404).json({ msg: "Post not found." });
    }
    console.log(err);
    res.status(500).send("Server error...");
  }
});

//@route PUT /api/posts/unlike/:id
//@desc removes like from a post
//@access private
router.put("/unlike/:id", [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ msg: "Post not found." });
    }
    if (
      post.likes.map((like) => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).send("Post is not liked already.");
    }
    post.likes = post.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );
    post.save();
    res.json(post.likes);
  } catch (err) {
    if (err.kind === "ObjectId") {
      res.status(404).json({ msg: "Post not found." });
    }
    console.log(err);
    res.status(500).send("Server error...");
  }
});

//@route PUT /api/posts/comment/:post_id
//@desc save the user's comment to DB
//@access private
router.put(
  "/comment/:post_id",
  [auth, [check("commentContent", "comment content is required.").notEmpty()]],
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        console.log(err);
        return res.status(400).json({ error: err.array() });
      }
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.post_id);
      if (!post) {
        return res.status(404).json({ msg: "Post not found." });
      }
      const comment = {
        user: req.user.id,
        commentContent: req.body.commentContent,
        userName: user.name,
        avatar: user.avatar,
      };
      await post.comments.unshift(comment);
      await post.save();
      res.send(post.comments);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error...");
    }
  }
);

//@route DELETE /api/posts/comment/:post_id/:comment_id
//@desc deletes a comment
//@access private
router.delete("/comment/:post_id/:comment_id", [auth], async (req, res) => {
  try {
    // find post.
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found." });
    }

    //find the comment from comments array of the post.
    const comment = post.comments.find(
      (comment) => comment.id.toString() === req.params.comment_id
    );
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found." });
    }

    //check if the comment belongs to current user.
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized." });
    }

    post.comments = post.comments.filter(
      (comment) => comment.id.toString() !== req.params.comment_id
    );

    await post.save();
    res.json(post.comments);
  } catch (err) {
    if (err.kind === "ObjectId") {
      res.status(404).json({ msg: "Post not found." });
    }
    console.log(err);
    res.status(500).send("Server error...");
  }
});

module.exports = router;
