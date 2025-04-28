import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/hook/action";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; 

const LogoutButton: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      Cookies.remove("role");
      dispatch(logout());
      router.push("/nk1/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-[#7397BB] text-white px-4 py-2 rounded-md hover:bg-[#C9D9EB]"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
