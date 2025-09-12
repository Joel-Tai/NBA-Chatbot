import React, { useState, useEffect, useMemo } from "react";
import { DynamicTable } from "./table";
import type { TableColumn } from "../../types/table";
import { LineChart } from "./linechart";

interface ChildComponentProps {
  gameStats: any[];
  resType?: string;
}

const Child_Display: React.FC<ChildComponentProps> = ({
  gameStats,
  resType,
}) => {
  const [stats, setStats] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);

  useEffect(() => {
    if (gameStats && Array.isArray(gameStats)) {
      setStats(gameStats);
      // Set default sortKey to the first numeric column, else fallback to first column
      if (gameStats.length > 0) {
        const keys = Object.keys(gameStats[0]);
        const firstNumericCol = keys.find((key) =>
          gameStats.every((row) => {
            const val = row[key];
            return (
              typeof val === "number" ||
              (typeof val === "string" && /^-?\d+(\.\d+)?$/.test(val.trim()))
            );
          })
        );
        setSortKey(firstNumericCol || keys[0]);
      }
    }
  }, [gameStats]);

  const columns: TableColumn<any>[] = useMemo(() => {
    if (!stats || stats.length === 0) return [];
    return Object.keys(stats[0]).map((key) => ({
      key,
      header: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      sortable: true,
      render: (value: any) => {
        // Format ISO date string to "Mon DD, YYYY"
        if (
          key.toLowerCase().includes("date") &&
          typeof value === "string" &&
          !isNaN(Date.parse(value))
        ) {
          const date = new Date(value);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });
        }
        if (
          key.toLowerCase().includes("%") &&
          typeof value === "number" &&
          Number.isFinite(value)
        ) {
          if (value === 1) return "1.000";
          if (value === 0) return "0.000";
          if (value < 1 && value > 0) return value.toFixed(3).slice(1);
        }
        if (typeof value === "number" && Number.isFinite(value)) {
          return value.toFixed(3);
        }
        return value;
      },
    }));
  }, [stats]);

  const handleRowClick = (row: any) => {
    console.log("Row clicked:", row);
  };

  if (!stats || stats.length === 0)
    return <div className="p-4">No data available</div>;

  // Determine if the selected column is numeric for all rows
  const isSortKeyNumeric =
    sortKey &&
    stats.length > 0 &&
    stats.every((row) => {
      const val = row[sortKey];
      return (
        typeof val === "number" ||
        (typeof val === "string" && /^-?\d+(\.\d+)?$/.test(val.trim()))
      );
    });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <DynamicTable
        data={stats}
        columns={columns}
        onRowClick={handleRowClick}
        className="shadow-lg rounded-lg"
        sortKey={sortKey}
        setSortKey={setSortKey}
      />
      {resType === "get_player_recent_games" &&
        (isSortKeyNumeric ? (
          <LineChart data={stats} columns={columns} sortKey={sortKey} />
        ) : (
          <div className="mt-8 p-4 bg-blue-50 text-gray-900 rounded text-center">
            Select a stat column to display a line chart.
          </div>
        ))}
    </div>
  );
};

export default Child_Display;
