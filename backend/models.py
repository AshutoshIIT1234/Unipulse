from sqlalchemy import Column, String, Float, Integer, DateTime
from database import Base
from datetime import datetime

class Post(Base):
    __tablename__ = "posts"

    id        = Column(String, primary_key=True)  # Reddit post ID
    iit       = Column(String, index=True)
    title     = Column(String)
    body      = Column(String)
    category  = Column(String)
    compound  = Column(Float)
    label     = Column(String)
    score     = Column(Integer)
    comments  = Column(Integer)
    subreddit = Column(String)
    scraped_at = Column(DateTime, default=datetime.utcnow)