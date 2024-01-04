import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const textSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
const Text = mongoose.model("Text", textSchema);
const bodyElementSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["text", "image", "video"],
    },
    content: {
      type: Schema.Types.Mixed,
    },
  },

  {
    _id: false,
    discriminatorKey: "type",
  }
);

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    featuredImage: {
      type: Schema.Types.ObjectId,
      ref: "Image",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: [bodyElementSchema],
    tags: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      required: true,
    },
    isPublished: {
      type: Boolean,
      required: true,
    },
    publishDate: {
      type: Date,
      default: null,
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

postSchema.plugin(mongooseAggregatePaginate);

export const Post = mongoose.model("Post", postSchema);

// const textElement = Post.discriminator(
//   "text",
//   new Schema(
//     {
//       content: {
//         type: String,
//         require: true,
//       },
//     },
//     { _id: false }
//   )
// );

// const imageElement = Post.discriminator(
//   "image",
//   new Schema(
//     {
//       content: {
//         type: Schema.Types.ObjectId,
//         ref: "Image",
//         required: true,
//       },
//     },
//     { _id: false }
//   )
// );

// const VideoElement = Post.discriminator(
//   "video",
//   new Schema(
//     {
//       content: {
//         type: Schema.Types.ObjectId,
//         ref: "Video",
//         required: true,
//       },
//     },
//     { _id: false }
//   )
// );
