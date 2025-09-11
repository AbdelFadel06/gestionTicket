import api from "./api";

export const createTicket = async (ticketData) => {
  const res = await api.post("/api/ticket/", ticketData);
  return res.data;
};
