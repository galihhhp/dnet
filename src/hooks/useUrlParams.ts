import { useLocation, useNavigate } from "react-router";
import { useMemo, useCallback } from "react";

export const useUrlParams = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const urlParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const getParam = useCallback(
    (paramName: string): string | null => {
      return urlParams.get(paramName);
    },
    [urlParams]
  );

  const setParams = useCallback(
    (paramsToSet: Record<string, string | number>) => {
      const params = new URLSearchParams(location.search);
      Object.entries(paramsToSet).forEach(([key, value]) => {
        params.set(key, String(value));
      });
      navigate(`${location.pathname}?${params.toString()}`);
    },
    [location.pathname, location.search, navigate]
  );

  return { urlParams, getParam, setParams };
};
