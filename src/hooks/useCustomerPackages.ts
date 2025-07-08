import { useState, useEffect, useCallback } from "react";
import api from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";
import { Package, Transaction } from "@/hooks/useAdminDashboard";

interface CustomerPackagesData {
  packages: Package[];
  loading: boolean;
  error: Error | null;
  isCreatingTransaction: boolean;
  createTransaction: (
    pkg: Package,
    paymentMethod: string
  ) => Promise<Transaction>;
}

const customerCreationLocks = new Map<number, Promise<void>>();

export const useCustomerPackages = (): CustomerPackagesData => {
  const { user } = useAuth();

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreatingTransaction, setIsCreatingTransaction] =
    useState<boolean>(false);
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

  const ensureCustomerExists = async () => {
    if (!user) return;

    if (customerCreationLocks.has(user.id)) {
      await customerCreationLocks.get(user.id);
      return;
    }

    const creationPromise = (async () => {
      try {
        const customerByUserId = await api.get(`/customers?userId=${user.id}`);
        if (customerByUserId.data.length > 0) return;

        const customerByEmail = await api.get(`/customers?email=${user.email}`);
        if (customerByEmail.data.length > 0) return;

        await api.post("/customers", {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: "active",
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
      } finally {
        customerCreationLocks.delete(user.id);
      }
    })();

    customerCreationLocks.set(user.id, creationPromise);
    await creationPromise;
  };

  const createTransaction = async (
    pkg: Package,
    paymentMethod: string
  ): Promise<Transaction> => {
    if (!user) {
      throw new Error("User is not authenticated");
    }

    try {
      setIsCreatingTransaction(true);

      await ensureCustomerExists();

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
    } finally {
      setIsCreatingTransaction(false);
    }
  };

  return { packages, loading, error, isCreatingTransaction, createTransaction };
};
