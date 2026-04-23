import axios from "axios";
import { API, BACKEND_URL } from "../constants/data";

const http = axios.create({ baseURL: BACKEND_URL });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) =>
  http.post(API.register, data).then((r) => r.data);

export const login = (data) =>
  http.post(API.login, data).then((r) => r.data);

export const testPing = () =>
  http.get("/api/test/ping").then((r) => r.data);

// Users
export const searchUsers = (q) =>
  http.get("/api/users/search", { params: { q } }).then((r) => r.data);

export const fetchConversations = () =>
  http.get(API.conversations).then((r) => r.data);

export const startDirectConversation = (userId) =>
  http.post(API.directConv(userId)).then((r) => r.data);

export const fetchMessages = (convId, page = 0, size = 50) =>
  http.get(API.messages(convId), { params: { page, size } }).then((r) => r.data);

export const sendMessageRest = (convId, text) =>
  http.post(API.sendMessage(convId), { text }).then((r) => r.data);

export const uploadAttachments = (convId, files, text = "") => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f.file));
  form.append("text", text);
  return http.post(API.attachments(convId), form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};
