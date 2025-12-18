import requests
import time
from sqlalchemy import create_engine, and_, or_
from sqlalchemy.orm import sessionmaker
from database import Anime, Genre, Studio, Base
from datetime import datetime

# Connect to database
engine = create_engine('sqlite:///anime.db')
Session = sessionmaker(bind=engine)
session = Session()

BASE_URL = "https://api.jikan.moe/v4"

# 定義要過濾的內容
EXCLUDED_TYPES = ['Music', 'CM', 'PV']
EXCLUDED_GENRES = ['Hentai']
EXCLUDED_STUDIOS = ['T-Rex']  # 可以繼續添加

def should_skip_anime(anime_data):
    """檢查是否應該跳過這部動漫"""
    
    # 檢查類型
    if anime_data.get('type') in EXCLUDED_TYPES:
        return True, f"類型 {anime_data.get('type')} 被排除"
    
    # 檢查 genre
    for genre in anime_data.get('genres', []):
        if genre.get('name') in EXCLUDED_GENRES:
            return True, f"Genre {genre.get('name')} 被排除"
    
    # 檢查 studio
    for studio in anime_data.get('studios', []):
        if studio.get('name') in EXCLUDED_STUDIOS:
            return True, f"Studio {studio.get('name')} 被排除"
    
    return False, None

def save_anime(anime_data):
    """Save an anime into database"""
    
    # 先檢查是否應該跳過
    should_skip, skip_reason = should_skip_anime(anime_data)
    if should_skip:
        print(f"⏭️  跳過: {anime_data['title']} ({skip_reason})")
        return False
    
    # Check if it exists
    existing = session.query(Anime).filter_by(mal_id=anime_data['mal_id']).first()
    if existing:
        return False
    
    try:
        # Parse aired dates
        aired_from = None
        aired_to = None
        if anime_data.get('aired'):
            if anime_data['aired'].get('from'):
                aired_from = datetime.fromisoformat(anime_data['aired']['from'].replace('Z', '+00:00'))
            if anime_data['aired'].get('to'):
                aired_to = datetime.fromisoformat(anime_data['aired']['to'].replace('Z', '+00:00'))
        
        # 從 aired_from 自動提取 year
        year = None
        if aired_from:
            year = aired_from.year
        elif anime_data.get('year'):
            year = anime_data.get('year')
        
        # Create Anime object
        anime = Anime(
            mal_id=anime_data['mal_id'],
            title=anime_data['title'],
            title_english=anime_data.get('title_english') or anime_data['title'],  # 自動填補
            type=anime_data.get('type'),
            episodes=anime_data.get('episodes'),
            score=anime_data.get('score'),
            rank=anime_data.get('rank'),
            popularity=anime_data.get('popularity'),
            members=anime_data.get('members'),
            favorites=anime_data.get('favorites'),
            year=year,  # 使用自動提取的年份
            season=anime_data.get('season'),
            image_url=anime_data['images']['jpg']['image_url'],
            synopsis=anime_data.get('synopsis'),
            aired_from=aired_from,
            aired_to=aired_to,
            demographic=anime_data.get('demographics', [{}])[0].get('name') if anime_data.get('demographics') else None
        )
        
        # 先加入 anime 到 session
        session.add(anime)
        session.flush()  # 確保 anime 在 session 中
        
        # Handle genres (自動跳過排除的 genre)
        for genre_data in anime_data.get('genres', []):
            if genre_data['name'] in EXCLUDED_GENRES:
                continue
                
            genre = session.query(Genre).filter_by(mal_id=genre_data['mal_id']).first()
            if not genre:
                genre = Genre(mal_id=genre_data['mal_id'], name=genre_data['name'])
                session.add(genre)
                session.flush()
            anime.genres.append(genre)
        
        # Handle studios (自動跳過排除的 studio)
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
        print(f"✅ Saved: {anime_data['title']}")
        return True
        
    except Exception as e:
        print(f"❌ Error saving {anime_data.get('title', 'Unknown')}: {str(e)}")
        session.rollback()
        return False

def clean_unused_studios():
    """清理沒有關聯任何 anime 的 studios"""
    try:
        # 找出沒有被使用的 studios
        unused_studios = session.query(Studio).filter(
            ~Studio.id.in_(
                session.query(Studio.id)
                .join(Studio.animes)
                .distinct()
            )
        ).all()
        
        if unused_studios:
            count = len(unused_studios)
            for studio in unused_studios:
                session.delete(studio)
            session.commit()
            print(f"🧹 清理了 {count} 個未使用的 studios")
        else:
            print("ℹ️  沒有需要清理的 studios")
            
    except Exception as e:
        print(f"❌ 清理 studios 時發生錯誤: {str(e)}")
        session.rollback()

