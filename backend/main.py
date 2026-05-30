from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, engine
from scheduler import scheduler
import models, scraper, sentiment as sa
from agents.agent_runner import AgentRunner
from typing import Optional, List

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="UniPulse AI API")

app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_methods=["*"], allow_headers=["*"])

agent_runner = AgentRunner()

@app.get("/api/sentiment/{iit_key}")
def get_sentiment(iit_key: str, db: Session = Depends(get_db)):
    posts_raw = scraper.scrape_iit(iit_key.upper(), limit=80)
    posts_analyzed = sa.analyze_posts(posts_raw)

    from collections import defaultdict
    cat_data = defaultdict(lambda: {"scores": [], "posts": 0})
    for p in posts_analyzed:
        cat_data[p["category"]]["scores"].append(p["compound"])
        cat_data[p["category"]]["posts"] += 1

    categories = []
    for cat, data in cat_data.items():
        avg = sum(data["scores"]) / len(data["scores"])
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
    return sorted(results, key=lambda x: x["score"], reverse=True)

@app.get("/api/chatbot")
def chat(question: str, iit_key: str = None):
    from rag_chatbot import rag_system, index_iit_data
    index_iit_data(iit_key)
    result = rag_system.query(question, top_k=5)
    answer = rag_system.build_answer(question, result["sources"])
    return {"answer": answer, "sources": result["sources"]}

@app.get("/api/chatbot/index")
def index_data(iit_key: str = None):
    from rag_chatbot import index_iit_data
    count = index_iit_data(iit_key)
    return {"indexed_posts": count, "message": "Data indexed successfully"}

@app.get("/api/agents")
def list_agents():
    return {"agents": agent_runner.list_agents()}

@app.get("/api/agents/run/{agent_name}")
def run_agent(agent_name: str, action: str = None, iit_key: str = None, iit_list: str = None):
    kwargs = {}
    if iit_key:
        kwargs["iit_key"] = iit_key
    if iit_list:
        kwargs["iit_list"] = iit_list.split(",")
    return agent_runner.run_agent(agent_name, action, **kwargs)

@app.get("/api/agents/insights")
def run_all_insights():
    return agent_runner.run_all_insights()

@app.get("/api/trends")
def get_trends():
    return agent_runner.run_agent("trend", "get_current_trends")

@app.get("/api/trends/anomalies")
def get_anomalies():
    return {"anomalies": agent_runner.run_agent("trend", "detect_anomalies")}

@app.get("/api/trends/weekly")
def get_weekly_summary():
    return agent_runner.run_agent("trend", "get_weekly_summary")

@app.get("/api/trends/categories")
def compare_categories():
    return {"categories": agent_runner.run_agent("trend", "compare_categories")}

@app.get("/api/improvements")
def get_improvements():
    return agent_runner.run_agent("improvement", "generate_report")

@app.get("/api/sentiment/report/{iit_key}")
def get_iit_report(iit_key: str):
    return agent_runner.run_agent("sentiment", "get_iit_report", iit_key=iit_key)

@app.get("/api/sentiment/compare")
def compare_iits(iit_list: str = None):
    iits = iit_list.split(",") if iit_list else None
    return agent_runner.run_agent("sentiment", "compare_iits", iit_list=iits)