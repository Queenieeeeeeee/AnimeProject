import requests
import time
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from datetime import datetime, date

# ========== 需要先 import 你的 models ==========
# 假設你從 database.py import
import sys
import os
sys.path.append(r'C:\Users\sty24\Desktop\AnimeProject\backend')
from models.database import Anime, Genre, Studio, Base

# ========== 設定 ==========
DB_PATH = r'C:\Users\sty24\Desktop\AnimeProject\backend\anime.db'
engine = create_engine(f'sqlite:///{DB_PATH}')
Session = sessionmaker(bind=engine)
session = Session()

BASE_URL = "https://api.jikan.moe/v4"

# 過濾設定
EXCLUDED_TYPES = ['Music', 'CM', 'PV']
EXCLUDED_GENRES = ['Hentai']
EXCLUDED_STUDIOS = ['T-Rex']


# =============================================================================
# 過濾檢查
# =============================================================================

def should_skip_anime(anime_data):
    """檢查是否應該跳過這部動漫"""
    if anime_data.get('type') in EXCLUDED_TYPES:
        return True, f"類型 {anime_data.get('type')} 被排除"
    
    for genre in anime_data.get('genres', []):
        if genre.get('name') in EXCLUDED_GENRES:
            return True, f"Genre {genre.get('name')} 被排除"
    
    for studio in anime_data.get('studios', []):
        if studio.get('name') in EXCLUDED_STUDIOS:
            return True, f"Studio {studio.get('name')} 被排除"
    
    return False, None


# =============================================================================
# 核心邏輯：新增 or 更新
# =============================================================================

def upsert_anime(anime_data):
    """
    新增或更新一部 anime
    - 如果不存在 → INSERT（完整資料）
    - 如果已存在 → UPDATE（只更新統計數字）
    回傳: 'inserted' / 'updated' / 'skipped' / 'filtered' / 'error'
    """
    
    # 1. 過濾檢查
    should_skip, skip_reason = should_skip_anime(anime_data)
    if should_skip:
        print(f"  ⏭️  過濾: {anime_data.get('title', 'Unknown')} ({skip_reason})")
        return 'filtered'
    
    mal_id = anime_data.get('mal_id')
    if not mal_id:
        return 'error'
    
    try:
        existing = session.query(Anime).filter_by(mal_id=mal_id).first()
        
        # ── 已存在：只更新統計數字 ──────────────────────────────────────────
        if existing:
            old_score = existing.score
            old_rank = existing.rank
            
            existing.episodes = anime_data.get('episodes') or existing.episodes
            existing.score = anime_data.get('score')
            existing.rank = anime_data.get('rank')
            existing.popularity = anime_data.get('popularity')
            existing.members = anime_data.get('members')
            existing.favorites = anime_data.get('favorites')
            
            session.commit()
            
            score_change = f"{old_score} → {existing.score}" if old_score != existing.score else "unchanged"
            rank_change  = f"{old_rank} → {existing.rank}"   if old_rank  != existing.rank  else "unchanged"
            print(f"  🔄 Updated: {existing.title[:50]}")
            print(f"     Score: {score_change} | Rank: {rank_change} | Members: {existing.members:,}")
            return 'updated'
        
        # ── 不存在：完整 INSERT ──────────────────────────────────────────────
        aired_from = None
        aired_to   = None
        if anime_data.get('aired'):
            if anime_data['aired'].get('from'):
                aired_from = datetime.fromisoformat(
                    anime_data['aired']['from'].replace('Z', '+00:00')
                )
            if anime_data['aired'].get('to'):
                aired_to = datetime.fromisoformat(
                    anime_data['aired']['to'].replace('Z', '+00:00')
                )
        
        year = None
        if aired_from:
            year = aired_from.year
        elif anime_data.get('year'):
            year = anime_data.get('year')
        
        anime = Anime(
            mal_id        = mal_id,
            title         = anime_data['title'],
            title_english = anime_data.get('title_english') or anime_data['title'],
            type          = anime_data.get('type'),
            episodes      = anime_data.get('episodes'),
            score         = anime_data.get('score'),
            rank          = anime_data.get('rank'),
            popularity    = anime_data.get('popularity'),
            members       = anime_data.get('members'),
            favorites     = anime_data.get('favorites'),
            year          = year,
            season        = anime_data.get('season'),
            image_url     = anime_data['images']['jpg']['image_url'],
            synopsis      = anime_data.get('synopsis'),
            aired_from    = aired_from,
            aired_to      = aired_to,
            demographic   = (anime_data.get('demographics', [{}])[0].get('name')
                             if anime_data.get('demographics') else None)
        )
        
        session.add(anime)
        session.flush()
        
        # Genres
        for genre_data in anime_data.get('genres', []):
            if genre_data['name'] in EXCLUDED_GENRES:
                continue
            genre = session.query(Genre).filter_by(mal_id=genre_data['mal_id']).first()
            if not genre:
                genre = Genre(mal_id=genre_data['mal_id'], name=genre_data['name'])
                session.add(genre)
                session.flush()
            anime.genres.append(genre)
        
        # Studios
        for studio_data in anime_data.get('studios', []):
            if studio_data['name'] in EXCLUDED_STUDIOS:
                continue
            studio = session.query(Studio).filter_by(mal_id=studio_data['mal_id']).first()
            if not studio:
                studio = Studio(mal_id=studio_data['mal_id'], name=studio_data['name'])
                session.add(studio)
                session.flush()
            anime.studios.append(studio)
        
        session.commit()
        print(f"  ✅ Inserted: {anime_data['title']}")
        return 'inserted'
    
    except Exception as e:
        print(f"  ❌ Error: {anime_data.get('title', 'Unknown')} → {str(e)}")
        session.rollback()
        return 'error'


