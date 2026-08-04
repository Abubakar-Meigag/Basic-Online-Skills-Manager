import type { ReactNode } from "react";

export type TableColumn<T> = {
  header: string;
  accessor: keyof T & string;
  headerClassName?: string;
  cellClassName?: string;
  render?: (value: T[keyof T & string], row: T) => ReactNode;
};

type DataTableProps<T extends Record<string, unknown>> = {
  data: T[];
  columns: TableColumn<T>[];
};

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
}: DataTableProps<T>) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="bg-[#F3F3F3]">
          {columns.map((column, index) => {
            const isFirstColumn = index === 0;

            return (
              <th
                key={column.header}
                className={`py-5 text-xs font-bold uppercase tracking-wider text-[#333333] ${
                  isFirstColumn ? "pl-10" : "px-4"
                } ${column.headerClassName ?? ""}`}
              >
                {column.header}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className="border-b border-[#F3F3F3] transition-colors hover:bg-[#F3F3F3]"
          >
            {columns.map((column, index) => {
              const isFirstColumn = index === 0;
              const value = row[column.accessor];

              return (
                <td
                  key={column.header}
                  className={`py-4 text-sm ${isFirstColumn ? "pl-5" : "px-4"} ${
                    column.cellClassName ?? "text-slate-600"
                  }`}
                >
                  {column.render
                    ? column.render(value, row)
                    : value == null
                      ? "-"
                      : String(value)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
