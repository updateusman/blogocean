import mongoose, { Schema } from "mongoose";

const imageSchema = new Schema(
  {
    imageFile: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ImageInPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

export const Image = mongoose.model("Image", imageSchema);
