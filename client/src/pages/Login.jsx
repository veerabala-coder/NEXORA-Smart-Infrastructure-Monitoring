import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======================================
  // LOGIN
  // ======================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;

      // Save JWT token
      localStorage.setItem(
        "nexora_token",
        token
      );

      // Save logged-in user
      localStorage.setItem(
        "nexora_user",
        JSON.stringify(user)
      );

      // Go to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data.message ||
            "Login failed"
        );
      } else {
        setError(
          "Unable to connect to NEXORA server."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ==================================
            LEFT SIDE
        ================================== */}

        <div className="hidden flex-col justify-between bg-slate-900 p-10 lg:flex">

          {/* LOGO */}

          <div>

            <h1 className="text-3xl font-bold text-cyan-400">
              NEXORA
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Infrastructure Intelligence Platform
            </p>

          </div>

          {/* DESCRIPTION */}

          <div className="max-w-lg">

            <ShieldCheck
              size={48}
              className="mb-6 text-cyan-400"
            />

            <h2 className="text-4xl font-bold leading-tight">

              Smart monitoring for

              <span className="text-cyan-400">
                {" "}modern infrastructure.
              </span>

            </h2>

            <p className="mt-6 leading-7 text-slate-400">

              Monitor infrastructure projects,
              track progress, manage risks and
              make data-driven decisions from
              one intelligent platform.

            </p>

          </div>

          {/* FOOTER */}

          <p className="text-xs text-slate-600">
            © 2026 NEXORA. Infrastructure Intelligence.
          </p>

        </div>

        {/* ==================================
            RIGHT SIDE
        ================================== */}

        <div className="flex items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}

            <div className="mb-10 lg:hidden">

              <h1 className="text-3xl font-bold text-cyan-400">
                NEXORA
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Infrastructure Intelligence
              </p>

            </div>

            {/* ==================================
                HEADING
            ================================== */}

            <div className="mb-8">

              <p className="text-sm font-medium text-cyan-400">
                SECURE ACCESS
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Welcome back
              </h2>

              <p className="mt-2 text-slate-400">
                Sign in to access your infrastructure dashboard.
              </p>

            </div>

            {/* ==================================
                ERROR MESSAGE
            ================================== */}

            {error && (

              <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">

                {error}

              </div>

            )}

            {/* ==================================
                LOGIN FORM
            ================================== */}

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

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
                    placeholder="admin@nexora.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                  />

                  {/* SHOW PASSWORD */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
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

              </div>

              {/* ==================================
                  OPTIONS
              ================================== */}

              <div className="flex items-center justify-between">

                {/* REMEMBER ME */}

                <label className="flex items-center gap-2 text-sm text-slate-400">

                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-cyan-500"
                  />

                  Remember me

                </label>

                {/* FORGOT PASSWORD */}

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Password reset feature will be available soon."
                    )
                  }
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Forgot password?
                </button>

              </div>

              {/* ==================================
                  LOGIN BUTTON
              ================================== */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-500 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading
                  ? "Signing in..."
                  : "Sign In"}

              </button>

            </form>

            {/* ==================================
                REGISTER
            ================================== */}

            <p className="mt-8 text-center text-sm text-slate-500">

              Don't have an account?

              <button
                type="button"
                onClick={() =>
                  navigate("/register")
                }
                className="ml-1 font-medium text-cyan-400 hover:text-cyan-300"
              >
                Create account
              </button>

            </p>

            {/* ==================================
                SECURITY
            ================================== */}

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

export default Login;