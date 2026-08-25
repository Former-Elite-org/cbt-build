import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, GraduationCap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { isFlagshipSubdomain } from "@/lib/utils/flagship";
import toast from "react-hot-toast";
import apiClient from "@/lib/api/client";

const BOARDS = [
  { code: "JAMB", label: "JAMB" },
  { code: "WAEC", label: "WAEC" },
  { code: "NECO", label: "NECO" },
  { code: "GCE", label: "GCE" },
  { code: "BECE", label: "BECE" },
];

export default function StudentRegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isFlagshipSubdomain()) {
    return <Navigate to="/login" replace />;
  }

  const toggleBoard = (code: string) => {
    setSelectedBoards((prev) =>
      prev.includes(code)
        ? prev.filter((b) => b !== code)
        : [...prev, code]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (selectedBoards.length === 0) {
      toast.error("Please select at least one board");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/student-register", {
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        password: password.trim() || undefined,
        phone: phone.trim() || undefined,
        boards: selectedBoards,
      });

      const { token, school_id } = response.data;
      localStorage.setItem("@@auth_token", token);
      if (school_id) {
        localStorage.setItem("school_id", school_id);
      }

      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <Card className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#002a56]/10 mb-4">
            <GraduationCap className="h-6 w-6 text-[#002a56]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Student Registration
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Elite Practice Academy
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              className="text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Board(s) <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {BOARDS.map((board) => {
                const isSelected = selectedBoards.includes(board.code);
                return (
                  <button
                    key={board.code}
                    type="button"
                    onClick={() => toggleBoard(board.code)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors",
                      isSelected
                        ? "bg-[#002a56] text-white border-[#002a56]"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#002a56] hover:text-[#002a56]"
                    )}
                  >
                    {isSelected && <CheckCircle2 className="h-3 w-3" />}
                    {board.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl h-10 text-xs font-bold bg-[#002a56] text-white hover:bg-[#002a56]/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#002a56] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
