import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import toast from "react-hot-toast";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signup(data.name, data.email, data.password);
      toast.success("Account created successfully! Welcome to AssetFlow.");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const password = watch("password", "");

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
          <h2 className="text-xl font-bold text-zinc-100">Create Account</h2>
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-1">
            Register your Employee profile
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.name?.message}
            required
            {...register("name", {
              required: "Full name is required",
              minLength: {
                value: 3,
                message: "Name must be at least 3 characters long",
              },
            })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john.doe@assetflow.com"
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

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            required
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />

          <Button
            type="submit"
            className="w-full mt-2 py-2.5"
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-500 font-semibold mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 font-bold hover:underline transition-all"
          >
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Signup;
