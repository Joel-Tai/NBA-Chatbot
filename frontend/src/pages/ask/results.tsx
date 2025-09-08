import { useLocation } from "react-router-dom";
import Child_Display from "./dynamicTable";
export const Results = () => {
  const location = useLocation();
  const data = location.state?.data;
  const interpretation = location.state?.interpretation;
  const resType = location.state?.resType;
  const rawdata = location.state?.rawRes;
  console.log("Results data:", data);
  console.log("Response Type:", resType);
  console.log("Raw Data:", rawdata);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {interpretation && (
        <div className="mb-4 p-4 bg-gray-50 rounded shadow text-gray-700">
          <strong>Interpretation:</strong> {interpretation}
        </div>
      )}
      <Child_Display gameStats={data || []} resType={resType} />
    </div>
  );
};
