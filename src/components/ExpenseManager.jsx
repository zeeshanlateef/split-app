import { useEffect, useState } from "react";
import { addExpense, getExpenses } from "../services/expenseService";
import { toast } from "react-toastify";

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const load = async () => {
    const res = await getExpenses();
    setExpenses(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!title || !amount) {
      toast.error("Fill all fields");
      return;
    }

    await addExpense({
      title,
      amount: Number(amount),
      createdAt: Date.now(),
    });

    setTitle("");
    setAmount("");
    toast.success("Expense added");
    load();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-6">
      <h2 className="text-xl font-semibold mb-4">Expenses</h2>

      <div className="flex gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Title"
        />

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded w-32"
          placeholder="Amount"
        />

        <button
          onClick={submit}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {expenses.map((e) => (
        <div key={e.id} className="bg-gray-100 p-3 rounded mb-2">
          {e.title} — ₹{e.amount}
        </div>
      ))}
    </div>
  );
}
