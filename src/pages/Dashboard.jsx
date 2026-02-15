import { useEffect, useState } from "react";
import { getGroups, createGroup, joinGroup } from "../services/groupService";
import { getGroupExpenses } from "../services/expenseService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { calculateBalances } from "../utils/splitCalculator";
import { toast } from "react-toastify";

const Dashboard = () => {

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const [owe, setOwe] = useState(0);
  const [owed, setOwed] = useState(0);

  // ================= LOAD GROUPS & BALANCES =================
  const load = async () => {

    const g = await getGroups(user.id);
    setGroups(g);

    // Calculate global balance
    let totalOwe = 0;
    let totalOwed = 0;

    for (let group of g) {
      const exp = await getGroupExpenses(group.id);
      const balances = calculateBalances(exp, group.members);

      const myBal = balances[user.id] || 0;

      if (myBal < 0) totalOwe += Math.abs(myBal);
      else totalOwed += myBal;
    }

    setOwe(totalOwe);
    setOwed(totalOwed);
  };

  useEffect(() => {
    if (!user) navigate("/");
    else load();
  }, []);

  // ================= CREATE =================
  const create = async () => {
    if (!name) return toast.error("Enter group name");

    await createGroup(name, user.id);
    toast.success("Group created");

    setName("");
    load();
  };

  // ================= JOIN =================
  const join = async () => {
    try {
      await joinGroup(code, user.id);
      toast.success("Joined successfully");

      setCode("");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* LEFT SIDEBAR */}
      <aside className="hidden md:block w-64 bg-emerald-600 text-white p-5">

        <h2 className="text-2xl font-bold mb-6">
          SPLITWISE
        </h2>

        <p className="text-xs text-emerald-200 mb-2 uppercase">
          Your Groups
        </p>

        {groups.map(g => (
          <div
            key={g.id}
            onClick={() => navigate(`/group/${g.id}`)}
            className="bg-emerald-500 p-2 mb-2 rounded cursor-pointer hover:bg-emerald-400"
          >
            <p className="font-semibold">{g.name}</p>
            <p className="text-xs">Members: {g.members.length}</p>
          </div>
        ))}

      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold">
              Hello, {user?.name}
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your shared expenses
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>

        </header>

        {/* CONTENT */}
        <div className="flex flex-col lg:flex-row p-6 gap-6">

          {/* CENTER */}
          <div className="flex-1 space-y-6">

            {/* CREATE */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-bold mb-3 text-lg">
                Create New Group
              </h2>

              <div className="flex flex-col md:flex-row gap-3">
                <input
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  placeholder="Group name"
                  className="border p-2 rounded w-full"
                />

                <button
                  onClick={create}
                  className="bg-emerald-500 text-white px-6 py-2 rounded"
                >
                  Create
                </button>
              </div>
            </div>

            {/* JOIN */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-bold mb-3 text-lg">
                Join Group
              </h2>

              <div className="flex flex-col md:flex-row gap-3">
                <input
                  value={code}
                  onChange={(e)=>setCode(e.target.value)}
                  placeholder="Enter join code"
                  className="border p-2 rounded w-full"
                />

                <button
                  onClick={join}
                  className="bg-blue-500 text-white px-6 py-2 rounded"
                >
                  Join
                </button>
              </div>
            </div>

            {/* GROUP LIST */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-bold mb-4 text-lg">
                Your Groups
              </h2>

              {groups.length === 0 ? (
                <p className="text-gray-500">
                  No groups yet
                </p>
              ) : (
                groups.map(g => (
                  <div
                    key={g.id}
                    onClick={()=>navigate(`/group/${g.id}`)}
                    className="border rounded-lg p-4 mb-3 cursor-pointer hover:shadow-md"
                  >
                    <h3 className="font-semibold">{g.name}</h3>
                    <p className="text-sm text-gray-500">
                      Members: {g.members.length}
                    </p>
                    <p className="text-xs text-gray-400">
                      Code: {g.joinCode}
                    </p>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className="w-full lg:w-80">

            <div className="bg-white p-6 rounded-xl shadow-sm">

              <h3 className="font-bold text-lg mb-4">
                Your Balance
              </h3>

              <div className="space-y-3 text-sm">

                <div className="flex justify-between">
                  <span>You owe</span>
                  <span className="text-red-500 font-semibold">
                    ₹{owe.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>You are owed</span>
                  <span className="text-emerald-600 font-semibold">
                    ₹{owed.toFixed(2)}
                  </span>
                </div>

                <hr />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-emerald-600">
                    ₹{(owed - owe).toFixed(2)}
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
