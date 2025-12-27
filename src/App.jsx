import { useState } from "react";
import "./index.css";
import inventoryData from "./data/inventoryData.json";
import { filterData } from "./utils/dataProcessor";
import SummaryCards from "./components/SummaryCards";
import InventoryStatusChart from "./components/InventoryStatusChart";
import UnitModelChart from "./components/UnitModelChart";
import ContractPaymentPlanChart from "./components/ContractPaymentPlanChart";
import QuarterlySalesTrendChart from "./components/QuarterlySalesTrendChart";
import UnitPriceBoxPlot from "./components/UnitPriceBoxPlot";
import PivotTable from "./components/PivotTable";
import FocusModal from "./components/FocusModal";

function App() {
  const [statusFilter, setStatusFilter] = useState(null);
  const [unitModelFilter, setUnitModelFilter] = useState(null);
  const [focusedChart, setFocusedChart] = useState(null);

  // Filter data based on active filters
  const filteredData = filterData(inventoryData, statusFilter, unitModelFilter);

  // Get data for Inventory Status chart (should show all data, not filtered)
  const statusChartData = inventoryData;

  // Get data for Unit Model chart (filtered by status only if status filter is active)
  const unitModelChartData = statusFilter
    ? filterData(inventoryData, statusFilter, null)
    : inventoryData;

  // Handle status filter click
  const handleStatusClick = (status) => {
    setStatusFilter(status);
    // Clear unit model filter when status changes
    setUnitModelFilter(null);
  };

  // Handle unit model filter click
  const handleUnitModelClick = (unitModel) => {
    setUnitModelFilter(unitModel);
    // Keep status filter if it exists
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter(null);
    setUnitModelFilter(null);
  };

  // Handle focus chart
  const handleFocusChart = (chartType) => {
    setFocusedChart(chartType);
  };

  // Handle close focus
  const handleCloseFocus = () => {
    setFocusedChart(null);
  };

  return (
    <div className="min-h-screen bg-[#F9F5EE] p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="lg:mb-6 mb-4 flex items-center justify-between">
          <h1 className="lg:text-3xl text-2xl font-bold text-gray-800">
            Inventory Dashboard
          </h1>
          {(statusFilter || unitModelFilter) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 flex cursor-pointer text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Filter badges */}
        {(statusFilter || unitModelFilter) && (
          <div className="mb-4 flex gap-2 flex-wrap">
            {statusFilter && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-[4px] text-xs font-medium">
                Status: {statusFilter}
              </span>
            )}
            {unitModelFilter && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-[4px] text-xs font-medium">
                Unit Model: {unitModelFilter}
              </span>
            )}
          </div>
        )}

        {/* Summary Cards */}
        <SummaryCards data={filteredData} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 md:mb-6 mb-4">
          {/* Inventory Status Chart */}
          <InventoryStatusChart
            data={statusChartData}
            onStatusClick={handleStatusClick}
            activeStatusFilter={statusFilter}
            onFocusClick={() => handleFocusChart("inventoryStatus")}
            isFocusMode={false}
          />

          {/* Unit Model Chart */}
          <UnitModelChart
            data={unitModelChartData}
            onUnitModelClick={handleUnitModelClick}
            activeUnitModelFilter={unitModelFilter}
            statusFilter={statusFilter}
            onFocusClick={() => handleFocusChart("unitModel")}
            isFocusMode={false}
          />

         
        </div>

        {/* Payment Plan and Sales Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 md:mb-6 mb-4">
           {/* Contract Payment Plan Chart */}
           <ContractPaymentPlanChart
            data={filteredData}
            onFocusClick={() => handleFocusChart("paymentPlan")}
            isFocusMode={false}
          />

          {/* Quarterly Sales Trend Chart */}
          <QuarterlySalesTrendChart
            data={filteredData}
            onFocusClick={() => handleFocusChart("salesTrend")}
            isFocusMode={false}
          />
        </div>

        {/* Unit Price Box Plot Chart */}
        <div className="grid grid-cols-1 gap-6 md:mb-6 mb-4">
          <UnitPriceBoxPlot
            data={filteredData}
            onFocusClick={() => handleFocusChart("priceBoxPlot")}
            isFocusMode={false}
          />
        </div>

        {/* Pivot Table */}
        <div className="grid grid-cols-1 gap-6 md:mb-6 mb-4">
          <PivotTable
            data={filteredData}
            onFocusClick={() => handleFocusChart("pivotTable")}
            isFocusMode={false}
          />
        </div>
      </div>

      {/* Focus Modal */}
      <FocusModal
        isOpen={focusedChart !== null}
        onClose={handleCloseFocus}
        title={
          focusedChart === "inventoryStatus"
            ? "Inventory Status"
            : focusedChart === "unitModel"
            ? "Unit Model"
            : focusedChart === "paymentPlan"
            ? "Contract Payment Plan"
            : focusedChart === "salesTrend"
            ? "Quarterly Sales Trend"
            : focusedChart === "priceBoxPlot"
            ? "Unit Metrics Overview"
            : focusedChart === "pivotTable"
            ? "Inventory Pivot Table"
            : ""
        }
      >
        {focusedChart === "inventoryStatus" && (
          <InventoryStatusChart
            data={statusChartData}
            onStatusClick={handleStatusClick}
            activeStatusFilter={statusFilter}
            isFocusMode={true}
          />
        )}
        {focusedChart === "unitModel" && (
          <UnitModelChart
            data={unitModelChartData}
            onUnitModelClick={handleUnitModelClick}
            activeUnitModelFilter={unitModelFilter}
            statusFilter={statusFilter}
            isFocusMode={true}
          />
        )}
        {focusedChart === "paymentPlan" && (
          <ContractPaymentPlanChart data={filteredData} isFocusMode={true} />
        )}
        {focusedChart === "salesTrend" && (
          <QuarterlySalesTrendChart data={filteredData} isFocusMode={true} />
        )}
        {focusedChart === "priceBoxPlot" && (
          <UnitPriceBoxPlot data={filteredData} isFocusMode={true} />
        )}
        {focusedChart === "pivotTable" && (
          <PivotTable data={filteredData} isFocusMode={true} />
        )}
      </FocusModal>
    </div>
  );
}

export default App;
