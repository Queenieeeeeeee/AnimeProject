from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from database import Anime, Genre, Studio, anime_genres, anime_studios
import pandas as pd
import os

# Connect to database
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'backend', 'anime.db')
engine = create_engine(f'sqlite:///{DB_PATH}')

Session = sessionmaker(bind=engine)
session = Session()

print("\n" + "="*60)
print("📊 動漫資料庫檢查報告")
print("="*60 + "\n")

# ========== 1. 基本統計 ==========
print("【1. 基本統計】")
print("-" * 60)
anime_count = session.query(Anime).count()
genre_count = session.query(Genre).count()
studio_count = session.query(Studio).count()

print(f"✅ 總動漫數量: {anime_count:,}")
print(f"✅ 總 Genre 數量: {genre_count}")
print(f"✅ 總 Studio 數量: {studio_count}")

# ========== 2. Anime 表格檢查 ==========
print("\n【2. Anime 表格 - Null 值檢查】")
print("-" * 60)

# 檢查各欄位的 null 數量
null_checks = {
    'title': session.query(Anime).filter(Anime.title == None).count(),
    'title_english': session.query(Anime).filter(Anime.title_english == None).count(),
    'type': session.query(Anime).filter(Anime.type == None).count(),
    'episodes': session.query(Anime).filter(Anime.episodes == None).count(),
    'score': session.query(Anime).filter(Anime.score == None).count(),
    'rank': session.query(Anime).filter(Anime.rank == None).count(),
    'popularity': session.query(Anime).filter(Anime.popularity == None).count(),    
    'members': session.query(Anime).filter(Anime.members == None).count(),    
    'favorites': session.query(Anime).filter(Anime.favorites == None).count(), 
    'year': session.query(Anime).filter(Anime.year == None).count(),
    'season': session.query(Anime).filter(Anime.season == None).count(),
    'synopsis': session.query(Anime).filter(Anime.synopsis == None).count(),
    'aired_from': session.query(Anime).filter(Anime.aired_from == None).count(),
    'aired_to': session.query(Anime).filter(Anime.aired_to == None).count(),
    'demographic': session.query(Anime).filter(Anime.demographic == None).count(),

}

for field, null_count in null_checks.items():
    percentage = (null_count / anime_count * 100) if anime_count > 0 else 0
    status = "⚠️" if null_count > 0 else "✅"
    print(f"{status} {field:20s}: {null_count:6,} null ({percentage:5.1f}%)")

# Type 分佈
print("\n【3. Type 分佈】")
print("-" * 60)
types = session.query(Anime.type, func.count(Anime.id)).group_by(Anime.type).all()
for anime_type, count in sorted(types, key=lambda x: x[1], reverse=True):
    percentage = (count / anime_count * 100) if anime_count > 0 else 0
    print(f"  {anime_type or 'NULL':15s}: {count:6,} ({percentage:5.1f}%)")

# Score 分佈
print("\n【4. Score 分佈】")
print("-" * 60)
score_stats = session.query(
    func.min(Anime.score),
    func.max(Anime.score),
    func.avg(Anime.score)
).filter(Anime.score != None).first()

if score_stats[0] is not None:
    print(f"  最低分: {score_stats[0]:.2f}")
    print(f"  最高分: {score_stats[1]:.2f}")
    print(f"  平均分: {score_stats[2]:.2f}")

# Year 分佈
print("\n【5. Year 分佈】")
print("-" * 60)
year_stats = session.query(
    func.min(Anime.year),
    func.max(Anime.year)
).filter(Anime.year != None).first()

if year_stats[0] is not None:
    print(f"  最早年份: {year_stats[0]}")
    print(f"  最晚年份: {year_stats[1]}")

# Season 分佈
print("\n【6. Season 分佈】")
print("-" * 60)
seasons = session.query(Anime.season, func.count(Anime.id)).group_by(Anime.season).all()
for season, count in sorted(seasons, key=lambda x: x[1], reverse=True):
    percentage = (count / anime_count * 100) if anime_count > 0 else 0
    print(f"  {season or 'NULL':15s}: {count:6,} ({percentage:5.1f}%)")

