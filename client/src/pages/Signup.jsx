import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Cpu,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  User
} from "lucide-react";

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
      toast.success("Account created successfully! Welcome to the workspace.");
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
    <div className="min-h-screen w-screen flex bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none">
      {/* LEFT PANEL: Register Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 sm:p-12 md:p-16 relative z-10 bg-zinc-950 border-r border-zinc-900">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-550/20 font-black text-white text-lg tracking-wider">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-zinc-150 leading-none">AssetFlow</span>
            <span className="text-[8px] text-zinc-550 font-bold uppercase tracking-wider mt-0.5">Enterprise Asset Intelligence</span>
          </div>
        </div>

        {/* Center Form Content */}
        <div className="my-auto max-w-sm w-full mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-zinc-100 tracking-tight font-sans">Create Your Workspace</h2>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Create your organization workspace and manage enterprise assets, resources, maintenance, bookings and operations from one intelligent ERP platform.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-4 w-4 text-zinc-555" />
                </span>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-blue-500/50 rounded-xl text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none transition-all"
                  {...register("name", {
                    required: "Full name is required",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 characters",
                    },
                  })}
                />
              </div>
              {errors.name && (
                <span className="text-[10px] text-red-400 font-semibold">{errors.name.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-4 w-4 text-zinc-555" />
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-blue-500/50 rounded-xl text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none transition-all"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email format",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <span className="text-[10px] text-red-400 font-semibold">{errors.email.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-555" />
                </span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-blue-500/50 rounded-xl text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none transition-all"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
              </div>
              {errors.password && (
                <span className="text-[10px] text-red-400 font-semibold">{errors.password.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-555" />
                </span>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-blue-500/50 rounded-xl text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none transition-all"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-[10px] text-red-400 font-semibold">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-600/15"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Organization</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center space-x-1.5 text-xs text-zinc-500 font-semibold">
            <span>Already registered?</span>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline">
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
          <span>Protected with JWT + Encryption</span>
          <span>© 2026 ASSETFLOW</span>
        </div>
      </div>

      {/* RIGHT PANEL: Billion-Dollar SaaS Illustration */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-16 bg-zinc-950 overflow-hidden">
        {/* Visual Background grid and neon lights */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(63,63,70,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(63,63,70,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2 bg-zinc-900/80 border border-zinc-800/80 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-zinc-350">Enterprise Ready</span>
          </div>

          <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-blue-400">Live Sync</span>
          </div>
        </div>

        {/* Center illustration & Live metrics */}
        <div className="relative z-10 my-auto space-y-12">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/15 to-indigo-500/15 border border-blue-500/25 px-4 py-1.5 rounded-full text-xs font-bold text-blue-400"
            >
              <Sparkles className="h-4 w-4 text-blue-400 animate-spin" />
              <span>Real-Time Collaboration</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl xl:text-5xl font-black tracking-tight leading-tight text-white max-w-lg"
            >
              The Enterprise Operating System for Asset Intelligence
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-sm text-zinc-400 leading-relaxed max-w-md font-medium"
            >
              An intelligent ERP operating system built for asset tracking, resource allocation, preventive maintenance scheduling, approval workflows, and compliance audit logging.
            </motion.p>
          </div>

          {/* Futuristic Live Metrics Cards */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { label: "Assets Managed", val: "154,280+", sub: "99.9% Tracking Accuracy", icon: TrendingUp, color: "text-blue-400" },
              { label: "Resource Utilization", val: "94.2%", sub: "Active Scheduling", icon: Cpu, color: "text-purple-400" }
            ].map((metric, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                key={i}
                className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-850/60 backdrop-blur-md space-y-3 hover:border-zinc-800 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">{metric.label}</span>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
                <h4 className="text-2xl font-black text-white tracking-tight">{metric.val}</h4>
                <p className="text-[10px] text-zinc-550 font-bold">{metric.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Ticker Feed */}
        <div className="flex items-center space-x-4 relative z-10 bg-zinc-900/10 border border-zinc-850/30 p-3 rounded-2xl backdrop-blur-sm max-w-sm">
          <Activity className="h-5 w-5 text-indigo-400 flex-shrink-0 animate-pulse" />
          <div className="text-[11px] text-zinc-450 leading-relaxed font-semibold">
            <span className="text-zinc-300 font-bold">Latest ERP Event:</span> Asset "Dell Latitude 7440" assigned to Engineering.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
