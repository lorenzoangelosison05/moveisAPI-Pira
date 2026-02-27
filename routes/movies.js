const express = require("express");
const Movie = require("../models/Movie");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

const router = express.Router();

// GET /movies - retrieve movies (public)
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    return res.status(200).json({ movies });
  } catch (err) {
    return res.status(500).json({ error: "Server error." });
  }
});

// GET /movies/:id - retrieve single movie by id (public)
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found." });

    return res.status(200).json({ movie });
  } catch (err) {
    return res.status(400).json({ error: "Invalid movie id." });
  }
});

// POST /movies/:id/comments - add comment (authenticated)
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Comment text is required." });

    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found." });

    movie.comments.push({
      userId: req.user.id,
      email: req.user.email,
      name: req.user.name || "",
      text
    });

    await movie.save();

    return res.status(201).json({
      message: "Comment added successfully.",
      comments: movie.comments
    });
  } catch (err) {
    return res.status(400).json({ error: "Invalid movie id." });
  }
});

// GET /movies/:id/comments - get comments (authenticated)
router.get("/:id/comments", auth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found." });

    return res.status(200).json({ comments: movie.comments });
  } catch (err) {
    return res.status(400).json({ error: "Invalid movie id." });
  }
});

// DELETE /movies/:id/comments/:commentId - delete comment (admin or owner)
router.delete("/:id/comments/:commentId", auth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found." });

    const comment = movie.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found." });

    const ownerId = comment.userId.toString();
    const myId = req.user.id.toString();

    if (!req.user.isAdmin && ownerId !== myId) {
      return res.status(403).json({ error: "Not allowed." });
    }

    comment.deleteOne();
    await movie.save();

    return res.status(200).json({
      message: "Comment deleted successfully.",
      comments: movie.comments
    });
  } catch (err) {
    return res.status(400).json({ error: "Invalid id." });
  }
});

// POST /movies - create movie (admin only)
router.post("/", auth, admin, async (req, res) => {
  try {
    const { title, director, year, description, genre } = req.body;

    if (!title || !director || year === undefined || !description || !genre) {
      return res.status(400).json({ error: "title, director, year, description, and genre are required." });
    }

    const movie = await Movie.create({
      title,
      director,
      year,
      description,
      genre
    });

    return res.status(201).json({
      message: "Movie created successfully.",
      movie
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error." });
  }
});

// PUT /movies/:id - update movie (admin only)
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const updates = {};
    const allowed = ["title", "director", "year", "description", "genre"];

    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const movie = await Movie.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!movie) return res.status(404).json({ error: "Movie not found." });

    return res.status(200).json({
      message: "Movie updated successfully.",
      movie
    });
  } catch (err) {
    return res.status(400).json({ error: "Invalid movie id." });
  }
});

// DELETE /movies/:id - delete movie (admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found." });

    return res.status(200).json({ message: "Movie deleted successfully." });
  } catch (err) {
    return res.status(400).json({ error: "Invalid movie id." });
  }
});

module.exports = router;