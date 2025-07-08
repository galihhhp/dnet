import { useState, useEffect, useCallback } from "react";
import api from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";
import { Package, Transaction } from "@/hooks/useAdminDashboard";

interface CustomerPackagesData {
  packages: Package[];
  loading: boolean;
  error: Error | null;
  createTransaction: (
    pkg: Package,
    paymentMethod: string
  ) => Promise<Transaction>;
}

export const useCustomerPackages = (): CustomerPackagesData => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/packages");
      setPackages(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const createTransaction = async (
    pkg: Package,
    paymentMethod: string
  ): Promise<Transaction> => {
    if (!user) {
      throw new Error("User is not authenticated");
    }

    try {
      const customerResponse = await api.get(`/customers?userId=${user.id}`);

      if (!customerResponse.data.length) {
        await api.post("/customers", {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone: "",
          status: "active",
          createdAt: new Date().toISOString(),
        });
      }

      const newTransaction = {
        userId: user.id,
        packageId: pkg.id,
        amount: pkg.price,
        status: "completed",
        date: new Date().toISOString(),
        paymentMethod,
      };

      const response = await api.post("/transactions", newTransaction);
      return response.data;
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  };

  return { packages, loading, error, createTransaction };
};
