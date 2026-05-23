from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app import db
from models import Employee, Category, Device, Admin
from utils import UnifiedResponse
import re
from datetime import datetime

class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return UnifiedResponse.error(400, '请填写用户名和密码')

        admin = Admin.query.filter_by(username=username).first()
        if not admin or not admin.check_password(password):
            return UnifiedResponse.error(401, '用户名或密码错误，请重试')

        access_token = create_access_token(identity=admin.id)
        return UnifiedResponse.success({
            'token': access_token,
            'expires_in': 7200  # 2小时
        })

class EmployeeListResource(Resource):
    @jwt_required()
    def get(self):
        try:
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)

            employees = Employee.query.order_by(Employee.created_at.desc()).paginate(
                page=page, per_page=per_page, error_out=False
            )

            return UnifiedResponse.success({
                'employees': [emp.to_dict() for emp in employees.items],
                'total': employees.total,
                'pages': employees.pages,
                'current_page': page
            })
        except Exception as e:
            return UnifiedResponse.error(500, '获取员工列表失败')

    @jwt_required()
    def post(self):
        data = request.get_json()

        # 数据校验
        errors = self._validate_employee_data(data)
        if errors:
            return UnifiedResponse.error(400, f'参数校验失败：{", ".join(errors)}')

        # 检查邮箱是否已存在
        if Employee.query.filter_by(email=data['email']).first():
            return UnifiedResponse.error(400, '邮箱已存在')

        employee = Employee(
            name=data['name'],
            age=data['age'],
            email=data['email'],
            dept=data.get('dept', '技术部')
        )

        db.session.add(employee)
        db.session.commit()

        return UnifiedResponse.success(employee.to_dict(), 201)

    def _validate_employee_data(self, data):
        errors = []

        if not data.get('name'):
            errors.append('姓名不能为空')
        elif len(data['name']) > 20:
            errors.append('姓名不超过20字符')

        age = data.get('age')
        if not age:
            errors.append('年龄不能为空')
        elif not isinstance(age, int) or age < 18 or age > 60:
            errors.append('年龄须在 18-60 之间')

        email = data.get('email')
        if not email:
            errors.append('邮箱不能为空')
        elif not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            errors.append('邮箱格式不正确')

        return errors

class EmployeeResource(Resource):
    @jwt_required()
    def get(self, user_id):
        employee = Employee.query.get(user_id)
        if not employee:
            return UnifiedResponse.error(404, '员工不存在')

        return UnifiedResponse.success(employee.to_dict())

    @jwt_required()
    def put(self, user_id):
        employee = Employee.query.get(user_id)
        if not employee:
            return UnifiedResponse.error(404, '员工不存在')

        data = request.get_json()

        # 数据校验
        errors = self._validate_employee_data(data)
        if errors:
            return UnifiedResponse.error(400, f'参数校验失败：{", ".join(errors)}')

        # 检查邮箱是否已被其他员工使用
        if data['email'] != employee.email and Employee.query.filter_by(email=data['email']).first():
            return UnifiedResponse.error(400, '邮箱已被其他员工使用')

        # 更新数据
        employee.name = data['name']
        employee.age = data['age']
        employee.email = data['email']
        employee.dept = data.get('dept', '技术部')

        db.session.commit()

        return UnifiedResponse.success(employee.to_dict())

    @jwt_required()
    def delete(self, user_id):
        employee = Employee.query.get(user_id)
        if not employee:
            return UnifiedResponse.error(404, '员工不存在')

        db.session.delete(employee)
        db.session.commit()

        return UnifiedResponse.success(None, 200)

class CategoryListResource(Resource):
    @jwt_required()
    def get(self):
        categories = Category.query.all()
        return UnifiedResponse.success([cat.to_dict() for cat in categories])

    @jwt_required()
    def post(self):
        data = request.get_json()

        # 数据校验
        if not data.get('name'):
            return UnifiedResponse.error(400, '分类名称不能为空')
        elif len(data['name']) > 20:
            return UnifiedResponse.error(400, '分类名称不超过20字符')

        # 检查分类是否已存在
        if Category.query.filter_by(name=data['name']).first():
            return UnifiedResponse.error(400, '分类名称已存在')

        category = Category(name=data['name'])
        db.session.add(category)
        db.session.commit()

        return UnifiedResponse.success(category.to_dict(), 201)

