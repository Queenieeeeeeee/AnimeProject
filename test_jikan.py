import requests

# Jikan API link
BASE_URL = "https://api.jikan.moe/v4"

# test:fetch one of the anime (JoJo, ID=14719)
anime_id = 14719
url = f"{BASE_URL}/anime/{anime_id}"

print(f"Fetching Anime Information... ID: {anime_id}")

response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    anime = data['data']
    
    print("\nSuccess!")
    print(f"Titile: {anime['title']}")
    print(f"English Title: {anime['title_english']}")
    print(f"Score: {anime['score']}")
    print(f"Type: {anime['type']}")
    print(f"Episodes: {anime['episodes']}")
else:
    print(f"Error! Status: {response.status_code}")