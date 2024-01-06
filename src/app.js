import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(express.json({ urlencoded: true, limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//testing for debugging
app.post("/api/v1/test", (req, res) => {
  console.log("Request Body:", req.body);
  res.send("Received a POST request");
});
//  Routes Import

import userRouter from "./routes/userRoutes.js";
import imageRouter from "./routes/imageRoutes.js";
import videoRouter from "./routes/videoRoutes.js";
import postRouter from "./routes/postRoutes.js";
import { userEmailVerification } from "./controllers/userController.js";

// User Routes
app.use("/api/v1/users", userRouter);
// app.get()

// Image Routes
app.use("/api/v1/images", imageRouter);

// Video Routes
app.use("/api/v1/videos", videoRouter);

// Post Routes
app.use("/api/v1/posts", postRouter);
app.use("/verifyemail", userEmailVerification);

app.use((req, res, next) => {
  res.status(404).send("Sorry could not find anything like that");
});

export default app;
