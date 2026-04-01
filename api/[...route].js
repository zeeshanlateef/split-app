import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cachedConnection = null;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  admin: { type: String, required: true },
  members: [String],
  joinCode: { type: String, required: true, unique: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const expenseSchema = new mongoose.Schema({
  groupId: { type: String, default: null },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  splitBetween: [String],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const settlementSchema = new mongoose.Schema({
  groupId: { type: String, default: null },
  from: { type: String, required: true },
  to: { type: String, required: true },
  amount: { type: Number, required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const getModels = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return {
      User: mongoose.models.User,
      Group: mongoose.models.Group,
      Expense: mongoose.models.Expense,
      Settlement: mongoose.models.Settlement,
    };
  }

  await mongoose.connect(MONGODB_URI);
  cachedConnection = mongoose.connection;

  const User = mongoose.models.User || mongoose.model("User", userSchema);
  const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);
  const Expense = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
  const Settlement = mongoose.models.Settlement || mongoose.model("Settlement", settlementSchema);

  return { User, Group, Expense, Settlement };
};

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  let models;
  try {
    models = await getModels();
  } catch (err) {
    console.error("DB connection error:", err);
    return res.status(500).json({ message: "Database connection failed", error: err.message });
  }

  const { User, Group, Expense, Settlement } = models;

  // Extract path segments after /api/
  const url = req.url.replace(/\?.*$/, ""); // strip query string for routing
  const parts = url.replace(/^\/api/, "").replace(/^\//, "").split("/");
  const resource = parts[0]; // users, groups, expenses, settlements
  const id = parts[1]; // optional id

  const query = req.query || {};
  const body = req.body || {};

  try {
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
        const group = await Group.findById(id);
        return res.json(group);
      }
      if (req.method === "POST") {
        const group = new Group(body);
        await group.save();
        return res.status(201).json(group);
      }
      if (req.method === "PUT" && id) {
        const group = await Group.findByIdAndUpdate(id, body, { new: true });
        return res.json(group);
      }
      if (req.method === "DELETE" && id) {
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

    res.status(404).json({ message: "Route not found" });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ message: err.message });
  }
}
