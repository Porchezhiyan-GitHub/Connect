const mongoose = require("mongoose");

const schema = mongoose.Schema;

const postSchema = new schema({
  user: {
    type: schema.Types.ObjectId,
    ref: "users",
  },

  postContent: {
    type: String,
    required: true,
  },

  userName: {
    type: String,
  },

  avatar: {
    type: String,
  },

  likes: [
    {
      user: {
        type: schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],

  comments: [
    {
      user: {
        type: schema.Types.ObjectId,
        ref: "users",
      },
      commentContent: {
        type: String,
        required: true,
      },

      userName: {
        type: String,
      },

      avatar: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now(),
      },
    },
  ],

  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = Post = mongoose.model("post", postSchema);
