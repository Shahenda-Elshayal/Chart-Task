import { calculateSummaryStats } from "../utils/dataProcessor";

const SummaryCards = ({ data }) => {
  const stats = calculateSummaryStats(data);

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(Math.round(num));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6 gap-4 md:mb-6 mb-4">
      {/* Total Inventory Card */}
      <div className="bg-white rounded-[4px] shadow-md p-4 hover:shadow-lg hover:scale-103 transition-all duration-500 border-l-4 border-[#E9762B]">
        <h3 className="lg:text-xl text-lg font-semibold text-[#252525] mb-4">Total Inventory</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Units</p>
            <p className="text-2xl font-bold text-[#E9762B]">{stats.total.units}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Sales Value</p>
            <p className="text-xl font-semibold text-[#E9762B]">
              {formatNumber(stats.total.salesValue)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Interest-Free Price</p>
                <p className="text-lg font-semibold text-[#E9762B]">
              {formatNumber(stats.total.avgInterestFreePrice)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. PSM</p>
            <p className="text-lg font-semibold text-[#E9762B]">
              {formatNumber(stats.total.avgPSM)}
            </p>
          </div>
        </div>
      </div>

      {/* Sold Units Card */}
      <div className="bg-white rounded-[4px] shadow-md p-4 hover:shadow-lg hover:scale-103 transition-all duration-500 border-l-4 border-[#E9762B]">
        <h3 className="lg:text-xl text-lg font-semibold text-[#252525] mb-4">Sold Units</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Units</p>
            <p className="text-2xl font-bold text-[#E9762B]">{stats.sold.units}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Sales Value</p>
            <p className="text-xl font-semibold text-[#E9762B]">
              {formatNumber(stats.sold.salesValue)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Interest-Free Price</p>
            <p className="text-lg font-semibold text-[#E9762B]">
              {formatNumber(stats.sold.avgInterestFreePrice)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. PSM</p>
            <p className="text-lg font-semibold text-[#E9762B]">
              {formatNumber(stats.sold.avgPSM)}
            </p>
          </div>
        </div>
      </div>

      {/* Unsold Units Card */}
      <div className="bg-white rounded-[4px] shadow-md p-4 hover:shadow-lg hover:scale-103 transition-all duration-500 border-l-4 border-[#E9762B]">
        <h3 className="lg:text-xl text-lg font-semibold text-[#252525] mb-4">Unsold Units</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Units</p>
            <p className="text-2xl font-bold text-[#E9762B]">{stats.unsold.units}</p>
          </div>
          <div>
                  <p className="text-sm font-medium text-gray-600">Total Sales Value</p>
            <p className="text-xl font-semibold text-[#E9762B]">
              {formatNumber(stats.unsold.salesValue)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Interest-Free Price</p>
            <p className="text-lg font-semibold text-[#E9762B]">
              {formatNumber(stats.unsold.avgInterestFreePrice)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. PSM</p>
            <p className="text-lg font-semibold text-[#E9762B]">
              {formatNumber(stats.unsold.avgPSM)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;

