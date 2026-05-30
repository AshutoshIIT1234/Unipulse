from collections import defaultdict
from .sentiment_agent import SentimentAgent
import scraper
import sentiment as sa

class ImprovementAgent:
    def __init__(self):
        self.name = "Website Improvement Agent"
        self.description = "Suggests improvements for UniPulse based on sentiment data"

    def generate_recommendations(self) -> dict:
        sentiment_agent = SentimentAgent()
        all_data = sentiment_agent.analyze_all_iits()
        
        recommendations = {
            "content": self._content_recommendations(all_data),
            "features": self._feature_recommendations(all_data),
            "ux": self._ux_recommendations(all_data),
            "engagement": self._engagement_recommendations(all_data)
        }
        
        return recommendations

    def _content_recommendations(self, data: dict) -> list:
        recommendations = []
        
        category_interest = defaultdict(list)
        for iit, info in data.items():
            for cat, score in info.get("categories", {}).items():
                category_interest[cat].append((iit, score))
        
        sorted_cats = sorted(
            category_interest.items(),
            key=lambda x: sum(s for _, s in x[1]) / len(x[1]) if x[1] else 0,
            reverse=True
        )
        
        if sorted_cats:
            top_cats = sorted_cats[:3]
            recommendations.append({
                "type": "content_focus",
                "priority": "high",
                "message": f"Focus more content on: {', '.join(cat for cat, _ in top_cats)}",
                "reason": "These categories have highest engagement"
            })
        
        low_cats = sorted_cats[-2:]
        for cat, scores in low_cats:
            if scores and sum(s for _, s in scores) / len(scores) < 0:
                recommendations.append({
                    "type": "content_improvement",
                    "priority": "medium",
                    "message": f"Improve {cat} content - currently negative sentiment",
                    "reason": "Users express negative sentiment in this category"
                })
        
        return recommendations

    def _feature_recommendations(self, data: dict) -> list:
        recommendations = []
        
        total_posts = sum(info["post_count"] for info in data.values())
        if total_posts > 500:
            recommendations.append({
                "type": "feature",
                "priority": "high",
                "message": "Add trend visualization over time",
                "reason": f"You have {total_posts} posts - trends would provide value"
            })
        
        high_engagement_iits = [
            iit for iit, info in data.items() 
            if any(p["score"] > 50 for p in info.get("top_posts", []))
        ]
        if len(high_engagement_iits) > 3:
            recommendations.append({
                "type": "feature",
                "priority": "medium",
                "message": "Implement real-time notifications for high-engagement IITs",
                "reason": "Multiple IITs show high engagement patterns"
            })
        
        return recommendations

    def _ux_recommendations(self, data: dict) -> list:
        recommendations = []
        
        all_categories = set()
        for info in data.values():
            all_categories.update(info.get("categories", {}).keys())
        
        if len(all_categories) > 5:
            recommendations.append({
                "type": "ux",
                "priority": "low",
                "message": "Add category filtering shortcuts",
                "reason": "Many categories detected - quick filters improve UX"
            })
        
        return recommendations

    def _engagement_recommendations(self, data: dict) -> list:
        recommendations = []
        
        avg_scores = {iit: info["overall_score"] for iit, info in data.items()}
        top_iit = max(avg_scores.items(), key=lambda x: x[1])
        bottom_iit = min(avg_scores.items(), key=lambda x: x[1])
        
        recommendations.append({
            "type": "engagement",
            "priority": "high",
            "message": f"Highlight {top_iit[0]} as success story - highest sentiment",
            "reason": f"Score: {round(top_iit[1], 2)}"
        })
        
        recommendations.append({
            "type": "engagement", 
            "priority": "medium",
            "message": f"Investigate issues at {bottom_iit[0]} - lowest sentiment",
            "reason": f"Score: {round(bottom_iit[1], 2)}"
        })
        
        return recommendations

    def generate_report(self) -> dict:
        recommendations = self.generate_recommendations()
        
        return {
            "summary": self._summarize_recommendations(recommendations),
            "recommendations": recommendations,
            "action_items": self._prioritized_action_items(recommendations)
        }

    def _summarize_recommendations(self, recommendations: dict) -> str:
        total = sum(len(v) for v in recommendations.values())
        high_priority = sum(1 for cats in recommendations.values() for r in cats if r.get("priority") == "high")
        
        return f"Found {total} recommendations ({high_priority} high priority) based on sentiment analysis"

    def _prioritized_action_items(self, recommendations: dict) -> list:
        items = []
        for category, recs in recommendations.items():
            for rec in recs:
                if rec.get("priority") == "high":
                    items.append({
                        "category": category,
                        "action": rec["message"],
                        "reason": rec["reason"]
                    })
        return items