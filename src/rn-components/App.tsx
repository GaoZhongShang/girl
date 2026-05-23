import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Users, FileText, RefreshCw, AlertTriangle, Shield,
  Layers, Lock,
} from 'lucide-react-native';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { employeeApi, categoryApi, deviceApi, type Employee, type Category, type Device } from '../api/client';
import { useApi, useBatchApi } from '../hooks/useApi';
import { useDevices } from '../hooks/useDevices';
import { API_BASE_URL } from '../config';

// 自定义Button组件
function Button({ title, onPress, disabled, style, color, icon, active }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor: active ? '#1B3A5C' : (color || '#EEF2F7'),
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {icon}
      {title ? <Text style={{ color: active || color === 'red' ? 'white' : (color || '#1B3A5C'), fontWeight: '600', fontSize: 14 }}>{title}</Text> : null}
    </TouchableOpacity>
  );
}

// 创建自定义hook
function useEmployees() {
  const { data: employees, loading: loading, error: error, execute: loadEmployees, reset } = useApi(() => employeeApi.getList());

  const createEmployee = useApi((data: Omit<Employee, 'id' | 'createdAt'>) => employeeApi.create(data));
  const updateEmployee = useApi((data: { id: number; payload: Partial<Employee> }) => employeeApi.update(data.id, data.payload));
  const deleteEmployee = useApi((id: number) => employeeApi.delete(id));

  return {
    employees: employees?.employees || [],
    loading,
    error,
    loadEmployees,
    createEmployee: {
      execute: (data: Omit<Employee, 'id' | 'createdAt'>) => createEmployee.execute(data),
      loading: createEmployee.loading,
      error: createEmployee.error,
    },
    updateEmployee: {
      execute: (id: number, payload: Partial<Employee>) => updateEmployee.execute({ id, payload }),
      loading: updateEmployee.loading,
      error: updateEmployee.error,
    },
    deleteEmployee: {
      execute: (id: number) => deleteEmployee.execute(id),
      loading: deleteEmployee.loading,
      error: deleteEmployee.error,
    },
    reset,
  };
}

function useCategories() {
  const { data: categories, loading: loading, error: error, execute: loadCategories, reset } = useApi(() => categoryApi.getList());

  const createCategory = useApi((data: { name: string }) => categoryApi.create(data));
  const updateCategory = useApi((data: { id: number; payload: { name: string } }) => categoryApi.update(data.id, data.payload));
  const deleteCategory = useApi((id: number) => categoryApi.delete(id));

  return {
    categories: categories || [],
    loading,
    error,
    loadCategories,
    createCategory: {
      execute: (name: string) => createCategory.execute({ name }),
      loading: createCategory.loading,
      error: createCategory.error,
    },
    updateCategory: {
      execute: (id: number, name: string) => updateCategory.execute({ id, payload: { name } }),
      loading: updateCategory.loading,
      error: updateCategory.error,
    },
    deleteCategory: {
      execute: (id: number) => deleteCategory.execute(id),
      loading: deleteCategory.loading,
      error: deleteCategory.error,
    },
    reset,
  };
}

