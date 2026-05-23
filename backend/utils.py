import time
import logging
from datetime import datetime
from functools import wraps
from flask import request, jsonify
from werkzeug.exceptions import HTTPException

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class LoggingMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        # 记录请求开始时间
        start_time = time.time()

        # 获取请求信息
        request_method = environ.get('REQUEST_METHOD', 'GET')
        request_path = environ.get('PATH_INFO', '/')
        request_ip = environ.get('REMOTE_ADDR', '127.0.0.1')

        logger.info(f"请求开始 - {request_method} {request_path} - IP: {request_ip}")

        def custom_start_response(status, response_headers, exc_info=None):
            # 计算响应耗时
            duration = int((time.time() - start_time) * 1000)

            # 记录响应信息
            logger.info(f"响应完成 - {status} - 耗时: {duration}ms")

            return start_response(status, response_headers, exc_info)

        return self.app(environ, custom_start_response)

class UnifiedResponse:
    """统一响应格式"""
    @staticmethod
    def success(data=None, code=200, message='成功'):
        return {
            'code': code,
            'message': message,
            'data': data
        }, code

    @staticmethod
    def error(code=400, message='参数校验失败'):
        return {
            'code': code,
            'message': message,
            'data': None
        }, code

def handle_exception(e):
    """全局异常处理"""
    if isinstance(e, HTTPException):
        # 处理HTTP异常
        error_code = e.code
        error_message = e.description
    else:
        # 处理其他异常
        error_code = 500
        error_message = "系统异常，请稍后重试"
        logger.error(f"未处理的异常: {str(e)}", exc_info=True)

    # 根据异常类型返回相应的状态码和错误信息
    error_mapping = {
        400: ("参数校验失败", 400),
        401: ("未授权访问，请先登录", 401),
        403: ("权限不足，无法执行此操作", 403),
        404: ("资源不存在", 404),
        409: ("业务冲突", 409),
        500: ("系统异常，请稍后重试", 500)
    }

    if error_code in error_mapping:
        message, status = error_mapping[error_code]
        return UnifiedResponse.error(error_code, message)
    else:
        return UnifiedResponse.error(error_code, error_message)