// import  { useState } from "react";
// import SignInForm from "../components/forms/SignInForm";
// import SignUpForm from "../components/forms/SignUpForm";
// import { useAuth } from "@/lib/auth";
// import { useNavigate } from "react-router-dom";
// import { api } from "@/lib/api";

// export default function AuthPage() {
//   const [showSignUp, setShowSignUp] = useState(false);
//   const { signIn } = useAuth();
//   const navigate = useNavigate();

//   const handleSignIn = async (form: { mobile: string; password: string }) => {
//     try {
//       const response = await api.loginUser(form.mobile, form.password);
//       if (response.token && response.user) {
//         signIn(response.token, response.user);
//         alert("Login successful");
//         navigate("/", { replace: true });
//       } else {
//         alert(response.message || "Login failed");
//       }
//     } catch (error: any) {
//       alert(error.message || "An error occurred during login");
//     }
//   };

//   const handleSignUp = async (form: { mobile: string; password: string }) => {
//     try {
//       const response = await api.registerUser(form.mobile, form.password);
//       if (response.token && response.user) {
//         signIn(response.token, response.user);
//         alert("Registration successful");
//         navigate("/", { replace: true });
//       } else {
//         alert(response.message || "Registration failed");
//       }
//     } catch (error: any) {
//       alert(error.message || "An error occurred during registration");
//     }
//   };

//   return (
//     <div>
//       <h2 style={{ textAlign: "center", marginBottom: 24 }}>
//         {showSignUp ? "Create your account" : "Sign In to your account"}
//       </h2>
//       {showSignUp ? (
//         <SignUpForm
//           onSwitch={() => setShowSignUp(false)}
//           onSubmit={handleSignUp}
//         />
//       ) : (
//         <SignInForm
//           onSwitch={() => setShowSignUp(true)}
//           onSubmit={handleSignIn}
//         />
//       )}
//     </div>
//   // );
// }
import  { useState } from "react";
import SignInForm from "../components/forms/SignInForm";
import SignUpForm from "../components/forms/SignUpForm";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export default function AuthPage() {
  const [showSignUp, setShowSignUp] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (form: { mobile: string; password: string }) => {
    try {
      const response = await api.loginUser(form.mobile, form.password);
      if (response.token && response.user) {
        signIn(response.token, response.user);
        alert("Login successful");
        navigate("/", { replace: true });
      } else {
        alert(response.message || "Login failed");
      }
    } catch (error: any) {
      alert(error.message || "An error occurred during login");
    }
  };

  const handleSignUp = async (form: { mobile: string; password: string }) => {
    try {
      const response = await api.registerUser(form.mobile, form.password);
      if (response.token && response.user) {
        signIn(response.token, response.user);
        alert("Registration successful");
        navigate("/", { replace: true });
      } else {
        alert(response.message || "Registration failed");
      }
    } catch (error: any) {
      alert(error.message || "An error occurred during registration");
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>
        {showSignUp ? "Create your account" : "Sign In to your account"}
      </h2>
      {showSignUp ? (
        <SignUpForm onSwitch={() => setShowSignUp(false)} onSubmit={handleSignUp} />
      ) : (
        <SignInForm onSwitch={() => setShowSignUp(true)} onSubmit={handleSignIn} />
      )}
    </div>
  );
}
