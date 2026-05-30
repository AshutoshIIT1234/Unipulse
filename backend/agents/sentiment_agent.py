from collections import defaultdict
import scraper
import sentiment as sa

class SentimentAgent:
    def __init__(self):
        self.name = "Sentiment Analysis Agent"
        self.description = "Analyzes Reddit sentiment for IITs and provides insights"

    def analyze_all_iits(self) -> dict:
        results = {}
        for iit_key in scraper.IIT_SUBREDDITS.keys():
            posts = scraper.scrape_iit(iit_key, limit=50)
            analyzed = sa.analyze_posts(posts)
            
            scores = [p["compound"] for p in analyzed]
            category_scores = defaultdict(list)
            for p in analyzed:
                category_scores[p["category"]].append(p["compound"])
            
            results[iit_key] = {
                "overall_score": sum(scores) / len(scores) if scores else 0,
                "post_count": len(analyzed),
                "categories": {
                    cat: sum(vals) / len(vals) for cat, vals in category_scores.items()
                },
                "top_posts": sorted(analyzed, key=lambda x: x["score"], reverse=True)[:3]
            }
        return results

    def get_iit_report(self, iit_key: str) -> dict:
        posts = scraper.scrape_iit(iit_key.upper(), limit=100)
        analyzed = sa.analyze_posts(posts)
        
        category_data = defaultdict(lambda: {"scores": [], "posts": 0})
        for p in analyzed:
            category_data[p["category"]]["scores"].append(p["compound"])
            category_data[p["category"]]["posts"] += 1

        return {
            "iit": iit_key.upper(),
            "summary": {
                "total_posts": len(analyzed),
                "avg_sentiment": sum(p["compound"] for p in analyzed) / len(analyzed) if analyzed else 0,
                "positive_count": sum(1 for p in analyzed if p["label"] == "positive"),
                "negative_count": sum(1 for p in analyzed if p["label"] == "negative"),
                "neutral_count": sum(1 for p in analyzed if p["label"] == "neutral"),
            },
            "categories": {
                cat: {
                    "avg_score": sum(d["scores"]) / len(d["scores"]),
                    "post_count": d["posts"]
                }
                for cat, d in category_data.items()
            },
            "insights": self._generate_insights(category_data, analyzed)
        }

    def _generate_insights(self, category_data: dict, posts: list) -> list:
        insights = []
        
        sorted_cats = sorted(
            [(cat, sum(d["scores"]) / len(d["scores"])) for cat, d in category_data.items() if d["scores"]],
            key=lambda x: x[1],
            reverse=True
        )
        
        if sorted_cats:
            best_cat = sorted_cats[0]
            insights.append(f"{best_cat[0]} has the highest sentiment ({round(best_cat[1], 2)})")
            
            worst_cat = sorted_cats[-1]
            insights.append(f"{worst_cat[0]} needs attention ({round(worst_cat[1], 2)})")
        
        high_score_posts = [p for p in posts if p["score"] > 100]
        if high_score_posts:
            insights.append(f"{len(high_score_posts)} posts have high engagement (>100 score)")
        
        return insights

    def compare_iits(self, iit_list: list = None) -> dict:
        if iit_list is None:
            iit_list = list(scraper.IIT_SUBREDDITS.keys())
        
        comparison = {}
        for iit_key in iit_list:
            posts = scraper.scrape_iit(iit_key, limit=50)
            analyzed = sa.analyze_posts(posts)
            if analyzed:
                scores = [p["compound"] for p in analyzed]
                comparison[iit_key] = {
                    "score": round((sum(scores) / len(scores) + 1) / 2 * 100),
                    "posts": len(analyzed),
                    "rank": 0
                }
        
        sorted_iits = sorted(comparison.items(), key=lambda x: x[1]["score"], reverse=True)
        for rank, (iit, data) in enumerate(sorted_iits, 1):
            comparison[iit]["rank"] = rank
        
        return comparison