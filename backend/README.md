# 企业内部移动助手 - 后端服务

基于 Flask + SQLAlchemy + MySQL 的后端API服务，实现了用户管理、JWT认证、设备分类管理等功能。

## 技术栈

- **后端框架**: Flask 2.3.3
- **RESTful扩展**: Flask-RESTful
- **数据库ORM**: SQLAlchemy
- **数据库**: MySQL 8.0+
- **JWT认证**: Flask-JWT-Extended
- **密码加密**: bcrypt
- **跨域支持**: Flask-CORS

## 功能模块

### 1. 用户管理模块
- 员工信息的CRUD操作
- 数据校验（姓名、年龄、邮箱格式）
- 分页查询支持

### 2. JWT身份验证
- 管理员登录认证
- JWT令牌生成与验证
- 接口访问权限控制

### 3. 设备分类与设备管理
- 分类管理（增删改查）
- 设备管理（增删改查）
- 分类与设备的关联查询
- 外键约束确保数据完整性

### 4. API日志中间件
- 全局请求日志记录
- 记录请求方法、路径、IP、响应状态码、耗时
- 同时输出到控制台和文件

### 5. 统一接口响应格式
- 标准JSON响应结构
- 全局异常处理
- 错误码规范化

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env` 文件并根据需要修改配置：

```env
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
DATABASE_URL=mysql+pymysql://user:password@localhost/corp_assistant
```

### 3. 初始化数据库

```bash
# 首次运行前需要创建MySQL数据库
mysql -u root -p < schema.sql

# 初始化表数据和默认管理员账号
python init_db.py
```

### 4. 启动服务

```bash
python run.py
```

服务将在 `http://localhost:5000` 启动。

### 5. 测试API

使用Postman或curl测试API：

```bash
# 管理员登录
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# 获取员工列表（需要JWT令牌）
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## API文档

### 认证接口

- `POST /api/auth/login` - 管理员登录

### 员工管理接口

- `GET /api/users` - 获取员工列表（支持分页）
- `POST /api/users` - 创建员工
- `GET /api/users/<id>` - 获取员工详情
- `PUT /api/users/<id>` - 更新员工
- `DELETE /api/users/<id>` - 删除员工

### 分类管理接口

- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `GET /api/categories/<id>` - 获取分类详情（包含该分类下的设备）
- `PUT /api/categories/<id>` - 更新分类
- `DELETE /api/categories/<id>` - 删除分类

### 设备管理接口

- `GET /api/devices` - 获取设备列表（支持按分类筛选）
- `POST /api/devices` - 创建设备
- `GET /api/devices/<id>` - 获取设备详情
- `PUT /api/devices/<id>` - 更新设备
- `DELETE /api/devices/<id>` - 删除设备

## 默认数据

初始化后会创建以下测试数据：

- **管理员账号**: admin / admin123
- **员工数据**: 5名测试员工
- **分类数据**: IT设备、办公耗材、网络设备
- **设备数据**: 6台测试设备

## 日志功能

所有API请求都会被记录，包含以下信息：
- 请求时间
- 请求方法
- 请求路径
- 客户端IP
- 响应状态码
- 响应耗时

日志文件位置：`backend/app.log`

## 错误处理

系统采用统一的错误响应格式：

```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

常见错误码：
- 400: 参数校验失败
- 401: 未授权访问
- 403: 权限不足
- 404: 资源不存在
- 409: 业务冲突
- 500: 系统异常