import { useState, useEffect, useCallback } from "react";
import api from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";
import { Transaction, Package } from "@/hooks/useAdminDashboard";

interface CustomerDashboardData {
  transactions: Transaction[];
  packages: Package[];
  loading: boolean;
  error: Error | null;
}

export const useCustomerDashboard = (): CustomerDashboardData => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const [transRes, pkgRes] = await Promise.all([
        api.get(`/transactions?userId=${user.id}`),
        api.get("/packages"),
      ]);
      setTransactions(transRes.data);
      setPackages(pkgRes.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { transactions, packages, loading, error };
};
