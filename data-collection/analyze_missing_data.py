from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from database import Anime
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'backend', 'anime.db')
engine = create_engine(f'sqlite:///{DB_PATH}')

Session = sessionmaker(bind=engine)
session = Session()

print("\n" + "="*70)
print("🔍 深入分析缺失資料")
print("="*70 + "\n")

# ==================== 1. 沒有 Genre 的動漫分析 ====================
print("【1. 沒有 Genre 的動漫詳細分析】")
print("-" * 70)

no_genre_anime = session.query(Anime).filter(~Anime.genres.any()).all()
total_no_genre = len(no_genre_anime)

print(f"總共: {total_no_genre} 部動漫沒有 Genre\n")

# 按類型分組
print("📊 按 Type 分佈:")
type_counts = {}
for anime in no_genre_anime:
    type_counts[anime.type] = type_counts.get(anime.type, 0) + 1

for anime_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
    percentage = (count / total_no_genre * 100)
    print(f"  {anime_type:15s}: {count:5,} ({percentage:5.1f}%)")

# 看看 TV 類型中沒有 Genre 的動漫（前 20 部）
print("\n📺 TV 動漫中沒有 Genre 的例子（前 20 部，按人氣排序）:")
tv_no_genre = session.query(Anime).filter(
    Anime.type == 'TV',
    ~Anime.genres.any()
).order_by(Anime.members.desc().nullslast()).limit(20).all()

for idx, anime in enumerate(tv_no_genre, 1):
    members = anime.members or 0
    score = anime.score or 0
    print(f"  {idx:2d}. [{anime.year}] {anime.title[:45]:45s} | 👥 {members:7,} | ⭐ {score:.2f}")

# ==================== 2. 沒有 Studio 的動漫分析 ====================
print("\n" + "="*70)
print("【2. 沒有 Studio 的動漫詳細分析】")
print("-" * 70)

no_studio_anime = session.query(Anime).filter(~Anime.studios.any()).all()
total_no_studio = len(no_studio_anime)

print(f"總共: {total_no_studio} 部動漫沒有 Studio\n")

# 按類型分組
print("📊 按 Type 分佈:")
type_counts = {}
for anime in no_studio_anime:
    type_counts[anime.type] = type_counts.get(anime.type, 0) + 1

for anime_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
    percentage = (count / total_no_studio * 100)
    print(f"  {anime_type:15s}: {count:5,} ({percentage:5.1f}%)")

# 看看 TV 類型中沒有 Studio 的動漫（前 20 部）
print("\n📺 TV 動漫中沒有 Studio 的例子（前 20 部，按人氣排序）:")
tv_no_studio = session.query(Anime).filter(
    Anime.type == 'TV',
    ~Anime.studios.any()
).order_by(Anime.members.desc().nullslast()).limit(20).all()

for idx, anime in enumerate(tv_no_studio, 1):
    members = anime.members or 0
    score = anime.score or 0
    print(f"  {idx:2d}. [{anime.year}] {anime.title[:45]:45s} | 👥 {members:7,} | ⭐ {score:.2f}")

# ==================== 3. Score 為 null 的動漫分析 ====================
print("\n" + "="*70)
print("【3. Score 為 null 的動漫分析】")
print("-" * 70)

no_score = session.query(Anime).filter(Anime.score == None).count()
print(f"總共: {no_score:,} 部動漫沒有 Score (30.3%)\n")

# 按類型分組
print("📊 按 Type 分佈:")
no_score_types = session.query(
    Anime.type, func.count(Anime.id)
).filter(Anime.score == None).group_by(Anime.type).order_by(func.count(Anime.id).desc()).all()

for anime_type, count in no_score_types:
    percentage = (count / no_score * 100)
    print(f"  {anime_type:15s}: {count:5,} ({percentage:5.1f}%)")

# 看看 TV 類型中沒有 Score 的動漫（前 20 部，按人氣排序）
print("\n📺 TV 動漫中沒有 Score 的例子（前 20 部，按人氣排序）:")
tv_no_score = session.query(Anime).filter(
    Anime.type == 'TV',
    Anime.score == None
).order_by(Anime.members.desc().nullslast()).limit(20).all()

for idx, anime in enumerate(tv_no_score, 1):
    members = anime.members or 0
    print(f"  {idx:2d}. [{anime.year}] {anime.title[:45]:45s} | 👥 {members:7,}")

# ==================== 4. 綜合分析 ====================
print("\n" + "="*70)
print("【4. 綜合分析 - 同時缺失 Genre 和 Studio】")
print("-" * 70)

no_both = session.query(Anime).filter(
    ~Anime.genres.any(),
    ~Anime.studios.any()
).all()

print(f"總共: {len(no_both)} 部動漫同時沒有 Genre 和 Studio\n")

# 按類型分組
print("📊 按 Type 分佈:")
type_counts = {}
for anime in no_both:
    type_counts[anime.type] = type_counts.get(anime.type, 0) + 1

for anime_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
    percentage = (count / len(no_both) * 100) if no_both else 0
    print(f"  {anime_type:15s}: {count:5,} ({percentage:5.1f}%)")

# ==================== 5. 資料完整性評分 ====================
print("\n" + "="*70)
print("【5. 資料完整性評分】")
print("-" * 70)

total = session.query(Anime).count()

# 計算各類型的完整性
tv_count = session.query(Anime).filter(Anime.type == 'TV').count()
tv_with_genre = session.query(Anime).filter(Anime.type == 'TV', Anime.genres.any()).count()
tv_with_studio = session.query(Anime).filter(Anime.type == 'TV', Anime.studios.any()).count()
tv_with_score = session.query(Anime).filter(Anime.type == 'TV', Anime.score != None).count()

print(f"TV 動漫完整性 (共 {tv_count} 部):")
print(f"  有 Genre:  {tv_with_genre:5,} / {tv_count:5,} ({tv_with_genre/tv_count*100:.1f}%)")
print(f"  有 Studio: {tv_with_studio:5,} / {tv_count:5,} ({tv_with_studio/tv_count*100:.1f}%)")
print(f"  有 Score:  {tv_with_score:5,} / {tv_count:5,} ({tv_with_score/tv_count*100:.1f}%)")

ona_count = session.query(Anime).filter(Anime.type == 'ONA').count()
ona_with_genre = session.query(Anime).filter(Anime.type == 'ONA', Anime.genres.any()).count()
ona_with_studio = session.query(Anime).filter(Anime.type == 'ONA', Anime.studios.any()).count()
ona_with_score = session.query(Anime).filter(Anime.type == 'ONA', Anime.score != None).count()

print(f"\nONA 動漫完整性 (共 {ona_count} 部):")
print(f"  有 Genre:  {ona_with_genre:5,} / {ona_count:5,} ({ona_with_genre/ona_count*100:.1f}%)")
print(f"  有 Studio: {ona_with_studio:5,} / {ona_count:5,} ({ona_with_studio/ona_count*100:.1f}%)")
print(f"  有 Score:  {ona_with_score:5,} / {ona_count:5,} ({ona_with_score/ona_count*100:.1f}%)")

print("\n" + "="*70)
print("✅ 分析完成！")
print("="*70 + "\n")

session.close()