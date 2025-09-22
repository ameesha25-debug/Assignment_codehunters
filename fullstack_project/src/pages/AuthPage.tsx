// pages/AuthPage.tsx
import { useState } from "react";
import { SignInForm } from "../components/forms/SignInForm";
import { SignUpForm } from "../components/forms/SignUpForm";
import { Sheet } from "@/components/ui/sheet"; 

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <Sheet open>
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h2>

        {mode === "signin" ? (
          <>
            <SignInForm />
            <p className="text-sm mt-4">
              Don’t have an account?{" "}
              <button onClick={() => setMode("signup")} className="text-blue-600">
                Sign up
              </button>
            </p>
          </>
        ) : (
          <>
            <SignUpForm />
            <p className="text-sm mt-4">
              Already have an account?{" "}
              <button onClick={() => setMode("signin")} className="text-blue-600">
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </Sheet>
  );
}
