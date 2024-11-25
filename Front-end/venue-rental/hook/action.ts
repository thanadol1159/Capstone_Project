export const login = (
  accessToken: string,
  refreshToken: string,
  expiredIn: number
) => ({
  type: "LOGIN",
  payload: {
    accessToken,
    refreshToken,
    tokenExpired: Date.now() + expiredIn * 1000,
  },
});

export const logout = () => ({
  type: "LOGOUT",
});

export const refreshToken = (
  accessToken: string,
  refreshToken: string,
  expiredIn: number
) => {
  return {
    type: "REFRESH_TOKEN",
    payload: {
      accessToken,
      refreshToken,
      tokenExpired: Date.now() + expiredIn * 1000,
    },
  };
};
