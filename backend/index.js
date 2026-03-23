import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// --- FALLBACK DATABASE (JSON) ---
const DB_FILE = path.join(__dirname, "data.json");
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], groups: [], expenses: [], settlements: [] }, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

const useMongo = MONGODB_URI && !MONGODB_URI.includes("<username>");

if (useMongo) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
      console.error("MongoDB connection error, falling back to JSON:", err);
    });
} else {
  console.log("No MONGODB_URI found, using local JSON storage.");
}

// Helper for IDs
const generateId = () => Math.random().toString(36).substring(2, 6);

// --- MODELS / HELPERS ---
import User from "./models/User.js";
import Group from "./models/Group.js";
import Expense from "./models/Expense.js";
import Settlement from "./models/Settlement.js";

// --- ROUTES ---

// USERS
app.get("/users", async (req, res) => {
  const { email } = req.query;
  if (useMongo && mongoose.connection.readyState === 1) {
    const filter = email ? { email } : {};
    return res.json(await User.find(filter));
  }
  const db = readDB();
  const users = email ? db.users.filter(u => u.email === email) : db.users;
  res.json(users);
});

app.post("/users", async (req, res) => {
  if (useMongo && mongoose.connection.readyState === 1) {
    try {
      const user = new User(req.body);
      await user.save();
      return res.status(201).json(user);
    } catch (err) { return res.status(400).json({ message: err.message }); }
  }
  const db = readDB();
  const user = { ...req.body, id: generateId() };
  db.users.push(user);
  writeDB(db);
  res.status(201).json(user);
});

// GROUPS
app.get("/groups", async (req, res) => {
  const { joinCode } = req.query;
  if (useMongo && mongoose.connection.readyState === 1) {
    const filter = joinCode ? { joinCode } : {};
    return res.json(await Group.find(filter));
  }
  const db = readDB();
  const groups = joinCode ? db.groups.filter(g => g.joinCode === joinCode) : db.groups;
  res.json(groups);
});

app.get("/groups/:id", async (req, res) => {
  if (useMongo && mongoose.connection.readyState === 1) {
    return res.json(await Group.findById(req.params.id));
  }
  const db = readDB();
  const group = db.groups.find(g => g.id === req.params.id);
  res.json(group);
});

app.post("/groups", async (req, res) => {
  if (useMongo && mongoose.connection.readyState === 1) {
    const group = new Group(req.body);
    await group.save();
    return res.status(201).json(group);
  }
  const db = readDB();
  const group = { ...req.body, id: generateId() };
  db.groups.push(group);
  writeDB(db);
  res.status(201).json(group);
});

app.put("/groups/:id", async (req, res) => {
  if (useMongo && mongoose.connection.readyState === 1) {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(group);
  }
  const db = readDB();
  const index = db.groups.findIndex(g => g.id === req.params.id);
  if (index !== -1) {
    db.groups[index] = { ...db.groups[index], ...req.body };
    writeDB(db);
  }
  res.json(db.groups[index]);
});

app.delete("/groups/:id", async (req, res) => {
  if (useMongo && mongoose.connection.readyState === 1) {
    await Group.findByIdAndDelete(req.params.id);
    return res.status(204).send();
  }
  const db = readDB();
  db.groups = db.groups.filter(g => g.id !== req.params.id);
  writeDB(db);
  res.status(204).send();
});

// EXPENSES
app.get("/expenses", async (req, res) => {
  const { groupId } = req.query;
  if (useMongo && mongoose.connection.readyState === 1) {
    const filter = groupId ? { groupId } : {};
    return res.json(await Expense.find(filter));
  }
  const db = readDB();
  const expenses = groupId ? db.expenses.filter(e => e.groupId === groupId) : db.expenses;
  res.json(expenses);
});

app.post("/expenses", async (req, res) => {
  if (useMongo && mongoose.connection.readyState === 1) {
    const expense = new Expense(req.body);
    await expense.save();
    return res.status(201).json(expense);
  }
  const db = readDB();
  const expense = { ...req.body, id: generateId() };
  db.expenses.push(expense);
  writeDB(db);
  res.status(201).json(expense);
});

app.delete("/expenses/:id", async (req, res) => {
  if (useMongo && mongoose.connection.readyState === 1) {
    await Expense.findByIdAndDelete(req.params.id);
    return res.status(204).send();
  }
  const db = readDB();
  db.expenses = db.expenses.filter(e => e.id !== req.params.id);
  writeDB(db);
  res.status(204).send();
});

// SETTLEMENTS
app.get("/settlements", async (req, res) => {
  const { groupId } = req.query;
  if (useMongo && mongoose.connection.readyState === 1) {
    const filter = groupId ? { groupId } : {};
    return res.json(await Settlement.find(filter));
  }
  const db = readDB();
  const settlements = groupId ? db.settlements.filter(s => s.groupId === groupId) : db.settlements;
  res.json(settlements);
});

app.post("/settlements", async (req, res) => {
  if (useMongo && mongoose.connection.readyState === 1) {
    const settlement = new Settlement(req.body);
    await settlement.save();
    return res.status(201).json(settlement);
  }
  const db = readDB();
  const settlement = { ...req.body, id: generateId() };
  db.settlements.push(settlement);
  writeDB(db);
  res.status(201).json(settlement);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
