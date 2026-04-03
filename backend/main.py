from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, select, or_, and_ 
from models import get_db, Anime, Genre, anime_genres, Studio, anime_studios
from datetime import date
from typing import Optional

app = FastAPI(
    title="Anime Database API",
    description="API for anime database with recommendations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Anime Database API",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "anime": "/api/anime",
            "anime_detail": "/api/anime/{id}",
            "search": "/api/search",
            "discover": "/discover",
            "health": "/health"
        }
    }

# =============================================================================
# Basic CRUD API
# =============================================================================

@app.get("/api/anime/latest")
def get_latest_anime(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    animes = db.query(Anime).filter(
        Anime.aired_from != None,
        Anime.image_url != None
    ).order_by(
        Anime.aired_from.desc()
    ).limit(limit).all()
    
    result = []
    for anime in animes:
        result.append({
            "id": anime.id,
            "mal_id": anime.mal_id,
            "title": anime.title,
            "title_english": anime.title_english,
            "type": anime.type,
            "episodes": anime.episodes,
            "score": anime.score,
            "year": anime.year,
            "season": anime.season,
            "members": anime.members,
            "image_url": anime.image_url
        })
    
    return {
        "success": True,
        "total": len(result),
        "data": result
    }

@app.get("/api/anime")
def get_anime_list(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get the list of anime (sorted by year, newest to oldest)"""
    animes = db.query(Anime).order_by(
        Anime.year.desc(),
        Anime.score.desc()
    ).offset(offset).limit(limit).all()
    total = db.query(Anime).count()
    
    result = []
    for anime in animes:
        result.append({
            "id": anime.id,
            "mal_id": anime.mal_id,
            "title": anime.title,
            "title_english": anime.title_english,
            "type": anime.type,
            "episodes": anime.episodes,
            "score": anime.score,
            "year": anime.year,
            "image_url": anime.image_url
        })
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": result
    }

@app.get("/api/anime/random")
def get_random_anime(db: Session = Depends(get_db)):
    """Get a random anime recommendation"""
    import random
    
    anime_ids = db.query(Anime.id).filter(
        Anime.score >= 7.0,
        Anime.members >= 50000,
        Anime.image_url != None
    ).all()
    
    if not anime_ids:
        raise HTTPException(status_code=404, detail="No anime found")
    
    random_id = random.choice([id[0] for id in anime_ids])
    anime = db.query(Anime).filter(Anime.id == random_id).first()
    
    if not anime:
        raise HTTPException(status_code=404, detail="Anime not found")
    
    genres = [{"id": g.id, "name": g.name} for g in anime.genres]
    studios = [{"id": s.id, "name": s.name} for s in anime.studios]
    
    return {
        "success": True,
        "data": {
            "id": anime.id,
            "mal_id": anime.mal_id,
            "title": anime.title,
            "title_english": anime.title_english,
            "type": anime.type,
            "episodes": anime.episodes,
            "score": anime.score,
            "rank": anime.rank,
            "popularity": anime.popularity,
            "members": anime.members,
            "favorites": anime.favorites,
            "year": anime.year,
            "season": anime.season,
            "image_url": anime.image_url,
            "synopsis": anime.synopsis,
            "aired_from": anime.aired_from,
            "aired_to": anime.aired_to,
            "demographic": anime.demographic,
            "genres": genres,
            "studios": studios
        },
        "message": "Random anime retrieved successfully"
    }

@app.get("/api/anime/mal/{mal_id}")
def get_anime_by_mal_id(
    mal_id: int,
    db: Session = Depends(get_db)
):
    """Get anime by MyAnimeList ID - for Relations feature"""
    anime = db.query(Anime).filter(Anime.mal_id == mal_id).first()
    
    if not anime:
        return None
    
    return {
        "id": anime.id,
        "mal_id": anime.mal_id,
        "title": anime.title,
        "title_english": anime.title_english,
        "type": anime.type,
        "score": anime.score,
        "year": anime.year,
        "image_url": anime.image_url
    }

@app.get("/api/anime/{anime_id}")
def get_anime_by_id(
    anime_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information of a single anime"""
    anime = db.query(Anime).filter(Anime.id == anime_id).first()
    
    if not anime:
        raise HTTPException(status_code=404, detail="Anime not found")
    
    genres = [{"id": g.id, "name": g.name} for g in anime.genres]
    studios = [{"id": s.id, "name": s.name} for s in anime.studios]
    
    return {
        "id": anime.id,
        "mal_id": anime.mal_id,
        "title": anime.title,
        "title_english": anime.title_english,
        "type": anime.type,
        "episodes": anime.episodes,
        "score": anime.score,
        "rank": anime.rank,
        "popularity": anime.popularity,
        "members": anime.members,
        "favorites": anime.favorites,
        "year": anime.year,
        "season": anime.season,
        "image_url": anime.image_url,
        "synopsis": anime.synopsis,
        "aired_from": anime.aired_from,
        "aired_to": anime.aired_to,
        "demographic": anime.demographic,
        "genres": genres,
        "studios": studios
    }

@app.get("/api/genres")
def get_all_genres(db: Session = Depends(get_db)):
    """Get list of all genres for filtering"""
    genres = db.query(Genre).filter(
        Genre.name != "Hentai"
    ).order_by(Genre.name).all()
    
    return {
        "success": True,
        "total": len(genres),
        "data": [{"id": g.id, "name": g.name} for g in genres]
    }

@app.get("/api/years")
def get_all_years(db: Session = Depends(get_db)):
    """Get list of all years that have anime in database"""
    # Get distinct years from database, ordered from newest to oldest
    years = db.query(Anime.year).filter(
        Anime.year != None
    ).distinct().order_by(Anime.year.desc()).all()
    
    # Convert to list of integers
    year_list = [year[0] for year in years if year[0] is not None]
    
    return {
        "success": True,
        "total": len(year_list),
        "data": year_list
    }

@app.get("/api/search")
def search_anime(
    q: Optional[str] = None,
    genres: Optional[str] = None,
    types: Optional[str] = None,
    years: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    sort_by: str = Query(default="score", regex="^(score|members|year|title)$"),
    order: str = Query(default="desc", regex="^(asc|desc)$"),
    limit: int = 24,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Search anime with multiple filters support
    - genres: comma-separated list (e.g., "Action,Comedy,Drama")
    - types: comma-separated list (e.g., "TV,Movie")
    - years: comma-separated list (e.g., "2024,2023,2022")
    """
    
    # 建立基礎 query
    query = db.query(Anime)
    
    # 1. Search by title
    if q:
        query = query.filter(Anime.title.ilike(f"%{q}%"))
    
    # 2. Filter by multiple genres (OR logic) - 使用 JOIN 提升效能
    if genres:
        genre_list = [g.strip() for g in genres.split(',') if g.strip()]
        if genre_list:
            # 使用 JOIN 來過濾 genres
            query = query.join(Anime.genres).filter(
                Genre.name.in_(genre_list)
            ).distinct()  # 加上 distinct() 避免重複
    
    # 3. Filter by multiple types (OR logic)
    if types:
        type_list = [t.strip() for t in types.split(',') if t.strip()]
        if type_list:
            query = query.filter(Anime.type.in_(type_list))
    
    # 4. Filter by multiple years (OR logic)
    if years:
        year_list = [int(y.strip()) for y in years.split(',') if y.strip().isdigit()]
        if year_list:
            query = query.filter(Anime.year.in_(year_list))
    
    # 5. Filter by score range
    if min_score is not None:
        query = query.filter(Anime.score >= min_score)
    if max_score is not None:
        query = query.filter(Anime.score <= max_score)
    
    # 6. Get total count before pagination
    total = query.count()
    
    # 7. Apply sorting
    if sort_by == "score":
        sort_column = Anime.score
    elif sort_by == "members":
        sort_column = Anime.members
    elif sort_by == "year":
        sort_column = Anime.year
    else:  # title
        sort_column = Anime.title
    
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # 8. Apply pagination
    query = query.limit(limit).offset(offset)
    
    # 9. Execute query and format results
    results = query.all()
    
    # 10. Format the response
    formatted_results = []
    for anime in results:
        formatted_results.append({
            "id": anime.id,
            "mal_id": anime.mal_id,
            "title": anime.title,
            "title_english": anime.title_english,
            "type": anime.type,
            "episodes": anime.episodes,
            "score": anime.score,
            "year": anime.year,
            "season": anime.season,
            "members": anime.members,
            "image_url": anime.image_url,
            "synopsis": anime.synopsis,
            "genres": [{"id": g.id, "name": g.name} for g in anime.genres],
            "studios": [{"id": s.id, "name": s.name} for s in anime.studios]
        })
    
    return {
        "success": True,
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": formatted_results
    }

# =============================================================================
# Discover Page Recommendations APIs
# =============================================================================

@app.get("/api/recommendations/classics")
def get_classics_recommendations(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get all-time classic anime (older anime with high scores and popularity)"""
    
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 100")
    
    current_year = date.today().year
    classics_year_threshold = current_year - 5  # Anime from 5+ years ago
    
    # First, get total count with same filters
    total_query = db.query(Anime).filter(
        Anime.year <= classics_year_threshold,
        Anime.score >= 7.5,
        Anime.members >= 100000,
        Anime.year != None
    )
    total = total_query.count()
    
    # Then get paginated results - sorted by score (highest first)
    classics = total_query.order_by(
        Anime.score.desc(),
        Anime.members.desc()
    ).offset(offset).limit(limit).all()
    
    results = []
    for anime in classics:
        results.append({
            "id": anime.id,
            "mal_id": anime.mal_id,
            "title": anime.title,
            "title_english": anime.title_english,
            "type": anime.type,
            "episodes": anime.episodes,
            "score": anime.score,
            "year": anime.year,
            "season": anime.season,
            "members": anime.members,
            "favorites": anime.favorites,
            "image_url": anime.image_url,
            "synopsis": anime.synopsis,
            "genres": [{"id": g.id, "name": g.name} for g in anime.genres],
            "studios": [{"id": s.id, "name": s.name} for s in anime.studios]
        })
    
    return {
        "success": True,
        "category": "classics",
        "criteria": {
            "max_year": classics_year_threshold,
            "min_score": 7.5,
            "min_members": 100000
        },
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": results,
        "message": f"Retrieved {len(results)} classic anime"
    }

@app.get("/api/recommendations/recent-hits")
def get_recent_hits_recommendations(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get recent popular hits (anime from last 3 years with high engagement)"""
    
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 100")
    
    current_year = date.today().year
    min_year = current_year - 3  # Last 3 years
    
    # First, get total count with same filters
    total_query = db.query(Anime).filter(
        Anime.year >= min_year,
        Anime.score >= 7.0,
        Anime.members >= 50000,
        Anime.year != None
    )
    total = total_query.count()

    # Then get paginated results - sorted by score (highest first)
    recent_hits = total_query.order_by(
        Anime.score.desc(),
        Anime.members.desc()
    ).offset(offset).limit(limit).all()
    
    results = []
    for anime in recent_hits:
        results.append({
            "id": anime.id,
            "mal_id": anime.mal_id,
            "title": anime.title,
            "title_english": anime.title_english,
            "type": anime.type,
            "episodes": anime.episodes,
            "score": anime.score,
            "year": anime.year,
            "season": anime.season,
            "members": anime.members,
            "favorites": anime.favorites,
            "image_url": anime.image_url,
            "synopsis": anime.synopsis,
            "genres": [{"id": g.id, "name": g.name} for g in anime.genres],
            "studios": [{"id": s.id, "name": s.name} for s in anime.studios]
        })
    
    return {
        "success": True,
        "category": "recent-hits",
        "criteria": {
            "min_year": min_year,
            "min_score": 7.0,
            "min_members": 50000
        },
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": results,
        "message": f"Retrieved {len(results)} recent hit anime"
    }

@app.get("/api/recommendations/hidden-gems")
def get_hidden_gems_recommendations(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get hidden gem anime - high quality but underrated"""
    
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 100")
    
    # First, get total count with same filters
    total_query = db.query(Anime).filter(
        Anime.score >= 8.0,              # Very high quality (stricter than 7.5)
        Anime.popularity >= 5000,        # Not too popular (rank >= 5000)
        Anime.members >= 10000,          # Has some audience base
        Anime.favorites != None,
        Anime.rank != None               # Exclude unranked anime
    )
    total = total_query.count()
    
    # Then get paginated results - sorted by score (highest first)
    hidden_gems = total_query.order_by(
        Anime.score.desc(),
        Anime.members.desc()
    ).offset(offset).limit(limit).all()
    
    results = []
    for anime in hidden_gems:
        results.append({
            "id": anime.id,
            "mal_id": anime.mal_id,
            "title": anime.title,
            "title_english": anime.title_english,
            "type": anime.type,
            "episodes": anime.episodes,
            "score": anime.score,
            "year": anime.year,
            "season": anime.season,
            "members": anime.members,
            "favorites": anime.favorites,
            "popularity": anime.popularity,  # Include popularity rank for display
            "image_url": anime.image_url,
            "synopsis": anime.synopsis,
            "genres": [{"id": g.id, "name": g.name} for g in anime.genres],
            "studios": [{"id": s.id, "name": s.name} for s in anime.studios]
        })
    
    return {
        "success": True,
        "category": "hidden-gems",
        "criteria": {
            "min_score": 8.0,
            "min_popularity_rank": 5000,
            "min_members": 10000,
            "must_have_rank": True
        },
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": results,
        "message": f"Retrieved {len(results)} hidden gem anime"
    }

@app.get("/api/recommendations/studio/{studio_name}")
def get_studio_recommendations(
    studio_name: str,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get anime by studio"""
    
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 100")
    
    studio = db.query(Studio).filter(
        func.lower(Studio.name) == func.lower(studio_name)
    ).first()
    
    if not studio:
        raise HTTPException(status_code=404, detail=f"Studio '{studio_name}' not found")
    
    # Count total first
    total_query = db.query(Anime).join(
        anime_studios, Anime.id == anime_studios.c.anime_id
    ).filter(
        anime_studios.c.studio_id == studio.id,
        Anime.score >= 6.0
    )
    total = total_query.count()
    
    # Get paginated results
    studio_anime = total_query.order_by(
        Anime.score.desc(),
        Anime.members.desc()
    ).offset(offset).limit(limit).all()
    
    results = []
    for anime in studio_anime:
        results.append({
            "id": anime.id,
            "mal_id": anime.mal_id,
            "title": anime.title,
            "title_english": anime.title_english,
            "type": anime.type,
            "episodes": anime.episodes,
            "score": anime.score,
            "year": anime.year,
            "season": anime.season,
            "members": anime.members,
            "favorites": anime.favorites,
            "image_url": anime.image_url,
            "synopsis": anime.synopsis,
            "genres": [{"id": g.id, "name": g.name} for g in anime.genres],
            "studios": [{"id": s.id, "name": s.name} for s in anime.studios]
        })
    
    return {
        "success": True,
        "category": "studio",
        "studio": studio.name,
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": results,
        "message": f"Retrieved {len(results)} anime from {studio.name}"
    }

@app.get("/api/recommendations/studios/list")
def get_studios_list(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get list of featured studios"""
    
    studios_with_count = db.query(
        Studio.id,
        Studio.name,
        func.count(anime_studios.c.anime_id).label('anime_count')
    ).join(
        anime_studios, Studio.id == anime_studios.c.studio_id
    ).group_by(
        Studio.id, Studio.name
    ).having(
        func.count(anime_studios.c.anime_id) >= 5
    ).order_by(
        func.count(anime_studios.c.anime_id).desc()
    ).limit(limit).all()
    
    results = []
    for studio_id, studio_name, anime_count in studios_with_count:
        results.append({
            "id": studio_id,
            "name": studio_name,
            "anime_count": anime_count
        })
    
    return {
        "success": True,
        "total": len(results),
        "data": results
    }