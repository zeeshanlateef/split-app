import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import api from "../api/axios";
import {
  addMemberToGroup,
  leaveGroup,
  deleteGroup
} from "../services/groupService";

import {
  getGroupExpenses,
  addExpense,
  recordSettlement,
  getSettlements
} from "../services/expenseService";

import {
  calculateBalances,
  settlement
} from "../utils/splitCalculator";

import { toast } from "react-toastify";


// ================= MODAL =================
const ConfirmModal = ({open,onClose,onYes,text})=>{
  if(!open) return null;

  return(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-80 shadow-xl">

        <h2 className="font-bold text-lg mb-3">
          Confirmation
        </h2>

        <p className="text-gray-600 mb-6">
          {text}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            No
          </button>

          <button
            onClick={onYes}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Yes
          </button>
        </div>

      </div>
    </div>
  )
};


const GroupDetails = ()=>{

  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [group,setGroup]=useState(null);
  const [users,setUsers]=useState([]);
  const [expenses,setExpenses]=useState([]);
  const [settlements,setSettle]=useState([]);

  const [member,setMember]=useState("");
  const [desc,setDesc]=useState("");
  const [amount,setAmount]=useState("");

  const [leaveOpen,setLeaveOpen]=useState(false);
  const [deleteOpen,setDeleteOpen]=useState(false);

  // ================= LOAD =================
  const load = async()=>{
    const g = await api.get(`/groups/${id}`);
    const u = await api.get("/users");
    const e = await getGroupExpenses(id);
    const s = await getSettlements(id);

    setGroup(g.data);
    setUsers(u.data);
    setExpenses(e);
    setSettle(s);
  };

  useEffect(()=>{ load(); },[]);

  if(!group) return null;

  // ================= ADD MEMBER =================
  const addMember=async()=>{
    if(!member) return toast.error("Enter email");

    try{
      await addMemberToGroup(group,member);
      toast.success("Member Added");
      setMember("");
      load();
    }catch(e){
      toast.error(e.message);
    }
  };

  // ================= ADD EXPENSE =================
  const addExp=async()=>{
    if(!desc || !amount)
      return toast.error("Fill all fields");

    await addExpense({
      groupId:id,
      description:desc,
      amount:Number(amount),
      paidBy:user.id,
      splitBetween:group.members
    });

    toast.success("Expense Added");

    setDesc("");
    setAmount("");
    load();
  };

  // ================= BALANCES =================
  const balances =
    calculateBalances(expenses, group.members);

  settlements.forEach(s=>{
    if(!balances[s.from]) balances[s.from]=0;
    if(!balances[s.to]) balances[s.to]=0;

    balances[s.from]+=Number(s.amount);
    balances[s.to]-=Number(s.amount);
  });

  Object.keys(balances).forEach(k=>{
    balances[k]=Number(balances[k].toFixed(2));
  });

  const suggest = settlement(balances);

  // ================= UI =================
  return(
  <div className="min-h-screen bg-gray-100">

    <ConfirmModal
      open={leaveOpen}
      onClose={()=>setLeaveOpen(false)}
      text="Are you sure you want to leave group?"
      onYes={async()=>{
        await leaveGroup(group,user.id);
        toast.success("Left Group");
        navigate("/dashboard");
      }}
    />

    <ConfirmModal
      open={deleteOpen}
      onClose={()=>setDeleteOpen(false)}
      text="Delete group permanently?"
      onYes={async()=>{
        await deleteGroup(group.id);
        toast.success("Deleted");
        navigate("/dashboard");
      }}
    />

    {/* HEADER */}
    <header className="bg-white shadow px-6 py-4 flex justify-between">
      <div>
        <h1 className="text-xl font-bold">{group.name}</h1>
        <p className="text-sm text-gray-500">
          {user.name}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={()=>navigate("/dashboard")}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          Dashboard
        </button>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </header>

    {/* BODY */}
    <div className="p-6 grid lg:grid-cols-3 gap-6">

      {/* MEMBERS */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <h3 className="font-bold">Members</h3>

        {group.members.map(m=>{
          const u=users.find(x=>x.id===m);
          return <p key={m}>{u?.name}</p>
        })}

        {group.admin===user.id && (
        <>
          <input
            value={member}
            onChange={e=>setMember(e.target.value)}
            onKeyDown={(e)=>e.key==="Enter"&&addMember()}
            placeholder="Email"
            className="border p-2 rounded w-full"
          />

          <button
            onClick={addMember}
            className="bg-emerald-500 text-white w-full py-2 rounded"
          >
            Add Member
          </button>
        </>
        )}

        <button
          onClick={()=>setLeaveOpen(true)}
          className="bg-yellow-500 text-white w-full py-2 rounded"
        >
          Leave
        </button>

        {group.admin===user.id && (
          <button
            onClick={()=>setDeleteOpen(true)}
            className="bg-red-600 text-white w-full py-2 rounded"
          >
            Delete
          </button>
        )}
      </div>

      {/* EXPENSE */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Add Expense</h3>

        <input
          value={desc}
          onChange={e=>setDesc(e.target.value)}
          onKeyDown={(e)=>e.key==="Enter"&&addExp()}
          placeholder="Description"
          className="border p-2 w-full mb-2 rounded"
        />

        <input
          value={amount}
          onChange={e=>setAmount(e.target.value)}
          onKeyDown={(e)=>e.key==="Enter"&&addExp()}
          placeholder="Amount"
          className="border p-2 w-full mb-2 rounded"
        />

        <button
          onClick={addExp}
          className="bg-emerald-600 text-white w-full py-2 rounded"
        >
          Add Expense
        </button>

        <hr className="my-4"/>

        {expenses.map(e=>(
          <div key={e.id} className="border-b py-2 text-sm">
            {e.description} — ₹{e.amount}
          </div>
        ))}
      </div>

      {/* BALANCE */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-3">Balances</h3>

        {Object.entries(balances).map(([uid,val])=>{
          const name=users.find(x=>x.id==uid)?.name;

          return(
            <div key={uid}
              className="flex justify-between py-1">
              <span>{name}</span>
              <span className={
                val>=0
                  ?"text-emerald-600 font-semibold"
                  :"text-red-500 font-semibold"
              }>
                ₹{val}
              </span>
            </div>
          )
        })}

        <hr className="my-3"/>

        <h4 className="font-semibold mb-2">
          Suggested Settlement
        </h4>

        {suggest.map((s,i)=>{
          const from=users.find(x=>x.id==s.from)?.name;
          const to=users.find(x=>x.id==s.to)?.name;

          return(
            <div key={i}
              className="flex justify-between items-center py-1">

              <span className="text-sm">
                {from} → {to} ₹{s.amount.toFixed(2)}
              </span>

              <button
                onClick={async()=>{
                  await recordSettlement({
                    groupId:id,
                    from:s.from,
                    to:s.to,
                    amount:s.amount
                  });
                  toast.success("Settled");
                  load();
                }}
                className="bg-emerald-500 text-white px-2 py-1 rounded text-sm"
              >
                Pay
              </button>

            </div>
          )
        })}
      </div>

    </div>
  </div>
  )
}

export default GroupDetails;
