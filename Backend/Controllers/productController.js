import ProductModel from "../Models/productModel.js";
import categoryModel from "../Models/categoryModel.js";
import fs from "fs";
import slugify from "slugify";

/* =====================================================
   CREATE PRODUCTa
   ===================================================== */

/* =====================================================
   CREATE PRODUCT (Updated for Multi-Photo & Specs)
   ===================================================== */
/* =====================================================
   CREATE PRODUCT
   ===================================================== */
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, gstRate, category, quantity, productID, specifications } = req.fields;
    const { photos } = req.files;

    if (!name || !description || !price || !category || !quantity || !productID) {
      return res.status(400).send({ success: false, message: "All required fields must be filled" });
    }

    let parsedSpecs = {};
    if (specifications) {
      try {
        parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (err) {
        return res.status(400).send({ success: false, message: "Invalid specifications format" });
      }
    }

    const uniqueSlug = slugify(`${name}-${productID}`);
    const product = new ProductModel({
      ...req.fields,
      specifications: parsedSpecs,
      price: parseFloat(price),
      gstRate: parseInt(gstRate, 10),
      slug: uniqueSlug,
    });

    // ✅ FIXED MULTI-PHOTO HANDLING
    if (photos) {
      // Force photos into an array to ensure map() works for 1 or more files
      const photoArray = Array.isArray(photos) ? photos : [photos];

      product.photos = photoArray.map((file) => {
        // Validation: 1MB limit per photo
        if (file.size > 1000000) throw new Error(`${file.name || 'Photo'} is too large (max 1MB)`);
        
        return {
          // Check for both 'path' and 'filepath' for compatibility
          data: fs.readFileSync(file.path || file.filepath),
          contentType: file.type || file.mimetype,
        };
      });
    }

    await product.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product: { ...product._doc, photos: undefined }, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: error.message || "Error in creating product" });
  }
};

/* =====================================================
   UPDATE PRODUCT
   ===================================================== */
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, gstRate, category, quantity, specifications } = req.fields;
    const { photos } = req.files;

    // 1. First, find the product to ensure it exists
    const product = await ProductModel.findById(req.params.pid);
    if (!product) return res.status(404).send({ success: false, message: "Product not found" });

    // 2. Update Standard Fields
    let parsedSpecs = specifications;
    if (typeof specifications === 'string') {
        try { parsedSpecs = JSON.parse(specifications); } catch (e) {}
    }

    // Update product properties
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.quantity = quantity || product.quantity;
    product.category = category || product.category;
    product.specifications = parsedSpecs || product.specifications;
    if (name) product.slug = slugify(name);

    // 3. ✅ FIXED PHOTO UPDATE LOGIC
    if (photos) {
      const photoArray = Array.isArray(photos) ? photos : [photos];
      
      // Map all uploaded photos
      product.photos = photoArray.map((file) => ({
        data: fs.readFileSync(file.path || file.filepath),
        contentType: file.type || file.mimetype,
      }));
    }

    await product.save();
    res.status(200).send({ success: true, message: "Product Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Update failed", error: error.message });
  }
};
/* =====================================================
   UPDATED PHOTO CONTROLLER (Handles Multiple)
   ===================================================== */
// This gets a SPECIFIC photo from the array by index
export const productPhotoController = async (req, res) => {
  try {
    const { pid, index } = req.params;
    // Find product and only select the photos field
    const product = await ProductModel.findById(pid).select("photos");

    const photoIndex = index ? parseInt(index) : 0;

    // Check if the array and the specific photo exists
    if (product?.photos && product.photos[photoIndex]?.data) {
      res.set("Content-Type", product.photos[photoIndex].contentType);
      return res.status(200).send(product.photos[photoIndex].data);
    }

    res.status(404).send({ success: false, message: "Photo not found in database" });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
};

// Keep all other functions the same...

/* =====================================================
   DELETE PRODUCT
   ===================================================== */
export const deleteProductController = async (req, res) => {
  try {
    await ProductModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

/* =====================================================
   GET SINGLE PRODUCT
   ===================================================== */
export const getSingleProductController = async (req, res) => {
  try {
    const product = await ProductModel.findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category")
      .populate("reviews.user");

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

/* =====================================================
   GET ALL PRODUCTS
   ===================================================== */
export const getAllProductsController = async (req, res) => {
  try {
    const products = await ProductModel.find({})
      .populate("category", "name slug")
      .select("-photo")
      .sort("-createdAt");

    res.status(200).send({
      success: true,
      countTotal: products.length,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

/* =====================================================
   PRODUCT PHOTO
   ===================================================== */

/* =====================================================
   CATEGORY BASED PRODUCTS
   ===================================================== */
// productController.js
// Controller to handle Category-wise products
export const productCategoryController = async (req, res) => {
  try {
    const { slug } = req.params;

    // Convert hyphens back to spaces (e.g., "LADDO-GOPAL-DRESSES" -> "LADDO GOPAL DRESSES")
    const categoryName = slug.replace(/-/g, " ");

    const category = await categoryModel.findOne({
      name: { $regex: new RegExp("^" + categoryName + "$", "i") },
    });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category Not Found",
      });
    }

    // ✅ Using ProductModel with capital 'P' to match your import
    const products = await ProductModel
      .find({ category: category._id })
      .populate("category");

    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products by category",
    });
  }
};

// --- FILTERS ---
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await ProductModel.find(args);
    res.status(200).send({ success: true, products });
  } catch (error) {
    res.status(400).send({ success: false, message: "Error While Filtering Products", error });
  }
};

// --- COUNT ---
export const productCountController = async (req, res) => {
  try {
    const total = await ProductModel.find({}).estimatedDocumentCount();
    res.status(200).send({ success: true, total });
  } catch (error) {
    res.status(400).send({ success: false, message: "Error in product count", error });
  }
};

// --- PLACE ORDER ---
export const addReviewController = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await ProductModel.findById(req.params.pid);

    if (product) {
      const attachmentPath = req.file ? `/uploads/${req.file.filename}` : "";
      const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
        attachment: attachmentPath,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.averageRating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

      await product.save();
      res.status(201).send({ success: true, message: "Review added", review });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: "Review submission failed" });
  }
};
// Add this to your productRoutes.js and productController.js
// Get search suggestions
export const getSearchSuggestionsController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await ProductModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    })
      .select("name slug") // Optimization: Only fetch name and slug
      .limit(8); // Limit to 8 suggestions like Amazon/Flipkart

    res.status(200).send({
      success: true,
      results,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in search suggestions",
      error,
    });
  }
};
// Search product controller
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    
    // Find products where name OR description matches the keyword
    const results = await ProductModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }).select("-photo"); // Exclude heavy photo data for faster initial load

    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};
