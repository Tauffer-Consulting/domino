def conditional_endpoint(enabled=True):
    def decorator(func):
        if enabled:
            return func
        def disabled():
            return {"message": "This endpoint is disabled."}
        return disabled
    return decorator