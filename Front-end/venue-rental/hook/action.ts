export const login = (accessToken: any, refreshToken: any) => ({
  type: "LOGIN",
  payload: { accessToken, refreshToken },
});