// 登录页面
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (!username || !password) { setErr("请填写用户名和密码"); return; }
    setErr("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '登录失败');
      }

      const { token } = await response.json();
      login(token);
      onLogin();
    } catch (error: any) {
      setErr(error.message || "用户名或密码错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* 品牌头部 */}
      <View style={[styles.brandHeader, { backgroundColor: '#1B3A5C' }]}>
        <View style={styles.brandContainer}>
          <View style={[styles.brandIcon, { backgroundColor: '#F47B20' }]}>
            <Shield size={18} color="white" />
          </View>
          <View style={styles.brandText}>
            <View>
              <Text style={[styles.brandTitle, { fontFamily: "'Barlow Semi Condensed', sans-serif" }]}>
                CORP ASSISTANT
              </Text>
              <Text style={[styles.brandSubtitle, { color: '#60A5FA' }]}>
                企业内部移动助手 · v1.0
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 表单卡片 */}
      <View style={styles.formCard}>
        {err && (
          <View style={[styles.alert, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
            <AlertTriangle size={13} color="#DC2626" />
            <Text style={[styles.alertText, { color: '#DC2626' }]}>{err}</Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>用户名</Text>
          <TextInput
            style={[styles.input, { color: err ? '#EF4444' : '#1A2332' }]}
            value={username}
            onChangeText={setUsername}
            placeholder="输入用户名"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>密码</Text>
          <TextInput
            style={[styles.input, { color: err ? '#EF4444' : '#1A2332' }]}
            value={password}
            onChangeText={setPassword}
            placeholder="输入密码"
            secureTextEntry
          />
        </View>

        <Button
          title={loading ? "处理中..." : "登 录"}
          onPress={submit}
          disabled={loading}
          style={styles.loginButton}
        />

        {/* 测试账号提示 */}
        <View style={[styles.hintCard, { backgroundColor: '#F8FAFC' }]}>
          <Text style={[styles.hintTitle, { color: '#94A3B8' }]}>测试账号</Text>
          <View style={styles.hintContent}>
            <Text>用户名：<Text style={[styles.code, { color: '#1B3A5C', fontFamily: 'monospace' }]}>admin</Text></Text>
            <Text>密码：<Text style={[styles.code, { color: '#1B3A5C', fontFamily: 'monospace' }]}>admin123</Text></Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// 主应用组件
function App() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState("employees");
  const [screen, setScreen] = useState({ id: "login" });

  const {
    employees,
    loading: employeesLoading,
    error: employeesError,
    loadEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    loadCategories,
    createCategory,
    deleteCategory,
  } = useCategories();

  const { devices } = useDevices();

  useEffect(() => {
    if (isAuthenticated) {
      loadEmployees();
      loadCategories();
    }
  }, [isAuthenticated]);

  const showNav = isAuthenticated && screen.id === "employees";

  const renderScreen = () => {
    switch (screen.id) {
      case "login":
        return <LoginScreen onLogin={() => setScreen({ id: "employees" })} />;

      case "employees":
        return (
          <View style={styles.container}>
            <Text style={styles.screenTitle}>员工管理</Text>
            {employeesLoading && <RefreshCw size={24} color="#1B3A5C" style={{ marginTop: 20 }} />}
            {employeesError && (
              <View style={styles.centered}>
                <AlertTriangle size={24} color="#DC2626" />
                <Text style={[styles.errorText, { color: '#DC2626' }]}>加载失败: {employeesError}</Text>
              </View>
            )}
            {employees.map(emp => (
              <View key={emp.id} style={styles.employeeCard}>
                <View style={styles.employeeHeader}>
                  <View style={[styles.avatar, { backgroundColor: '#EEF2F6' }]}>
                    <Text style={styles.avatarText}>{emp.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.employeeName}>{emp.name}</Text>
                    <Text style={styles.employeeEmail}>{emp.email}</Text>
                  </View>
                </View>
                <View style={styles.employeeActions}>
                  <Button title="详情" style={styles.actionButton} />
                  <Button title="编辑" style={styles.actionButton} />
                  <Button title="删除" color="red" style={styles.actionButton} />
                </View>
              </View>
            ))}
          </View>
        );

      case "devices":
        return (
          <View style={styles.container}>
            <Text style={styles.screenTitle}>设备管理</Text>
            <View style={styles.categoryList}>
              {categories.map(cat => (
                <View key={cat.id} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.deviceCount}>{cat.deviceCount} 台设备</Text>
                  </View>
                  <View style={styles.categoryActions}>
                    <Button title="查看设备" style={styles.actionButton} />
                    <Button title="删除" color="red" style={styles.actionButton} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case "logs":
        return (
          <View style={styles.container}>
            <Text style={styles.screenTitle}>接口日志</Text>
            <Text style={styles.logInfo}>2026-05-22 · 10 条记录 · 全局中间件</Text>
            <View style={styles.logList}>
              {[
                { id: 1, method: 'GET', url: '/api/users', status: 200, duration: 45 },
                { id: 2, method: 'POST', url: '/api/users', status: 201, duration: 120 },
              ].map(log => (
                <View key={log.id} style={styles.logItem}>
                  <View style={styles.logHeader}>
                    <Text style={[styles.method, { color: getMethodColor(log.method) }]}>{log.method}</Text>
                    <Text style={styles.url}>{log.url}</Text>
                    <Text style={[styles.status, { color: getStatusColor(log.status) }]}>{log.status}</Text>
                  </View>
                  <Text style={styles.logTime}>{log.duration}ms</Text>
                </View>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {renderScreen()}

      {/* 底部导航 */}
      {showNav && (
        <View style={styles.bottomNav}>
          <Button title="员工" icon={<Users size={18} />} onPress={() => setTab("employees")} active={tab === "employees"} />
          <Button title="设备" icon={<Layers size={18} />} onPress={() => setTab("devices")} active={tab === "devices"} />
          <Button title="日志" icon={<FileText size={18} />} onPress={() => setTab("logs")} active={tab === "logs"} />
        </View>
      )}
    </View>
  );
}

// 导出包装后的组件
export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

// 样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  brandHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 60,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    flex: 1,
  },
  brandTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 22,
  },
  brandSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },
  formCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  alertText: {
    fontSize: 12,
    flex: 1,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2EBF6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
  },
  loginButton: {
    backgroundColor: '#1B3A5C',
    color: 'white',
    fontWeight: '600',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  hintCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  hintTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  hintContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  code: {
    fontWeight: 'bold',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B3A5C',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  employeeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2332',
  },
  employeeEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  employeeActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#EEF2F7',
    color: '#1B3A5C',
    fontSize: 11,
    borderRadius: 8,
    paddingVertical: 8,
  },
  categoryList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2332',
  },
  deviceCount: {
    backgroundColor: '#E2EBF6',
    color: '#1B3A5C',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  logInfo: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  logList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  logItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  method: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: getMethodColorBg('GET'),
  },
  url: {
    flex: 1,
    fontSize: 11,
    color: '#1A2332',
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: getStatusColorBg(200),
  },
  logTime: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'right',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    height: 62,
  },
});

// 辅助函数
function getMethodColor(method: string) {
  const colors: Record<string, string> = {
    GET: '#0EA5E9',
    POST: '#10B981',
    PUT: '#F59E0B',
    DELETE: '#EF4444',
  };
  return colors[method] || '#6B7280';
}

function getMethodColorBg(method: string) {
  const colors: Record<string, string> = {
    GET: '#DBEAFE',
    POST: '#D1FAE5',
    PUT: '#FEF3C7',
    DELETE: '#FEE2E2',
  };
  return colors[method] || '#F3F4F6';
}

function getStatusColor(status: number) {
  if (status >= 500) return '#EF4444';
  if (status >= 400) return '#F59E0B';
  return '#10B981';
}

function getStatusColorBg(status: number) {
  if (status >= 500) return '#FEE2E2';
  if (status >= 400) return '#FEF3C7';
  return '#D1FAE5';
}