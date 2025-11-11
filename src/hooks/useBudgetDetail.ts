import { useState, useEffect, useCallback } from 'react';
import { getBudgetById, Budget } from '@/services/budgetService';

export function useBudgetDetail(budgetId: string | null) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(false);

  const loadBudgetDetail = useCallback(async () => {
    if (!budgetId) {
      setBudget(null);
      return;
    }

    try {
      setLoading(true);
      const data = await getBudgetById(budgetId);
      setBudget(data);
    } catch (err) {
      console.error('Error loading budget detail:', err);
    } finally {
      setLoading(false);
    }
  }, [budgetId]);

  useEffect(() => {
    loadBudgetDetail();
  }, [loadBudgetDetail]);

  return {
    budget,
    loading,
    refetch: loadBudgetDetail
  };
}
