import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
  categoryId:{
    type:String,
    unique:true,
    required:true
  }
});

// CHANGE "category" to "Category"
export default mongoose.model("Category", categorySchema);