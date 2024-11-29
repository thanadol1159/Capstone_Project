import { useMemo } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { RootState } from "@/hook/store";
import { useSelector } from "react-redux";

interface CustomJwtPayload extends JwtPayload {
  user_id: string;
}

/** 
  @returns {string | null} 
 */
export const useAccountId = (): string | null => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const accountId = useMemo(() => {
    if (!accessToken) return null;

    try {
      const decoded = jwtDecode<CustomJwtPayload>(accessToken);
      return decoded.user_id;
    } catch (error) {
      console.error("Failed to decode token", error);
      return null;
    }
  }, [accessToken]);

  return accountId;
};
