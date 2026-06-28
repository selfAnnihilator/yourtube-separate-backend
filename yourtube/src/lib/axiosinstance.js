import axios from "axios";
import { appConfig } from "./app-config";

const axiosInstance = axios.create({
  baseURL: appConfig.apiBaseUrl,
});
export default axiosInstance;
