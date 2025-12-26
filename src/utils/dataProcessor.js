/**
 * Filter data based on status and unit model filters
 */
export const filterData = (data, statusFilter, unitModelFilter) => {
  return data.filter((unit) => {
    const statusMatch = !statusFilter || unit.status === statusFilter;
    const modelMatch = !unitModelFilter || unit.unitModel === unitModelFilter;
    return statusMatch && modelMatch;
  });
};

/**
 * Calculate summary statistics for the summary cards
 */
export const calculateSummaryStats = (filteredData) => {
  const totalUnits = filteredData.length;
  const totalSalesValue = filteredData.reduce((sum, unit) => sum + unit.salesValue, 0);
  const avgInterestFreePrice =
    totalUnits > 0
      ? filteredData.reduce((sum, unit) => sum + unit.interestFreePrice, 0) / totalUnits
      : 0;
  const avgPSM =
    totalUnits > 0
      ? filteredData.reduce((sum, unit) => sum + unit.psm, 0) / totalUnits
      : 0;

  const soldUnits = filteredData.filter((unit) => unit.isSold);
  const soldCount = soldUnits.length;
  const soldSalesValue = soldUnits.reduce((sum, unit) => sum + unit.salesValue, 0);
  const avgSoldInterestFreePrice =
    soldCount > 0
      ? soldUnits.reduce((sum, unit) => sum + unit.interestFreePrice, 0) / soldCount
      : 0;
  const avgSoldPSM =
    soldCount > 0 ? soldUnits.reduce((sum, unit) => sum + unit.psm, 0) / soldCount : 0;

  const unsoldUnits = filteredData.filter((unit) => !unit.isSold);
  const unsoldCount = unsoldUnits.length;
  const unsoldSalesValue = unsoldUnits.reduce((sum, unit) => sum + unit.salesValue, 0);
  const avgUnsoldInterestFreePrice =
    unsoldCount > 0
      ? unsoldUnits.reduce((sum, unit) => sum + unit.interestFreePrice, 0) / unsoldCount
      : 0;
  const avgUnsoldPSM =
    unsoldCount > 0
      ? unsoldUnits.reduce((sum, unit) => sum + unit.psm, 0) / unsoldCount
      : 0;

  return {
    total: {
      units: totalUnits,
      salesValue: totalSalesValue,
      avgInterestFreePrice,
      avgPSM,
    },
    sold: {
      units: soldCount,
      salesValue: soldSalesValue,
      avgInterestFreePrice: avgSoldInterestFreePrice,
      avgPSM: avgSoldPSM,
    },
    unsold: {
      units: unsoldCount,
      salesValue: unsoldSalesValue,
      avgInterestFreePrice: avgUnsoldInterestFreePrice,
      avgPSM: avgUnsoldPSM,
    },
  };
};

/**
 * Aggregate data by status for Inventory Status chart
 */
export const aggregateByStatus = (data) => {
  const statuses = [
    "Available",
    "Blocked Development",
    "Reserved",
    "Contracted",
    "Partner",
  ];
  const aggregation = {};

  statuses.forEach((status) => {
    aggregation[status] = 0;
  });

  data.forEach((unit) => {
    if (aggregation.hasOwnProperty(unit.status)) {
      aggregation[unit.status] += 1;
    }
  });

  return {
    labels: Object.keys(aggregation),
    values: Object.values(aggregation),
  };
};

/**
 * Aggregate data by unit model for Unit Model chart
 */
export const aggregateByUnitModel = (data) => {
  const models = [
    "Garden",
    "Typical",
    "Penthouse",
    "Townhouse",
    "Twin House",
    "Villa",
    "ST",
    "Terrace Villa",
    "Merged Unit",
    "Yard Villa",
    "Duplex",
    "Studio",
  ];
  const aggregation = {};

  models.forEach((model) => {
    aggregation[model] = 0;
  });

  data.forEach((unit) => {
    if (aggregation.hasOwnProperty(unit.unitModel)) {
      aggregation[unit.unitModel] += 1;
    }
  });

  // Filter out models with zero count
  const filteredLabels = [];
  const filteredValues = [];

  Object.keys(aggregation).forEach((model) => {
    if (aggregation[model] > 0) {
      filteredLabels.push(model);
      filteredValues.push(aggregation[model]);
    }
  });

  return {
    labels: filteredLabels,
    values: filteredValues,
  };
};

