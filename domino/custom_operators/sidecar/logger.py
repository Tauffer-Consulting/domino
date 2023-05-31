import logging

LOG_LEVEL = logging.INFO
LOG_FORMAT = '%(asctime)-15s.%(msecs)d %(levelname)-5s --- [%(threadName)15s]' \
             ' %(name)-15s : %(lineno)d : %(message)s'
LOG_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT,
                    datefmt=LOG_DATE_FORMAT)
BASE_LOGGER_NAME = 'domino-storage-sidecar'


def override_basic_config():
    logger = logging.getLogger(BASE_LOGGER_NAME)
    if logger.handlers:
        for handler in logger.handlers:
            logger.removeHandler(handler)
    logger.setLevel(LOG_LEVEL)
    logger_handler = logging.StreamHandler()
    logger.addHandler(logger_handler)
    logger_handler.setFormatter(logging.Formatter(LOG_FORMAT, LOG_DATE_FORMAT))
    logger.propagate = False


override_basic_config()


def get_configured_logger(name: str) -> logging.Logger:
    return logging.getLogger(f'{BASE_LOGGER_NAME}.{name}')