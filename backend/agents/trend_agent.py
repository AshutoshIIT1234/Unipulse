from collections import defaultdict
from datetime import datetime, timedelta
import scraper
import sentiment as sa

class TrendAgent:
    def __init__(self):
        self.name = "Trend Monitoring Agent"
        self.description = "Monitors sentiment trends across IITs and categories"

    def get_current_trends(self) -> dict:
        trends = {}
        for iit_key in scraper.IIT_SUBREDDITS.keys():
            posts = scraper.scrape_iit(iit_key, limit=100)
            analyzed = sa.analyze_posts(posts)
            
            category_scores = defaultdict(list)
            for p in analyzed:
                category_scores[p["category"]].append(p["compound"])
            
            trends[iit_key] = {
                "overall": sum(p["compound"] for p in analyzed) / len(analyzed) if analyzed else 0,
                "categories": {cat: sum(vals) / len(vals) for cat, vals in category_scores.items()},
                "engagement": sum(p["score"] for p in analyzed) / len(analyzed) if analyzed else 0,
                "hot_topics": self._extract_hot_topics(analyzed)
            }
        
        return trends

    def _extract_hot_topics(self, posts: list) -> list:
        topic_scores = defaultdict(lambda: {"total": 0, "count": 0})
        
        keywords = ["placement", "exam", "hostel", "fest", "research", "professor", "cutoff", "rank"]
        for post in posts:
            text = (post.get("title", "") + " " + post.get("body", "")).lower()
            for kw in keywords:
                if kw in text:
                    topic_scores[kw]["total"] += post.get("compound", 0)
                    topic_scores[kw]["count"] += 1
        
        sorted_topics = sorted(
            [(kw, data["total"] / data["count"]) for kw, data in topic_scores.items() if data["count"] > 0],
            key=lambda x: x[1],
            reverse=True
        )
        
        return [{"topic": t, "sentiment": s} for t, s in sorted_topics[:5]]

    def detect_anomalies(self) -> list:
        anomalies = []
        trends = self.get_current_trends()
        
        all_scores = [info["overall"] for info in trends.values()]
        avg = sum(all_scores) / len(all_scores) if all_scores else 0
        
        for iit, info in trends.items():
            deviation = abs(info["overall"] - avg)
            if deviation > 0.3:
                anomalies.append({
                    "iit": iit,
                    "type": "sentiment_spike" if info["overall"] > avg else "sentiment_drop",
                    "severity": "high" if deviation > 0.5 else "medium",
                    "details": f"Sentiment deviation: {round(deviation, 2)} from average"
                })
        
        for iit, info in trends.items():
            for cat, score in info.get("categories", {}).items():
                if score < -0.5:
                    anomalies.append({
                        "iit": iit,
                        "type": "negative_category",
                        "category": cat,
                        "severity": "high",
                        "details": f"{cat} has strongly negative sentiment ({round(score, 2)})"
                    })
        
        return anomalies

    def get_weekly_summary(self) -> dict:
        trends = self.get_current_trends()
        
        sorted_by_score = sorted(trends.items(), key=lambda x: x[1]["overall"], reverse=True)
        
        summary = {
            "top_performer": sorted_by_score[0] if sorted_by_score else None,
            "needs_attention": sorted_by_score[-1] if len(sorted_by_score) > 1 else None,
            "rankings": [
                {"iit": iit, "score": round(info["overall"], 2), "rank": rank + 1}
                for rank, (iit, info) in enumerate(sorted_by_score)
            ],
            "anomalies": self.detect_anomalies(),
            "generated_at": datetime.now().isoformat()
        }
        
        return summary

    def compare_categories(self) -> dict:
        all_categories = set()
        category_data = defaultdict(lambda: {"scores": [], "iits": set()})
        
        for iit_key in scraper.IIT_SUBREDDITS.keys():
            posts = scraper.scrape_iit(iit_key, limit=50)
            analyzed = sa.analyze_posts(posts)
            
            for p in analyzed:
                cat = p["category"]
                all_categories.add(cat)
                category_data[cat]["scores"].append(p["compound"])
                category_data[cat]["iits"].add(iit_key)
        
        return {
            cat: {
                "avg_sentiment": round(sum(data["scores"]) / len(data["scores"]), 3) if data["scores"] else 0,
                "post_count": len(data["scores"]),
                "iit_count": len(data["iits"])
            }
            for cat, data in category_data.items()
        }