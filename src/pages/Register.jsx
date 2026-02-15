import { useForm } from "react-hook-form";
import { registerUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import AuthLayout from "../components/AuthLayout";

const Register = () => {

  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {

    if (!data.name || !data.email || !data.password) {
      toast.error("All fields required");
      return;
    }

    if (data.password.length < 6) {
      toast.error("Password must be 6+ chars");
      return;
    }

    try {
      await registerUser(data);

      toast.success("Account created!");
      reset();
      navigate("/");

    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start splitting smarter"
    >

      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>

      <form onSubmit={handleSubmit(onSubmit)}>

        <input
          {...register("name")}
          placeholder="Name"
          className="w-full border p-3 rounded mb-4"
        />

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
          Sign Up
        </button>

      </form>

      <p className="mt-4 text-sm">
        Already have account?
        <Link to="/" className="text-emerald-600 ml-1">
          Log In
        </Link>
      </p>

    </AuthLayout>
  );
};

export default Register;
