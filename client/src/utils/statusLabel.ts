// client/src/utils/statusLabel.ts
import { statusStyles as defaultStyles } from "../lib/constants/statusStyles";

const statusLabel = (status: string, customStyles?: Record<string, string>) => {
  const styles = (customStyles || defaultStyles) as Record<string, string>;

  const statusKey = String(status);
  const statusStyle = styles[statusKey] ?? "bg-slate-100 text-slate-700";
  const statusText = statusKey.replace(/_/g, " ");

  return { statusStyle, statusText };
};

export default statusLabel;
