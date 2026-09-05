import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check password
    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    // Check confirm password
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://nexora-smart-infrastructure-monitoring.onrender.com/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }
      );

      setSuccess(
        response.data.message || "Registration successful!"
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "USER",
      });

      // Go to login after 1.5 seconds
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response) {
        setError(
          err.response.data.message || "Registration failed."
        );
      } else {
        setError("Unable to connect to NEXORA server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ===============================
            LEFT SIDE
        =============================== */}

        <div className="hidden flex-col justify-between bg-slate-900 p-10 lg:flex">

          <div>

            <h1 className="text-3xl font-bold text-cyan-400">
              NEXORA
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Infrastructure Intelligence Platform
            </p>

          </div>

          <div className="max-w-lg">

            <ShieldCheck
              size={48}
              className="mb-6 text-cyan-400"
            />

            <h2 className="text-4xl font-bold leading-tight">

              Build your
              <span className="text-cyan-400">
                {" "}NEXORA account.
              </span>

            </h2>

            <p className="mt-6 leading-7 text-slate-400">

              Create an account to monitor
              infrastructure projects, analyze
              performance, manage risks and
              access intelligent project data.

            </p>

            <div className="mt-8 space-y-3 text-sm text-slate-400">

              <p>✓ Infrastructure monitoring</p>

              <p>✓ Project analytics</p>

              <p>✓ Risk and alert management</p>

              <p>✓ Secure authentication</p>

            </div>

          </div>

          <p className="text-xs text-slate-600">
            © 2026 NEXORA. Infrastructure Intelligence.
          </p>

        </div>

        {/* ===============================
            RIGHT SIDE
        =============================== */}

        <div className="flex items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}

            <div className="mb-8 lg:hidden">

              <h1 className="text-3xl font-bold text-cyan-400">
                NEXORA
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Infrastructure Intelligence
              </p>

            </div>

            {/* HEADER */}

            <div className="mb-8">

              <p className="text-sm font-medium text-cyan-400">
                CREATE ACCOUNT
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Join NEXORA
              </h2>

              <p className="mt-2 text-slate-400">
                Create your infrastructure monitoring account.
              </p>

            </div>

            {/* ERROR */}

            {error && (

              <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>

            )}

            {/* SUCCESS */}

            {success && (

              <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                {success}
              </div>

            )}

            {/* FORM */}

            <form
              onSubmit={handleRegister}
              className="space-y-5"
            >

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm text-slate-300">
                  Full Name
                </label>

                <div className="relative">

                  <User
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-sm text-slate-300">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <label className="mb-2 block text-sm text-slate-300">
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >

                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}

                  </button>

                </div>

                <p className="mt-2 text-xs text-slate-600">
                  Minimum 8 characters
                </p>

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label className="mb-2 block text-sm text-slate-300">
                  Confirm Password
                </label>

                <div className="relative">

                  <Lock
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >

                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}

                  </button>

                </div>

              </div>

              {/* ROLE */}

              <div>

                <label className="mb-2 block text-sm text-slate-300">
                  Account Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                >

                  <option value="USER">
                    User
                  </option>

                  <option value="OFFICER">
                    Officer
                  </option>

                  <option value="CONTRACTOR">
                    Contractor
                  </option>

                  <option value="INSPECTOR">
                    Inspector
                  </option>

                </select>

              </div>

              {/* CREATE */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-500 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading
                  ? "Creating Account..."
                  : "Create Account"}

              </button>

            </form>

            {/* LOGIN */}

            <div className="mt-8 text-center">

              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
              >

                <ArrowLeft size={16} />

                Already have an account?

                <span className="font-medium text-cyan-400">
                  Sign in
                </span>

              </button>

            </div>

            {/* SECURITY */}

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600">

              <ShieldCheck size={15} />

              Protected by NEXORA Security

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;