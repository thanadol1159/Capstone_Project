import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/hook/action";
import { useRouter } from "next/navigation";

const LogoutButton: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      dispatch(logout());
      router.push("/nk1/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-[#74512D] text-white px-4 py-2 rounded-md hover:bg-[#492b26]"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
