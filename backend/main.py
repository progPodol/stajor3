from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from router import router as main_router
from src.admins.router import router as admin_router

app = FastAPI()

origins = [
    "https://dubaidolls.site",
    "http://dubaidolls.site",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(admin_router)
app.include_router(main_router)
