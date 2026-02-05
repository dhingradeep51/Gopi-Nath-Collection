import express from "express";
import { isAdmin, requireSignIn } from "../Middlewares/authMiddleware.js";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getSingleProductController,
  productCategoryController,
  productCountController,
  productFiltersController,
  productPhotoController,
  updateProductController,
  addReviewController,
  getSearchSuggestionsController,
  searchProductController
} from "../Controllers/productController.js";
import formidable from "express-formidable";
import { upload } from "../Middlewares/multerConfig.js";

const router = express.Router();

// --- PRODUCT ROUTES ---

// Create Product
router.post("/create-product", requireSignIn, isAdmin, formidable({multiples:true}), createProductController);

// Update Product
router.put("/update-product/:pid", requireSignIn, isAdmin, formidable({multiples:true}), updateProductController);

// Get All Products
router.get("/get-product", getAllProductsController);

// Get Single Product
router.get("/get-product/:slug", getSingleProductController);

// Get Photo
router.get("/product-photo/:pid/:index", productPhotoController);

// Delete Product
router.delete("/delete-product/:pid", requireSignIn, isAdmin, deleteProductController);

// Filter Products
router.post("/product-filters", productFiltersController);

// Product Count
router.get("/product-count", productCountController);

// Category Wise Product
router.get("/product-category/:slug", productCategoryController);

// Reviews (Linked to Product ID)
router.post("/add-review/:pid", requireSignIn, upload.single("attachment"), addReviewController);

router.get("/search-suggest/:keyword", getSearchSuggestionsController);

// Search product route
router.get("/search/:keyword", searchProductController);


export default router;