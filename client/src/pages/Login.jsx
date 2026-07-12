import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import authService from "../services/authService";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Login successful! Welcome to AssetFlow.");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await authService.forgotPassword();
      toast.success("Simulation: Forgot password request received!");
    } catch (error) {
      toast.error("Forgot password request failed.");
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-zinc-950 p-4 select-none relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-emerald-600/5 blur-[150px] pointer-events-none" />

      <Card className="w-full max-w-md border border-zinc-800/80 bg-zinc-900/40 p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-550/20 font-black text-white text-2xl mb-4 tracking-wider">
            AF
          </div>
          <h2 className="text-xl font-bold text-zinc-100">Welcome Back</h2>
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-1">
            Sign in to your AssetFlow ERP account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@assetflow.com"
            error={errors.email?.message}
            required
            {...register("email", {
              required: "Email address is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address format",
              },
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            required
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters long",
              },
            })}
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 text-zinc-400 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded bg-zinc-900 border-zinc-800 text-blue-600 focus:ring-blue-600/50"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-all"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 py-2.5"
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-500 font-semibold mt-6">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-400 hover:text-blue-300 font-bold hover:underline transition-all"
          >
            Sign Up
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
