from fastapi import FastAPI
from .database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from .routers import authentication,users,diagnosis

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MeroCare",
              version="1.0.0")

#CORS Configuration
origins=["http://localhost",
          "http://localhost:8000",
          "http://10.0.2.2:8000",
          "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(authentication.router,tags=["Authentication"])
app.include_router(users.router,prefix="/users",tags=["Users"])
app.include_router(diagnosis.router,prefix="/diagnosis",tags=["Diagnosis"])



@app.get("/")
def read_root():
    return {"Connected Successfully"}