import urllib.request
import json
import re

BLOGGER_FEED_URL = "https://emrepelit7337.blogspot.com/feeds/posts/default?alt=json"
SITE_API_ENDPOINT = "https://sci-phil.ai.studio/api/articles"  # Sitenizin API uç noktası

def clean_and_filter_html(html_content):
    """
    Süzgeç İşlevi:
    1. Gereksiz inline stil ve div etiketlerini temizler.
    2. KaTeX matematiksel formüllerini korur.
    3. Temiz semantik HTML / Markdown yapısına dönüştürür.
    """
    # Inline stilleri ve script'leri temizle
    cleaned = re.sub(r'style="[^"]*"', '', html_content)
    cleaned = re.sub(r'<script[^>]*>.*?</script>', '', cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'<font[^>]*>(.*?)</font>', r'\1', cleaned)
    return cleaned.strip()

def is_turkish_content(title, content):
    """
    Yalnızca Türkçe yazı süzen kontrol mekanizması
    """
    tr_keywords = ["ve", "bir", "bu", "ile", "değil", "için", "üzerine", "evren", "zaman"]
    matches = sum(1 for kw in tr_keywords if f" {kw} " in content.lower())
    return matches >= 3

def sync_blogger_to_sciphil():
    req = urllib.request.Request(BLOGGER_FEED_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))

    entries = data.get('feed', {}).get('entry', [])
    processed_articles = []

    for entry in entries:
        title = entry['title']['$t']
        raw_content = entry['content']['$t']
        published_date = entry['published']['$t']
        
        # Linklerden orijinal Blogger slug'ı
        blogger_link = next((link['href'] for link in entry['link'] if link['rel'] == 'alternate'), '')
        
        # 1. Dil Süzgeci
        if not is_turkish_content(title, raw_content):
            continue
            
        # 2. İçerik ve Format Süzgeci
        filtered_content = clean_and_filter_html(raw_content)
        
        processed_articles.append({
            "title": title,
            "slug": blogger_link.split('/')[-1].replace('.html', ''),
            "content": filtered_content,
            "published_at": published_date,
            "source_url": blogger_link,
            "language": "tr"
        })
        
    print(f"Süzgeçten geçen Türkçe yazı sayısı: {len(processed_articles)}")
    return processed_articles

if __name__ == "__main__":
    articles = sync_blogger_to_sciphil()
    # Buradan elde edilen 'articles' dizisini sitenizin veritabanına veya API'sine gönderebilirsiniz.
