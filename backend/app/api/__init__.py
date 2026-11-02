from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.contacts import router as contacts_router
from app.api.sos import router as sos_router
from app.api.location import router as location_router
from app.api.ai_safety import router as ai_router
from app.api.integrity import router as integrity_router
from app.api.admin import router as admin_router
from app.api.notifications import router as notifications_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(contacts_router)
api_router.include_router(sos_router)
api_router.include_router(location_router)
api_router.include_router(ai_router)
api_router.include_router(integrity_router)
api_router.include_router(admin_router)
api_router.include_router(notifications_router)
