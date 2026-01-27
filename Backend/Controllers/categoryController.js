import categoryModel from "../Models/categoryModel.js";
import slugify from "slugify";

// CREATE CATEGORY
export const createCategoryController = async (req, res) => {
  try {
    // ✅ Added categoryId to destructuring (Manual input from frontend)
    const { name, categoryId } = req.body;
    
    // 1. Basic Validation
    if (!name) return res.status(401).send({ message: "Name is required" });
    if (!categoryId) return res.status(401).send({ message: "Category ID is required" });

    // 2. Check for existing category name
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({ success: false, message: "Category Name Already Exists" });
    }

    // 3. ✅ Check for Duplicate Manual ID (Prevents 11000 error)
    const existingID = await categoryModel.findOne({ categoryId });
    if (existingID) {
      return res.status(400).send({ 
        success: false, 
        message: "Duplicate Error: This Category ID is already in use." 
      });
    }

    // 4. Save with the ID you typed manually
    const category = await new categoryModel({ 
      name, 
      slug: slugify(name),
      categoryId: categoryId // ✅ Uses your manual input
    }).save();

    res.status(201).send({
      success: true,
      message: "New category created",
      category,
    });
  } catch (error) {
    console.log("BACKEND ERROR:", error);
    res.status(500).send({ 
      success: false, 
      message: "Error in Category", 
      error: error.message 
    });
  }
};

// UPDATE CATEGORY
export const updateCategoryController = async (req, res) => {
  try {
    const { name, categoryId } = req.body; // ✅ Accept manual ID edit
    const { id } = req.params;

    if (!name || !categoryId) {
      return res.status(401).send({ message: "Name and Category ID are required" });
    }

    // ✅ Check if the manually typed categoryId is used by ANOTHER category
    const existingID = await categoryModel.findOne({ 
      categoryId, 
      _id: { $ne: id } 
    });

    if (existingID) {
      return res.status(400).send({ 
        success: false, 
        message: "Duplicate Error: This Category ID is already assigned to another category." 
      });
    }

    const category = await categoryModel.findByIdAndUpdate(
      id,
      { 
        name, 
        slug: slugify(name),
        categoryId: categoryId // ✅ Manual update
      },
      { new: true }
    );

    if (!category) {
      return res.status(404).send({ success: false, message: "Category not found" });
    }

    res.status(200).send({
      success: true,
      message: "Category Updated Successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error: error.message, message: "Error while updating category" });
  }
};

// GET ALL CATEGORIES
export const categoryControlller = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({ success: true, message: "All Categories List", category });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error while getting categories", error });
  }
};

// GET SINGLE CATEGORY
export const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Get Single Category Successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error While getting Single Category" });
  }
};

// DELETE CATEGORY
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "error while deleting category", error });
  }
};

// Get products by category
// Controllers/productController.js
export const productCategoryController = async (req, res) => {
  try {
    // 1. Find category by slug
    const category = await categoryModel.findOne({ slug: req.params.slug });
    
    // 2. Validate category exists to avoid 400 errors
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // 3. Find products linked to that category ID
    const products = await productModel.find({ category: category._id }).populate("category");
    
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
      message: "Error while getting products by category",
    });
  }
};