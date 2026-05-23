import { useState, useEffect } from 'react';
import { deviceApi, type Device } from '../api/client';

interface UseDevicesOptions {
  categoryId?: number;
}

export function useDevices(options: UseDevicesOptions = {}) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await deviceApi.getList(options.categoryId);
      setDevices(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载设备失败');
    } finally {
      setLoading(false);
    }
  };

  const createDevice = async (data: { name: string; model?: string; categoryId: number }) => {
    setLoading(true);
    try {
      const response = await deviceApi.create(data);
      setDevices(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '创建设备失败';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDevice = async (id: number, data: { name: string; model?: string; categoryId?: number }) => {
    setLoading(true);
    try {
      const response = await deviceApi.update(id, data);
      setDevices(prev => prev.map(dev => dev.id === id ? response.data : dev));
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '更新设备失败';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDevice = async (id: number) => {
    setLoading(true);
    try {
      await deviceApi.delete(id);
      setDevices(prev => prev.filter(dev => dev.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '删除设备失败';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [options.categoryId]);

  return {
    devices,
    loading,
    error,
    loadDevices,
    createDevice,
    updateDevice,
    deleteDevice,
  };
}