import ReactPivot from "react-pivot";

const PivotTable = ({ data, onFocusClick, isFocusMode = false }) => {
  // Define dimensions for rows and columns (users can select which to use)
  const dimensions = [
    { value: "projectName", title: "Project Name" },
    { value: "status", title: "Status" },
    { value: "unitModel", title: "Unit Model" },
    { value: "paymentPlan", title: "Payment Plan" },
    { value: "quarter", title: "Quarter" },
  ];

  // Reduce function to aggregate data
  // This accumulates count and sum of salesValue for averages
  const reduce = (row, accumulator) => {
    accumulator.count = (accumulator.count || 0) + 1;
    accumulator.totalSales = (accumulator.totalSales || 0) + (row.salesValue || 0);
    return accumulator;
  };

  // Calculate aggregates for display
  const calculations = [
    {
      title: "Units",
      value: "count",
      template: function (val) {
        return val;
      },
      className: "text-right",
    },
    {
      title: "Total Sales",
      value: "totalSales",
      template: function (val) {
        return "$ " + new Intl.NumberFormat("en-US").format(val);
      },
      className: "text-right",
    },
    {
      title: "Avg Sales",
      value: function (row) {
        return row.count > 0 ? row.totalSales / row.count : 0;
      },
      template: function (val) {
        return "$ " + new Intl.NumberFormat("en-US").format(Math.round(val));
      },
      className: "text-right",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Inventory Pivot Table</h3>
          <p className="text-sm text-gray-500 mt-1">Project × Status Analysis</p>
        </div>
        {!isFocusMode && onFocusClick && (
          <button
            onClick={onFocusClick}
            className="cursor-pointer rounded-full transition-colors"
            aria-label="Focus chart"
            title="Focus chart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="overflow-x-scroll -mx-4 px-4 md:mx-0 md:px-0">
        <div className="min-w-[1000px]">
          <ReactPivot
            rows={data}
            dimensions={dimensions}
            reduce={reduce}
            calculations={calculations}
            nPaginateRows={20}
          />
        </div>
      </div>
    </div>
  );
};

export default PivotTable;

