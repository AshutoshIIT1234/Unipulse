from .sentiment_agent import SentimentAgent
from .improvement_agent import ImprovementAgent
from .trend_agent import TrendAgent
import json

class AgentRunner:
    def __init__(self):
        self.agents = {
            "sentiment": SentimentAgent(),
            "improvement": ImprovementAgent(),
            "trend": TrendAgent()
        }

    def list_agents(self):
        return [
            {"name": agent.name, "description": agent.description}
            for agent in self.agents.values()
        ]

    def run_agent(self, agent_name: str, action: str = None, **kwargs):
        agent = self.agents.get(agent_name)
        if not agent:
            return {"error": f"Unknown agent: {agent_name}"}
        
        if action == "analyze_all_iits" or action is None:
            if hasattr(agent, "analyze_all_iits"):
                return agent.analyze_all_iits()
        
        if action == "get_iit_report" and hasattr(agent, "get_iit_report"):
            return agent.get_iit_report(kwargs.get("iit_key", "IITB"))
        
        if action == "generate_recommendations" or action == "generate_report":
            if hasattr(agent, "generate_report"):
                return agent.generate_report()
            if hasattr(agent, "generate_recommendations"):
                return agent.generate_recommendations()
        
        if action == "get_current_trends" or action == "get_weekly_summary":
            if hasattr(agent, "get_weekly_summary"):
                return agent.get_weekly_summary()
            if hasattr(agent, "get_current_trends"):
                return agent.get_current_trends()
        
        if action == "detect_anomalies" and hasattr(agent, "detect_anomalies"):
            return agent.detect_anomalies()
        
        if action == "compare_categories" and hasattr(agent, "compare_categories"):
            return agent.compare_categories()
        
        if action == "compare_iits" and hasattr(agent, "compare_iits"):
            return agent.compare_iits(kwargs.get("iit_list"))
        
        return {"error": f"Unknown action: {action}"}

    def run_all_insights(self):
        return {
            "sentiment_analysis": self.run_agent("sentiment", "analyze_all_iits"),
            "improvement_recommendations": self.run_agent("improvement", "generate_report"),
            "trend_analysis": self.run_agent("trend", "get_weekly_summary")
        }

def main():
    runner = AgentRunner()
    
    print("=" * 50)
    print("UniPulse AI Agents")
    print("=" * 50)
    print("\nAvailable agents:")
    for agent in runner.list_agents():
        print(f"  - {agent['name']}: {agent['description']}")
    
    print("\n" + "=" * 50)
    print("Running all insights...")
    print("=" * 50)
    
    results = runner.run_all_insights()
    
    print("\n[SENTIMENT ANALYSIS]")
    print(json.dumps(results["sentiment_analysis"], indent=2)[:1000])
    
    print("\n[IMPROVEMENT RECOMMENDATIONS]")
    recs = results["improvement_recommendations"]
    print(f"Summary: {recs.get('summary', 'N/A')}")
    print("\nAction Items:")
    for item in recs.get("action_items", [])[:5]:
        print(f"  - [{item['category']}] {item['action']}")
    
    print("\n[TREND ANALYSIS]")
    trends = results["trend_analysis"]
    top_perf = trends.get("top_performer")
    needs_att = trends.get("needs_attention")
    print(f"Top performer: {top_perf[0] if top_perf else 'N/A'}")
    print(f"Needs attention: {needs_att[0] if needs_att else 'N/A'}")
    print(f"Anomalies detected: {len(trends.get('anomalies', []))}")

if __name__ == "__main__":
    main()