# =============================================================================
# 清理
# =============================================================================

def clean_unused_studios():
    """清理沒有關聯任何 anime 的 studios"""
    try:
        unused = session.query(Studio).filter(
            ~Studio.id.in_(
                session.query(Studio.id).join(Studio.animes).distinct()
            )
        ).all()
        
        if unused:
            count = len(unused)
            for studio in unused:
                session.delete(studio)
            session.commit()
            print(f"🧹 清理了 {count} 個未使用的 studios")
        else:
            print("ℹ️  沒有需要清理的 studios")
    except Exception as e:
        print(f"❌ 清理 studios 時發生錯誤: {str(e)}")
        session.rollback()


# =============================================================================
# 主要收集邏輯
# =============================================================================

def sync_anime_by_years(start_year, end_year):
    """
    依年份季度同步 anime（新增 + 更新統計）
    """
    seasons = ['winter', 'spring', 'summer', 'fall']
    
    stats = {'inserted': 0, 'updated': 0, 'filtered': 0, 'skipped': 0, 'error': 0}
    
    print(f"\n{'='*60}")
    print(f"🎌 開始同步 {start_year}-{end_year} 的動漫資料")
    print(f"🚫 排除類型:  {', '.join(EXCLUDED_TYPES)}")
    print(f"🚫 排除 Genre: {', '.join(EXCLUDED_GENRES)}")
    print(f"🚫 排除 Studio: {', '.join(EXCLUDED_STUDIOS)}")
    print(f"{'='*60}\n")
    
    for year in range(start_year, end_year + 1):
        for season in seasons:
            print(f"\n{'='*60}")
            print(f"📥 {year} {season}")
            print(f"{'='*60}")
            
            page = 1
            season_stats = {'inserted': 0, 'updated': 0, 'filtered': 0, 'error': 0}
            
            while True:
                try:
                    response = requests.get(
                        f"{BASE_URL}/seasons/{year}/{season}",
                        params={'page': page, 'limit': 25}
                    )
                    
                    if response.status_code == 200:
                        data       = response.json()
                        anime_list = data['data']
                        
                        if not anime_list:
                            print(f"  ℹ️  第 {page} 頁沒有資料，結束此季度")
                            break
                        
                        page_stats = {'inserted': 0, 'updated': 0, 'filtered': 0, 'error': 0}
                        
                        for anime_data in anime_list:
                            result = upsert_anime(anime_data)
                            if result in page_stats:
                                page_stats[result] += 1
                                season_stats[result] += 1
                                stats[result] += 1
                            else:
                                stats['skipped'] += 1
                            
                            time.sleep(0.35)
                        
                        print(f"\n  📄 第 {page} 頁："
                              f" 新增 {page_stats['inserted']} |"
                              f" 更新 {page_stats['updated']} |"
                              f" 過濾 {page_stats['filtered']} |"
                              f" 錯誤 {page_stats['error']}")
                        page += 1
                    
                    elif response.status_code == 429:
                        print("  ⏸️  Rate limit，等待 60 秒...")
                        time.sleep(60)
                        continue
                    
                    elif response.status_code == 404:
                        print(f"  ℹ️  {year} {season} 沒有資料")
                        break
                    
                    else:
                        print(f"  ❌ HTTP {response.status_code}")
                        stats['error'] += 1
                        break
                
                except Exception as e:
                    print(f"  ❌ 錯誤: {str(e)}")
                    stats['error'] += 1
                    time.sleep(5)
                    continue
            
            print(f"\n📊 {year} {season} 小計："
                  f" 新增 {season_stats['inserted']} |"
                  f" 更新 {season_stats['updated']} |"
                  f" 過濾 {season_stats['filtered']}")
            
            time.sleep(2)
    
    # 清理
    print(f"\n{'='*60}")
    print("🧹 清理未使用的 studios...")
    clean_unused_studios()
    
    # 最終統計
    print(f"\n{'='*60}")
    print(f"🎉 同步完成！")
    print(f"{'='*60}")
    print(f"✅ 新增: {stats['inserted']} 部")
    print(f"🔄 更新: {stats['updated']} 部")
    print(f"🚫 過濾: {stats['filtered']} 部")
    print(f"⏭️  跳過重複: {stats['skipped']} 部")
    print(f"❌ 錯誤: {stats['error']} 次")
    print(f"{'='*60}\n")


# =============================================================================
# 主程式
# =============================================================================

if __name__ == "__main__":
    # ========== 直接設定年份範圍 ==========
    START_YEAR = 2024
    END_YEAR   = 2026
    # ======================================

    print("\n" + "="*60)
    print("🎌 動漫資料庫同步工具（新增 + 更新合併版）")
    print(f"📁 資料庫: {DB_PATH}")
    print(f"📅 同步範圍: {START_YEAR} - {END_YEAR}")
    print("="*60)

    sync_anime_by_years(START_YEAR, END_YEAR)

    session.close()
    print("\n✅ 資料庫連接已關閉")
    print("="*60 + "\n")