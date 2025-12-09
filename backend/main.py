from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from models.database import get_db, Anime
from typing import List

app = FastAPI(
    title="Anime Database API",
    description="API for anime database with analytics and recommendations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # 允許所有網址呼叫（開發用）
    allow_credentials=True,   # 允許帶 cookies
    allow_methods=["*"],      # 允許所有 HTTP methods (GET, POST...)
    allow_headers=["*"],      # 允許所有 headers
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
            "search": "/api/search?q=keyword",
            "health": "/health"
        }
    }

@app.get("/api/anime")
def get_anime_list(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    取得動漫列表
    - limit: 每頁顯示幾筆（預設 10）
    - offset: 從第幾筆開始（預設 0）
    """
    animes = db.query(Anime).offset(offset).limit(limit).all()
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

# 取得單一動漫詳細資訊
@app.get("/api/anime/{anime_id}")
def get_anime_by_id(
    anime_id: int,
    db: Session = Depends(get_db)
):
    """
    取得單一動漫的詳細資訊
    - anime_id: 動漫的 ID
    """
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

# 搜尋動漫
@app.get("/api/search")
def search_anime(
    q: str,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    搜尋動漫
    - q: 搜尋關鍵字（必填）
    - limit: 每頁顯示幾筆（預設 10）
    - offset: 從第幾筆開始（預設 0）
    """
    if not q or q.strip() == "":
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    
    search_pattern = f"%{q}%"
    
    query = db.query(Anime).filter(
        (Anime.title.ilike(search_pattern)) | 
        (Anime.title_english.ilike(search_pattern))
    )
    
    total = query.count()
    animes = query.offset(offset).limit(limit).all()
    
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
        "query": q,
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": result
    }