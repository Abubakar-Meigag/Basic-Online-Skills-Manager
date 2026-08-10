import { statusStyles } from "../lib/constants/statusStyles";

const statusLabel = (status: string) => {
  const statusKey = String(status) as keyof typeof statusStyles;
  const statusStyle = statusStyles[statusKey] ?? "bg-slate-100 text-slate-700";
  const statusText = String(status).replace(/_/g, " ");

  return { statusStyle, statusText };
};

export default statusLabel;
