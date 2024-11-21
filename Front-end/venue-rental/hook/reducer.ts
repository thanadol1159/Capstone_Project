const initialState = {
  accessToken: null,
  refreshToken: null,
};

const authReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    default:
      return state;
  }
};

export default authReducer;
