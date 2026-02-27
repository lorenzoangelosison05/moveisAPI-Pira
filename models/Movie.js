const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    name: { type: String, default: "" },
    text: { type: String, required: [true, "Comment text is required."] }
  },
  { timestamps: true }
);

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required."], trim: true },
    director: { type: String, required: [true, "Director is required."], trim: true },
    year: { type: Number, required: [true, "Year is required."] },
    description: { type: String, required: [true, "Description is required."] },
    genre: { type: String, required: [true, "Genre is required."], trim: true },
    comments: { type: [commentSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);