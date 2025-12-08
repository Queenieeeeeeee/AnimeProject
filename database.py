from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, Table, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

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
    
    # Association
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

# Create Database
engine = create_engine('sqlite:///anime.db')
Base.metadata.create_all(engine)

print("Database has been created successfuly!")