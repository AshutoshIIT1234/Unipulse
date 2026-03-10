from apscheduler.schedulers.background import BackgroundScheduler
from scraper import scrape_iit, IIT_SUBREDDITS
from sentiment import analyze_posts

def refresh_all_iits():
    print("🔄 Refreshing all IIT data...")
    for iit_key in IIT_SUBREDDITS:
        posts = scrape_iit(iit_key, limit=50)
        analyzed = analyze_posts(posts)
        # Save to DB here
        print(f"  ✅ {iit_key}: {len(analyzed)} posts processed")

scheduler = BackgroundScheduler()
scheduler.add_job(refresh_all_iits, "interval", hours=6)
scheduler.start()