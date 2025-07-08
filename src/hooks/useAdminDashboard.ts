import { useState, useEffect, useCallback } from "react";
import api from "@/utils/api";

export interface Transaction {
  id: number;
  userId: number;
  packageId: number;
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  paymentMethod: string;
}

export interface Customer {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Package {
  id: number;
  name: string;
  price: number;
  description: string;
  duration: string;
  category: string;
}

interface DashboardData {
  transactions: Transaction[];
  customers: Customer[];
  packages: Package[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useAdminDashboard = (): DashboardData => {
  const [data, setData] = useState<
    Omit<DashboardData, "loading" | "error" | "refetch">
  >({
    transactions: [],
    customers: [],
    packages: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [transactionsRes, customersRes, packagesRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/customers"),
        api.get("/packages"),
      ]);

      setData((prevData) => ({
        transactions: transactionsRes.data,
        customers: customersRes.data,
        packages: packagesRes.data,
      }));
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return { ...data, loading, error, refetch: fetchData };
};
