import mongoose, { Schema } from "mongoose";

const followSchema = new Schema(
  {
    followedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // One Who is been followed
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: "User", // On is following
    },
  },
  { timestamps: true }
);

export const Follow = mongoose.model("Follow", followSchema);
