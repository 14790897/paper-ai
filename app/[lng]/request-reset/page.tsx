import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

const RequestResetPassword = () => {
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    const { data, error } = await supabase.auth.api.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`, // 确保这个URL是你重置密码页面的地址
      }
    );

    if (error) {
      alert("Error sending password reset email: " + error.message);
    } else {
      alert("Please check your email for the password reset link");
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleResetPassword}>Reset Password</button>
    </div>
  );
};

export default RequestResetPassword;
