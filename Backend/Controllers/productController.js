import ProductModel from "../Models/productModel.js";
import categoryModel from "../Models/categoryModel.js";
import fs from "fs";
import slugify from "slugify";
import sharp from "sharp";

export const createProductController = async (req, res) => {
  try {
    // 🔍 LOG 1: Verify text fields (name, price, category, etc.)
    console.log("--- CREATE PRODUCT START ---");
    console.log("Fields received:", req.fields);

    const { name, description, price, gstRate, category, quantity, productID, specifications } = req.fields;
    const { photos } = req.files;

    // 🔍 LOG 2: Verify if photos are arriving as an Array
    if (photos) {
      console.log("Photos received in req.files:", Array.isArray(photos) ? `Array of ${photos.length}` : "Single Object");
    } else {
      console.log("❌ No photos found in req.files - Check frontend FormData append logic");
    }

    // 1. Validation
    if (!name || !description || !price || !category || !quantity || !productID) {
      return res.status(400).send({ success: false, message: "All required fields must be filled" });
    }

    // 2. Parse Specifications
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

    // 3. ✅ UPDATED MULTI-PHOTO HANDLING WITH BACKEND COMPRESSION
    if (photos) {
      const photoArray = Array.isArray(photos) ? photos : [photos];
      
      console.log(`📸 Compressing ${photoArray.length} photos in Backend...`);

      // We use Promise.all because sharp operations are asynchronous
      product.photos = await Promise.all(photoArray.map(async (file, index) => {
        const filePath = file.path || file.filepath;
        
        console.log(`Processing Photo [${index}] - Name: ${file.name}, Original Size: ${(file.size / 1024).toFixed(2)} KB`);

        // ✅ SHARP COMPRESSION: Resize and set quality to reduce BSON size
        const compressedBuffer = await sharp(filePath)
          .resize(1000) // Max width 1000px
          .jpeg({ quality: 80 }) // Convert to JPEG and compress to 80% quality
          .toBuffer();

        console.log(`Compressed Photo [${index}] - New Size: ${(compressedBuffer.length / 1024).toFixed(2)} KB`);

        return {
          data: compressedBuffer, // Save the compressed buffer
          contentType: "image/jpeg",
        };
      }));
    }

    await product.save();
    console.log("✅ Product saved successfully to Database");
    console.log("--- CREATE PRODUCT END ---");

    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product: { ...product._doc, photos: undefined }, 
    });
  } catch (error) {
    console.error("--- CREATE PRODUCT ERROR ---");
    console.error(error);
    res.status(500).send({ success: false, message: error.message || "Error in creating product" });
  }
};

/* =====================================================
   UPDATE PRODUCT
   ===================================================== */
export const updateProductController = async (req, res) => {
  try {
    // 🔍 LOG 1: Monitor incoming text data
    console.log("--- UPDATE START ---");
    console.log("Fields received:", req.fields);

    const { name, description, price, gstRate, category, quantity, specifications, productID } = req.fields;
    const { photos } = req.files;

    // 🔍 LOG 2: Check incoming files
    if (photos) {
      console.log("Photos in req.files:", Array.isArray(photos) ? `Array of ${photos.length}` : "Single Object");
    } else {
      console.log("No new photos uploaded in this update");
    }

    const product = await ProductModel.findById(req.params.pid);
    if (!product) return res.status(404).send({ success: false, message: "Product not found" });

    // 2. Parse Specifications
    let parsedSpecs = specifications;
    if (typeof specifications === 'string') {
      try { 
        parsedSpecs = JSON.parse(specifications); 
      } catch (e) {
        console.log("Specs parse error (using existing):", e.message);
      }
    }

    // Update standard fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price ? parseFloat(price) : product.price;
    product.quantity = quantity || product.quantity;
    product.category = category || product.category;
    product.specifications = parsedSpecs || product.specifications;
    product.gstRate = gstRate ? parseInt(gstRate, 10) : product.gstRate;
    product.productID = productID || product.productID;
    
    if (name) product.slug = slugify(name);

    // ✅ UPDATED PHOTO UPDATE LOGIC WITH BACKEND COMPRESSION
    if (photos) {
      const photoArray = Array.isArray(photos) ? photos : [photos];
      
      console.log(`📸 Compressing ${photoArray.length} updated photos in Backend...`);

      product.photos = await Promise.all(photoArray.map(async (file, index) => {
        const filePath = file.path || file.filepath;
        
        console.log(`Processing Slot [${index}] - Name: ${file.name}, Original: ${(file.size / 1024).toFixed(2)} KB`);
        
        // ✅ SHARP COMPRESSION
        const compressedBuffer = await sharp(filePath)
          .resize(1000)
          .jpeg({ quality: 80 })
          .toBuffer();

        console.log(`Compressed Slot [${index}] - New: ${(compressedBuffer.length / 1024).toFixed(2)} KB`);

        return {
          data: compressedBuffer,
          contentType: "image/jpeg",
        };
      }));
    }

    await product.save();
    console.log("--- UPDATE SUCCESSFUL ---");
    res.status(200).send({ success: true, message: "Product Updated Successfully" });
  } catch (error) {
    console.error("--- UPDATE ERROR ---");
    console.error(error);
    res.status(500).send({ success: false, message: "Update failed", error: error.message });
  }
};

/* =====================================================
   PHOTO CONTROLLER (Specific Photo by Index)
   ===================================================== */
export const productPhotoController = async (req, res) => {
  try {
    const { pid, index } = req.params;
    const product = await ProductModel.findById(pid).select("photos");
    const photoIndex = index ? parseInt(index) : 0;

    if (product?.photos && product.photos[photoIndex]?.data) {
      res.set("Content-Type", product.photos[photoIndex].contentType);
      return res.status(200).send(product.photos[photoIndex].data);
    }
    res.status(404).send({ success: false, message: "Photo not found" });
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
/* =====================================================
   GET ALL PRODUCTS
   ===================================================== */
export const getAllProductsController = async (req, res) => {
  try {
    const products = await ProductModel.find({})
      .populate("category", "name slug")
      .select("-photos") // ✅ Changed from '-photo' to '-photos'
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
   GET SINGLE PRODUCT
   ===================================================== */
export const getSingleProductController = async (req, res) => {
  try {
    const product = await ProductModel.findOne({ slug: req.params.slug })
      .select("-photos") // ✅ Changed from '-photo' to '-photos'
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
