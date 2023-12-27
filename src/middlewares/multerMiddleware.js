import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },

  filename: function (req, res, cb) {
    cb(null, file.originalFileName + "-" + Date.now());
  },
});

export const upload = multer({ storage });
