import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";

import User from "./models/User.js";
import Group from "./models/Group.js";
import Expense from "./models/Expense.js";
import Settlement from "./models/Settlement.js";

dotenv.config();

const migrate = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error("MONGODB_URI is required");

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const dbData = JSON.parse(fs.readFileSync("./db.json", "utf-8"));

    // Users
    console.log("Migrating users...");
    const userMap = {}; // mapping old string id to new ObjectId
    for (const u of dbData.users) {
      const newUser = new User({
        name: u.name,
        email: u.email,
        password: u.password
      });
      const saved = await newUser.save();
      userMap[u.id] = saved._id;
    }

    // Groups
    console.log("Migrating groups...");
    const groupMap = {};
    for (const g of dbData.groups) {
      const newGroup = new Group({
        name: g.name,
        admin: userMap[g.admin],
        members: (g.members || []).map(m => userMap[m]).filter(id => id),
        joinCode: g.joinCode
      });
      const saved = await newGroup.save();
      groupMap[g.id] = saved._id;
    }

    // Expenses
    console.log("Migrating expenses...");
    for (const e of dbData.expenses) {
      const newExpense = new Expense({
        groupId: e.groupId ? groupMap[e.groupId] : null,
        description: e.description,
        amount: e.amount || 0,
        paidBy: userMap[e.paidBy],
        splitBetween: (e.splitBetween || []).map(s => userMap[s]).filter(id => id)
      });
      await newExpense.save();
    }

    // Settlements
    console.log("Migrating settlements...");
    for (const s of dbData.settlements) {
      const newSettlement = new Settlement({
        groupId: s.groupId ? groupMap[s.groupId] : null,
        from: userMap[s.from],
        to: userMap[s.to],
        amount: s.amount
      });
      await newSettlement.save();
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrate();
