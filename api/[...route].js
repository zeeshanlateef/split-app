import mongoose from "mongoose";
import User from "../backend/models/User.js";
import Group from "../backend/models/Group.js";
import Expense from "../backend/models/Expense.js";
import Settlement from "../backend/models/Settlement.js";

const MONGODB_URI = process.env.MONGODB_URI;

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined. Please check your environment variables.");
  }

  try {
    await mongoose.connect(MONGODB_URI);
    cachedConnection = mongoose.connection;
    return cachedConnection;
  } catch (err) {
    console.error("Mongoose connection error:", err);
    throw err;
  }
};

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: "Database connection failed", 
      error: err.message 
    });
  }

  // Extract path segments after /api/
  const url = req.url.replace(/\?.*$/, ""); // strip query string for routing
  const parts = url.replace(/^\/api/, "").replace(/^\//, "").split("/");
  const resource = parts[0]; // status, users, groups, expenses, settlements
  const id = parts[1]; // optional id

  const query = req.query || {};
  const body = req.body || {};

  try {
    // ===== SYSTEM STATUS =====
    if (resource === "status") {
      return res.json({ 
        status: "online", 
        db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
      });
    }

    // ===== USERS =====
    if (resource === "users") {
      if (req.method === "GET") {
        const filter = query.email ? { email: query.email } : {};
        const users = await User.find(filter);
        return res.json(users);
      }
      if (req.method === "POST") {
        const existing = await User.findOne({ email: body.email });
        if (existing) return res.status(400).json({ message: "Email already registered" });
        const user = new User(body);
        await user.save();
        return res.status(201).json(user);
      }
    }

    // ===== GROUPS =====
    if (resource === "groups") {
      if (req.method === "GET" && !id) {
        const filter = query.joinCode ? { joinCode: query.joinCode } : {};
        const groups = await Group.find(filter);
        return res.json(groups);
      }
      if (req.method === "GET" && id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid Group ID" });
        const group = await Group.findById(id);
        if (!group) return res.status(404).json({ message: "Group not found" });
        return res.json(group);
      }
      if (req.method === "POST") {
        const group = new Group(body);
        await group.save();
        return res.status(201).json(group);
      }
      if (req.method === "PUT" && id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid Group ID" });
        const group = await Group.findByIdAndUpdate(id, body, { new: true });
        return res.json(group);
      }
      if (req.method === "DELETE" && id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid Group ID" });
        await Group.findByIdAndDelete(id);
        return res.status(204).end();
      }
    }

    // ===== EXPENSES =====
    if (resource === "expenses") {
      if (req.method === "GET") {
        const filter = query.groupId ? { groupId: query.groupId } : {};
        const expenses = await Expense.find(filter);
        return res.json(expenses);
      }
      if (req.method === "POST") {
        const expense = new Expense(body);
        await expense.save();
        return res.status(201).json(expense);
      }
      if (req.method === "DELETE" && id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid Expense ID" });
        await Expense.findByIdAndDelete(id);
        return res.status(204).end();
      }
    }

    // ===== SETTLEMENTS =====
    if (resource === "settlements") {
      if (req.method === "GET") {
        const filter = query.groupId ? { groupId: query.groupId } : {};
        const settlements = await Settlement.find(filter);
        return res.json(settlements);
      }
      if (req.method === "POST") {
        const settlement = new Settlement(body);
        await settlement.save();
        return res.status(201).json(settlement);
      }
    }

    res.status(404).json({ message: `Route /api/${resource} ${req.method} not found` });
  } catch (err) {
    console.error("API Error at /api/" + resource, err);
    res.status(500).json({ message: err.message });
  }
}

