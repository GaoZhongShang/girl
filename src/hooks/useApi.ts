import { useState } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: () => Promise<T>
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '请求失败';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  return {
    ...state,
    execute,
    reset,
  };
}

// 批量API操作hook
export function useBatchApi<T>(
  apiCalls: Array<() => Promise<T>>
) {
  const [state, setState] = useState<{
    results: T[];
    loading: boolean;
    error: string | null;
    completed: number;
    total: number;
  }>({
    results: [],
    loading: false,
    error: null,
    completed: 0,
    total: apiCalls.length,
  });

  const executeAll = async () => {
    setState(prev => ({ ...prev, loading: true, error: null, results: [], completed: 0 }));

    try {
      const promises = apiCalls.map((call, index) =>
        call()
          .then(result => ({ index, result, success: true }))
          .catch(error => ({ index, error: error.message, success: false }))
      );

      const results = await Promise.all(promises);
      setState(prev => ({
        ...prev,
        loading: false,
        results: prev.results.concat(results.filter(r => r.success).map(r => (r as any).result)),
        completed: prev.total,
        error: results.some(r => !r.success) ? '部分请求失败' : null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '批量请求失败',
      }));
    }
  };

  return {
    ...state,
    executeAll,
  };
}