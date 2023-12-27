import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
    },
    media: {
      type: Schema.Types.ObjectId,
      ref: "Media",
    },
    isPublished: {
      type: Boolean,
      required: true,
    },
    publishDate: {
      type: Date,
      default: false,
    },
    view: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
