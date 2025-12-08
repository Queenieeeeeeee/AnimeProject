import requests
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Anime, Genre, Studio, Base
from datetime import datetime

# Connect to database
engine = create_engine('sqlite:///anime.db')
Session = sessionmaker(bind=engine)
session = Session()

BASE_URL = "https://api.jikan.moe/v4"

def save_anime(anime_data):
    """Save an anime into database"""
    
    # Check if it exists
    existing = session.query(Anime).filter_by(mal_id=anime_data['mal_id']).first()
    if existing:
        print(f"Already exists: {anime_data['title']}")
        return
    
    # Parse aired dates
    aired_from = None
    aired_to = None
    if anime_data.get('aired'):
        if anime_data['aired'].get('from'):
            aired_from = datetime.fromisoformat(anime_data['aired']['from'].replace('Z', '+00:00'))
        if anime_data['aired'].get('to'):
            aired_to = datetime.fromisoformat(anime_data['aired']['to'].replace('Z', '+00:00'))
    
    # Create Anime object
    anime = Anime(
        mal_id=anime_data['mal_id'],
        title=anime_data['title'],
        title_english=anime_data.get('title_english'),
        type=anime_data.get('type'),
        episodes=anime_data.get('episodes'),
        score=anime_data.get('score'),
        rank=anime_data.get('rank'),
        popularity=anime_data.get('popularity'),
        members=anime_data.get('members'),
        favorites=anime_data.get('favorites'),
        year=anime_data.get('year'),
        season=anime_data.get('season'),
        image_url=anime_data['images']['jpg']['image_url'],
        synopsis=anime_data.get('synopsis'),
        aired_from=aired_from,
        aired_to=aired_to,
        demographic=anime_data.get('demographics', [{}])[0].get('name') if anime_data.get('demographics') else None
    )
    
    # Handle genres
    for genre_data in anime_data.get('genres', []):
        genre = session.query(Genre).filter_by(mal_id=genre_data['mal_id']).first()
        if not genre:
            genre = Genre(mal_id=genre_data['mal_id'], name=genre_data['name'])
            session.add(genre)
        anime.genres.append(genre)
    
    # Handle studios
    for studio_data in anime_data.get('studios', []):
        studio = session.query(Studio).filter_by(mal_id=studio_data['mal_id']).first()
        if not studio:
            studio = Studio(mal_id=studio_data['mal_id'], name=studio_data['name'])
            session.add(studio)
        anime.studios.append(studio)
    
    session.add(anime)
    session.commit()
    print(f"✅ Saved: {anime_data['title']}")

# Test: fetch and save JoJo
anime_id = 14719
response = requests.get(f"{BASE_URL}/anime/{anime_id}")

if response.status_code == 200:
    anime_data = response.json()['data']
    save_anime(anime_data)
    print("\nTest successful!")
else:
    print(f"Error: {response.status_code}")

session.close()