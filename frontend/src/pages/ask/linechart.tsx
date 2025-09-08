import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  TimeScale
);

interface LineChartProps<T extends Record<string, any>> {
  data: T[];
  columns: { key: keyof T; header: string }[];
  sortKey: keyof T | null;
}

// Utility to check if a string is a valid number/float
function isNumericString(val: any): boolean {
  return typeof val === "string" && /^-?\d+(\.\d+)?$/.test(val.trim());
}

export function LineChart<T extends Record<string, any>>({
  data,
  columns,
  sortKey,
}: LineChartProps<T>) {
  // Find the date column (first column with "date" in the name)
  const dateCol = columns.find((col) =>
    col.key.toString().toLowerCase().includes("date")
  );

  if (!sortKey || !dateCol) return null;

  // Console log the type of the data for the selected column
  data.forEach((row, idx) => {
    const val = row[sortKey];
    // eslint-disable-next-line no-console
    console.log(`Row ${idx} - ${String(sortKey)}:`, val, "Type:", typeof val);
  });

  const chartData = {
    labels: data.map((row) => {
      const dateStr = row[dateCol.key];
      const parsed = Date.parse(dateStr);
      return !isNaN(parsed)
        ? new Date(parsed).toISOString().slice(0, 10)
        : dateStr;
    }),
    datasets: [
      {
        label:
          columns.find((col) => col.key === sortKey)?.header ?? String(sortKey),
        data: data.map((row) => {
          const val = row[sortKey];
          if (typeof val === "number") return val;
          if (isNumericString(val)) return parseFloat(val);
          return null;
        }),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.1)",
        fill: false,
        tension: 0.2,
      },
    ],
  };

  // Determine if the selected column is "min"
  const isMinCol = sortKey && sortKey.toString().toLowerCase() === "min";

  return (
    <div className="mt-8">
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: { enabled: true },
          },
          scales: {
            x: {
              type: "time",
              time: { unit: "day" },
              title: { display: true, text: dateCol.header },
            },
            y: {
              title: {
                display: true,
                text:
                  columns.find((col) => col.key === sortKey)?.header ??
                  String(sortKey),
              },
              min: isMinCol ? 0 : undefined,
              max: isMinCol ? 48 : undefined,
            },
          },
        }}
      />
    </div>
  );
}
