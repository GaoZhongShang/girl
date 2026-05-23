import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Cpu, FileText, Plus, ChevronLeft, ChevronDown,
  Edit2, Trash2, Eye, Search, X, Bell, Mail,
  Calendar, RefreshCw, AlertTriangle, Shield, Clock,
  Globe, Server, Monitor, Printer, Wifi, HardDrive,
  Layers, CheckCircle, Filter, Package, Lock,
} from "lucide-react";
import { AuthProvider, useAuth } from "../hooks/useAuth";
import { employeeApi, categoryApi, deviceApi, type Employee, type Category, type Device } from "../api/client";
import { useApi, useBatchApi } from "../hooks/useApi";
import { useDevices } from "../hooks/useDevices";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Tab = "employees" | "devices" | "logs";

type Screen =
  | { id: "login" }
  | { id: "employees" }
  | { id: "employee-detail"; employeeId: number }
  | { id: "employee-form"; employeeId?: number }
  | { id: "categories" }
  | { id: "device-list"; categoryId: number; categoryName: string }
  | { id: "device-form" }
  | { id: "logs" };

interface Employee {
  id: number; name: string; age: number;
  email: string; dept: string; createdAt: string;
}
interface Category { id: number; name: string; deviceCount: number; }
interface Device { id: number; name: string; model: string; categoryId: number; categoryName: string; }
interface LogEntry {
  id: number; time: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string; ip: string; status: number; duration: number;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const INIT_EMPLOYEES: Employee[] = [
  { id: 1, name: "张伟", age: 32, email: "zhang.wei@corp.com", dept: "人事部", createdAt: "2024-03-15" },
  { id: 2, name: "李娜", age: 28, email: "li.na@corp.com", dept: "技术部", createdAt: "2024-04-02" },
  { id: 3, name: "王芳", age: 35, email: "wang.fang@corp.com", dept: "财务部", createdAt: "2024-01-20" },
  { id: 4, name: "刘洋", age: 29, email: "liu.yang@corp.com", dept: "技术部", createdAt: "2024-05-10" },
  { id: 5, name: "陈静", age: 31, email: "chen.jing@corp.com", dept: "行政部", createdAt: "2024-02-28" },
];

const INIT_CATEGORIES: Category[] = [
  { id: 1, name: "IT设备", deviceCount: 5 },
  { id: 2, name: "办公耗材", deviceCount: 3 },
  { id: 3, name: "网络设备", deviceCount: 8 },
];

const ALL_DEVICES: Device[] = [
  { id: 1, name: "联想 ThinkPad E14", model: "Type-20RA", categoryId: 1, categoryName: "IT设备" },
  { id: 2, name: "戴尔 U2421E 显示器", model: "U2421E-BLK", categoryId: 1, categoryName: "IT设备" },
  { id: 3, name: "惠普 M1136 MFP", model: "CE847A", categoryId: 2, categoryName: "办公耗材" },
  { id: 4, name: "佳能 LBP6030", model: "8468B001", categoryId: 2, categoryName: "办公耗材" },
  { id: 5, name: "Cisco SG220-26", model: "SG220-26-K9", categoryId: 3, categoryName: "网络设备" },
  { id: 6, name: "华为 AR2240 路由器", model: "AR2240-AC", categoryId: 3, categoryName: "网络设备" },
];

const ALL_LOGS: LogEntry[] = [
  { id: 1, time: "09:15:23", method: "GET", url: "/api/users", ip: "192.168.1.100", status: 200, duration: 45 },
  { id: 2, time: "09:16:10", method: "POST", url: "/api/users", ip: "192.168.1.100", status: 201, duration: 120 },
  { id: 3, time: "09:17:05", method: "GET", url: "/api/categories", ip: "192.168.1.101", status: 200, duration: 32 },
  { id: 4, time: "09:18:44", method: "PUT", url: "/api/users/3", ip: "192.168.1.100", status: 400, duration: 18 },
  { id: 5, time: "09:19:30", method: "DELETE", url: "/api/categories/2", ip: "192.168.1.100", status: 409, duration: 55 },
  { id: 6, time: "09:20:15", method: "POST", url: "/api/auth/login", ip: "192.168.1.102", status: 401, duration: 22 },
  { id: 7, time: "09:21:00", method: "GET", url: "/api/devices", ip: "192.168.1.100", status: 200, duration: 67 },
  { id: 8, time: "09:22:30", method: "POST", url: "/api/devices", ip: "192.168.1.103", status: 201, duration: 89 },
  { id: 9, time: "09:23:45", method: "DELETE", url: "/api/users/4", ip: "192.168.1.100", status: 200, duration: 34 },
  { id: 10, time: "09:24:12", method: "GET", url: "/api/users/9", ip: "192.168.1.101", status: 404, duration: 12 },
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function statusColor(code: number) {
  if (code >= 500) return "bg-red-100 text-red-700";
  if (code >= 400) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

function methodColor(m: string) {
  const map: Record<string, string> = {
    GET: "bg-sky-100 text-sky-700",
    POST: "bg-emerald-100 text-emerald-700",
    PUT: "bg-amber-100 text-amber-700",
    DELETE: "bg-red-100 text-red-700",
  };
  return map[m] ?? "bg-gray-100 text-gray-700";
}

function deptColor(dept: string) {
  const map: Record<string, string> = {
    "人事部": "bg-violet-100 text-violet-700",
    "技术部": "bg-sky-100 text-sky-700",
    "财务部": "bg-emerald-100 text-emerald-700",
    "行政部": "bg-amber-100 text-amber-700",
  };
  return map[dept] ?? "bg-gray-100 text-gray-700";
}

function avatarBg(name: string) {
  const colors = ["bg-violet-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
  return colors[name.charCodeAt(0) % colors.length];
}

function screenKey(s: Screen): string {
  if (s.id === "employee-detail") return `emp-detail-${s.employeeId}`;
  if (s.id === "employee-form") return `emp-form-${s.employeeId ?? "new"}`;
  if (s.id === "device-list") return `dev-list-${s.categoryId}`;
  return s.id;
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

function Av({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sz = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-xl" }[size];
  return (
    <div className={`${sz} ${avatarBg(name)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {name[0]}
    </div>
  );
}

function Chip({ children, cls = "" }: { children: React.ReactNode; cls?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium leading-none ${cls}`}>
      {children}
    </span>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", err,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; err?: string;
}) {
  return (
    <div className="mb-4">
      <label className="block text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border text-[#1A2332] text-sm placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 focus:border-[#1B3A5C] transition-all ${err ? "border-red-300 bg-red-50/60" : "border-[#E2EBF6]"}`}
      />
      {err && (
        <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
          <AlertTriangle size={10} />{err}
        </p>
      )}
    </div>
  );
}

function Btn({
  children, onClick, loading, danger, outline, full = true, className = "",
}: {
  children: React.ReactNode; onClick?: () => void; loading?: boolean;
  danger?: boolean; outline?: boolean; full?: boolean; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${full ? "w-full" : ""} py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-60 ${danger
        ? "bg-red-500 text-white"
        : outline
        ? "border border-[#E2EBF6] text-[#64748B] bg-white"
        : "bg-[#1B3A5C] text-white"} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <RefreshCw size={13} className="animate-spin" />处理中...
        </span>
      ) : children}
    </button>
  );
}

function FAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 w-[52px] h-[52px] bg-[#F47B20] rounded-full flex items-center justify-center text-white z-10"
      style={{ boxShadow: "0 6px 20px rgba(244,123,32,0.45)" }}
    >
      <Plus size={22} />
    </button>
  );
}

function BottomSheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/50 z-40 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 380 }}
        className="w-full bg-white rounded-t-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-[#E2EBF6] rounded-full mx-auto mt-3 mb-1" />
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── LAYOUT CHROME ────────────────────────────────────────────────────────────

function StatusBar() {
  return (
    <div className="h-11 bg-white flex items-end justify-between px-5 pb-1.5 flex-shrink-0">
      <span className="text-[13px] font-semibold text-[#1A2332]">9:41</span>
      <div className="flex items-center gap-1.5">
        <Wifi size={11} className="text-[#1A2332]" />
        <div className="flex gap-[2px] items-end">
          {[3, 5, 7, 9].map((h, i) => (
            <div
              key={i}
              style={{ height: h, width: 3 }}
              className={`rounded-[1px] ${i < 3 ? "bg-[#1A2332]" : "bg-[#CBD5E1]"}`}
            />
          ))}
        </div>
        <div className="relative w-5 h-[11px] rounded-[3px] border border-[#1A2332]">
          <div className="absolute inset-[2px] right-[4px] bg-[#1A2332] rounded-[1px]" />
          <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-[5px] bg-[#1A2332] rounded-r-[1px]" />
        </div>
      </div>
    </div>
  );
}

function AppHeader({
  title, onBack, right,
}: {
  title: string; onBack?: () => void; right?: React.ReactNode;
}) {
  return (
    <div className="h-12 flex items-center justify-between px-3 bg-white border-b border-[#EEF2F7] flex-shrink-0">
      {onBack ? (
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-[#EEF2F7]">
          <ChevronLeft size={20} className="text-[#1A2332]" />
        </button>
      ) : (
        <div className="w-9" />
      )}
      <span className="font-semibold text-[#1A2332] text-[15px]">{title}</span>
      {right ?? <div className="w-9" />}
    </div>
  );
}

function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: "employees", icon: Users, label: "员工" },
    { id: "devices", icon: Layers, label: "设备" },
    { id: "logs", icon: FileText, label: "日志" },
  ];
  return (
    <div className="h-[62px] bg-white border-t border-[#EEF2F7] flex items-stretch flex-shrink-0">
      {tabs.map(({ id, icon: Icon, label }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => onChange(id)} className="flex-1 flex flex-col items-center justify-center gap-0.5">
            <div className={`w-10 h-7 flex items-center justify-center rounded-xl transition-all ${active ? "bg-[#E2EBF6]" : ""}`}>
              <Icon size={18} className={active ? "text-[#1B3A5C]" : "text-[#94A3B8]"} />
            </div>
            <span className={`text-[10px] font-semibold ${active ? "text-[#1B3A5C]" : "text-[#94A3B8]"}`}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── AUTH GUARD ──────────────────────────────────────────────────────────────

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-[#F1F5F9]">
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw size={24} className="animate-spin text-[#1B3A5C]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => {}} />;
  }

  return <>{children}</>;
}

// ─── API STATE HOOKS ─────────────────────────────────────────────────────────

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

function useDevices() {
  const { data: devices, loading: loading, error: error, execute: loadDevices, reset } = useApi(() => deviceApi.getList());

  const createDevice = useApi((data: { name: string; model?: string; categoryId: number }) => deviceApi.create(data));
  const updateDevice = useApi((data: { id: number; payload: { name: string; model?: string; categoryId?: number } }) => deviceApi.update(data.id, data.payload));
  const deleteDevice = useApi((id: number) => deviceApi.delete(id));

  return {
    devices: devices || [],
    loading,
    error,
    loadDevices,
    createDevice: {
      execute: (data: { name: string; model?: string; categoryId: number }) => createDevice.execute(data),
      loading: createDevice.loading,
      error: createDevice.error,
    },
    updateDevice: {
      execute: (id: number, payload: { name: string; model?: string; categoryId?: number }) => updateDevice.execute({ id, payload }),
      loading: updateDevice.loading,
      error: updateDevice.error,
    },
    deleteDevice: {
      execute: (id: number) => deleteDevice.execute(id),
      loading: deleteDevice.loading,
      error: deleteDevice.error,
    },
    reset,
  };
}

// ─── ADD CATEGORY MODAL ───────────────────────────────────────────────────────

function AddCategoryModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function submit() {
    if (!name.trim()) { setErr("分类名称不能为空"); return; }
    if (name.length > 20) { setErr("分类名称不超过20字符"); return; }
    setErr("");
    setLoading(true);
    setTimeout(() => { setLoading(false); onAdd(name.trim()); }, 700);
  }

  return (
    <BottomSheet onClose={onClose}>
      <div className="px-5 pt-2 pb-6">
        <p className="font-semibold text-[#1A2332] text-base mb-4">添加设备分类</p>
        <Field
          label="分类名称 *"
          value={name}
          onChange={setName}
          placeholder="如：IT设备、办公耗材（1–20字符）"
          err={err}
        />
        <div className="flex gap-2 mt-1">
          <Btn outline onClick={onClose} className="flex-1">取消</Btn>
          <Btn onClick={submit} loading={loading} className="flex-1">添加</Btn>
        </div>
      </div>
    </BottomSheet>
  );
}

// ─── SCREEN: LOGIN ────────────────────────────────────────────────────────────

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
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
    <div className="h-full flex flex-col bg-[#F1F5F9]">
      {/* Brand header */}
      <div className="bg-[#1B3A5C] px-5 pt-5 pb-16 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#F47B20] rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base tracking-widest" style={{ fontFamily: "'Barlow Semi Condensed', sans-serif" }}>
              CORP ASSISTANT
            </p>
            <p className="text-blue-300 text-[11px]">企业内部移动助手 · v1.0</p>
          </div>
        </div>
        <h2 className="text-white text-[26px] font-bold leading-tight">管理员登录</h2>
        <p className="text-blue-300/80 text-sm mt-1">受保护接口需要 JWT 身份验证</p>
      </div>

      {/* Form card */}
      <div className="mx-4 -mt-8 bg-white rounded-2xl shadow-lg p-5 flex-1 overflow-y-auto">
        {err && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2"
          >
            <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-600">{err}</span>
          </motion.div>
        )}

        <Field label="用户名" value={username} onChange={setUsername} placeholder="输入用户名" />
        <Field label="密码" value={password} onChange={setPassword} placeholder="输入密码" type="password" />

        <div className="mb-5">
          <Btn onClick={submit} loading={loading}>登 录</Btn>
        </div>

        {/* Test account hint */}
        <div className="bg-[#F8FAFC] rounded-xl p-3 mb-4">
          <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1.5">测试账号</p>
          <div className="flex gap-4 text-xs text-[#64748B]">
            <span>用户名：<code className="text-[#1B3A5C] font-bold font-mono">admin</code></span>
            <span>密码：<code className="text-[#1B3A5C] font-bold font-mono">admin123</code></span>
          </div>
        </div>

        {/* JWT diagram */}
        <div>
          <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-2">JWT 令牌结构</p>
          <div className="flex gap-1 h-7 mb-2">
            {[
              { label: "Header", color: "bg-sky-500", flex: 2 },
              { label: "Payload", color: "bg-[#1B3A5C]", flex: 3 },
              { label: "Signature", color: "bg-[#F47B20]", flex: 2 },
            ].map(({ label, color, flex }) => (
              <div key={label} className={`${color} rounded-lg flex items-center justify-center`} style={{ flex }}>
                <span className="text-white text-[10px] font-semibold">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#94A3B8]">
            过期: 2小时 · 算法: HS256 · 密钥: <code className="font-mono">JWT_SECRET</code> env
          </p>
        </div>
      </div>

      <div className="py-3 text-center text-[10px] text-[#94A3B8] flex-shrink-0">
        Flask + SQLAlchemy · MySQL 8.0 · PyJWT · bcrypt
      </div>
    </div>
  );
}

// ─── SCREEN: EMPLOYEE LIST ────────────────────────────────────────────────────

function EmployeeListScreen({
  employees, loading, error, onAdd, onView, onEdit, onDelete, refresh,
}: {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  onAdd: () => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  refresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = employees.filter(e =>
    e.name.includes(search) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.dept.includes(search)
  );

  const target = employees.find(e => e.id === deletingId);

  // 加载状态
  if (loading) {
    return (
      <div className="h-full flex flex-col bg-[#F1F5F9]">
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw size={24} className="animate-spin text-[#1B3A5C]" />
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="h-full flex flex-col bg-[#F1F5F9]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle size={24} className="text-red-500 mx-auto mb-2" />
            <p className="text-red-600 text-sm">加载失败: {error}</p>
            <button
              onClick={refresh}
              className="mt-2 px-4 py-2 bg-[#1B3A5C] text-white rounded-lg text-sm"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F1F5F9] relative">
      {/* Coloured header */}
      <div className="bg-[#1B3A5C] px-4 pt-3 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white font-bold text-lg leading-none" style={{ fontFamily: "'Barlow Semi Condensed', sans-serif" }}>
              员工管理
            </h1>
            <p className="text-blue-300 text-xs mt-0.5">{employees.length} 名在职员工</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5">
              <Lock size={9} className="text-blue-300" />
              <span className="text-[10px] text-blue-300 font-mono">JWT</span>
            </div>
            <button className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center">
              <Bell size={15} className="text-white" />
            </button>
          </div>
        </div>
        <div className="flex items-center bg-white/10 rounded-xl px-3 py-2 gap-2">
          <Search size={13} className="text-blue-300 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索姓名、邮箱、部门…"
            className="bg-transparent text-white placeholder-blue-300/60 text-[13px] flex-1 outline-none min-w-0"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={13} className="text-blue-300" />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-2.5 flex gap-2 flex-shrink-0">
        {[
          { label: "总人数", val: employees.length, color: "text-[#1B3A5C]" },
          { label: "技术部", val: employees.filter(e => e.dept === "技术部").length, color: "text-sky-600" },
          { label: "本月新增", val: 1, color: "text-emerald-600" },
        ].map(({ label, val, color }) => (
          <div key={label} className="flex-1 bg-white rounded-xl py-2 text-center shadow-sm">
            <div className={`font-bold text-base ${color}`}>{val}</div>
            <div className="text-[9px] text-[#94A3B8] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[#94A3B8]">
            <Users size={28} className="mb-2 opacity-40" />
            <p className="text-sm">无匹配员工</p>
          </div>
        )}
        {filtered.map(emp => (
          <div key={emp.id} className="bg-white rounded-2xl mb-2.5 p-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <Av name={emp.name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1A2332] text-sm">{emp.name}</span>
                  <Chip cls={deptColor(emp.dept)}>{emp.dept}</Chip>
                </div>
                <p className="text-[#64748B] text-xs mt-0.5 truncate">{emp.email}</p>
                <p className="text-[#94A3B8] text-[11px] mt-0.5">
                  年龄 {emp.age} · #{emp.id.toString().padStart(4, "0")}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5 mt-3 pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => onView(emp.id)}
                className="flex-1 h-7 rounded-lg bg-[#EEF2F7] flex items-center justify-center gap-1 text-[11px] text-[#1B3A5C] font-medium"
              >
                <Eye size={11} />详情
              </button>
              <button
                onClick={() => onEdit(emp.id)}
                className="flex-1 h-7 rounded-lg bg-[#EEF2F7] flex items-center justify-center gap-1 text-[11px] text-[#1B3A5C] font-medium"
              >
                <Edit2 size={11} />编辑
              </button>
              <button
                onClick={() => setDeletingId(emp.id)}
                className="flex-1 h-7 rounded-lg bg-red-50 flex items-center justify-center gap-1 text-[11px] text-red-500 font-medium"
              >
                <Trash2 size={11} />删除
              </button>
            </div>
          </div>
        ))}
      </div>

      <FAB onClick={onAdd} />

      {/* Delete confirmation */}
      <AnimatePresence>
        {deletingId !== null && target && (
          <BottomSheet onClose={() => setDeletingId(null)}>
            <div className="px-5 pt-2 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A2332] text-sm">确认删除员工？</p>
                  <p className="text-xs text-[#64748B]">{target.name} · {target.dept}</p>
                </div>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-3 mb-4">
                <p className="text-xs text-[#64748B] leading-relaxed">
                  此操作将永久删除该员工的所有数据，包括考勤、薪资等关联记录，且
                  <strong className="text-[#1A2332]">不可撤销</strong>。
                </p>
              </div>
              <div className="flex gap-2">
                <Btn outline onClick={() => setDeletingId(null)} className="flex-1">取消</Btn>
                <Btn danger onClick={() => { onDelete(deletingId); setDeletingId(null); }} className="flex-1">
                  确认删除
                </Btn>
              </div>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SCREEN: EMPLOYEE DETAIL ──────────────────────────────────────────────────

function EmployeeDetailScreen({
  emp, onBack, onEdit,
}: {
  emp: Employee; onBack: () => void; onEdit: () => void;
}) {
  return (
    <div className="h-full flex flex-col bg-[#F1F5F9]">
      <AppHeader
        title="员工详情"
        onBack={onBack}
        right={
          <button onClick={onEdit} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-[#EEF2F7]">
            <Edit2 size={16} className="text-[#1B3A5C]" />
          </button>
        }
      />

      {/* Hero */}
      <div className="bg-[#1B3A5C] px-5 pt-4 pb-12 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Av name={emp.name} size="lg" />
          <div>
            <h2 className="text-white text-xl font-bold">{emp.name}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <Chip cls="bg-white/20 text-white">{emp.dept}</Chip>
              <Chip cls="bg-white/10 text-blue-200">
                #{emp.id.toString().padStart(4, "0")}
              </Chip>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 -mt-6 pb-4">
        {/* Info card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-3">
          {[
            { icon: Mail, label: "邮箱", val: emp.email },
            { icon: Calendar, label: "年龄", val: `${emp.age} 岁` },
            { icon: Clock, label: "入职日期", val: emp.createdAt },
            { icon: Server, label: "所在系统", val: "Corp ERP · 人事管理" },
          ].map(({ icon: I, label, val }, i, arr) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-[#F1F5F9]" : ""}`}
            >
              <div className="w-8 h-8 bg-[#EEF2F7] rounded-lg flex items-center justify-center flex-shrink-0">
                <I size={14} className="text-[#1B3A5C]" />
              </div>
              <div>
                <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">{label}</p>
                <p className="text-sm text-[#1A2332] font-medium mt-0.5">{val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* API response preview */}
        <div>
          <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-2 px-1">
            统一响应格式（模块五）
          </p>
          <div className="bg-[#0D1829] rounded-2xl p-4 overflow-x-auto">
            <pre className="text-[11px] font-mono leading-relaxed whitespace-pre">
              <span className="text-[#94A3B8]">{"{"}</span>{"\n"}
              <span className="text-[#64748B]">  "code":    </span><span className="text-emerald-400">200</span><span className="text-[#64748B]">,</span>{"\n"}
              <span className="text-[#64748B]">  "message": </span><span className="text-amber-300">"成功"</span><span className="text-[#64748B]">,</span>{"\n"}
              <span className="text-[#64748B]">  "data": {"{"}</span>{"\n"}
              <span className="text-[#64748B]">    "id":    </span><span className="text-sky-400">{emp.id}</span><span className="text-[#64748B]">,</span>{"\n"}
              <span className="text-[#64748B]">    "name":  </span><span className="text-amber-300">"{emp.name}"</span><span className="text-[#64748B]">,</span>{"\n"}
              <span className="text-[#64748B]">    "age":   </span><span className="text-sky-400">{emp.age}</span><span className="text-[#64748B]">,</span>{"\n"}
              <span className="text-[#64748B]">    "email": </span><span className="text-amber-300">"···"</span>{"\n"}
              <span className="text-[#64748B]">  {"}"}</span>{"\n"}
              <span className="text-[#94A3B8]">{"}"}</span>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: EMPLOYEE FORM ────────────────────────────────────────────────────

function EmployeeFormScreen({
  emp, onBack, onDone,
}: {
  emp?: Employee; onBack: () => void; onDone: () => void;
}) {
  const isEdit = !!emp;
  const [name, setName] = useState(emp?.name ?? "");
  const [age, setAge] = useState(emp?.age?.toString() ?? "");
  const [email, setEmail] = useState(emp?.email ?? "");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "姓名不能为空";
    else if (name.length > 20) e.name = "姓名不超过20字符";
    const n = parseInt(age);
    if (!age) e.age = "年龄不能为空";
    else if (isNaN(n) || n < 18 || n > 60) e.age = "年龄须在 18–60 之间";
    if (!email) e.email = "邮箱不能为空";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "邮箱格式不正确";
    setErrs(e);
    return !Object.keys(e).length;
  }

  function submit() {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOk(true);
      setTimeout(onDone, 800);
    }, 900);
  }

  const rules = [
    { text: "姓名 1–20 字符", pass: name.length >= 1 && name.length <= 20 },
    { text: "年龄 18–60 整数", pass: (() => { const n = parseInt(age); return !isNaN(n) && n >= 18 && n <= 60; })() },
    { text: "合法邮箱格式", pass: /\S+@\S+\.\S+/.test(email) },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F1F5F9]">
      <AppHeader title={isEdit ? "编辑员工" : "新增员工"} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {ok && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 px-3 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2"
          >
            <CheckCircle size={14} className="text-emerald-500" />
            <span className="text-xs text-emerald-700 font-medium">
              {isEdit ? "员工信息已更新" : "员工添加成功"}
            </span>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-3">
          <Field label="姓名 *" value={name} onChange={setName} placeholder="请输入员工姓名（1–20字符）" err={errs.name} />
          <Field label="年龄 *" value={age} onChange={setAge} placeholder="请输入年龄（18–60）" type="number" err={errs.age} />
          <Field label="邮箱 *" value={email} onChange={setEmail} placeholder="请输入有效邮箱地址" type="email" err={errs.email} />

          {/* Live validation */}
          <div className="bg-[#F8FAFC] rounded-xl p-3 mb-4">
            <p className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider mb-2">实时校验</p>
            <div className="space-y-1.5">
              {rules.map(({ text, pass }) => (
                <div key={text} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${pass ? "bg-emerald-500" : "bg-[#E2EBF6]"}`}>
                    {pass && <span className="text-white text-[9px] font-bold leading-none">✓</span>}
                  </div>
                  <span className={`text-xs transition-colors ${pass ? "text-emerald-700" : "text-[#94A3B8]"}`}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <Btn onClick={submit} loading={loading}>
            {isEdit ? "保存修改" : "添加员工"}
          </Btn>
        </div>

        {/* Endpoint reference */}
        <div className="bg-[#0D1829] rounded-xl px-4 py-3">
          <p className="text-[10px] text-[#64748B] mb-1 uppercase tracking-wider">请求端点</p>
          <code className="text-xs text-[#F47B20] font-mono">
            {isEdit ? `PUT /api/users/${emp?.id}` : "POST /api/users"}
          </code>
          <div className="mt-2 pt-2 border-t border-white/5 flex gap-4">
            <div>
              <p className="text-[9px] text-[#64748B] mb-0.5">校验失败 →</p>
              <code className="text-[10px] text-red-400 font-mono">400 Bad Request</code>
            </div>
            <div>
              <p className="text-[9px] text-[#64748B] mb-0.5">成功 →</p>
              <code className="text-[10px] text-emerald-400 font-mono">{isEdit ? "200 OK" : "201 Created"}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: CATEGORY LIST ────────────────────────────────────────────────────

function CategoryListScreen({
  categories, loading, error, onViewDevices, onAdd, onDelete, refresh,
}: {
  categories: Category[];
  loading: boolean;
  error: string | null;
  onViewDevices: (id: number, name: string) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  refresh: () => void;
}) {
  const [errMsg, setErrMsg] = useState("");

  const iconMap: Record<string, React.ElementType> = {
    "IT设备": Monitor,
    "办公耗材": Printer,
    "网络设备": Wifi,
  };

  return (
    <div className="h-full flex flex-col bg-[#F1F5F9] relative">
      {/* Header */}
      <div className="bg-[#1B3A5C] px-4 pt-3 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg leading-none" style={{ fontFamily: "'Barlow Semi Condensed', sans-serif" }}>
              设备管理
            </h1>
            <p className="text-blue-300 text-xs mt-0.5">
              {categories.length} 个分类 · {ALL_DEVICES.length} 台设备
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5">
              <Lock size={9} className="text-blue-300" />
              <span className="text-[10px] text-blue-300 font-mono">JWT</span>
            </div>
            <button className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center">
              <Bell size={15} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-20">
        <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-2.5">设备分类列表</p>

        {categories.map(cat => {
          const Icon = iconMap[cat.name] ?? HardDrive;
          const hasDevices = cat.deviceCount > 0;
          return (
            <div key={cat.id} className="bg-white rounded-2xl mb-2.5 shadow-sm overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EEF2F7] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-[#1B3A5C]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1A2332] text-sm">{cat.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Chip cls="bg-[#E2EBF6] text-[#1B3A5C]">{cat.deviceCount} 台设备</Chip>
                    <span className="text-[10px] text-[#94A3B8]">ID #{cat.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex border-t border-[#F1F5F9]">
                <button
                  onClick={() => onViewDevices(cat.id, cat.name)}
                  className="flex-1 py-2.5 flex items-center justify-center gap-1 text-xs text-[#1B3A5C] font-medium border-r border-[#F1F5F9]"
                >
                  <Eye size={12} />查看设备
                </button>
                <button className="flex-1 py-2.5 flex items-center justify-center gap-1 text-xs text-[#64748B] border-r border-[#F1F5F9]">
                  <Edit2 size={12} />编辑
                </button>
                <button
                  onClick={() => {
                    if (hasDevices) {
                      setErrMsg(
                        `「${cat.name}」分类下存在 ${cat.deviceCount} 台设备，禁止删除。\n\n请先将该分类下的所有设备迁移或删除后再执行此操作。`
                      );
                    } else {
                      onDelete(cat.id);
                    }
                  }}
                  className={`flex-1 py-2.5 flex items-center justify-center gap-1 text-xs font-medium ${hasDevices ? "text-[#CBD5E1]" : "text-red-500"}`}
                >
                  <Trash2 size={12} />
                  {hasDevices ? "不可删除" : "删除"}
                </button>
              </div>
            </div>
          );
        })}

        {/* Add placeholder */}
        <button
          onClick={onAdd}
          className="w-full bg-white rounded-2xl py-4 shadow-sm border-2 border-dashed border-[#E2EBF6] flex items-center justify-center gap-2 text-[#94A3B8] text-sm"
        >
          <Plus size={16} />添加新分类
        </button>
      </div>

      <FAB onClick={onAdd} />

      {/* Error sheet */}
      <AnimatePresence>
        {errMsg && (
          <BottomSheet onClose={() => setErrMsg("")}>
            <div className="px-5 pt-2 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={16} className="text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A2332] text-sm">删除失败</p>
                  <p className="text-[11px] text-[#64748B]">HTTP 400 · 业务冲突</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
                <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-line">{errMsg}</p>
              </div>
              {/* Error response format */}
              <div className="bg-[#0D1829] rounded-xl p-3 mb-4">
                <pre className="text-[10px] font-mono leading-relaxed">
                  <span className="text-[#64748B]">{"{ "}</span>
                  <span className="text-[#94A3B8]">"code": </span><span className="text-amber-400">400</span>
                  <span className="text-[#64748B]">,{"\n"}  </span>
                  <span className="text-[#94A3B8]">"message": </span><span className="text-red-300">"分类下存在设备，无法删除"</span>
                  <span className="text-[#64748B]">,{"\n"}  </span>
                  <span className="text-[#94A3B8]">"data": </span><span className="text-sky-400">null</span>
                  <span className="text-[#64748B]">{"\n}"}</span>
                </pre>
              </div>
              <Btn onClick={() => setErrMsg("")}>知道了</Btn>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SCREEN: DEVICE LIST ──────────────────────────────────────────────────────

function DeviceListScreen({
  categoryId, categoryName, onBack, onAdd,
}: {
  categoryId: number; categoryName: string; onBack: () => void; onAdd: () => void;
}) {
  const devices = ALL_DEVICES.filter(d => d.categoryId === categoryId);

  return (
    <div className="h-full flex flex-col bg-[#F1F5F9] relative">
      <AppHeader title={`${categoryName} 设备`} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-20">
        {/* Filter chip */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 bg-[#1B3A5C] rounded-full px-2.5 py-1">
            <Filter size={10} className="text-blue-300" />
            <span className="text-[11px] text-white font-medium">{categoryName}</span>
          </div>
          <span className="text-[11px] text-[#94A3B8]">{devices.length} 台设备</span>
        </div>

        {devices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[#94A3B8]">
            <Package size={28} className="mb-2 opacity-40" />
            <p className="text-sm">该分类暂无设备</p>
          </div>
        )}

        {devices.map(device => (
          <div key={device.id} className="bg-white rounded-2xl mb-2.5 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-[#EEF2F7] rounded-xl flex items-center justify-center flex-shrink-0">
                <Cpu size={15} className="text-[#1B3A5C]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#1A2332] text-sm leading-tight">{device.name}</p>
                <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">{device.model}</p>
                <Chip cls="bg-[#E2EBF6] text-[#1B3A5C] mt-1.5">{device.categoryName}</Chip>
              </div>
            </div>
            <div className="flex gap-1.5 mt-3 pt-3 border-t border-[#F1F5F9]">
              <button className="flex-1 h-7 rounded-lg bg-[#EEF2F7] flex items-center justify-center gap-1 text-[11px] text-[#1B3A5C] font-medium">
                <Edit2 size={11} />编辑
              </button>
              <button className="flex-1 h-7 rounded-lg bg-red-50 flex items-center justify-center gap-1 text-[11px] text-red-500 font-medium">
                <Trash2 size={11} />删除
              </button>
            </div>
          </div>
        ))}
      </div>

      <FAB onClick={onAdd} />
    </div>
  );
}

// ─── SCREEN: DEVICE FORM ──────────────────────────────────────────────────────

function DeviceFormScreen({
  categories, onBack, onDone,
}: {
  categories: Category[]; onBack: () => void; onDone: () => void;
}) {
  const [deviceName, setDeviceName] = useState("");
  const [model, setModel] = useState("");
  const [catId, setCatId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  function submit() {
    const e: Record<string, string> = {};
    if (!deviceName.trim()) e.deviceName = "设备名称不能为空";
    if (!catId) e.cat = "请选择所属分类";
    setErrs(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setOk(true); setTimeout(onDone, 800); }, 900);
  }

  const selCat = categories.find(c => c.id === catId);

  return (
    <div className="h-full flex flex-col bg-[#F1F5F9]">
      <AppHeader title="新增设备" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {ok && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 px-3 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2"
          >
            <CheckCircle size={14} className="text-emerald-500" />
            <span className="text-xs text-emerald-700 font-medium">设备添加成功</span>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-3">
          <Field label="设备名称 *" value={deviceName} onChange={setDeviceName} placeholder="如：联想 ThinkPad E14" err={errs.deviceName} />
          <Field label="型号（可选）" value={model} onChange={setModel} placeholder="如：Type-20RA" />

          {/* Category picker */}
          <div className="mb-4">
            <label className="block text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
              所属分类 *
            </label>
            <button
              onClick={() => setOpen(!open)}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border text-sm flex items-center justify-between transition-all ${errs.cat ? "border-red-300 bg-red-50/60" : "border-[#E2EBF6] focus:border-[#1B3A5C]"}`}
            >
              <span className={selCat ? "text-[#1A2332]" : "text-[#94A3B8]"}>
                {selCat?.name ?? "请选择设备分类"}
              </span>
              <ChevronDown
                size={14}
                className={`text-[#94A3B8] transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            {errs.cat && (
              <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                <AlertTriangle size={10} />{errs.cat}
              </p>
            )}
            {open && (
              <div className="mt-1 bg-white border border-[#E2EBF6] rounded-xl overflow-hidden shadow-lg">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setCatId(cat.id); setOpen(false); }}
                    className={`w-full px-4 py-2.5 flex items-center justify-between text-sm border-b border-[#F1F5F9] last:border-0 ${catId === cat.id ? "bg-[#EEF2F7] text-[#1B3A5C] font-semibold" : "text-[#1A2332]"}`}
                  >
                    {cat.name}
                    <Chip cls="bg-[#EEF2F7] text-[#64748B]">{cat.deviceCount} 台</Chip>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Btn onClick={submit} loading={loading}>添加设备</Btn>
        </div>

        {/* Endpoint reference */}
        <div className="bg-[#0D1829] rounded-xl px-4 py-3">
          <p className="text-[10px] text-[#64748B] mb-1 uppercase tracking-wider">API 端点</p>
          <code className="text-xs text-[#F47B20] font-mono">POST /api/devices</code>
          <div className="mt-2 pt-2 border-t border-white/5">
            <p className="text-[10px] text-[#94A3B8] font-mono">外键校验 → category_id 须存在</p>
            <p className="text-[10px] text-[#64748B] font-mono mt-0.5">
              关联查询: GET /api/categories/{"{id}"}/devices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: API LOGS ─────────────────────────────────────────────────────────

function ApiLogsScreen() {
  const [filter, setFilter] = useState<"all" | "2xx" | "4xx" | "5xx">("all");

  const filtered = ALL_LOGS.filter(log =>
    filter === "all" ? true :
    filter === "2xx" ? log.status < 300 :
    filter === "4xx" ? log.status >= 400 && log.status < 500 :
    log.status >= 500
  );

  const stats = [
    { label: "2xx 成功", count: ALL_LOGS.filter(l => l.status < 300).length, color: "text-emerald-600" },
    { label: "4xx 错误", count: ALL_LOGS.filter(l => l.status >= 400 && l.status < 500).length, color: "text-amber-600" },
    { label: "5xx 异常", count: ALL_LOGS.filter(l => l.status >= 500).length, color: "text-red-600" },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F1F5F9]">
      {/* Header */}
      <div className="bg-[#1B3A5C] px-4 pt-3 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white font-bold text-lg leading-none" style={{ fontFamily: "'Barlow Semi Condensed', sans-serif" }}>
              接口日志
            </h1>
            <p className="text-blue-300 text-xs mt-0.5">2026-05-22 · {ALL_LOGS.length} 条记录 · 全局中间件</p>
          </div>
          <button className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center">
            <RefreshCw size={14} className="text-white" />
          </button>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1.5">
          {(["all", "2xx", "4xx", "5xx"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${filter === f ? "bg-white text-[#1B3A5C]" : "bg-white/10 text-blue-200"}`}
            >
              {f === "all" ? "全部" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 py-2.5 flex gap-2 flex-shrink-0">
        {stats.map(({ label, count, color }) => (
          <div key={label} className="flex-1 bg-white rounded-xl py-2 text-center shadow-sm">
            <div className={`font-bold text-base ${color}`}>{count}</div>
            <div className="text-[9px] text-[#94A3B8] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-2">
          LoggingMiddleware · RotatingFileHandler
        </p>
        {filtered.map(log => (
          <div key={log.id} className="bg-white rounded-xl mb-2 px-3.5 py-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <Chip cls={`${methodColor(log.method)} font-mono font-semibold`}>{log.method}</Chip>
              <code className="text-xs text-[#1A2332] flex-1 truncate">{log.url}</code>
              <Chip cls={`${statusColor(log.status)} font-mono font-semibold`}>{log.status}</Chip>
            </div>
            <div className="flex items-center text-[10px] text-[#94A3B8] gap-3">
              <span className="flex items-center gap-1">
                <Clock size={9} />{log.time}
              </span>
              <span className="flex items-center gap-1">
                <Globe size={9} />{log.ip}
              </span>
              <span className="flex items-center gap-1 ml-auto">
                <Server size={9} />{log.duration}ms
              </span>
            </div>
          </div>
        ))}

        {/* Middleware schema */}
        <div className="mt-3 bg-[#0D1829] rounded-xl p-3.5">
          <p className="text-[10px] text-[#64748B] uppercase tracking-wider mb-2">日志格式规范（模块四）</p>
          <pre className="text-[10px] font-mono text-[#94A3B8] leading-relaxed">
            <span className="text-sky-400">[2026-05-22 09:15:23]</span>{" "}
            <span className="text-emerald-400">GET</span>{" "}
            <span className="text-amber-300">/api/users</span>{"\n"}
            <span className="text-[#64748B]">IP: 192.168.1.100  Status: </span>
            <span className="text-emerald-400">200</span>
            <span className="text-[#64748B]">  Duration: 45ms</span>
          </pre>
        </div>
      </div>
    </div>
  );
}

// ─── SLIDE ANIMATION ──────────────────────────────────────────────────────────

const SLIDE: Record<string, (d: "fwd" | "bck") => object> = {
  enter: (d) => ({ x: d === "fwd" ? "100%" : "-20%", opacity: d === "bck" ? 0.5 : 1 }),
  center: () => ({ x: 0, opacity: 1 }),
  exit: (d) => ({ x: d === "fwd" ? "-20%" : "100%", opacity: d === "fwd" ? 0.5 : 1 }),
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

const SUB_SCREENS = ["employee-detail", "employee-form", "device-list", "device-form"];

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>("employees");
  const [screen, setScreen] = useState<Screen>({ id: "login" });
  const [dir, setDir] = useState<"fwd" | "bck">("fwd");
  const [showAddCat, setShowAddCat] = useState(false);

  // 使用API hooks获取数据
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

  const {
    devices,
    loading: devicesLoading,
    error: devicesError,
    loadDevices,
    createDevice,
    deleteDevice,
  } = useDevices();

  const showNav = isAuthenticated && !SUB_SCREENS.includes(screen.id);

  // 初始加载数据
  useEffect(() => {
    if (isAuthenticated) {
      loadEmployees();
      loadCategories();
      loadDevices();
    }
  }, [isAuthenticated]);

  function go(to: Screen) { setDir("fwd"); setScreen(to); }
  function back(to: Screen) { setDir("bck"); setScreen(to); }

  function changeTab(t: Tab) {
    setTab(t);
    setDir("fwd");
    if (t === "employees") setScreen({ id: "employees" });
    else if (t === "devices") setScreen({ id: "categories" });
    else setScreen({ id: "logs" });
  }

  function renderScreen() {
    switch (screen.id) {
      case "login":
        return (
          <LoginScreen
            onLogin={() => { setLoggedIn(true); go({ id: "employees" }); }}
          />
        );

      case "employees":
        return (
          <EmployeeListScreen
            employees={employees}
            onAdd={() => go({ id: "employee-form" })}
            onView={id => go({ id: "employee-detail", employeeId: id })}
            onEdit={id => go({ id: "employee-form", employeeId: id })}
            onDelete={id => setEmployees(prev => prev.filter(e => e.id !== id))}
          />
        );

      case "employee-detail": {
        const emp = employees.find(e => e.id === screen.employeeId)!;
        return (
          <EmployeeDetailScreen
            emp={emp}
            onBack={() => back({ id: "employees" })}
            onEdit={() => go({ id: "employee-form", employeeId: screen.employeeId })}
          />
        );
      }

      case "employee-form": {
        const emp = screen.employeeId
          ? employees.find(e => e.id === screen.employeeId)
          : undefined;
        return (
          <EmployeeFormScreen
            emp={emp}
            onBack={() => back({ id: "employees" })}
            onDone={() => back({ id: "employees" })}
          />
        );
      }

      case "categories":
        return (
          <CategoryListScreen
            categories={categories}
            onViewDevices={(id, name) => go({ id: "device-list", categoryId: id, categoryName: name })}
            onAdd={() => setShowAddCat(true)}
          />
        );

      case "device-list":
        return (
          <DeviceListScreen
            categoryId={screen.categoryId}
            categoryName={screen.categoryName}
            onBack={() => back({ id: "categories" })}
            onAdd={() => go({ id: "device-form" })}
          />
        );

      case "device-form":
        return (
          <DeviceFormScreen
            categories={categories}
            onBack={() => back({ id: "categories" })}
            onDone={async (data) => {
              await createDevice(data);
              back({ id: "categories" });
            }}
          />
        );

      case "logs":
        return <ApiLogsScreen />;

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060E18] via-[#0D1E35] to-[#1B3A5C] flex items-center justify-center p-6">
      {/* Phone shell */}
      <div className="relative flex-shrink-0">
        {/* Volume buttons */}
        <div className="absolute -left-[3px] top-[84px] w-[3px] h-7 bg-[#232323] rounded-l-[2px]" />
        <div className="absolute -left-[3px] top-[124px] w-[3px] h-14 bg-[#232323] rounded-l-[2px]" />
        <div className="absolute -left-[3px] top-[192px] w-[3px] h-14 bg-[#232323] rounded-l-[2px]" />
        {/* Power button */}
        <div className="absolute -right-[3px] top-[136px] w-[3px] h-20 bg-[#232323] rounded-r-[2px]" />

        {/* Phone body */}
        <div
          className="w-[390px] h-[844px] rounded-[44px] overflow-hidden flex flex-col"
          style={{
            background: "#111",
            boxShadow:
              "0 0 0 1px #2a2a2a, 0 0 0 3px #111, 0 40px 120px rgba(0,0,0,0.8), inset 0 0 0 1px #3a3a3a",
          }}
        >
          {/* Screen glass */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#F1F5F9] m-[2px] rounded-[42px] overflow-hidden relative">
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[118px] h-[34px] bg-black rounded-full z-50 flex items-center justify-center gap-2.5">
              <div className="w-[9px] h-[9px] bg-[#1c1c1c] rounded-full border border-[#2e2e2e]" />
              <div className="w-[3px] h-[3px] bg-[#222] rounded-full" />
            </div>

            {/* Status bar */}
            <StatusBar />

            {/* Main content */}
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={screenKey(screen)}
                  custom={dir}
                  variants={{
                    enter: (d: "fwd" | "bck") => SLIDE.enter(d),
                    center: () => SLIDE.center("fwd"),
                    exit: (d: "fwd" | "bck") => SLIDE.exit(d),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0"
                >
                  {renderScreen()}
                </motion.div>
              </AnimatePresence>

              {/* Add category modal — layered above screens */}
              <AnimatePresence>
                {showAddCat && (
                  <AddCategoryModal
                    onClose={() => setShowAddCat(false)}
                    onAdd={name => {
                      setCategories(prev => [
                        ...prev,
                        { id: Date.now(), name, deviceCount: 0 },
                      ]);
                      setShowAddCat(false);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Bottom nav */}
            {showNav && <BottomNav tab={tab} onChange={changeTab} />}

            {/* Home indicator */}
            <div className="h-8 flex items-center justify-center flex-shrink-0 bg-white">
              <div className="w-28 h-[4px] bg-[#1A2332]/15 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