/**
 * Aggregate data by payment plan for Contract Payment Plan chart
 */
export const aggregateByPaymentPlan = (data) => {
  const plans = [
    "Cash",
    "1 Yrs",
    "2 Yrs",
    "3months",
    "4 Yrs",
    "5 Yrs",
    "6months",
    "7 Yrs",
    "7months",
    "8 Yrs",
    "9 Yrs",
    "10 Yrs",
  ];
  const aggregation = {};

  plans.forEach((plan) => {
    aggregation[plan] = 0;
  });

  data.forEach((unit) => {
    if (aggregation.hasOwnProperty(unit.paymentPlan)) {
      aggregation[unit.paymentPlan] += 1;
    }
  });

  // Filter out plans with zero count
  const filteredLabels = [];
  const filteredValues = [];

  Object.keys(aggregation).forEach((plan) => {
    if (aggregation[plan] > 0) {
      filteredLabels.push(plan);
      filteredValues.push(aggregation[plan]);
    }
  });

  return {
    labels: filteredLabels,
    values: filteredValues,
  };
};

/**
 * Aggregate data by quarter for Quarterly Sales Trend chart
 */
export const aggregateByQuarter = (data) => {
  const aggregation = {};

  data.forEach((unit) => {
    if (unit.isSold) {
      const quarter = unit.quarter;
      if (!aggregation[quarter]) {
        aggregation[quarter] = 0;
      }
      aggregation[quarter] += unit.salesValue;
    }
  });

  // Sort quarters chronologically
  const sortedQuarters = Object.keys(aggregation).sort((a, b) => {
    const [yearA, quarterA] = a.split("-Q");
    const [yearB, quarterB] = b.split("-Q");
    if (yearA !== yearB) {
      return parseInt(yearA) - parseInt(yearB);
    }
    return parseInt(quarterA) - parseInt(quarterB);
  });

  return {
    labels: sortedQuarters,
    values: sortedQuarters.map((quarter) => aggregation[quarter]),
  };
};

/**
 * Aggregate price data by unit model for Box Plot chart
 * Returns min, max, and average prices for each unit model
 */
export const aggregatePriceByUnitModel = (data) => {
  const models = [
    "Garden",
    "Typical",
    "Penthouse",
    "Townhouse",
    "Twin House",
    "Villa",
    "ST",
    "Terrace Villa",
    "Merged Unit",
    "Yard Villa",
    "Duplex",
    "Studio",
  ];

  const aggregation = {};

  // Initialize aggregation for each model
  models.forEach((model) => {
    aggregation[model] = {
      prices: [],
      min: null,
      max: null,
      avg: null,
      avgCloserTo: null,
    };
  });

  // Collect all prices for each model
  data.forEach((unit) => {
    if (aggregation.hasOwnProperty(unit.unitModel)) {
      aggregation[unit.unitModel].prices.push(unit.interestFreePrice);
    }
  });

  // Calculate min, max, avg for each model
  const result = [];
  Object.keys(aggregation).forEach((model) => {
    const prices = aggregation[model].prices;
    if (prices.length > 0) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;

      // Determine if average is closer to min or max
      const distanceToMin = Math.abs(avg - min);
      const distanceToMax = Math.abs(avg - max);
      const avgCloserTo = distanceToMin < distanceToMax ? "min" : "max";

      result.push({
        unitModel: model,
        min,
        max,
        avg,
        avgCloserTo,
      });
    }
  });

  // Sort by unit model name for consistent ordering
  result.sort((a, b) => {
    const indexA = models.indexOf(a.unitModel);
    const indexB = models.indexOf(b.unitModel);
    return indexA - indexB;
  });

  return result;
};

