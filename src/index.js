import connectDB from "./db/dbConnect.js";
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8001, () => {
      console.log("Server is Running at ", process.env.PORT);
    });
  })
  .catch((error) => {
    console.error("Mongo DB Connection Error ", error);
  });
