import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema(
  {
    title: {
      type: String,
      index: true,
      required: true,
    },
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    description: {
      type: String,
    },
    duration: {
      type: Number,
    },
    views: {
      type: Number,
      default: 0,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    videoInPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

export const Video = mongoose.model("Video", videoSchema);
