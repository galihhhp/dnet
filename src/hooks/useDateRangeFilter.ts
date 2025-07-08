import { useMemo } from "react";
import { useUrlParams } from "./useUrlParams";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

export interface DateRangeFilterOptions {
  dateField: string;
  defaultRange?: "week" | "month" | "quarter" | "year" | "all";
}

export interface DateRangeFilterResult<T> {
  filteredData: T[];
  dateRange: [Dayjs | null, Dayjs | null];
  setDateRange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  clearDateFilter: () => void;
  hasDateFilter: boolean;
}

export const useDateRangeFilter = <T extends Record<string, any>>(
  data: T[],
  options: DateRangeFilterOptions
): DateRangeFilterResult<T> => {
  const { getParam, setParams } = useUrlParams();
  const { dateField, defaultRange = "all" } = options;

  const startDate = getParam("startDate");
  const endDate = getParam("endDate");

  const dateRange: [Dayjs | null, Dayjs | null] = useMemo(() => {
    if (startDate && endDate) {
      return [dayjs(startDate), dayjs(endDate)];
    }

    if (defaultRange !== "all") {
      const now = dayjs();
      switch (defaultRange) {
        case "week":
          return [now.subtract(7, "day"), now];
        case "month":
          return [now.subtract(1, "month"), now];
        case "quarter":
          return [now.subtract(3, "month"), now];
        case "year":
          return [now.subtract(1, "year"), now];
        default:
          return [null, null];
      }
    }

    return [null, null];
  }, [startDate, endDate, defaultRange]);

  const filteredData = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return data;

    return data.filter((item) => {
      const itemDate = dayjs(item[dateField]);
      return itemDate.isBetween(dateRange[0], dateRange[1], "day", "[]");
    });
  }, [data, dateRange, dateField]);

  const setDateRange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates || !dates[0] || !dates[1]) {
      setParams({ startDate: "", endDate: "" });
    } else {
      setParams({
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
      });
    }
  };

  const clearDateFilter = () => {
    setParams({ startDate: "", endDate: "" });
  };

  const hasDateFilter = Boolean(dateRange[0] && dateRange[1]);

  return {
    filteredData,
    dateRange,
    setDateRange,
    clearDateFilter,
    hasDateFilter,
  };
};
