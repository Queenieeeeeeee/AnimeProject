import requests
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Anime
from datetime import datetime

# 使用絕對路徑連接資料庫
DB_PATH = r'C:\Users\sty24\Desktop\AnimeProject\backend\anime.db'
engine = create_engine(f'sqlite:///{DB_PATH}')
Session = sessionmaker(bind=engine)
session = Session()

BASE_URL = "https://api.jikan.moe/v4"

def update_anime_stats(anime):
    """更新單部動漫的統計數據"""
    try:
        # 從 Jikan API 獲取最新數據
        response = requests.get(f"{BASE_URL}/anime/{anime.mal_id}")
        
        if response.status_code == 200:
            data = response.json()['data']
            
            # 記錄舊值 (用於比較)
            old_score = anime.score
            old_rank = anime.rank
            
            # 更新統計數據
            anime.episodes = data.get('episodes') or anime.episodes
            anime.score = data.get('score')
            anime.rank = data.get('rank')
            anime.popularity = data.get('popularity')
            anime.members = data.get('members')
            anime.favorites = data.get('favorites')
            
            session.commit()
            
            # 顯示更新訊息
            score_change = f"{old_score} → {anime.score}" if old_score != anime.score else "unchanged"
            rank_change = f"{old_rank} → {anime.rank}" if old_rank != anime.rank else "unchanged"
            
            print(f"✅ {anime.title[:50]}")
            print(f"   Score: {score_change} | Rank: {rank_change} | Members: {anime.members:,}")
            
            return True
            
        elif response.status_code == 429:
            print("⏸️  達到速率限制,等待 60 秒...")
            time.sleep(60)
            return False
            
        else:
            print(f"❌ {anime.title}: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 更新 {anime.title} 時發生錯誤: {str(e)}")
        session.rollback()
        return False

def update_all_anime_stats(batch_size=100):
    """更新所有動漫的統計數據"""
    
    # 獲取所有動漫
    total_anime = session.query(Anime).count()
    all_anime = session.query(Anime).order_by(Anime.id).all()
    
    print(f"\n{'='*60}")
    print(f"🔄 開始更新 {total_anime} 部動漫的統計數據")
    print(f"{'='*60}\n")
    
    updated = 0
    failed = 0
    
    for i, anime in enumerate(all_anime, 1):
        print(f"\n[{i}/{total_anime}] 正在更新...")
        
        if update_anime_stats(anime):
            updated += 1
        else:
            failed += 1
        
        # API 限制: 每秒約 3 個請求
        time.sleep(0.35)
        
        # 每處理 batch_size 部動漫後暫停一下
        if i % batch_size == 0:
            print(f"\n{'='*60}")
            print(f"📊 進度: {i}/{total_anime} ({i/total_anime*100:.1f}%)")
            print(f"   成功: {updated} | 失敗: {failed}")
            print(f"{'='*60}")
            print("⏸️  暫停 5 秒...")
            time.sleep(5)
    
    print(f"\n{'='*60}")
    print(f"🎉 更新完成!")
    print(f"{'='*60}")
    print(f"✅ 成功更新: {updated} 部")
    print(f"❌ 更新失敗: {failed} 部")
    print(f"{'='*60}\n")

def update_popular_anime_only(min_members=10000):
    """只更新熱門動漫 (members 超過指定數量)"""
    
    anime_list = session.query(Anime).filter(
        Anime.members >= min_members
    ).order_by(Anime.members.desc()).all()
    
    total = len(anime_list)
    
    print(f"\n{'='*60}")
    print(f"🔄 更新熱門動漫 (Members >= {min_members:,})")
    print(f"📊 找到 {total} 部動漫")
    print(f"{'='*60}\n")
    
    updated = 0
    failed = 0
    
    for i, anime in enumerate(anime_list, 1):
        print(f"\n[{i}/{total}] 正在更新...")
        
        if update_anime_stats(anime):
            updated += 1
        else:
            failed += 1
        
        time.sleep(0.35)
    
    print(f"\n{'='*60}")
    print(f"🎉 更新完成!")
    print(f"{'='*60}")
    print(f"✅ 成功更新: {updated} 部")
    print(f"❌ 更新失敗: {failed} 部")
    print(f"{'='*60}\n")

def update_recent_anime(years=1):
    """只更新最近幾年的動漫"""
    
    current_year = datetime.now().year
    start_year = current_year - years
    
    anime_list = session.query(Anime).filter(
        Anime.year >= start_year
    ).order_by(Anime.year.desc()).all()
    
    total = len(anime_list)
    
    print(f"\n{'='*60}")
    print(f"🔄 更新近 {years} 年的動漫 ({start_year}-{current_year})")
    print(f"📊 找到 {total} 部動漫")
    print(f"{'='*60}\n")
    
    updated = 0
    failed = 0
    
    for i, anime in enumerate(anime_list, 1):
        print(f"\n[{i}/{total}] 正在更新...")
        
        if update_anime_stats(anime):
            updated += 1
        else:
            failed += 1
        
        time.sleep(0.35)
    
    print(f"\n{'='*60}")
    print(f"🎉 更新完成!")
    print(f"{'='*60}")
    print(f"✅ 成功更新: {updated} 部")
    print(f"❌ 更新失敗: {failed} 部")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    print("\n" + "="*60)
    print(f"🔄 動漫統計數據更新工具")
    print(f"📁 資料庫: {DB_PATH}")
    print("="*60)
    print("\n請選擇更新模式:")
    print("1. 更新所有動漫 (可能需要數小時)")
    print("2. 只更新熱門動漫 (members >= 10000)")
    print("3. 只更新最近 2 年的動漫")
    print("4. 自訂條件更新")
    print("="*60)
    
    choice = input("\n請輸入選項 (1-4): ").strip()
    
    if choice == "1":
        confirm = input("⚠️  這會花費很長時間,確定要更新所有動漫嗎? (yes/no): ")
        if confirm.lower() == 'yes':
            update_all_anime_stats()
    
    elif choice == "2":
        update_popular_anime_only(min_members=10000)
    
    elif choice == "3":
        update_recent_anime(years=2)
    
    elif choice == "4":
        print("\n自訂選項:")
        option = input("輸入 'popular' 更新熱門動漫 或 'recent' 更新近期動漫: ").strip()
        
        if option == 'popular':
            min_members = int(input("最低 members 數量: "))
            update_popular_anime_only(min_members=min_members)
        
        elif option == 'recent':
            years = int(input("更新最近幾年 (輸入數字): "))
            update_recent_anime(years=years)
    
    else:
        print("❌ 無效的選項")
    
    session.close()
    print("\n✅ 資料庫連接已關閉")
    print("="*60 + "\n")