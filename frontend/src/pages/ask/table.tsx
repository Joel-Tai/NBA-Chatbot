import React from "react";
import type { DynamicTableProps } from "../../types/table";

export interface TableProps<T extends Record<string, any>>
  extends DynamicTableProps<T> {
  sortKey: string | null;
  setSortKey: (key: string) => void;
}

export function DynamicTable<T extends Record<string, any>>({
  data,
  columns,
  className = "",
  onRowClick,
  sortKey,
  setSortKey,
}: TableProps<T>) {
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "desc"
  );

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key as string);
      setSortDirection("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      // Try to convert to numbers if possible
      const aNum =
        typeof aVal === "string" && !isNaN(Number(aVal)) ? Number(aVal) : aVal;
      const bNum =
        typeof bVal === "string" && !isNaN(Number(bVal)) ? Number(bVal) : bVal;

      // Check for date strings (ISO or common formats)
      const isDate =
        typeof aVal === "string" &&
        typeof bVal === "string" &&
        !isNaN(Date.parse(aVal)) &&
        !isNaN(Date.parse(bVal));

      if (isDate) {
        const aDate = new Date(aVal).getTime();
        const bDate = new Date(bVal).getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (typeof aNum === "number" && typeof bNum === "number") {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }

      // Fallback to string comparison
      aVal = aVal?.toString() ?? "";
      bVal = bVal?.toString() ?? "";
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection]);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.sortable ? "cursor-pointer hover:bg-gray-100" : ""}
                  ${sortKey === column.key ? "bg-blue-50" : ""}
                `}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center">{column.header}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, index) => (
            <tr
              key={index}
              className={`${
                onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`px-2 py-1 whitespace-nowrap text-sm text-gray-900
                    ${sortKey === column.key ? "bg-blue-50" : ""}
                  `}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
