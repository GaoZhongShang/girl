from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('JWT_SECRET', 'dev-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///corp_assistant.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_recycle': 3600,
    'pool_pre_ping': True
}

# 初始化扩展
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app)

# 导入模型和资源
from models import Employee, Category, Device
from resources import EmployeeResource, EmployeeListResource, CategoryResource, CategoryListResource, DeviceResource, DeviceListResource, LoginResource
from utils import LoggingMiddleware, UnifiedResponse, handle_exception

# 注册中间件
app.wsgi_app = LoggingMiddleware(app.wsgi_app)

# API路由
api = Api(app)
api.add_resource(EmployeeListResource, '/api/users')
api.add_resource(EmployeeResource, '/api/users/<int:user_id>')
api.add_resource(CategoryListResource, '/api/categories')
api.add_resource(CategoryResource, '/api/categories/<int:category_id>')
api.add_resource(DeviceListResource, '/api/devices')
api.add_resource(DeviceResource, '/api/devices/<int:device_id>')
api.add_resource(LoginResource, '/api/auth/login')

# 全局异常处理
@app.errorhandler(Exception)
def handle_all_exceptions(e):
    return handle_exception(e)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)