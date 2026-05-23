#!/bin/bash
# 首次部署脚本 - 在 ECS 服务器上运行
# 用法: chmod +x setup.sh && sudo ./setup.sh

set -e
echo "=== 企业内部移动助手 - ECS 初始化部署 ==="

# 1. 安装系统依赖
echo ">>> 安装系统依赖..."
apt update -qq
apt install -y python3 python3-pip python3-venv git nginx -qq

# 2. 克隆仓库
APP_DIR="/opt/corp-assistant"
if [ ! -d "$APP_DIR" ]; then
    echo ">>> 克隆仓库..."
    git clone https://github.com/GaoZhongShang/girl.git "$APP_DIR"
else
    echo ">>> 仓库已存在，跳过克隆"
fi

cd "$APP_DIR/backend"

# 3. 创建虚拟环境并安装依赖
echo ">>> 安装 Python 依赖..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet

# 4. 初始化数据库
echo ">>> 初始化数据库..."
python init_db.py

# 5. 安装 systemd 服务
echo ">>> 安装 systemd 服务..."
cp "$APP_DIR/backend/deploy/corp-assistant.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable corp-assistant
systemctl start corp-assistant

# 6. 检查状态
echo ">>> 检查服务状态..."
systemctl status corp-assistant --no-pager || true

echo ""
echo "=== 部署完成 ==="
echo "后端地址: http://$(hostname -I | awk '{print $1}'):5000"
echo "服务管理: systemctl {start|stop|restart|status} corp-assistant"
echo "查看日志: journalctl -u corp-assistant -f"
