import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { store, persistor } from "@/hook/store";
import { logout } from "@/hook/action";
import { useRouter } from "next/navigation";

// const apiJson = axios.create({
//   baseURL: "https://capstone24.sit.kmutt.ac.th/nk1/api/",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// const apiFormData = axios.create({
//   baseURL: "https://capstone24.sit.kmutt.ac.th/nk1/api/",
//   headers: {
//     "Content-Type": "multipart/form-data",
//   },
// });

// const apiJson = axios.create({
//   baseURL: "http://capstone24.sit.kmutt.ac.th:8080/nk1/api/",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// const apiFormData = axios.create({
//   baseURL: "http://capstone24.sit.kmutt.ac.th:8080/nk1/api/",
//   headers: {
//     "Content-Type": "multipart/form-data",
//   },
// });

const apiJson = axios.create({
  baseURL: "http://localhost:8080/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

const apiFormData = axios.create({
  baseURL: "http://localhost:8080/api/",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

const apiML = axios.create({
  baseURL: "http://localhost:8080/",
  headers: {
    "Content-Type": "application/json",
  },
});


// Function to refresh the access token 
// production
// const refreshAccessToken = async () => {
//   try {
//     const state = store.getState();
//     const { refreshToken } = state.auth;

//     if (!refreshToken) {
//       throw new Error("No refresh token available");
//     }

//     const response = await axios.post(
//       "http://capstone24.sit.kmutt.ac.th:8080/nk1/api/token/refresh/",
//       {
//         refresh: refreshToken,
//       }
//     );

//     const { access } = response.data;

//     const decoded: any = jwtDecode(access);

//     store.dispatch({
//       type: "REFRESH_TOKEN",
//       payload: {
//         accessToken: access,
//         refreshToken: refreshToken,
//         tokenExpired: decoded.exp * 1000,
//       },
//     });

//     return access;
//   } catch (error) {
//     console.error("Failed to refresh token:", error);

//     // Log out
//     store.dispatch(logout());
//     persistor.purge();

//     return null;
//   }
// };


//Develop
const refreshAccessToken = async () => {
  try {
    const state = store.getState();
    const { refreshToken } = state.auth;

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(
      "https://capstone24.sit.kmutt.ac.th/nk1/api/token/refresh/",
      {
        refresh: refreshToken,
      }
    );

    const { access } = response.data;

    const decoded: any = jwtDecode(access);

    store.dispatch({
      type: "REFRESH_TOKEN",
      payload: {
        accessToken: access,
        refreshToken: refreshToken,
        tokenExpired: decoded.exp * 1000,
      },
    });

    return access;
  } catch (error) {
    console.error("Failed to refresh token:", error);

    // Log out
    store.dispatch(logout());
    persistor.purge();

    return null;
  }
};

// Interceptor to handle token expiration and refreshing
const addAuthorizationInterceptor = (instance: any) => {
  instance.interceptors.request.use(
    async (config: any) => {
      const state = store.getState();
      let { accessToken } = state.auth;

      if (accessToken) {
        const decoded: any = jwtDecode(accessToken);

        // Check if token is about to expire and refresh it
        if (decoded.exp * 1000 < Date.now() + 60 * 1000) {
          accessToken = await refreshAccessToken();

          if (!accessToken) {
            throw new Error("Failed to refresh token");
          }
        }

        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error: any) => Promise.reject(error)
  );

  // Handle 401
  instance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response && error.response.status === 401) {
        store.dispatch(logout());
        persistor.purge();
        window.location.assign("/login");
      }
      return Promise.reject(error);
    }
  );
};

addAuthorizationInterceptor(apiJson);
addAuthorizationInterceptor(apiFormData);
addAuthorizationInterceptor(apiML)

export { apiJson, apiFormData,apiML };
