import { useMemo } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { RootState } from "@/hook/store";
import { useSelector } from "react-redux";

interface CustomJwtPayload extends JwtPayload {
  user_id: number;
}

/** 
  @returns {number | null} 
 */
export const useUserId = (): number | null => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const UserId = useMemo(() => {
    if (!accessToken) return null;

    try {
      const decoded = jwtDecode<CustomJwtPayload>(accessToken);
      console.log(decoded);
      return decoded.user_id; // user_id should be a number
    } catch (error) {
      console.error("Failed to decode token", error);
      return null;
    }
  }, [accessToken]);

  return UserId;
};
