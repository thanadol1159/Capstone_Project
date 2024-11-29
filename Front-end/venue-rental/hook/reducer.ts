import { jwtDecode } from "jwt-decode";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  username: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,
  username: null,
};

const authReducer = (state = initialState, action: any): AuthState => {
  switch (action.type) {
    case "LOGIN":
      const decoded: any = jwtDecode(action.payload.accessToken);
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        tokenExpiry: decoded.exp * 1000,
        username: action.payload.username,
      };
    case "REFRESH_TOKEN":
      const refreshed: any = jwtDecode(action.payload.accessToken);
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        tokenExpiry: refreshed.exp * 1000,
      };
    case "LOGOUT":
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export default authReducer;