# Demographic 分佈
print("\n【7. Demographic 分佈】")
print("-" * 60)
demographics = session.query(Anime.demographic, func.count(Anime.id)).group_by(Anime.demographic).all()
for demo, count in sorted(demographics, key=lambda x: x[1], reverse=True):
    percentage = (count / anime_count * 100) if anime_count > 0 else 0
    print(f"  {demo or 'NULL':15s}: {count:6,} ({percentage:5.1f}%)")

# ========== 3. Genre 檢查 ==========
print("\n【8. Genre 分析】")
print("-" * 60)
print(f"✅ 總 Genre 數量: {genre_count}")

# 最常見的 Genre (前 10)
print("\n  🔝 前 10 常見 Genre:")
top_genres = session.query(
    Genre.name, 
    func.count(anime_genres.c.anime_id)
).join(anime_genres).group_by(Genre.id).order_by(func.count(anime_genres.c.anime_id).desc()).limit(10).all()

for idx, (genre_name, count) in enumerate(top_genres, 1):
    print(f"    {idx:2d}. {genre_name:20s}: {count:6,} 部動漫")

# 沒有 Genre 的動漫
no_genre = session.query(Anime).filter(~Anime.genres.any()).count()
print(f"\n  ⚠️  沒有 Genre 的動漫: {no_genre} 部")

# 平均每部動漫的 Genre 數量
total_genre_links = session.query(func.count(anime_genres.c.anime_id)).scalar()
avg_genres = total_genre_links / anime_count if anime_count > 0 else 0
print(f"  📊 平均每部動漫有 {avg_genres:.1f} 個 Genre")

# ========== 4. Studio 檢查 ==========
print("\n【9. Studio 分析】")
print("-" * 60)
print(f"✅ 總 Studio 數量: {studio_count}")

# 最常見的 Studio (前 10)
print("\n  🔝 前 10 常見 Studio:")
top_studios = session.query(
    Studio.name, 
    func.count(anime_studios.c.anime_id)
).join(anime_studios).group_by(Studio.id).order_by(func.count(anime_studios.c.anime_id).desc()).limit(10).all()

for idx, (studio_name, count) in enumerate(top_studios, 1):
    print(f"    {idx:2d}. {studio_name:30s}: {count:6,} 部動漫")

# 沒有 Studio 的動漫
no_studio = session.query(Anime).filter(~Anime.studios.any()).count()
print(f"\n  ⚠️  沒有 Studio 的動漫: {no_studio} 部")

# 平均每部動漫的 Studio 數量
total_studio_links = session.query(func.count(anime_studios.c.anime_id)).scalar()
avg_studios = total_studio_links / anime_count if anime_count > 0 else 0
print(f"  📊 平均每部動漫有 {avg_studios:.1f} 個 Studio")

# ========== 5. 資料品質檢查 ==========
print("\n【10. 資料品質檢查】")
print("-" * 60)

# 檢查重複的 mal_id
duplicate_mal = session.query(Anime.mal_id, func.count(Anime.id)).group_by(Anime.mal_id).having(func.count(Anime.id) > 1).all()
print(f"  {'✅' if len(duplicate_mal) == 0 else '❌'} 重複的 mal_id: {len(duplicate_mal)} 筆")

# 檢查異常的 score
abnormal_score = session.query(Anime).filter((Anime.score < 0) | (Anime.score > 10)).count()
print(f"  {'✅' if abnormal_score == 0 else '❌'} 異常的 score (< 0 or > 10): {abnormal_score} 筆")

# 檢查異常的 year
abnormal_year = session.query(Anime).filter((Anime.year < 1900) | (Anime.year > 2030)).count()
print(f"  {'✅' if abnormal_year == 0 else '❌'} 異常的 year (< 1900 or > 2030): {abnormal_year} 筆")

print("\n" + "="*60)
print("✅ 檢查完成！")
print("="*60 + "\n")

session.close()