import mongoose, { Schema } from "mongoose";
import { User } from "./userModel.js";

const replySchema = new Schema(
  {
    replyText: {
      type: String,
      required: true,
    },
    repliedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    repliedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    replyingUnderComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    replyUnderPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

export const Reply = mongoose.model("Reply", replySchema);
