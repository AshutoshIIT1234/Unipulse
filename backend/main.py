from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, engine
from scheduler import scheduler  # auto-starts on import
import models, scraper, sentiment as sa

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="UniPulse AI API")

app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"], allow_headers=["*"])

@app.get("/api/sentiment/{iit_key}")
def get_sentiment(iit_key: str, db: Session = Depends(get_db)):
    posts_raw = scraper.scrape_iit(iit_key.upper(), limit=80)
    posts_analyzed = sa.analyze_posts(posts_raw)

    # Aggregate by category
    from collections import defaultdict
    cat_data = defaultdict(lambda: {"scores": [], "posts": 0})
    for p in posts_analyzed:
        cat_data[p["category"]]["scores"].append(p["compound"])
        cat_data[p["category"]]["posts"] += 1

    categories = []
    for cat, data in cat_data.items():
        avg = sum(data["scores"]) / len(data["scores"])
        # Normalize -1..1 → 0..100
        normalized = round((avg + 1) / 2 * 100)
        categories.append({
            "name": cat, "score": normalized,
            "posts": data["posts"]
        })

    total_scores = [p["compound"] for p in posts_analyzed]
    overall = round((sum(total_scores)/len(total_scores) + 1) / 2 * 100) if total_scores else 50

    return {
        "iit":        iit_key.upper(),
        "overall":    overall,
        "total_posts": len(posts_analyzed),
        "categories": categories,
        "top_posts":  posts_analyzed[:5],
    }

@app.get("/api/compare")
def compare_all(db: Session = Depends(get_db)):
    results = []
    for iit_key in scraper.IIT_SUBREDDITS.keys():
        posts = scraper.scrape_iit(iit_key, limit=30)
        analyzed = sa.analyze_posts(posts)
        if analyzed:
            avg = sum(p["compound"] for p in analyzed) / len(analyzed)
            results.append({
                "iit": iit_key,
                "score": round((avg + 1) / 2 * 100),
                "posts": len(analyzed)
            })
    return sorted(results, key=lambda x: x["score"], reverse=True)h
