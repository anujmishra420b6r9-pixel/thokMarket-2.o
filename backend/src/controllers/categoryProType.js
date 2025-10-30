import { productType } from "../models/productType.js";
import { Category } from "../models/category.js";
import { Product } from "../models/product.js"; 
import {Admin} from "../models/admin.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";





export async function deleteCategory(req, res) {
  try {
    const { categoryId } = req.params; // 🟢 frontend se categoryId aayegi (e.g. /category/:categoryId)

    // ✅ Input Validation
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // 🔹 Check if category exists
    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // 🔹 Delete category
    await Category.findByIdAndDelete(categoryId);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });

  } catch (error) {
    console.error("❌ Error deleting category:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting category",
      error: error.message,
    });
  }
}

export async function deleteProductType(req, res) {
  try {
    const { typeId } = req.params; // frontend se typeId aayegi (e.g. /product-type/:typeId)

    // 🟡 Validate input
    if (!typeId) {
      return res.status(400).json({
        success: false,
        message: "Product type ID is required",
      });
    }

    // 🔹 Check if product type exists
    const typeExists = await productType.findById(typeId);
    if (!typeExists) {
      return res.status(404).json({
        success: false,
        message: "Product type not found",
      });
    }

    // 🔹 Delete the product type
    await productType.findByIdAndDelete(typeId);

    return res.status(200).json({
      success: true,
      message: "Product type deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting product type:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting product type",
      error: error.message,
    });
  }
}


export async function ProductTypeRoute(req, res) {
  try {
    // ✅ Step 1: Read token from cookies
    const token = req.cookies?.userInfo;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // ✅ Step 2: Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id;
    const rank = decoded.rank;

    // ✅ Optional: Allow only master or admin
    if (rank !== "master" && rank !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Step 3: Get data from body
    const { category, productType: type } = req.body;

    if (!category || !type) {
      return res.status(400).json({ message: "Category and product type are required" });
    }

    // ✅ Step 4: Category exist check
    const cat = await Category.findOne({ category: { $regex: `^${category}$`, $options: "i" } });
    if (!cat) {
      return res.status(404).json({ message: "Category does not exist" });
    }

    // ✅ Step 5: Check if product type already exists
    const existingType = await productType.findOne({
      category: { $regex: `^${category}$`, $options: "i" },
      productType: { $regex: `^${type}$`, $options: "i" }
    });

    if (existingType) {
      return res.status(409).json({ message: "Product type already exists" });
    }

    // ✅ Step 6: Save new product type
    const newType = new productType({ category, productType: type });
    await newType.save();

    return res.status(201).json({
      message: "Product type saved successfully",
      productType: newType
    });

  } catch (error) {
    console.error("ProductTypeRoute error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}


export async function CategoryRoute(req, res) {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Check अगर category पहले से exist करती है
    const existing = await Category.findOne({ category });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    // category save करो DB में
    const newCategory = new Category({ category });
    await newCategory.save();

    // save होने के बाद सभी categories fetch करो
    const allCategories = await Category.find({});

    // response में भेज दो
    return res.status(201).json({
      message: "Category added successfully",
      newCategory,
      allCategories
    });
  } catch (error) {
    console.error("CategoryRoute error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}


export async function getAllCategory(req, res) {
  try {
    // 🟢 Step 1: Database se sabhi categories fetch karo
    const categories = await Category.find();

    // 🟡 Step 2: Agar koi category nahi mili
    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found y",
      });
    }

    // 🟢 Step 3: Frontend ko data bhej do
    return res.status(200).json({
      success: true,
      message: "All categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    // 🔴 Step 4: Error handling
    console.error("Error fetching categories:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
      error: error.message,
    });
  }
}



export const getAllProductType = async (req, res) => {
  try {
    const allProducts = await productType
      .find({})
      .select("_id productType category") // only required fields
      .lean();

    return res.status(200).json({
      success: true,
      data: allProducts,
      total: allProducts.length
    });
  } catch (error) {
    console.error("❌ GetAllProductType Error:", error);

    if (error.name === "MongoNetworkError" || error.name === "MongooseServerSelectionError") {
      return res.status(503).json({
        success: false,
        message: "Database connection failed. Please try again later."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error. Please contact support."
    });
  }
};

