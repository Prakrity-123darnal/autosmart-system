import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export function useCurrentCustomer() {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(user?.role === 'customer');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'customer') {
      setCustomer(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .get<CustomerProfile>('/customers/me')
      .then((res) => {
        if (cancelled) return;
        setCustomer(res.data);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setCustomer(null);
        setError(
          'No customer profile linked to your account. Contact staff or register a vehicle.'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.role, user?.email]);

  return { customer, customerId: customer?.id ?? null, loading, error };
}
