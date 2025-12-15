from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func  
from models.database import get_db, Anime, Genre, anime_genres, Studio, anime_studios
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

@app.get("/api/anime/latest")
def get_latest_anime(
    limit: int = 12,
    db: Session = Depends(get_db)
):
    """Get the latest anime with score - for homepage featured section"""
    
    # Get anime from recent years, with score, ordered by year (desc) and members (desc)
    animes = db.query(Anime).filter(
        Anime.year >= date.today().year  
    ).order_by(
        Anime.year.desc(),
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
    year: int = date.today().year,
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

# =============================================================================
# Analytics API - Phase 3: Genres Analysis
# =============================================================================
# Add this to your backend/main.py after Phase 2 (Trending Analysis)

def calculate_market_potential_score(
    anime_count: int,
    avg_score: float,
    total_members: int,
    max_count: int,
    max_members: int
) -> float:
    """
    Calculate market potential score for a genre
    
    Formula:
    - Market size (anime_count): 30%
    - Quality (avg_score): 30%
    - Popularity (total_members): 40%
    """
    if max_count == 0 or max_members == 0:
        return 0.0
    
    market_size_score = (anime_count / max_count) * 0.3
    quality_score = (avg_score / 10) * 0.3
    popularity_score = (total_members / max_members) * 0.4
    
    final_score = (market_size_score + quality_score + popularity_score) * 10
    
    return round(final_score, 2)

@app.get("/api/analytics/genres")
def get_genres_analysis(
    sort_by: str = "count",  # count | score | members | market_score
    order: str = "desc",     # asc | desc
    db: Session = Depends(get_db)
):
    """
    Genres Analysis API - Analyze genre popularity and market potential
    
    Query Parameters:
    - sort_by: count (anime count) | score (avg score) | members (total members) | market_score
    - order: asc | desc
    
    Features:
    - Exclude "Hentai" genre
    - Calculate market potential score
    - Show top 5 representative anime per genre
    - Historical trends (anime count by year)
    """
    
    # Validate parameters
    valid_sort_by = ["count", "score", "members", "market_score"]
    valid_order = ["asc", "desc"]
    
    if sort_by not in valid_sort_by:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid sort_by. Must be one of: {', '.join(valid_sort_by)}"
        )
    
    if order not in valid_order:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid order. Must be one of: {', '.join(valid_order)}"
        )
    
    # Get all genres except Hentai
    all_genres = db.query(Genre).filter(Genre.name != "Hentai").all()
    
    genres_data = []
    max_count = 0
    max_members = 0
    
    # First pass: Calculate basic stats and find max values
    for genre in all_genres:
        # Count anime in this genre
        anime_count = db.query(Anime).join(
            anime_genres, Anime.id == anime_genres.c.anime_id
        ).filter(
            anime_genres.c.genre_id == genre.id
        ).count()
        
        if anime_count == 0:
            continue
        
        # Calculate average score
        avg_score = db.query(func.avg(Anime.score)).join(
            anime_genres, Anime.id == anime_genres.c.anime_id
        ).filter(
            anime_genres.c.genre_id == genre.id,
            Anime.score != None
        ).scalar()
        
        avg_score = float(avg_score) if avg_score else 0.0
        
        # Calculate total members
        total_members = db.query(func.sum(Anime.members)).join(
            anime_genres, Anime.id == anime_genres.c.anime_id
        ).filter(
            anime_genres.c.genre_id == genre.id,
            Anime.members != None
        ).scalar()
        
        total_members = int(total_members) if total_members else 0
        
        # Track max values for scoring
        max_count = max(max_count, anime_count)
        max_members = max(max_members, total_members)
        
        genres_data.append({
            "genre": genre,
            "anime_count": anime_count,
            "avg_score": avg_score,
            "total_members": total_members
        })
    
    # Second pass: Calculate market scores and prepare final data
    result_data = []
    total_anime = db.query(Anime).count()
    
    for data in genres_data:
        genre = data["genre"]
        anime_count = data["anime_count"]
        avg_score = data["avg_score"]
        total_members = data["total_members"]
        
        # Calculate market potential score
        market_score = calculate_market_potential_score(
            anime_count=anime_count,
            avg_score=avg_score,
            total_members=total_members,
            max_count=max_count,
            max_members=max_members
        )
        
        # Calculate average members per anime
        avg_members = total_members // anime_count if anime_count > 0 else 0
        
        # Get top 5 representative anime for this genre
        top_5_anime = db.query(Anime).join(
            anime_genres, Anime.id == anime_genres.c.anime_id
        ).filter(
            anime_genres.c.genre_id == genre.id,
            Anime.score != None
        ).order_by(
            Anime.score.desc(),
            Anime.members.desc()
        ).limit(5).all()
        
        top_5_list = []
        for anime in top_5_anime:
            top_5_list.append({
                "id": anime.id,
                "title": anime.title,
                "title_english": anime.title_english,
                "score": anime.score,
                "members": anime.members,
                "year": anime.year,
                "type": anime.type,
                "image_url": anime.image_url
            })
        
        # Get historical trend (last 10 years)
        current_year = date.today().year
        years_range = list(range(current_year - 9, current_year + 1))
        
        yearly_trend = []
        for year in years_range:
            year_count = db.query(Anime).join(
                anime_genres, Anime.id == anime_genres.c.anime_id
            ).filter(
                anime_genres.c.genre_id == genre.id,
                Anime.year == year
            ).count()
            
            yearly_trend.append({
                "year": year,
                "count": year_count
            })
        
        result_data.append({
            "id": genre.id,
            "name": genre.name,
            "anime_count": anime_count,
            "average_score": round(avg_score, 2),
            "total_members": total_members,
            "average_members_per_anime": avg_members,
            "market_potential_score": market_score,
            "percentage_of_total": round(anime_count / total_anime * 100, 2) if total_anime > 0 else 0,
            "top_5_anime": top_5_list,
            "historical_trend": yearly_trend,
            "_sort_values": {
                "count": anime_count,
                "score": avg_score,
                "members": total_members,
                "market_score": market_score
            }
        })
    
    # Sort the results
    sort_key = sort_by if sort_by != "market_score" else "market_score"
    result_data.sort(
        key=lambda x: x["_sort_values"][sort_key],
        reverse=(order == "desc")
    )
    
    # Remove internal sort values before returning
    for item in result_data:
        del item["_sort_values"]
    
    # Calculate summary statistics
    total_genres = len(result_data)
    avg_anime_per_genre = sum(g["anime_count"] for g in result_data) / total_genres if total_genres > 0 else 0
    
    # Find top genre by each metric
    top_by_count = max(result_data, key=lambda x: x["anime_count"])["name"] if result_data else "N/A"
    top_by_score = max(result_data, key=lambda x: x["average_score"])["name"] if result_data else "N/A"
    top_by_members = max(result_data, key=lambda x: x["total_members"])["name"] if result_data else "N/A"
    top_by_market = max(result_data, key=lambda x: x["market_potential_score"])["name"] if result_data else "N/A"
    
    return {
        "success": True,
        "data": {
            "total_genres": total_genres,
            "sort_by": sort_by,
            "order": order,
            "summary": {
                "average_anime_per_genre": round(avg_anime_per_genre, 1),
                "top_genre_by_count": top_by_count,
                "top_genre_by_score": top_by_score,
                "top_genre_by_members": top_by_members,
                "top_genre_by_market_score": top_by_market
            },
            "genres": result_data
        },
        "message": f"Genres analysis retrieved successfully (sorted by {sort_by}, {order})"
    }

