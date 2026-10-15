import urllib.request
import urllib.parse
import json
import re
import os
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor

BLOGGER_FEED_URL = "https://emrepelit7337.blogspot.com/feeds/posts/default"
SITE_SYNC_ENDPOINT = "https://sci-phil.ai.studio/api/sync-blog"
SITE_ARTICLES_ENDPOINT = "https://sci-phil.ai.studio/api/articles"
STATE_FILE = ".last_sync_state.json"
PAGE_SIZE = 150


def clean_and_filter_html(html_content):
    """
    Süzgeç İşlevi:
    1. Gereksiz inline stil ve script etiketlerini temizler.
    2. KaTeX matematiksel formüllerini korur.
    3. Temiz semantik HTML yapısına dönüştürür.
    """
    if not html_content:
        return ""
    cleaned = re.sub(r'style="[^"]*"', '', html_content, flags=re.IGNORECASE)
    cleaned = re.sub(r'<script[^>]*>.*?</script>', '', cleaned, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r'<font[^>]*>(.*?)</font>', r'\1', cleaned, flags=re.DOTALL | re.IGNORECASE)
    return cleaned.strip()


def is_turkish_content(title, content):
    """
    Yalnızca Türkçe yazıları süzen kontrol mekanizması
    """
    full_text = f" {title} {content} ".lower()
    tr_keywords = ["ve", "bir", "bu", "ile", "değil", "için", "üzerine", "evren", "zaman", "bilim", "felsefe"]
    matches = sum(1 for kw in tr_keywords if f" {kw} " in full_text)
    return matches >= 2


def load_last_sync_time():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f).get("last_sync_time")
        except Exception:
            return None
    return None


def save_last_sync_time(timestamp):
    try:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump({"last_sync_time": timestamp}, f)
    except Exception as e:
        print(f"Durum dosyası kaydedilemedi: {e}")


def fetch_feed_page(start_index=1, updated_min=None):
    params = {
        "alt": "json",
        "start-index": str(start_index),
        "max-results": str(PAGE_SIZE)
    }
    if updated_min:
        params["updated-min"] = updated_min

    url = f"{BLOGGER_FEED_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "SciPhil-FastSync/2.0"})
    with urllib.request.urlopen(req, timeout=12) as response:
        return json.loads(response.read().decode("utf-8"))


def parse_entries(entries):
    processed = []
    for entry in entries:
        title = entry.get("title", {}).get("$t", "")
        raw_content = entry.get("content", {}).get("$t") or entry.get("summary", {}).get("$t", "")
        published_date = entry.get("published", {}).get("$t", "")
        updated_date = entry.get("updated", {}).get("$t", published_date)

        links = entry.get("link", [])
        blogger_link = next((link["href"] for link in links if link.get("rel") == "alternate"), "")

        if not is_turkish_content(title, raw_content):
            continue

        filtered_content = clean_and_filter_html(raw_content)
        slug = blogger_link.split("/")[-1].replace(".html", "") if blogger_link else ""

        processed.append({
            "title": title,
            "slug": slug,
            "content": filtered_content,
            "published_at": published_date,
            "updated_at": updated_date,
            "source_url": blogger_link,
            "language": "tr"
        })
    return processed


def sync_blogger_to_sciphil(force_full=False):
    last_sync = None if force_full else load_last_sync_time()
    now_iso = datetime.now(timezone.utc).isoformat()

    first_data = fetch_feed_page(start_index=1, updated_min=last_sync)
    feed = first_data.get("feed", {})
    entries = feed.get("entry", [])
    total_results = int(feed.get("openSearch$totalResults", {}).get("$t", len(entries)))

    all_entries = list(entries)

    if not last_sync and total_results > len(entries) and len(entries) == PAGE_SIZE:
        start_indices = list(range(PAGE_SIZE + 1, min(total_results + 1, PAGE_SIZE * 10), PAGE_SIZE))
        with ThreadPoolExecutor(max_workers=6) as executor:
            futures = [executor.submit(fetch_feed_page, idx, None) for idx in start_indices]
            for future in futures:
                try:
                    page_data = future.result()
                    all_entries.extend(page_data.get("feed", {}).get("entry", []))
                except Exception as err:
                    print(f"Sayfa çekme hatası: {err}")

    processed_articles = parse_entries(all_entries)
    save_last_sync_time(now_iso)

    print(f"Süzgeçten geçen yeni/güncel Türkçe yazı sayısı: {len(processed_articles)}")
    return processed_articles


def trigger_live_server_sync():
    try:
        req = urllib.request.Request(
            SITE_SYNC_ENDPOINT,
            data=b"{}",
            headers={"Content-Type": "application/json", "User-Agent": "SciPhil-FastSync/2.0"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=15) as res:
            print(f"Canlı sunucu senkronizasyonu tamamlandı (HTTP {res.status}).")
    except Exception as e:
        print(f"Canlı sunucu tetikleme uyarısı: {e}")


if __name__ == "__main__":
    articles = sync_blogger_to_sciphil()
    trigger_live_server_sync()