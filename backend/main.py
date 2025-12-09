from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func  
from models.database import get_db, Anime
from typing import List
from datetime import date

app = FastAPI(
    title="Anime Database API",
    description="API for anime database with analytics and recommendations",
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
            "search": "/api/search?q=keyword",
            "analytics_overview": "/api/analytics/overview",
            "analytics_trending": "/api/analytics/trending",
            "health": "/health"
        }
    }

@app.get("/api/anime")
def get_anime_list(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get the list of anime"""
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

@app.get("/api/search")
def search_anime(
    q: str,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Search for anime"""
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


# =============================================================================
# Analytics API - Phase 1: Overview
# =============================================================================
def get_current_season():
    month = date.today().month
    if 3 <= month <= 5:
        return "spring"
    elif 6 <= month <= 8:
        return "summer"
    elif 9 <= month <= 11:
        return "autumn"
    else: # 12, 1, 2
        return "winter"

@app.get("/api/analytics/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    """Analytics Overview API - Market overview for investors/executives"""
    
    current_year = date.today().year
    current_season = get_current_season()
    
    total_anime = db.query(Anime).count()
    
    last_3_years = [current_year, current_year - 1, current_year - 2]
    
    recent_avg_score = db.query(func.avg(Anime.score)).filter(
        Anime.year.in_(last_3_years),
        Anime.score != None
    ).scalar()
    recent_avg_score = round(float(recent_avg_score), 2) if recent_avg_score else 0
    
    recent_anime_count = db.query(Anime).filter(
        Anime.year.in_(last_3_years)
    ).count()
    
    yearly_breakdown = []
    for year in sorted(last_3_years, reverse=True):
        year_count = db.query(Anime).filter(Anime.year == year).count()
        year_avg_score = db.query(func.avg(Anime.score)).filter(
            Anime.year == year,
            Anime.score != None
        ).scalar()
        
        yearly_breakdown.append({
            "year": year,
            "count": year_count,
            "average_score": round(float(year_avg_score), 2) if year_avg_score else 0
        })
    
    current_season_count = db.query(Anime).filter(
        Anime.year == current_year,
        Anime.season == current_season
    ).count()
    
    top_10_anime = db.query(Anime).filter(
        Anime.score != None
    ).order_by(
        Anime.score.desc()
    ).limit(10).all()
    
    top_10_list = []
    for anime in top_10_anime:
        top_10_list.append({
            "rank": len(top_10_list) + 1,
            "title": anime.title,
            "title_english": anime.title_english,
            "score": anime.score,
            "year": anime.year,
            "type": anime.type,
            "members": anime.members,
            "image_url": anime.image_url
        })
    
    high_score_all_time = db.query(Anime).filter(Anime.score >= 8.0).count()
    high_score_recent = db.query(Anime).filter(
        Anime.score >= 8.0,
        Anime.year.in_(last_3_years)
    ).count()
    
    type_distribution = db.query(
        Anime.type, 
        func.count(Anime.id)
    ).filter(
        Anime.year.in_(last_3_years)
    ).group_by(Anime.type).all()
    
    type_stats = {anime_type: count for anime_type, count in type_distribution}
    
    return {
        "success": True,
        "data": {
            "total_anime": total_anime,
            "total_anime_last_3_years": recent_anime_count,
            "current_season": {
                "year": current_year,
                "season": current_season,
                "count": current_season_count
            },
            "last_3_years": {
                "years": last_3_years,
                "average_score": recent_avg_score,
                "total_count": recent_anime_count,
                "yearly_breakdown": yearly_breakdown
            },
            "top_10_anime": top_10_list,
            "high_score_anime": {
                "threshold": 8.0,
                "all_time": {
                    "count": high_score_all_time,
                    "percentage": round(high_score_all_time / total_anime * 100, 2) if total_anime > 0 else 0
                },
                "last_3_years": {
                    "count": high_score_recent,
                    "percentage": round(high_score_recent / recent_anime_count * 100, 2) if recent_anime_count > 0 else 0
                }
            },
            "type_distribution_recent": type_stats
        },
        "message": "Overview statistics retrieved successfully"
    }


# =============================================================================
# Analytics API - Phase 2: Trending Analysis
# =============================================================================

def calculate_merchandising_score(anime, current_year=2025):
    """Calculate merchandising potential score with time decay"""
    quality_score = (anime.score or 0) / 10
    reach_score = min((anime.members or 0) / 5000000, 1.0)
    loyalty_score = min((anime.favorites or 0) / 300000, 1.0)
    
    years_since = current_year - (anime.year or current_year)
    if years_since <= 2:
        recency_score = 1.0
    elif years_since <= 5:
        recency_score = 0.8
    elif years_since <= 10:
        recency_score = 0.5
    else:
        recency_score = 0.3
    
    final_score = (
        quality_score * 0.3 +
        reach_score * 0.4 +
        loyalty_score * 0.2 +
        recency_score * 0.1
    ) * 10
    
    return round(final_score, 2)


@app.get("/api/analytics/trending")
def get_trending_analysis(
    year: int = 2026,
    db: Session = Depends(get_db)
):
    """Trending Analysis API - Identify hot titles and classic IPs"""
    
    current_year = date.today().year
    
    # Most Anticipated (by members)
    most_anticipated = db.query(Anime).filter(
        Anime.year == year,
        Anime.members != None
    ).order_by(
        Anime.members.desc()
    ).limit(20).all()
    
    anticipated_list = []
    for idx, anime in enumerate(most_anticipated, 1):
        anticipated_list.append({
            "rank": idx,
            "title": anime.title,
            "title_english": anime.title_english,
            "year": anime.year,
            "season": anime.season,
            "type": anime.type,
            "members": anime.members,
            "score": anime.score,
            "genres": [g.name for g in anime.genres],
            "studios": [s.name for s in anime.studios],
            "image_url": anime.image_url
        })
    
    # Most Favorited (all time)
    most_favorited = db.query(Anime).filter(
        Anime.favorites != None
    ).order_by(
        Anime.favorites.desc()
    ).limit(20).all()
    
    favorited_list = []
    for idx, anime in enumerate(most_favorited, 1):
        favorited_list.append({
            "rank": idx,
            "title": anime.title,
            "title_english": anime.title_english,
            "year": anime.year,
            "type": anime.type,
            "members": anime.members,
            "favorites": anime.favorites,
            "score": anime.score,
            "genres": [g.name for g in anime.genres],
            "image_url": anime.image_url
        })
    
    # Classic IPs (last 20 years)
    last_20_years = list(range(current_year - 19, current_year + 1))
    
    classic_ips = db.query(Anime).filter(
        Anime.year.in_(last_20_years),
        Anime.score >= 8.0,
        Anime.members >= 100000,
        Anime.type == 'TV'
    ).order_by(
        Anime.members.desc()
    ).limit(20).all()
    
    classics_list = []
    for idx, anime in enumerate(classic_ips, 1):
        years_since = current_year - (anime.year or current_year)
        recency = 1.0 if years_since <= 2 else (0.8 if years_since <= 5 else 0.5)
        
        classics_list.append({
            "rank": idx,
            "title": anime.title,
            "title_english": anime.title_english,
            "year": anime.year,
            "type": anime.type,
            "score": anime.score,
            "members": anime.members,
            "favorites": anime.favorites,
            "genres": [g.name for g in anime.genres],
            "studios": [s.name for s in anime.studios],
            "image_url": anime.image_url,
            "merchandising_score": calculate_merchandising_score(anime, current_year),
            "score_breakdown": {
                "quality": round((anime.score or 0) / 10, 2),
                "reach": round(min((anime.members or 0) / 5000000, 1.0), 2),
                "loyalty": round(min((anime.favorites or 0) / 300000, 1.0), 2),
                "recency": recency
            }
        })
    
    # Season Breakdown
    seasons = ["winter", "spring", "summer", "fall"]
    season_breakdown = []
    
    for season in seasons:
        season_count = db.query(Anime).filter(
            Anime.year == year,
            Anime.season == season
        ).count()
        
        top_season_anime = db.query(Anime).filter(
            Anime.year == year,
            Anime.season == season,
            Anime.members != None
        ).order_by(
            Anime.members.desc()
        ).limit(5).all()
        
        season_top_list = []
        for anime in top_season_anime:
            season_top_list.append({
                "title": anime.title,
                "title_english": anime.title_english,
                "members": anime.members,
                "image_url": anime.image_url
            })
        
        season_breakdown.append({
            "season": season,
            "year": year,
            "total_count": season_count,
            "top_5": season_top_list
        })
    
    # Summary
    total_upcoming = db.query(Anime).filter(Anime.year == year).count()
    avg_members_upcoming = db.query(func.avg(Anime.members)).filter(
        Anime.year == year,
        Anime.members != None
    ).scalar()
    avg_members_upcoming = int(avg_members_upcoming) if avg_members_upcoming else 0
    
    return {
        "success": True,
        "data": {
            "target_year": year,
            "summary": {
                "total_upcoming_anime": total_upcoming,
                "average_members": avg_members_upcoming
            },
            "most_anticipated": {
                "description": f"Top 20 most anticipated anime in {year}",
                "business_value": "High members = strong pre-release interest",
                "data": anticipated_list
            },
            "most_favorited": {
                "description": "Top 20 most favorited anime of all time",
                "business_value": "Strong fanbase = merchandising potential",
                "data": favorited_list
            },
            "classic_ips": {
                "description": "Classic IPs from last 20 years",
                "business_value": "Proven success for sequels/merchandise",
                "criteria": {
                    "years": f"{current_year - 19}-{current_year}",
                    "min_score": 8.0,
                    "min_members": 100000,
                    "type": "TV"
                },
                "data": classics_list
            },
            "season_breakdown": {
                "description": f"Breakdown of {year} anime by season",
                "data": season_breakdown
            }
        },
        "message": "Trending analysis retrieved successfully"
    }