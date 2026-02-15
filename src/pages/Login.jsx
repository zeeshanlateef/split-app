import { useForm } from "react-hook-form";
import { loginUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import AuthLayout from "../components/AuthLayout";

const Login = () => {

  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {

    if (!data.email || !data.password) {
      toast.error("Enter email & password");
      return;
    }

    try {
      const user = await loginUser(data.email, data.password);

      login(user);
      toast.success("Login successful");

      navigate("/dashboard");

    } catch (err) {
      toast.error("Invalid email or password");
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Login to manage expenses"
    >

      <h2 className="text-2xl font-bold mb-6">Log In</h2>

      <form onSubmit={handleSubmit(onSubmit)}>

        <input
          {...register("email")}
          placeholder="Email"
          className="w-full border p-3 rounded mb-4"
        />

        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-4"
        />

        <button className="w-full bg-emerald-500 text-white p-3 rounded-lg hover:bg-emerald-600">
          Log In
        </button>

      </form>

      <p className="mt-4 text-sm">
        Don't have account?
        <Link to="/register" className="text-emerald-600 ml-1">
          Sign Up
        </Link>
      </p>

    </AuthLayout>
  );
};

export default Login;
