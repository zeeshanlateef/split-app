import api from "../api/axios";

export const getGroupExpenses =
async(groupId)=>{
  const res = await api.get("/expenses",
    { params:{ groupId }});
  return res.data;
};

export const addExpense =
async(data)=>{
  const res = await api.post("/expenses",data);
  return res.data;
};

export const recordSettlement =
async(data)=>{
  const res =
    await api.post("/settlements",data);
  return res.data;
};

export const getSettlements =
async(groupId)=>{
  const res =
    await api.get("/settlements",
      { params:{ groupId }});
  return res.data;
};
