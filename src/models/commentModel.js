import mongoose from "mongoose";
import { User } from "./userModel.js";
import { Post } from "./postModel.js";

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    commentBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },

    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reply",
      },
    ],
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
