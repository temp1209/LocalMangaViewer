export const API_BASE = "/api";
export const API_ENDPOINTS = {
  manga: { list: `${API_BASE}/manga`, pageList: (id: string) => `${API_BASE}/manga/${id}/pages` },
  tag: { list: `${API_BASE}/tag` },
  config: `${API_BASE}/config`,
};