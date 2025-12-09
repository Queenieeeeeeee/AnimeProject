from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, Table, ForeignKey
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
import os

Base = declarative_base()

# Many to many Association Table: anime ↔ genres
anime_genres = Table(
    'anime_genres',
    Base.metadata,
    Column('anime_id', Integer, ForeignKey('anime.id')),
    Column('genre_id', Integer, ForeignKey('genres.id'))
)

# Many to many Association Table: anime ↔ studios
anime_studios = Table(
    'anime_studios',
    Base.metadata,
    Column('anime_id', Integer, ForeignKey('anime.id')),
    Column('studio_id', Integer, ForeignKey('studios.id'))
)

# Anime Table
class Anime(Base):
    __tablename__ = 'anime'
    
    id = Column(Integer, primary_key=True)
    mal_id = Column(Integer, unique=True)
    title = Column(String)
    title_english = Column(String)
    type = Column(String)
    episodes = Column(Integer)
    score = Column(Float)
    rank = Column(Integer)
    popularity = Column(Integer)
    members = Column(Integer)
    favorites = Column(Integer)
    year = Column(Integer)
    season = Column(String)
    image_url = Column(String)
    synopsis = Column(Text)
    aired_from = Column(DateTime)
    aired_to = Column(DateTime)
    demographic = Column(String)
    
    # Relationships
    genres = relationship('Genre', secondary=anime_genres, back_populates='animes')
    studios = relationship('Studio', secondary=anime_studios, back_populates='animes')

# Genre Table
class Genre(Base):
    __tablename__ = 'genres'
    
    id = Column(Integer, primary_key=True)
    mal_id = Column(Integer, unique=True)
    name = Column(String)
    
    animes = relationship('Anime', secondary=anime_genres, back_populates='genres')

# Studio Table
class Studio(Base):
    __tablename__ = 'studios'
    
    id = Column(Integer, primary_key=True)
    mal_id = Column(Integer, unique=True)
    name = Column(String)
    
    animes = relationship('Anime', secondary=anime_studios, back_populates='studios')

# ========== 以下是新增的部分（FastAPI 需要用到） ==========

# 找到 anime.db 的路徑
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_PATH = os.path.join(BASE_DIR, 'anime.db')

# Create engine（連接資料庫）
engine = create_engine(f'sqlite:///{DATABASE_PATH}')

# Create session factory（建立 session 工廠）
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency function（FastAPI 用來取得 database session）
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()