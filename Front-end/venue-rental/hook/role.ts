import { useMemo } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { RootState } from "@/hook/store";
import { useSelector } from "react-redux";

interface CustomJwtPayload extends JwtPayload {
  role: string;
}

/** 
  @returns {string | null} 
 */
export const useRole = (): string | null => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const Role = useMemo(() => {
    if (!accessToken) return null;
    try {
      const decoded = jwtDecode<CustomJwtPayload>(accessToken);
      console.log(decoded);
      return decoded.role;
    } catch (error) {
      console.error("Failed to decode token", error);
      return null;
    }
  }, [accessToken]);

  return Role;
};
