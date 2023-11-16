from services.user_service import UserService
from schemas.requests.auth import AuthRegisterRequest
from schemas.exceptions.base import ConflictException
from core.settings import settings
from core.logger import get_configured_logger
import asyncio


async def populate_first_user():
    logger = get_configured_logger('populate-first-user')
    user_service = UserService()

    request = AuthRegisterRequest(
        email=settings.ADMIN_USER_EMAIL,
        password=settings.ADMIN_USER_PASSWORD,
    )

    try:
        await user_service.create_user(
            email=request.email,
            password=request.password
        )
        logger.info('Admin user created successfully')
    except ConflictException:
        logger.info('Admin user already exists, skipping...')
    except Exception as e:
        logger.exception(e)
        raise e

if __name__ == '__main__':
    asyncio.run(populate_first_user())