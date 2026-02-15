import api from "../api/axios";

// ================= GET GROUPS =================
export const getGroups = async (userId) => {
  const res = await api.get("/groups");
  return res.data.filter(g => g.members.includes(userId));
};

// ================= GET GROUP =================
export const getGroup = async (id) => {
  const res = await api.get(`/groups/${id}`);
  return res.data;
};

// ================= CREATE =================
export const createGroup = async (name, adminId) => {
  const group = {
    name,
    admin: adminId,
    members: [adminId],
    joinCode: Math.random().toString(36).substring(2,7)
  };

  const res = await api.post("/groups", group);
  return res.data;
};

// ================= JOIN =================
export const joinGroup = async (code, userId) => {
  const res = await api.get("/groups",{ params:{ joinCode:code }});

  if(res.data.length===0)
    throw new Error("Invalid code");

  const group = res.data[0];

  if(!group.members.includes(userId)){
    group.members.push(userId);
    await api.put(`/groups/${group.id}`,group);
  }
};

// ================= UPDATE GROUP ⭐ (FIX)
export const updateGroup = async (group)=>{
  const res =
    await api.put(`/groups/${group.id}`,group);
  return res.data;
};

// ================= LEAVE =================
export const leaveGroup = async (group,userId)=>{
  group.members =
    group.members.filter(m=>m!==userId);

  await updateGroup(group);
};

// ================= DELETE =================
export const deleteGroup = async (id)=>{
  await api.delete(`/groups/${id}`);
};

// ================= ADD MEMBER =================
export const addMemberToGroup =
async(group,email)=>{

  const users =
    await api.get("/users",{ params:{ email }});

  if(users.data.length===0)
    throw new Error("User not found");

  const uid = users.data[0].id;

  if(group.members.includes(uid))
    throw new Error("Already member");

  group.members.push(uid);

  await updateGroup(group);
};
