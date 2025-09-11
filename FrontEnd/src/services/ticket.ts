import api from "./api";

export const getUserTickets = async () => {
  const res = await api.get("/api/my-tickets/");
  return res.data; // liste de tickets
};

export const getTicketStats = async () => {
  const res = await api.get("/api/my-tickets/stats/");
  return res.data; // { total, completed, in_progress, unassigned }
};
