import api from "./api";

export const createTicket = async (ticketData: any) => {
  const res = await api.post("/api/ticket/", ticketData);
  return res.data;
};
