from .database import (
    get_db,      # 資料庫 session 的 dependency
    Anime,       # Anime 模型
    Genre,       # Genre 模型
    Studio,      # Studio 模型
    anime_genres,  # 多對多關聯表
    anime_studios  # 多對多關聯表
)

__all__ = [
    "get_db",
    "Anime",
    "Genre",
    "Studio",
    "anime_genres",
    "anime_studios"
]