# =============================================================================
# Analytics API - Phase 4: Studios Analysis
# =============================================================================

def calculate_workload_score(
    recent_count: int,
    total_count: int,
    avg_per_year: float,
    max_avg_per_year: float,
    type_count: int,
    max_type_count: int
) -> float:
    """
    Calculate workload score for a studio
    
    Formula:
    - Recent activity (recent/total): 30%
    - Production rate (avg per year): 40%
    - Type diversity (多工能力): 30%
    """
    if total_count == 0 or max_avg_per_year == 0 or max_type_count == 0:
        return 0.0
    
    recent_activity = (recent_count / total_count) * 0.3
    production_rate = (avg_per_year / max_avg_per_year) * 0.4
    type_diversity = (type_count / max_type_count) * 0.3
    
    final_score = (recent_activity + production_rate + type_diversity) * 10
    
    return round(final_score, 2)

@app.get("/api/analytics/studios")
def get_studios_analysis(
    years: int = 5,           # 1-20
    sort_by: str = "workload", # workload | count | score | members
    limit: int = 10,           # 10-100
    db: Session = Depends(get_db)
):
    """
    Studios Analysis API - Find the hardest working studios
    
    Query Parameters:
    - years: How many recent years to analyze (1-20, default: 5)
    - sort_by: workload | count | score | members
    - limit: Number of studios to show (10-100, default: 10)
    
    Features:
    - Workload score (辛苦指數)
    - All anime produced in recent years
    - Popularity metrics (members, favorites)
    - Type distribution (TV/Movie/OVA/Special)
    - Yearly output trend
    """
    
    # Validate parameters
    if years < 1 or years > 20:
        raise HTTPException(
            status_code=400,
            detail="years must be between 1 and 20"
        )
    
    valid_sort_by = ["workload", "count", "score", "members"]
    if sort_by not in valid_sort_by:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sort_by. Must be one of: {', '.join(valid_sort_by)}"
        )
    
    if limit < 10 or limit > 100:
        raise HTTPException(
            status_code=400,
            detail="limit must be between 10 and 100"
        )
    
    # Calculate year range
    current_year = date.today().year
    start_year = current_year - years + 1
    end_year = current_year
    years_range = list(range(start_year, end_year + 1))
    
    # Get all studios that have at least 1 anime in recent years
    studios_with_recent_anime = db.query(Studio).join(
        anime_studios, Studio.id == anime_studios.c.studio_id
    ).join(
        Anime, Anime.id == anime_studios.c.anime_id
    ).filter(
        Anime.year.in_(years_range)
    ).distinct().all()
    
    studios_data = []
    max_avg_per_year = 0
    max_type_count = 0
    
    # First pass: Calculate basic stats and find max values
    for studio in studios_with_recent_anime:
        # Total anime count (all time)
        total_count = db.query(Anime).join(
            anime_studios, Anime.id == anime_studios.c.anime_id
        ).filter(
            anime_studios.c.studio_id == studio.id
        ).count()
        
        if total_count == 0:
            continue
        
        # Recent anime count
        recent_count = db.query(Anime).join(
            anime_studios, Anime.id == anime_studios.c.anime_id
        ).filter(
            anime_studios.c.studio_id == studio.id,
            Anime.year.in_(years_range)
        ).count()
        
        if recent_count == 0:
            continue
        
        # Calculate average per year
        avg_per_year = recent_count / years
        max_avg_per_year = max(max_avg_per_year, avg_per_year)
        
        # Type distribution
        type_dist = db.query(
            Anime.type,
            func.count(Anime.id)
        ).join(
            anime_studios, Anime.id == anime_studios.c.anime_id
        ).filter(
            anime_studios.c.studio_id == studio.id,
            Anime.year.in_(years_range)
        ).group_by(Anime.type).all()
        
        type_count = len(type_dist)
        max_type_count = max(max_type_count, type_count)
        
        studios_data.append({
            "studio": studio,
            "total_count": total_count,
            "recent_count": recent_count,
            "avg_per_year": avg_per_year,
            "type_count": type_count
        })
    
    # Second pass: Calculate workload scores and prepare final data
    result_data = []
    
    for data in studios_data:
        studio = data["studio"]
        total_count = data["total_count"]
        recent_count = data["recent_count"]
        avg_per_year = data["avg_per_year"]
        type_count = data["type_count"]
        
        # Calculate workload score
        workload_score = calculate_workload_score(
            recent_count=recent_count,
            total_count=total_count,
            avg_per_year=avg_per_year,
            max_avg_per_year=max_avg_per_year,
            type_count=type_count,
            max_type_count=max_type_count
        )
        
        # Get all anime from this studio in recent years
        recent_anime = db.query(Anime).join(
            anime_studios, Anime.id == anime_studios.c.anime_id
        ).filter(
            anime_studios.c.studio_id == studio.id,
            Anime.year.in_(years_range)
        ).order_by(
            Anime.year.desc(),
            Anime.score.desc().nullslast()
        ).all()
        
        # Calculate average score
        avg_score = db.query(func.avg(Anime.score)).join(
            anime_studios, Anime.id == anime_studios.c.anime_id
        ).filter(
            anime_studios.c.studio_id == studio.id,
            Anime.year.in_(years_range),
            Anime.score != None
        ).scalar()
        
        avg_score = float(avg_score) if avg_score else 0.0
        
        # Calculate popularity metrics
        total_members = db.query(func.sum(Anime.members)).join(
            anime_studios, Anime.id == anime_studios.c.anime_id
        ).filter(
            anime_studios.c.studio_id == studio.id,
            Anime.year.in_(years_range),
            Anime.members != None
        ).scalar()
        
        total_members = int(total_members) if total_members else 0
        
        total_favorites = db.query(func.sum(Anime.favorites)).join(
            anime_studios, Anime.id == anime_studios.c.anime_id
        ).filter(
            anime_studios.c.studio_id == studio.id,
            Anime.year.in_(years_range),
            Anime.favorites != None
        ).scalar()
        
        total_favorites = int(total_favorites) if total_favorites else 0
        
        avg_members = total_members // recent_count if recent_count > 0 else 0
        avg_favorites = total_favorites // recent_count if recent_count > 0 else 0
        
        # Type distribution
        type_distribution = {}
        type_dist_data = db.query(
            Anime.type,
            func.count(Anime.id)
        ).join(
            anime_studios, Anime.id == anime_studios.c.anime_id
        ).filter(
            anime_studios.c.studio_id == studio.id,
            Anime.year.in_(years_range)
        ).group_by(Anime.type).all()
        
        for anime_type, count in type_dist_data:
            type_distribution[anime_type] = count
        
        # Yearly output
        yearly_output = []
        for year in sorted(years_range, reverse=True):
            year_count = db.query(Anime).join(
                anime_studios, Anime.id == anime_studios.c.anime_id
            ).filter(
                anime_studios.c.studio_id == studio.id,
                Anime.year == year
            ).count()
            
            yearly_output.append({
                "year": year,
                "count": year_count
            })
        
        # All anime list with details
        anime_list = []
        for anime in recent_anime:
            anime_list.append({
                "id": anime.id,
                "mal_id": anime.mal_id,
                "title": anime.title,
                "title_english": anime.title_english,
                "score": anime.score,
                "members": anime.members,
                "favorites": anime.favorites,
                "year": anime.year,
                "season": anime.season,
                "type": anime.type,
                "episodes": anime.episodes,
                "image_url": anime.image_url
            })
        
        result_data.append({
            "id": studio.id,
            "name": studio.name,
            "anime_count_total": total_count,
            "anime_count_recent": recent_count,
            "average_score": round(avg_score, 2),
            "workload_score": workload_score,
            "avg_anime_per_year": round(avg_per_year, 1),
            "popularity_metrics": {
                "total_members": total_members,
                "total_favorites": total_favorites,
                "avg_members_per_anime": avg_members,
                "avg_favorites_per_anime": avg_favorites
            },
            "type_distribution": type_distribution,
            "yearly_output": yearly_output,
            "anime_list": anime_list,
            "_sort_values": {
                "workload": workload_score,
                "count": recent_count,
                "score": avg_score,
                "members": total_members
            }
        })
    
    # Sort the results
    result_data.sort(
        key=lambda x: x["_sort_values"][sort_by],
        reverse=True
    )
    
    # Limit results
    result_data = result_data[:limit]
    
    # Remove internal sort values before returning
    for item in result_data:
        del item["_sort_values"]
    
    # Calculate summary statistics
    total_studios_with_recent = len(studios_with_recent_anime)
    showing = len(result_data)
    
    if result_data:
        total_recent_anime = sum(s["anime_count_recent"] for s in result_data)
        avg_anime_per_studio = total_recent_anime / showing if showing > 0 else 0
        
        top_by_workload = result_data[0]["name"] if sort_by == "workload" else max(result_data, key=lambda x: x["workload_score"])["name"]
        top_by_count = max(result_data, key=lambda x: x["anime_count_recent"])["name"]
        top_by_score = max(result_data, key=lambda x: x["average_score"])["name"]
        top_by_members = max(result_data, key=lambda x: x["popularity_metrics"]["total_members"])["name"]
    else:
        avg_anime_per_studio = 0
        top_by_workload = "N/A"
        top_by_count = "N/A"
        top_by_score = "N/A"
        top_by_members = "N/A"
    
    return {
        "success": True,
        "data": {
            "total_studios": total_studios_with_recent,
            "showing": showing,
            "time_range": {
                "years": years,
                "start_year": start_year,
                "end_year": end_year
            },
            "summary": {
                "avg_anime_per_studio": round(avg_anime_per_studio, 1),
                "top_studio_by_workload": top_by_workload,
                "top_studio_by_count": top_by_count,
                "top_studio_by_score": top_by_score,
                "top_studio_by_members": top_by_members
            },
            "studios": result_data
        },
        "message": f"Studios analysis retrieved successfully (last {years} years, sorted by {sort_by})"
    }

