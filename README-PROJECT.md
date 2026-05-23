# 企业内部移动助手 - 设计原型

这是一个基于React的企业内部移动助手设计原型，实现了用户管理、JWT认证、设备分类管理等功能。

## 项目结构

```
projects/111/
├── src/                    # React前端代码
│   ├── app/               # 主要应用组件
│   ├── api/               # API客户端
│   ├── hooks/             # 自定义React Hooks
│   └── styles/            # 样式文件
├── backend/               # Flask后端API服务
│   ├── app.py             # 主应用文件
│   ├── models.py          # 数据库模型
│   ├── resources.py       # API资源
│   ├── utils.py           # 工具函数
│   └── requirements.txt   # Python依赖
└── README.md             # 项目说明
```

## 功能模块

### 1. 用户管理模块
- 员工信息的CRUD操作
- 数据校验（姓名、年龄、邮箱格式）
- 搜索和分页功能

### 2. JWT身份验证
- 管理员登录认证
- JWT令牌管理
- 自动令牌刷新

### 3. 设备分类与设备管理
- 分类管理（增删改查）
- 设备管理（增删改查）
- 分类与设备的关联查询

### 4. API日志展示
- 全局请求日志记录
- 状态码过滤
- 响应时间统计

## 技术栈

### 前端
- React 18
- TypeScript
- Tailwind CSS
- Motion (动画)
- Lucide React (图标)

### 后端
- Flask
- SQLAlchemy
- Flask-JWT-Extended
- bcrypt
- MySQL

## 快速开始

### 1. 启动后端服务

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 初始化数据库
python init_db.py

# 启动服务
python run.py
```

后端服务将在 http://localhost:5000 启动。

### 2. 启动前端应用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将在 http://localhost:5173 启动。

## 默认账号

- **管理员用户名**: admin
- **管理员密码**: admin123

## API接口

### 认证接口
- `POST /api/auth/login` - 管理员登录

### 员工管理
- `GET /api/users` - 获取员工列表
- `POST /api/users` - 创建员工
- `GET /api/users/{id}` - 获取员工详情
- `PUT /api/users/{id}` - 更新员工
- `DELETE /api/users/{id}` - 删除员工

### 分类管理
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `GET /api/categories/{id}` - 获取分类详情
- `PUT /api/categories/{id}` - 更新分类
- `DELETE /api/categories/{id}` - 删除分类

### 设备管理
- `GET /api/devices` - 获取设备列表
- `POST /api/devices` - 创建设备
- `GET /api/devices/{id}` - 获取设备详情
- `PUT /api/devices/{id}` - 更新设备
- `DELETE /api/devices/{id}` - 删除设备

## 特色功能

1. **响应式设计**: 模拟手机端界面，包含状态栏、导航栏等
2. **动画效果**: 使用Motion实现流畅的页面切换动画
3. **实时验证**: 表单输入时实时验证数据格式
4. **错误处理**: 统一的错误提示和错误状态处理
5. **加载状态**: 所有异步操作都显示加载动画

## 开发说明

### 数据库初始化

首次运行时需要先创建MySQL数据库：

```sql
CREATE DATABASE corp_assistant CHARACTER SET utf8mb4;
```

然后运行 `python init_db.py` 来创建表结构和初始数据。

### 环境变量

创建 `.env` 文件并配置：

```
REACT_APP_API_URL=http://localhost:5000
```

### 自定义Hooks

项目包含以下自定义Hooks：

- `useAuth`: 管理认证状态
- `useApi`: 处理API请求和状态
- `useEmployees`: 员工数据管理
- `useCategories`: 分类数据管理
- `useDevices`: 设备数据管理

## 注意事项

1. 确保MySQL服务已启动
2. 后端服务启动后再启动前端
3. 所有API请求都会自动添加JWT令牌
4. 401错误会自动跳转到登录页

## 扩展功能

项目已预留以下扩展点：

- 单元测试
- Docker容器化
- API文档自动生成
- 数据可视化
- 主题切换
- 国际化支持