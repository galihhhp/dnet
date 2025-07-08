import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { Package } from '@/hooks/useAdminDashboard';

interface AdminPackagesData {
  packages: Package[];
  loading: boolean;
  error: Error | null;
  addPackage: (pkg: Omit<Package, 'id'>) => Promise<void>;
  updatePackage: (pkg: Package) => Promise<void>;
  deletePackage: (id: number) => Promise<void>;
}

export const useAdminPackages = (): AdminPackagesData => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/packages');
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

  const addPackage = async (pkg: Omit<Package, 'id'>) => {
    try {
      const response = await api.post('/packages', pkg);
      setPackages(current => [...current, response.data]);
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  };

  const updatePackage = async (pkg: Package) => {
    try {
      const response = await api.put(`/packages/${pkg.id}`, pkg);
      setPackages(current => current.map(p => p.id === pkg.id ? response.data : p));
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  };

  const deletePackage = async (id: number) => {
    try {
      await api.delete(`/packages/${id}`);
      setPackages(current => current.filter(p => p.id !== id));
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  };

  return { packages, loading, error, addPackage, updatePackage, deletePackage };
}; 