def collect_anime_by_years(start_year, end_year):
    """Collect anime from a range of years"""
    seasons = ['winter', 'spring', 'summer', 'fall']
    total_collected = 0
    total_skipped = 0
    total_filtered = 0  # 新增：被過濾的數量
    total_errors = 0
    
    print(f"\n{'='*60}")
    print(f"🎌 開始收集 {start_year}-{end_year} 的動漫資料")
    print(f"🚫 排除類型: {', '.join(EXCLUDED_TYPES)}")
    print(f"🚫 排除 Genre: {', '.join(EXCLUDED_GENRES)}")
    print(f"🚫 排除 Studio: {', '.join(EXCLUDED_STUDIOS)}")
    print(f"{'='*60}\n")
    
    for year in range(start_year, end_year + 1):
        for season in seasons:
            print(f"\n{'='*60}")
            print(f"📥 正在抓取: {year} {season}")
            print(f"{'='*60}")
            
            page = 1
            season_count = 0
            season_filtered = 0
            season_errors = 0
            
            while True:
                try:
                    response = requests.get(
                        f"{BASE_URL}/seasons/{year}/{season}",
                        params={'page': page, 'limit': 25}
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        anime_list = data['data']
                        
                        if not anime_list:
                            print(f"  ℹ️  第 {page} 頁沒有資料,結束此季度")
                            break
                        
                        page_saved = 0
                        page_filtered = 0
                        for anime_data in anime_list:
                            # 檢查是否被過濾
                            should_skip, skip_reason = should_skip_anime(anime_data)
                            
                            if should_skip:
                                page_filtered += 1
                                season_filtered += 1
                                total_filtered += 1
                            elif save_anime(anime_data):
                                season_count += 1
                                total_collected += 1
                                page_saved += 1
                            else:
                                total_skipped += 1
                            
                            time.sleep(0.35)  # ~3 requests per second
                        
                        print(f"  ✅ 第 {page} 頁: 新增 {page_saved} 部 | 過濾 {page_filtered} 部")
                        page += 1
                        
                    elif response.status_code == 429:
                        print("  ⏸️  達到速率限制,等待 60 秒...")
                        time.sleep(60)
                        continue
                        
                    elif response.status_code == 404:
                        print(f"  ℹ️  {year} {season} 沒有資料")
                        break
                        
                    else:
                        print(f"  ❌ HTTP 錯誤 {response.status_code}")
                        season_errors += 1
                        total_errors += 1
                        break
                        
                except Exception as e:
                    print(f"  ❌ 發生錯誤: {str(e)}")
                    season_errors += 1
                    total_errors += 1
                    time.sleep(5)
                    continue
            
            print(f"\n📊 {year} {season} 統計:")
            print(f"  - 新增: {season_count} 部")
            print(f"  - 過濾: {season_filtered} 部")
            print(f"  - 錯誤: {season_errors} 次")
            print(f"  - 總進度: {total_collected} 部動漫")
            
            time.sleep(2)  # 季度之間的延遲
    
    # 收集完成後清理未使用的 studios
    print(f"\n{'='*60}")
    print("🧹 開始清理未使用的資料...")
    print(f"{'='*60}")
    clean_unused_studios()
    
    print(f"\n{'='*60}")
    print(f"🎉 收集完成！")
    print(f"{'='*60}")
    print(f"✅ 成功新增: {total_collected} 部動漫")
    print(f"🚫 自動過濾: {total_filtered} 部動漫")
    print(f"⏭️  跳過重複: {total_skipped} 部")
    print(f"❌ 發生錯誤: {total_errors} 次")
    print(f"{'='*60}\n")


# 主程式
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🎌 動漫資料收集工具 - 改進版")
    print("="*60)
    print("\n✨ 新功能:")
    print("   - 自動過濾 Music/CM/PV 類型")
    print("   - 自動過濾 Hentai genre")
    print("   - 自動過濾指定 studios (如 T-Rex)")
    print("   - 自動填補 title_english")
    print("   - 自動從 aired_from 提取 year")
    print("   - 收集後自動清理未使用的 studios")
    print("\n⚠️  這會花費 2-3 小時,請確保:")
    print("   - 網路連線穩定")
    print("   - 電腦不會進入睡眠模式\n")
    print("="*60)
    
    # 開始抓取 (你可以修改年份範圍)
    collect_anime_by_years(2005, 2024)
    
    session.close()
    print("\n✅ 資料庫連接已關閉")
    print("="*60 + "\n")