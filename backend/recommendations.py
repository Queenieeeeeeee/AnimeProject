"""
Recommendation Engine for Anime
Content-based filtering using genre, score, demographic, studio, year, and popularity metrics
"""

from sqlalchemy.orm import Session
from models.database import Anime
from typing import List, Dict, Optional


def is_quality_candidate(anime: Anime) -> bool:
    """
    Check if anime meets minimum quality thresholds
    
    Two scenarios:
    1. Has rank: Must meet at least ONE of these criteria:
       - rank < 6000 (top 40% of ranked anime)
       - popularity < 3000 (well-known anime)
       - members > 20000 (sufficient viewership)
       - favorites > 100 (genuine fan appreciation)
    
    2. No rank (new anime): Must meet STRONGER criteria (at least ONE):
       - popularity < 2000 (very popular)
       - members > 50000 (strong viewership for unranked)
       - favorites > 200 (strong fan appreciation)
    
    Args:
        anime: Candidate anime to check
    
    Returns:
        True if anime meets quality threshold, False otherwise
    """
    # Scenario 1: Has rank
    if anime.rank is not None:
        return (
            anime.rank < 6000 or
            anime.popularity < 3000 or
            anime.members > 20000 or
            anime.favorites > 100
        )
    
    # Scenario 2: No rank (must meet stronger criteria)
    return (
        anime.popularity < 2000 or
        anime.members > 50000 or
        anime.favorites > 200
    )


def calculate_genre_similarity(target_genres: List[str], candidate_genres: List[str]) -> float:
    """
    Calculate genre similarity using Jaccard Similarity
    
    Args:
        target_genres: Target anime's genres
        candidate_genres: Candidate anime's genres
    
    Returns:
        Similarity score from 0.0 to 1.0
    """
    if not target_genres or not candidate_genres:
        return 0.0
    
    target_set = set(target_genres)
    candidate_set = set(candidate_genres)
    
    intersection = len(target_set & candidate_set)
    union = len(target_set | candidate_set)
    
    return intersection / union if union > 0 else 0.0


def calculate_year_similarity(target_year: int, candidate_year: int) -> float:
    """
    Calculate year proximity similarity
    
    Args:
        target_year: Target anime's year
        candidate_year: Candidate anime's year
    
    Returns:
        Similarity score from 0.0 to 1.0
    """
    year_diff = abs(target_year - candidate_year)
    # Maximum difference of 10 years
    return max(0, 1 - year_diff / 10.0)


def calculate_popularity_score(candidate_popularity: int) -> float:
    """
    Calculate popularity score based on MAL popularity rank
    Lower rank number = more popular = higher score
    
    Args:
        candidate_popularity: Candidate anime's popularity rank
    
    Returns:
        Score from 0.0 to 1.0
    """
    if candidate_popularity is None:
        return 0.0
    
    # Popularity scoring tiers (based on data analysis)
    if candidate_popularity <= 500:
        return 1.0
    elif candidate_popularity <= 1000:
        return 0.9
    elif candidate_popularity <= 2000:
        return 0.8
    elif candidate_popularity <= 3000:
        return 0.7
    elif candidate_popularity <= 5000:
        return 0.6
    elif candidate_popularity <= 10000:
        return 0.4
    else:
        return 0.2


def calculate_members_score(candidate_members: int) -> float:
    """
    Calculate members score based on viewership numbers
    More members = more popular = higher score
    
    Args:
        candidate_members: Candidate anime's member count
    
    Returns:
        Score from 0.0 to 1.0
    """
    if candidate_members is None:
        return 0.0
    
    # Members scoring tiers (based on data analysis)
    if candidate_members >= 500000:
        return 1.0
    elif candidate_members >= 100000:
        return 0.9
    elif candidate_members >= 50000:
        return 0.8
    elif candidate_members >= 20000:
        return 0.7
    elif candidate_members >= 10000:
        return 0.6
    elif candidate_members >= 5000:
        return 0.4
    else:
        return 0.2


def calculate_favorites_score(candidate_favorites: int) -> float:
    """
    Calculate favorites score based on fan appreciation
    More favorites = more loved = higher score
    
    Args:
        candidate_favorites: Candidate anime's favorites count
    
    Returns:
        Score from 0.0 to 1.0
    """
    if candidate_favorites is None:
        return 0.0
    
    # Favorites scoring tiers (based on data analysis)
    if candidate_favorites >= 10000:
        return 1.0
    elif candidate_favorites >= 1000:
        return 0.9
    elif candidate_favorites >= 500:
        return 0.8
    elif candidate_favorites >= 200:
        return 0.7
    elif candidate_favorites >= 100:
        return 0.6
    elif candidate_favorites >= 50:
        return 0.4
    else:
        return 0.2


