#!/usr/bin/env python3
"""
企业内部移动助手 - 后端服务启动脚本
"""
import os
import sys
from app import app

def main():
    print("启动企业内部移动助手后端服务...")
    print("=" * 50)

    # 检查环境变量
    required_env_vars = ['SECRET_KEY', 'JWT_SECRET']
    for var in required_env_vars:
        if not os.environ.get(var):
            print(f"警告: {var} 未设置，将使用默认值")

    # 检查数据库配置
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("警告: DATABASE_URL 未设置，使用默认配置")
        print("建议设置: mysql+pymysql://user:password@localhost/corp_assistant")

    print("=" * 50)
    print("API端点:")
    print("  POST   /api/auth/login           - 管理员登录")
    print("  GET    /api/users                - 获取员工列表")
    print("  POST   /api/users                - 创建员工")
    print("  GET    /api/users/<id>          - 获取员工详情")
    print("  PUT    /api/users/<id>          - 更新员工")
    print("  DELETE /api/users/<id>          - 删除员工")
    print("  GET    /api/categories          - 获取分类列表")
    print("  POST   /api/categories          - 创建分类")
    print("  GET    /api/categories/<id>     - 获取分类详情")
    print("  PUT    /api/categories/<id>     - 更新分类")
    print("  DELETE /api/categories/<id>     - 删除分类")
    print("  GET    /api/devices              - 获取设备列表")
    print("  POST   /api/devices              - 创建设备")
    print("  GET    /api/devices/<id>        - 获取设备详情")
    print("  PUT    /api/devices/<id>        - 更新设备")
    print("  DELETE /api/devices/<id>        - 删除设备")
    print("=" * 50)

    try:
        debug_mode = os.environ.get('FLASK_ENV') == 'development'
        app.run(debug=debug_mode, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n服务已停止")
        sys.exit(0)
    except Exception as e:
        print(f"启动失败: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()