import React, { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User2,
  Github,
  Chrome,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import AnimatedBlobs from "../components/ui/AnimatedBlobs";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "otp">("login");
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [otp, setOtp] = useState("");

  const strength = useMemo(() => passwordStrength(password), [password]);
  const isSignup = mode === "signup";
  const isOtp = mode === "otp";

  const { login, signup } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignup) {
      // const payload = { name, email, password };
      if (password !== confirm) {
        toast.error("Passwords don't match!");
        return;
      }
      if (!agree) {
        toast.error("You must agree to the terms and conditions!");
        return;
      }

      try {
        await api.post("/api/otp/send-otp", { email });
        setMode("otp"); // Switch to OTP mode
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to send OTP");
      }
    } else if (isOtp) {
      try {
        await signup(name, email, password);
        toast.success("Account created successfully!");
        setTimeout(() => {
          login(email, password);
        }, 1500);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Invalid OTP");
      }
    } else {
      try {
        // const payload = { email, password };
        await login(email, password);
        toast.success("Logged in successfully!");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Login failed");
      }
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(60rem_60rem_at_70%_-10%,rgba(99,102,241,0.25),transparent),radial-gradient(50rem_50rem_at_-10%_120%,rgba(37,99,235,0.25),transparent)]">
      <AnimatedBlobs />
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="text-sm font-medium tracking-wide text-neutral-200">Ping</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-300/80">
          <ShieldCheck className="size-4" />
          <span>End-to-end security • OAuth ready</span>
        </div>
      </div>

      <div className="relative z-20 mx-auto grid min-h-dvh w-full max-w-6xl place-items-center px-4 mt-20 md:mt-0">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <Header mode={mode} setMode={setMode} />

            <motion.form
              key={isOtp ? "otp" : "auth"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onSubmit={onSubmit}
              className="mt-6 space-y-4"
              noValidate
            >
              {isOtp ? (
                <>
                  <Field
                    label="Enter OTP"
                    htmlFor="otp"
                    icon={<Lock className="size-4" />}
                  >
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder="Enter 6-digit OTP"
                      className="peer w-full rounded-xl bg-neutral-800/70 px-4 py-3 text-sm text-neutral-100 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-violet-400/70 placeholder:text-neutral-500"
                    />
                  </Field>
                  <p className="text-xs text-neutral-400">
                    We've sent a 6-digit code to {email}. Please check your inbox or spam folder.
                  </p>
                </>
              ) : isSignup ? (
                <>
                  <Field
                    label="Full name"
                    htmlFor="name"
                    icon={<User2 className="size-4" />}
                  >
                    <input
                      id="name"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Ada Lovelace"
                      className="peer w-full rounded-xl bg-neutral-800/70 px-4 py-3 text-sm text-neutral-100 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-violet-400/70 placeholder:text-neutral-500"
                    />
                  </Field>
                  <Field
                    label="Email"
                    htmlFor="email"
                    icon={<Mail className="size-4" />}
                  >
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@domain.com"
                      className="peer w-full rounded-xl bg-neutral-800/70 px-4 py-3 text-sm text-neutral-100 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-violet-400/70 placeholder:text-neutral-500"
                    />
                  </Field>
                  <Field
                    label="Password"
                    htmlFor="password"
                    icon={<Lock className="size-4" />}
                    right={
                      <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="rounded-lg p-1.5 text-neutral-400/90 transition hover:bg-white/5 hover:text-neutral-200"
                        aria-label={showPwd ? "Hide password" : "Show password"}
                      >
                        {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    }
                  >
                    <input
                      id="password"
                      name="password"
                      type={showPwd ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Create a strong password"
                      className="peer w-full rounded-xl bg-neutral-800/70 px-4 py-3 text-sm text-neutral-100 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-violet-400/70 placeholder:text-neutral-500"
                    />
                  </Field>
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 m-auto">
                      <div
                        className={"h-full transition-all " + strengthBarClass(strength.score)}
                        style={{ width: `${Math.max(8, strength.score * 25)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Strength: <span className="font-medium text-neutral-200">{strength.label}</span>
                    </p>
                  </div>
                  <Field label="Confirm password" htmlFor="confirm">
                    <input
                      id="confirm"
                      name="confirm"
                      type={showPwd ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      placeholder="Re-enter password"
                      className="peer w-full rounded-xl bg-neutral-800/70 px-4 py-3 text-sm text-neutral-100 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-violet-400/70 placeholder:text-neutral-500"
                    />
                  </Field>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <label className="flex cursor-pointer select-none items-start gap-3 text-xs text-neutral-300">
                      <input
                        type="checkbox"
                        className="mt-0.5 size-4 rounded border-white/20 bg-neutral-800/70 text-violet-500 focus:ring-violet-400"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        required
                      />
                      <span>
                        I agree to the <a className="underline decoration-dotted underline-offset-2 hover:text-neutral-100" href="#">Terms</a> and <a className="underline decoration-dotted underline-offset-2 hover:text-neutral-100" href="#">Privacy</a>.
                      </span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <Field
                    label="Email"
                    htmlFor="email"
                    icon={<Mail className="size-4" />}
                  >
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@domain.com"
                      className="peer w-full rounded-xl bg-neutral-800/70 px-4 py-3 text-sm text-neutral-100 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-violet-400/70 placeholder:text-neutral-500"
                    />
                  </Field>
                  <Field
                    label="Password"
                    htmlFor="password"
                    icon={<Lock className="size-4" />}
                    right={
                      <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="rounded-lg p-1.5 text-neutral-400/90 transition hover:bg-white/5 hover:text-neutral-200"
                        aria-label={showPwd ? "Hide password" : "Show password"}
                      >
                        {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    }
                  >
                    <input
                      id="password"
                      name="password"
                      type={showPwd ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Your password"
                      className="peer w-full rounded-xl bg-neutral-800/70 px-4 py-3 text-sm text-neutral-100 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-violet-400/70 placeholder:text-neutral-500"
                    />
                  </Field>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <a href="#" className="text-xs font-medium text-blue-300/90 hover:text-blue-200">Forgot password?</a>
                  </div>
                </>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_-10px_rgba(59,130,246,0.6)] transition hover:brightness-[1.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70"
              >
                <span className="relative z-10">
                  {isOtp ? "Verify OTP" : isSignup ? "Create account" : "Sign in"}
                </span>
                <ArrowRight className="relative z-10 size-4 transition-transform group-hover:translate-x-0.5" />
                <span className="absolute inset-0 -z-0 bg-[radial-gradient(20rem_12rem_at_20%_0%,rgba(255,255,255,0.15),transparent)]" />
              </motion.button>

              {!isOtp && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="h-px w-full bg-white/10" />
                    <span className="text-[11px] uppercase tracking-wider text-neutral-400">or</span>
                    <div className="h-px w-full bg-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <OAuthButton icon={<Github className="size-4" />} label="GitHub" onClick={() => console.log("oauth github")} />
                    <OAuthButton icon={<Chrome className="size-4" />} label="Google" onClick={() => console.log("oauth google")} />
                  </div>
                  <p className="pt-2 text-center text-sm text-neutral-400">
                    {isSignup ? "Already have an account?" : "New here?"}{" "}
                    <button
                      type="button"
                      onClick={() => setMode(isSignup ? "login" : "signup")}
                      className="font-medium text-blue-300/90 underline decoration-dotted underline-offset-4 hover:text-blue-200"
                    >
                      {isSignup ? "Sign in" : "Create one"}
                    </button>
                  </p>
                </>
              )}
            </motion.form>
          </div>

          <p className="mx-auto mt-6 max-w-sm text-center text-[11px] leading-5 text-neutral-400">
            By continuing, you agree to our Terms and acknowledge our Privacy Policy. We use cookies to personalize content
            and analyze traffic.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Header({
  mode,
  setMode,
}: {
  mode: "login" | "signup" | "otp";
  setMode: (m: "login" | "signup" | "otp") => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600/40 to-blue-600/40 blur-xl" />
        <div className="relative rounded-2xl bg-gradient-to-r from-violet-600/15 to-blue-600/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-200 ring-1 ring-white/10">
          {mode === "otp" ? "Verify your email" : mode === "signup" ? "Join the community" : "Welcome back"}
        </div>
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-neutral-100 sm:text-3xl">
        {mode === "otp" ? "Enter your OTP" : mode === "signup" ? "Create your account" : "Sign in to your account"}
      </h1>
      {mode !== "otp" && (
        <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-800/40 p-1 ring-1 ring-white/10">
          <Tab active={mode === "login"} onClick={() => setMode("login")}>Login</Tab>
          <Tab active={mode === "signup"} onClick={() => setMode("signup")}>Sign Up</Tab>
        </div>
      )}
    </div>
  );
}

function Tab({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "w-full rounded-lg px-4 py-2 text-sm font-medium transition " +
        (active
          ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          : "text-neutral-400 hover:text-neutral-200")
      }
    >
      {children}
    </button>
  );
}

function Field({
  label,
  htmlFor,
  children,
  icon,
  right,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-xs font-medium text-neutral-300">
        {label}
      </label>
      <div className="group relative flex items-center gap-2 rounded-xl ring-1 ring-white/10 focus-within:ring-2">
        {icon && (
          <div className="pointer-events-none pl-3 text-neutral-400">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1 px-0">{children}</div>
        {right && <div className="pr-1">{right}</div>}
      </div>
    </div>
  );
}

function OAuthButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-800/60 px-3 py-2.5 text-sm font-medium text-neutral-100 ring-1 ring-white/10 transition hover:bg-neutral-800 hover:ring-white/15"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function strengthBarClass(score: number) {
  switch (score) {
    case 0:
    case 1:
      return "w-1/5 bg-red-500";
    case 2:
      return "w-2/5 bg-orange-500";
    case 3:
      return "w-3/5 bg-yellow-500";
    case 4:
    default:
      return "w-4/5 bg-green-500";
  }
}

function passwordStrength(pwd: string) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  score = Math.min(score, 4);
  const label = ["Very weak", "Weak", "Okay", "Good", "Strong"][score];
  return { score, label } as const;
}

function LogoMark() {
  return (
    <div className="grid size-7 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-[0_8px_30px_-10px_rgba(59,130,246,0.6)]">
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path
          d="M12 2l3.5 6.5L22 9l-5 4.5L18 21l-6-3.5L6 21l1-7.5L2 9l6.5-.5L12 2z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}