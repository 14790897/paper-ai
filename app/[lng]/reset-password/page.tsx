import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/router";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();
  const { access_token } = router.query; // 获取URL中的access_token参数

  const handleNewPassword = async () => {
    if (!access_token) {
      alert("Token is not provided or invalid");
      return;
    }

    const { error } = await supabase.auth.api.updateUser(access_token, {
      password: newPassword,
    });

    if (error) {
      alert("Error resetting password: " + error.message);
    } else {
      alert("Your password has been reset successfully");
      router.push("/login"); // 导航到登录页面或其他页面
    }
  };

  return (
    <div>
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleNewPassword}>Update Password</button>
    </div>
  );
};

export default ResetPassword;
