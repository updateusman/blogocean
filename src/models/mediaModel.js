import mongoose, { Schema } from "mongoose";

const mediaSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    mediaPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

export const Media = mongoose.model("Media", mediaSchema);