class CategoryResource(Resource):
    @jwt_required()
    def get(self, category_id):
        category = Category.query.get(category_id)
        if not category:
            return UnifiedResponse.error(404, '分类不存在')

        # 获取该分类下的所有设备
        devices = Device.query.filter_by(category_id=category_id).all()
        return UnifiedResponse.success({
            'category': category.to_dict(),
            'devices': [device.to_dict() for device in devices]
        })

    @jwt_required()
    def put(self, category_id):
        category = Category.query.get(category_id)
        if not category:
            return UnifiedResponse.error(404, '分类不存在')

        data = request.get_json()

        # 数据校验
        if not data.get('name'):
            return UnifiedResponse.error(400, '分类名称不能为空')
        elif len(data['name']) > 20:
            return UnifiedResponse.error(400, '分类名称不超过20字符')

        # 检查分类名称是否已被使用
        existing = Category.query.filter_by(name=data['name']).first()
        if existing and existing.id != category_id:
            return UnifiedResponse.error(400, '分类名称已存在')

        category.name = data['name']
        db.session.commit()

        return UnifiedResponse.success(category.to_dict())

    @jwt_required()
    def delete(self, category_id):
        category = Category.query.get(category_id)
        if not category:
            return UnifiedResponse.error(404, '分类不存在')

        # 检查该分类下是否有设备
        device_count = Device.query.filter_by(category_id=category_id).count()
        if device_count > 0:
            return UnifiedResponse.error(409, '分类下存在设备，无法删除')

        db.session.delete(category)
        db.session.commit()

        return UnifiedResponse.success(None, 200)

class DeviceListResource(Resource):
    @jwt_required()
    def get(self):
        category_id = request.args.get('category_id', type=int)
        devices = Device.query

        if category_id:
            devices = devices.filter_by(category_id=category_id)

        devices = devices.order_by(Device.created_at.desc()).all()
        return UnifiedResponse.success([device.to_dict() for device in devices])

    @jwt_required()
    def post(self):
        data = request.get_json()

        # 数据校验
        errors = self._validate_device_data(data)
        if errors:
            return UnifiedResponse.error(400, f'参数校验失败：{", ".join(errors)}')

        # 检查分类是否存在
        if not Category.query.get(data['category_id']):
            return UnifiedResponse.error(400, '所选分类不存在')

        device = Device(
            name=data['name'],
            model=data.get('model', ''),
            category_id=data['category_id']
        )

        db.session.add(device)
        db.session.commit()

        return UnifiedResponse.success(device.to_dict(), 201)

    def _validate_device_data(self, data):
        errors = []

        if not data.get('name'):
            errors.append('设备名称不能为空')

        if not data.get('category_id'):
            errors.append('请选择所属分类')
        elif not Category.query.get(data['category_id']):
            errors.append('所选分类不存在')

        return errors

class DeviceResource(Resource):
    @jwt_required()
    def get(self, device_id):
        device = Device.query.get(device_id)
        if not device:
            return UnifiedResponse.error(404, '设备不存在')

        return UnifiedResponse.success(device.to_dict())

    @jwt_required()
    def put(self, device_id):
        device = Device.query.get(device_id)
        if not device:
            return UnifiedResponse.error(404, '设备不存在')

        data = request.get_json()

        # 数据校验
        errors = self._validate_device_data(data)
        if errors:
            return UnifiedResponse.error(400, f'参数校验失败：{", ".join(errors)}')

        # 检查分类是否存在
        if data.get('category_id') and not Category.query.get(data['category_id']):
            return UnifiedResponse.error(400, '所选分类不存在')

        # 更新数据
        device.name = data['name']
        device.model = data.get('model', '')
        if 'category_id' in data:
            device.category_id = data['category_id']

        db.session.commit()

        return UnifiedResponse.success(device.to_dict())

    @jwt_required()
    def delete(self, device_id):
        device = Device.query.get(device_id)
        if not device:
            return UnifiedResponse.error(404, '设备不存在')

        db.session.delete(device)
        db.session.commit()

        return UnifiedResponse.success(None, 200)