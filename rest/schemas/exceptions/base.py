class BaseException(Exception):
    status_code = 500
    message = "Something went wrong"

class BadRequestException(Exception):
    def __init__(self, message: str = None):
        self.status_code = 400
        if not message:
            message = "Bad request"
        self.message = message
        super().__init__(message)

class ResourceNotFoundException(Exception):
    def __init__(self, message: str = None):
        self.status_code = 404
        if not message:
            message = "Resource not found"
        self.message = message
        super().__init__(message)

class ConflictException(Exception):
    def __init__(self, message: str = None):
        self.status_code = 409
        if not message:
            message = "Conflict"
        self.message = message
        super().__init__(message)


class ForbiddenException(Exception):
    def __init__(self, message: str = None):
        self.status_code = 403
        if not message:
            message = "Forbidden"
        self.message = message
        super().__init__(message)

class UnauthorizedException(Exception):
    def __init__(self, message: str = None):
        self.status_code = 401
        if not message:
            message = "Unauthorized"
        self.message = message
        super().__init__(message)

