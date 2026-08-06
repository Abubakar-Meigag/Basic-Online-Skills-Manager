import { statusStyles } from "../lib/constants/statusStyles";

const statusLabel = (status: string) => {
  // Figure out the status color
  let statusStyle = statusStyles[status as keyof typeof statusStyles];
  if (!statusStyle) {
    statusStyle = "bg-slate-100 text-slate-700"; // Fallback to grey
  }

  // Remove underscores from status text (e.g. "request_open" -> "request open")
  const statusText = status.replace("_", " ");

  return { statusStyle, statusText };
};

export default statusLabel;

