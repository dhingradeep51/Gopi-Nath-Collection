import express from "express";
import { requireSignIn, isAdmin } from "../Middlewares/authMiddleware.js";
import {
  categoryControlller,
  createCategoryController,
  deleteCategoryController,
  singleCategoryController,
  updateCategoryController,
  productCategoryController
} from "../Controllers/categoryController.js";

const router = express.Router();

// Routes
router.post("/create-category", requireSignIn, isAdmin, createCategoryController);

router.put("/update-category/:id", requireSignIn, isAdmin, updateCategoryController);

router.get("/get-category", categoryControlller);

router.get("/single-category/:slug", singleCategoryController);

router.delete("/delete-category/:id", requireSignIn, isAdmin, deleteCategoryController);

router.get("/product-category/:slug", productCategoryController);

export default router;