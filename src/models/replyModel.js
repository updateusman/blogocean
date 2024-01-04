import mongoose, { Schema } from "mongoose";

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
    commentAbove: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    postAbove: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

export const Reply = mongoose.model("Reply", replySchema);