# =============================================================================
# Recommendations API
# =============================================================================
from recommendations import get_recommendations

@app.get("/api/anime/{anime_id}/recommendations")
def get_anime_recommendations(
    anime_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get anime recommendations based on content similarity
    
    Args:
        anime_id: The ID of the target anime
        limit: Number of recommendations to return (default: 10)
    
    Returns:
        JSON containing target anime and list of similar anime with similarity scores
        
    Algorithm:
        - Genre overlap: 50%
        - Score similarity: 25%
        - Demographic match: 10%
        - Studio match: 10%
        - Year proximity: 5%
    """
    result = get_recommendations(db, anime_id, limit)
    
    if not result:
        raise HTTPException(status_code=404, detail="Anime not found")
    
    target_anime = result['target_anime']
    recommendations = result['recommendations']
    
    # Format response
    return {
        "success": True,
        "target_anime": {
            "id": target_anime.id,
            "mal_id": target_anime.mal_id,
            "title": target_anime.title,
            "title_english": target_anime.title_english,
            "image_url": target_anime.image_url,
            "year": target_anime.year,
            "type": target_anime.type,
            "score": target_anime.score,
            "genres": [{"id": g.id, "name": g.name} for g in target_anime.genres],
            "studios": [{"id": s.id, "name": s.name} for s in target_anime.studios]
        },
        "recommendations": [
            {
                "id": rec['anime'].id,
                "mal_id": rec['anime'].mal_id,
                "title": rec['anime'].title,
                "title_english": rec['anime'].title_english,
                "image_url": rec['anime'].image_url,
                "year": rec['anime'].year,
                "type": rec['anime'].type,
                "score": rec['anime'].score,
                "genres": [{"id": g.id, "name": g.name} for g in rec['anime'].genres],
                "studios": [{"id": s.id, "name": s.name} for s in rec['anime'].studios],
                "similarity_score": rec['similarity']['total_similarity'],
                "match_details": rec['similarity']['details'],
                "weights_used": rec['similarity']['weights_used']
            }
            for rec in recommendations
        ],
        "message": f"Found {len(recommendations)} similar anime"
    }