def calculate_similarity(target_anime: Anime, candidate_anime: Anime) -> Optional[Dict]:
    """
    Calculate overall similarity between two anime
    Uses fixed weights with no redistribution for missing data
    
    Weights:
    - Similarity dimensions (80%): genre, score, studio, demographic, year
    - Popularity boost (20%): popularity, members, favorites
    
    Args:
        target_anime: The anime user selected
        candidate_anime: A candidate anime to compare
    
    Returns:
        Dictionary containing similarity scores and details, or None (skip this candidate)
    """
    # Fixed weights (no redistribution for missing data)
    weights = {
        # Similarity dimensions
        'genre': 0.40,
        'score': 0.20,
        'studio': 0.10,
        'demographic': 0.05,
        'year': 0.05,
        # Popularity boost
        'popularity': 0.10,
        'members': 0.05,
        'favorites': 0.05
    }
    
    # Store individual scores
    scores = {}
    
    # 1. Genre (required, skip if missing)
    target_genre_names = [g.name for g in target_anime.genres] if target_anime.genres else []
    candidate_genre_names = [g.name for g in candidate_anime.genres] if candidate_anime.genres else []
    
    if not candidate_genre_names:
        return None  # No genres, skip this candidate
    
    scores['genre'] = calculate_genre_similarity(target_genre_names, candidate_genre_names)
    
    # 2. Score similarity
    if target_anime.score is None or candidate_anime.score is None:
        scores['score'] = 0.0
    else:
        score_diff = abs(target_anime.score - candidate_anime.score)
        scores['score'] = max(0, 1 - score_diff / 2.0)
    
    # 3. Studio similarity
    target_studio_names = [s.name for s in target_anime.studios] if target_anime.studios else []
    candidate_studio_names = [s.name for s in candidate_anime.studios] if candidate_anime.studios else []
    
    if candidate_studio_names and target_studio_names:
        target_studios = set(target_studio_names)
        candidate_studios = set(candidate_studio_names)
        scores['studio'] = 1.0 if len(target_studios & candidate_studios) > 0 else 0.0
    else:
        scores['studio'] = 0.0
    
    # 4. Demographic similarity
    if candidate_anime.demographic and target_anime.demographic:
        scores['demographic'] = 1.0 if target_anime.demographic == candidate_anime.demographic else 0.0
    else:
        scores['demographic'] = 0.0
    
    # 5. Year similarity
    scores['year'] = calculate_year_similarity(target_anime.year, candidate_anime.year)
    
    # 6. Popularity boost (only based on candidate's popularity)
    scores['popularity'] = calculate_popularity_score(candidate_anime.popularity)
    
    # 7. Members boost (only based on candidate's members)
    scores['members'] = calculate_members_score(candidate_anime.members)
    
    # 8. Favorites boost (only based on candidate's favorites)
    scores['favorites'] = calculate_favorites_score(candidate_anime.favorites)
    
    # Calculate total similarity (fixed weights, no redistribution)
    total_similarity = sum(scores[key] * weights[key] for key in scores)
    
    return {
        'total_similarity': round(total_similarity, 4),
        'details': {k: round(v, 4) for k, v in scores.items()},
        'weights_used': weights
    }


def get_recommendations(db: Session, anime_id: int, limit: int = 10) -> Optional[Dict]:
    """
    Get anime recommendations based on similarity
    
    Args:
        db: Database session
        anime_id: Target anime's ID
        limit: Number of recommendations to return
    
    Returns:
        Dictionary containing target anime and recommendations list, or None if anime not found
    """
    # 1. Find target anime
    target_anime = db.query(Anime).filter(Anime.id == anime_id).first()
    
    if not target_anime:
        return None
    
    # 2. Get all candidate anime (exclude self and apply quality filter)
    all_candidates = db.query(Anime).filter(Anime.id != anime_id).all()
    
    # Filter for quality candidates
    candidates = [anime for anime in all_candidates if is_quality_candidate(anime)]
    
    # 3. Calculate similarities
    recommendations = []
    
    for candidate in candidates:
        similarity_result = calculate_similarity(target_anime, candidate)
        
        if similarity_result is None:
            continue  # Skip candidates that don't meet criteria
        
        recommendations.append({
            'anime': candidate,
            'similarity': similarity_result
        })
    
    # 4. Sort by total similarity (descending)
    recommendations.sort(
        key=lambda x: x['similarity']['total_similarity'],
        reverse=True
    )
    
    # 5. Take top N
    top_recommendations = recommendations[:limit]
    
    return {
        'target_anime': target_anime,
        'recommendations': top_recommendations
    }