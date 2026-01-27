import ProductModel from "../Models/productModel.js";
import categoryModel from "../Models/categoryModel.js";
import fs from "fs";
import slugify from "slugify";

/* =====================================================
   CREATE PRODUCTa
   ===================================================== */
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, gstRate, category, quantity, productID } = req.fields;
    const { photo } = req.files;

    // 1. Validation
    if (!name || !description || !price || !gstRate || !category || !quantity || !productID) {
      return res.status(400).send({ success: false, message: "All fields are required" });
    }

    // 2. GST Validation (parseInt ensures it's a number)
    const numericGst = parseInt(gstRate, 10);
    if (![0, 5, 12, 18].includes(numericGst)) {
      return res.status(400).send({ success: false, message: "Invalid GST rate" });
    }

    // 3. Unique Slug (Prevents E11000 error)
    const uniqueSlug = slugify(`${name}-${productID}`);

    const product = new ProductModel({
      ...req.fields,
      price: parseFloat(price),
      gstRate: numericGst,
      slug: uniqueSlug,
    });

    // 4. Photo Handling
    if (photo) {
      if (photo.size > 1000000) {
        return res.status(400).send({ success: false, message: "Photo must be less than 1MB" });
      }
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in creating product",
      error: error.message,
    });
  }
};

/* =====================================================
   UPDATE PRODUCT
   ===================================================== */
export const updateProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      gstRate,          // ✅ REQUIRED (as percentage)
      category,
      quantity,
      shipping,
    } = req.fields;

    const { photo } = req.files;

    if (
      !name ||
      !description ||
      !price ||
      !gstRate ||
      !category ||
      !quantity
    ) {
      return res.status(400).send({
        success: false,
        message: "All required fields including GST rate must be provided",
      });
    }

    // ✅ CHANGED: Accept percentages instead of decimals
    if (![0, 5, 12, 18].includes(Number(gstRate))) {
      return res.status(400).send({
        success: false,
        message: "Invalid GST rate. Must be 0, 5, 12, or 18",
      });
    }

    const product = await ProductModel.findByIdAndUpdate(
      req.params.pid,
      {
        name,
        description,
        shortDescription,
        price: Number(price),
        gstRate: Number(gstRate),  // ✅ stored as percentage
        category,
        quantity,
        shipping,
        slug: slugify(name),
      },
      { new: true }
    );

    if (photo) {
      if (photo.size > 1000000) {
        return res.status(400).send({
          success: false,
          message: "Photo should be less than 1MB",
        });
      }
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();

    res.status(200).send({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("PRODUCT UPDATE ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Update failed",
      error: error.message,
    });
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
export const productPhotoController = async (req, res) => {
  try {
    if (!req.params.pid || req.params.pid === "undefined") {
      return res.status(400).send({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await ProductModel.findById(req.params.pid).select("photo");

    if (product?.photo?.data) {
      res.set("Content-Type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }

    res.status(404).send({
      success: false,
      message: "Photo not found",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

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
