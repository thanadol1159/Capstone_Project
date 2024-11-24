import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/hook/action";
import { useRouter } from "next/navigation";

const LogoutButton: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <button onClick={handleLogout} className="text-black">
      Logout
    </button>
  );
};

export default LogoutButton;
