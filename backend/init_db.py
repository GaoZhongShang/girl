from app import app, db
from models import Employee, Category, Device, Admin
import sys

def init_database():
    """初始化数据库"""
    with app.app_context():
        # 创建所有表
        db.create_all()

        # 创建默认管理员账号
        admin = Admin.query.filter_by(username='admin').first()
        if not admin:
            admin = Admin(username='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            print("已创建管理员账号: admin / admin123")

        # 创建初始员工数据
        if Employee.query.count() == 0:
            employees = [
                Employee(name='张伟', age=32, email='zhang.wei@corp.com', dept='人事部'),
                Employee(name='李娜', age=28, email='li.na@corp.com', dept='技术部'),
                Employee(name='王芳', age=35, email='wang.fang@corp.com', dept='财务部'),
                Employee(name='刘洋', age=29, email='liu.yang@corp.com', dept='技术部'),
                Employee(name='陈静', age=31, email='chen.jing@corp.com', dept='行政部'),
            ]
            for emp in employees:
                db.session.add(emp)

        # 创建初始分类数据
        if Category.query.count() == 0:
            categories = [
                Category(name='IT设备'),
                Category(name='办公耗材'),
                Category(name='网络设备'),
            ]
            for cat in categories:
                db.session.add(cat)

        # 创建初始设备数据
        if Device.query.count() == 0:
            devices = [
                Device(name='联想 ThinkPad E14', model='Type-20RA', category_id=1),
                Device(name='戴尔 U2421E 显示器', model='U2421E-BLK', category_id=1),
                Device(name='惠普 M1136 MFP', model='CE847A', category_id=2),
                Device(name='佳能 LBP6030', model='8468B001', category_id=2),
                Device(name='Cisco SG220-26', model='SG220-26-K9', category_id=3),
                Device(name='华为 AR2240 路由器', model='AR2240-AC', category_id=3),
            ]
            for dev in devices:
                db.session.add(dev)

        db.session.commit()
        print("数据库初始化完成！")

if __name__ == '__main__':
    init_database()