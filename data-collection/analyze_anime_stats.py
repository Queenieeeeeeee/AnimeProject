"""
Analyze anime database statistics
Run this script in your backend directory
"""

from sqlalchemy import create_engine
import sqlite3
import sys
import os

# Database path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'backend', 'anime.db')
engine = create_engine(f'sqlite:///{DB_PATH}')

def execute_query(cursor, query, description):
    """Execute a query and print results"""
    print(f"\n{'='*80}")
    print(f"📊 {description}")
    print('='*80)
    
    cursor.execute(query)
    results = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    
    # Print column headers
    header = " | ".join(f"{col:20}" for col in columns)
    print(header)
    print("-" * len(header))
    
    # Print rows
    for row in results:
        formatted_row = []
        for val in row:
            if val is None:
                formatted_row.append(f"{'NULL':20}")
            elif isinstance(val, float):
                formatted_row.append(f"{val:20,.2f}")
            elif isinstance(val, int):
                formatted_row.append(f"{val:20,}")
            else:
                formatted_row.append(f"{str(val)[:20]:20}")
        print(" | ".join(formatted_row))
    
    print(f"\nTotal rows: {len(results)}\n")

def main():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Query 1: Overall Statistics
        execute_query(cursor, """
            SELECT 
                COUNT(*) as total_anime,
                COUNT(CASE WHEN rank IS NOT NULL THEN 1 END) as with_rank,
                COUNT(CASE WHEN score IS NOT NULL THEN 1 END) as with_score,
                ROUND(AVG(CASE WHEN rank IS NOT NULL THEN rank END), 2) as avg_rank,
                ROUND(AVG(popularity), 2) as avg_popularity,
                ROUND(AVG(members), 2) as avg_members,
                ROUND(AVG(favorites), 2) as avg_favorites
            FROM anime
        """, "Overall Statistics")
        
        # Query 2: Top 1000 by Rank
        execute_query(cursor, """
            SELECT 
                COUNT(*) as count,
                MIN(rank) as min_rank,
                MAX(rank) as max_rank,
                ROUND(AVG(rank), 2) as avg_rank,
                ROUND(AVG(popularity), 2) as avg_popularity,
                ROUND(AVG(members), 2) as avg_members,
                ROUND(AVG(favorites), 2) as avg_favorites,
                MIN(members) as min_members,
                MAX(members) as max_members
            FROM anime
            WHERE rank IS NOT NULL AND rank <= 1000
        """, "Top 1000 by Rank")
        
        # Query 3: Rank Distribution
        execute_query(cursor, """
            SELECT 
                CASE 
                    WHEN rank <= 1000 THEN '1. Top 1000'
                    WHEN rank <= 3000 THEN '2. Rank 1001-3000'
                    WHEN rank <= 5000 THEN '3. Rank 3001-5000'
                    WHEN rank <= 8000 THEN '4. Rank 5001-8000'
                    WHEN rank <= 10000 THEN '5. Rank 8001-10000'
                    ELSE '6. Rank 10000+'
                END as rank_bucket,
                COUNT(*) as count,
                ROUND(AVG(popularity), 2) as avg_popularity,
                ROUND(AVG(members), 2) as avg_members,
                ROUND(AVG(favorites), 2) as avg_favorites,
                ROUND(AVG(score), 2) as avg_score
            FROM anime
            WHERE rank IS NOT NULL
            GROUP BY rank_bucket
            ORDER BY rank_bucket
        """, "Rank Distribution")
        
        # Query 4: Popularity Distribution
        execute_query(cursor, """
            SELECT 
                CASE 
                    WHEN popularity <= 500 THEN '1. Top 500'
                    WHEN popularity <= 1000 THEN '2. Pop 501-1000'
                    WHEN popularity <= 2000 THEN '3. Pop 1001-2000'
                    WHEN popularity <= 5000 THEN '4. Pop 2001-5000'
                    WHEN popularity <= 10000 THEN '5. Pop 5001-10000'
                    ELSE '6. Pop 10000+'
                END as popularity_bucket,
                COUNT(*) as count,
                ROUND(AVG(rank), 2) as avg_rank,
                ROUND(AVG(members), 2) as avg_members,
                ROUND(AVG(favorites), 2) as avg_favorites,
                ROUND(AVG(score), 2) as avg_score
            FROM anime
            GROUP BY popularity_bucket
            ORDER BY popularity_bucket
        """, "Popularity Distribution")
        
        # Query 5: Members Distribution
        execute_query(cursor, """
            SELECT 
                CASE 
                    WHEN members >= 100000 THEN '1. 100k+ members'
                    WHEN members >= 50000 THEN '2. 50k-100k members'
                    WHEN members >= 10000 THEN '3. 10k-50k members'
                    WHEN members >= 5000 THEN '4. 5k-10k members'
                    WHEN members >= 1000 THEN '5. 1k-5k members'
                    ELSE '6. <1k members'
                END as members_bucket,
                COUNT(*) as count,
                ROUND(AVG(rank), 2) as avg_rank,
                ROUND(AVG(popularity), 2) as avg_popularity,
                ROUND(AVG(favorites), 2) as avg_favorites,
                ROUND(AVG(score), 2) as avg_score
            FROM anime
            GROUP BY members_bucket
            ORDER BY members_bucket
        """, "Members Distribution")
        
        # Query 6: Favorites Distribution
        execute_query(cursor, """
            SELECT 
                CASE 
                    WHEN favorites >= 1000 THEN '1. 1000+ favorites'
                    WHEN favorites >= 500 THEN '2. 500-1000 favorites'
                    WHEN favorites >= 100 THEN '3. 100-500 favorites'
                    WHEN favorites >= 50 THEN '4. 50-100 favorites'
                    WHEN favorites >= 10 THEN '5. 10-50 favorites'
                    ELSE '6. <10 favorites'
                END as favorites_bucket,
                COUNT(*) as count,
                ROUND(AVG(rank), 2) as avg_rank,
                ROUND(AVG(popularity), 2) as avg_popularity,
                ROUND(AVG(members), 2) as avg_members,
                ROUND(AVG(score), 2) as avg_score
            FROM anime
            GROUP BY favorites_bucket
            ORDER BY favorites_bucket
        """, "Favorites Distribution")
        
        # Query 7: Anime WITHOUT rank
        execute_query(cursor, """
            SELECT 
                COUNT(*) as count,
                ROUND(AVG(popularity), 2) as avg_popularity,
                ROUND(AVG(members), 2) as avg_members,
                ROUND(AVG(favorites), 2) as avg_favorites,
                MIN(members) as min_members,
                MAX(members) as max_members
            FROM anime
            WHERE rank IS NULL
        """, "Anime WITHOUT Rank (像那些中國武俠作品)")
        
        # Query 8: Examples - Top Tier
        execute_query(cursor, """
            SELECT title, rank, popularity, members, favorites, score
            FROM anime
            WHERE rank IS NOT NULL AND rank < 500
            ORDER BY rank
            LIMIT 5
        """, "Examples: TOP TIER (Rank < 500)")
        
        # Query 9: Examples - Mid Tier
        execute_query(cursor, """
            SELECT title, rank, popularity, members, favorites, score
            FROM anime
            WHERE rank BETWEEN 2000 AND 3000
            ORDER BY rank
            LIMIT 5
        """, "Examples: MID TIER (Rank 2000-3000)")
        
        # Query 10: Examples - Lower Tier
        execute_query(cursor, """
            SELECT title, rank, popularity, members, favorites, score
            FROM anime
            WHERE rank BETWEEN 8000 AND 10000
            ORDER BY rank
            LIMIT 5
        """, "Examples: LOWER TIER (Rank 8000-10000)")
        
        # Query 11: Examples - Very Low Tier
        execute_query(cursor, """
            SELECT title, rank, popularity, members, favorites, score
            FROM anime
            WHERE rank > 15000
            ORDER BY rank DESC
            LIMIT 5
        """, "Examples: VERY LOW TIER (Rank > 15000)")
        
        conn.close()
        print("\n✅ Analysis complete!")
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
