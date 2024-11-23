import axios from "axios";
import store from "./store";

// Create an instance for JSON requests
const apiJson = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Create an instance for FormData requests
const apiFormData = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Add interceptors to include the authorization token for both instances
const addAuthorizationInterceptor = (instance: any) => {
  instance.interceptors.request.use((config: any) => {
    const { accessToken } = store.getState().auth;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });
};

addAuthorizationInterceptor(apiJson);
addAuthorizationInterceptor(apiFormData);

// Export both instances
export { apiJson, apiFormData };
