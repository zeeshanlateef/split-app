import api from "../api/axios";

// REGISTER USER
export const registerUser = async (data) => {

  // Check duplicate email
  const existing = await api.get("/users", {
    params: { email: data.email },
  });

  if (existing.data.length > 0) {
    throw new Error("Email already registered");
  }

  const res = await api.post("/users", data);
  return res.data;
};


// LOGIN USER
export const loginUser = async (email, password) => {

  const res = await api.get("/users", {
    params: { email },
  });

  const user = res.data[0];

  if (!user || user.password !== password) {
    throw new Error("Invalid credentials");
  }

  return user;
};
