import os
import numpy as np
from sentence_transformers import SentenceTransformer
from datetime import datetime

class SentimentRAG:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.index = None
        self.documents = []
        self.metadata = []

    def index_posts(self, posts_data):
        self.documents = []
        self.metadata = []

        seen_docs = set()
        for post in posts_data:
            doc_content = f"{post.get('title', '')} {post.get('body', '')}".strip()
            if not doc_content or doc_content.lower() in seen_docs:
                continue
            seen_docs.add(doc_content.lower())

            doc = f"{post.get('title', '')} {post.get('body', '')} Category: {post.get('category', 'General')} IIT: {post.get('iit', 'Unknown')} Score: {post.get('compound', 0)} Sentiment: {post.get('label', 'neutral')}"
            self.documents.append(doc)
            self.metadata.append({
                "title": post.get("title", ""),
                "iit": post.get("iit", ""),
                "category": post.get("category", "General"),
                "compound": post.get("compound", 0),
                "label": post.get("label", "neutral")
            })

        if not self.documents:
            return

        embeddings = self.model.encode(self.documents)
        dim = embeddings.shape[1]

        try:
            import faiss
            self.index = faiss.IndexFlatL2(dim)
            self.index.add(embeddings.astype(np.float32))
        except ImportError:
            self.index = embeddings

    def query(self, question: str, top_k: int = 5) -> dict:
        if not self.documents or self.index is None:
            return {"answer": "No data indexed. Please scrape some IIT data first.", "sources": []}

        question_embedding = self.model.encode([question])
        
        try:
            import faiss
            distances, indices = self.index.search(question_embedding.astype(np.float32), top_k)
            indices = indices[0]
            distances = distances[0]
        except:
            cos_sim = np.dot(self.index, question_embedding.T).flatten()
            top_k_idx = np.argsort(cos_sim)[-top_k:][::-1]
            indices = top_k_idx
            distances = [1 - cos_sim[i] for i in top_k_idx]

        sources = []
        for i, idx in enumerate(indices):
            if idx < len(self.metadata):
                sources.append({
                    "text": self.documents[idx][:300],
                    "iit": self.metadata[idx].get("iit", ""),
                    "category": self.metadata[idx].get("category", ""),
                    "score": self.metadata[idx].get("compound", 0),
                    "label": self.metadata[idx].get("label", ""),
                    "distance": float(distances[i]) if i < len(distances) else 0
                })

        return {"sources": sources}

    def build_answer(self, question: str, sources: list) -> str:
        if not sources:
            return "I don't have enough information to answer that question."

        # 1. Deduplicate sources based on the text snippet content
        unique_sources = []
        seen_texts = set()
        for s in sources:
            text_norm = s["text"].strip().lower()
            snippet = text_norm[:150]
            if snippet not in seen_texts:
                seen_texts.add(snippet)
                unique_sources.append(s)

        if not unique_sources:
            return "No unique information found to construct a reliable answer."

        # 2. Analyze question intent
        question_lower = question.lower()

        # Detect category of interest
        matched_category = None
        category_keywords = {
            "Placements": ["placement", "job", "internship", "package", "salary", "recruit", "ppo", "lpa", "career"],
            "Academics": ["academic", "exam", "course", "professor", "grading", "study", "lecture", "cgpa", "quiz", "endsem", "midsem"],
            "Hostel Life": ["hostel", "mess", "food", "canteen", "room", "warden", "maggi", "curfew", "bathroom", "solar"],
            "Fests & Culture": ["fest", "culture", "event", "mood indigo", "spring fest", "club", "concert", "selections", "orientation"],
            "Mental Health": ["stress", "anxiety", "mental", "depression", "counsel", "burnout", "loneliness"],
            "Administration": ["admin", "dean", "fee", "policy", "registration", "bureaucracy", "hike", "senate"],
            "Infrastructure": ["wifi", "internet", "library", "sport", "gym", "lab", "cluster", "gpu", "building", "complex"]
        }

        for cat, keywords in category_keywords.items():
            if any(kw in question_lower for kw in keywords):
                matched_category = cat
                break

        # Detect specific IITs mentioned in the question
        iit_names = ["IITB", "IITM", "IITP", "IITD", "IITKgp", "IITBHU", "IITG"]
        mentioned_iits = [iit for iit in iit_names if iit.lower() in question_lower]

        # 3. Aggregate stats from retrieved unique sources
        iit_stats = {}
        category_stats = {}
        pos_aspects = []
        neg_aspects = []

        for s in unique_sources:
            iit = s["iit"]
            cat = s["category"]
            score = s["score"]
            label = s["label"]
            text = s["text"]

            # IIT Stats
            if iit not in iit_stats:
                iit_stats[iit] = {"scores": [], "pos_count": 0, "neg_count": 0, "texts": []}
            iit_stats[iit]["scores"].append(score)
            iit_stats[iit]["texts"].append(text)
            if label == "positive" or score > 0.2:
                iit_stats[iit]["pos_count"] += 1
            elif label == "negative" or score < -0.2:
                iit_stats[iit]["neg_count"] += 1

            # Category Stats
            if cat not in category_stats:
                category_stats[cat] = {"scores": [], "count": 0}
            category_stats[cat]["scores"].append(score)
            category_stats[cat]["count"] += 1

            # Clean suffix elements from snippets
            clean_text = text
            for suffix_indicator in ["Category:", "IIT:", "Score:", "Sentiment:"]:
                if suffix_indicator in clean_text:
                    clean_text = clean_text.split(suffix_indicator)[0].strip()

            # Grab complete sentences for pros/cons extraction
            sentences = [sent.strip() for sent in clean_text.split('.') if len(sent.strip()) > 15]
            for sent in sentences:
                sent_clean = sent.replace("...", "").strip()
                if not sent_clean:
                    continue
                sent_lower = sent_clean.lower()
                if any(k in sent_lower for k in ["category:", "score:", "iit:", "sentiment:"]):
                    continue
                if score > 0.2:
                    if any(w in sent_lower for w in ["good", "great", "excellent", "amazing", "incredible", "best", "happy", "love", "resolved", "smooth", "top", "up", "pushed", "increase", "successful"]):
                        pos_aspects.append((iit, cat, sent_clean))
                elif score < -0.2:
                    if any(w in sent_lower for w in ["bad", "worst", "disgusting", "terrible", "harsh", "brutal", "stress", "annoy", "slow", "fail", "protest", "fewer", "recession", "overwhelmed"]):
                        neg_aspects.append((iit, cat, sent_clean))

        # Deduplicate aspect sentences
        unique_pos_aspects = []
        seen_pos = set()
        for iit, cat, aspect in pos_aspects:
            if aspect.lower() not in seen_pos:
                seen_pos.add(aspect.lower())
                unique_pos_aspects.append((iit, cat, aspect))

        unique_neg_aspects = []
        seen_neg = set()
        for iit, cat, aspect in neg_aspects:
            if aspect.lower() not in seen_neg:
                seen_neg.add(aspect.lower())
                unique_neg_aspects.append((iit, cat, aspect))

        # 4. Formulate the response sections
        topic_header = f"**{matched_category}**" if matched_category else "General Topics"
        
        # Title & Summary Intro
        answer = f"### 📊 UniPulse Analysis for your query: *\"{question}\"*\n\n"
        
        all_retrieved_scores = [s["score"] for s in unique_sources]
        avg_overall_sentiment = sum(all_retrieved_scores) / len(all_retrieved_scores) if all_retrieved_scores else 0
        sentiment_word = "highly positive" if avg_overall_sentiment > 0.4 else "positive" if avg_overall_sentiment > 0.1 else "neutral/mixed" if avg_overall_sentiment >= -0.1 else "negative"
        sentiment_emoji = "🟢" if avg_overall_sentiment > 0.1 else "🟡" if avg_overall_sentiment >= -0.1 else "🔴"
        
        answer += f"Based on our indexed Reddit sentiment data concerning {topic_header}, the overall matched sentiment is **{sentiment_word}** ({sentiment_emoji} average score: **{avg_overall_sentiment:.2f}**).\n\n"

        # Winner/Ranking synthesis if comparing or seeking "best" or "worst"
        is_comparative = any(w in question_lower for w in ["best", "worst", "better", "compare", "highest", "lowest", "rank", "top", "leader"])
        
        if is_comparative and iit_stats:
            answer += "#### 🏆 Sentiment Rankings & Comparison\n"
            iit_rankings = []
            for iit, stats in iit_stats.items():
                avg_iit_score = sum(stats["scores"]) / len(stats["scores"])
                iit_rankings.append((iit, avg_iit_score, stats["pos_count"], stats["neg_count"]))
            
            iit_rankings.sort(key=lambda x: x[1], reverse=True)
            
            best_iit, best_score, best_pos, best_neg = iit_rankings[0]
            answer += f"🥇 **{best_iit}** emerges as the leader in sentiment for this query, boasting a highly favorable average sentiment of **+{best_score:.2f}** (with {best_pos} positive mentions).\n"
            
            if len(iit_rankings) > 1:
                worst_iit, worst_score, worst_pos, worst_neg = iit_rankings[-1]
                answer += f"⚠️ In contrast, **{worst_iit}** sits at the lower end of the sentiment spectrum for these matches, averaging **{worst_score:.2f}** (with {worst_neg} concerned mentions).\n\n"
                
                # Add a mini comparison table
                answer += "| Rank | IIT | Avg Sentiment Score | Sentiment Profile |\n"
                answer += "| :--- | :--- | :---: | :--- |\n"
                for idx, (iit, avg_score, p_c, n_c) in enumerate(iit_rankings, 1):
                    profile = "🟢 Positive" if avg_score > 0.1 else "🟡 Mixed" if avg_score >= -0.1 else "🔴 Concerned"
                    answer += f"| #{idx} | **{iit}** | `{avg_score:+.2f}` | {profile} ({p_c} Positive / {n_c} Concerned) |\n"
                answer += "\n"
            else:
                answer += "\n"
        elif mentioned_iits and iit_stats:
            answer += "#### 🔍 IIT-Specific Sentiment Deep Dive\n"
            for iit in mentioned_iits:
                if iit in iit_stats:
                    avg_iit_score = sum(iit_stats[iit]["scores"]) / len(iit_stats[iit]["scores"])
                    profile = "mostly positive" if avg_iit_score > 0.2 else "concerned/negative" if avg_iit_score < -0.2 else "balanced/neutral"
                    answer += f"- **{iit}**: Displays a **{profile}** sentiment score of `{avg_iit_score:+.2f}` across matched discussions.\n"
            answer += "\n"

        # 5. Core Insights (Positive / Negative points)
        if unique_pos_aspects or unique_neg_aspects:
            answer += "#### 📢 Key Insights Extracted from Reddit Discussions\n"
            
            if unique_pos_aspects:
                answer += "**🎉 Positive Highlights:**\n"
                for iit, cat, aspect in unique_pos_aspects[:3]:
                    answer += f"- *[{iit} - {cat}]*: \"{aspect}\"\n"
                answer += "\n"
                
            if unique_neg_aspects:
                answer += "**⚠️ Key Concerns & Pain Points:**\n"
                for iit, cat, aspect in unique_neg_aspects[:3]:
                    answer += f"- *[{iit} - {cat}]*: \"{aspect}\"\n"
                answer += "\n"

        # 6. Top Unique Context Sources
        answer += "#### 📖 Top Unique Context Sources\n"
        context_parts = []
        for s in unique_sources[:3]:
            text_snippet = s['text']
            for suffix_indicator in ["Category:", "IIT:", "Score:", "Sentiment:"]:
                if suffix_indicator in text_snippet:
                    text_snippet = text_snippet.split(suffix_indicator)[0].strip()
            text_snippet = text_snippet[0].upper() + text_snippet[1:]
            context_parts.append(f"- **{s['iit']} ({s['category']})**: *\"{text_snippet[:180]}...\"* (Sentiment: `{s['score']:+.2f}`)")

        answer += "\n".join(context_parts) + "\n\n"
        answer += "*Note: Sentiment scores are computed locally using VADER analysis on live scraped Reddit posts. Higher scores indicate more favorable public sentiment.*"

        return answer

rag_system = SentimentRAG()

def index_iit_data(iit_key: str = None):
    import scraper, sentiment as sa
    
    all_posts = []
    iit_keys = [iit_key] if iit_key else list(scraper.IIT_SUBREDDITS.keys())
    
    for key in iit_keys:
        posts = scraper.scrape_iit(key, limit=50)
        analyzed = sa.analyze_posts(posts)
        all_posts.extend(analyzed)
    
    rag_system.index_posts(all_posts)
    return len(all_posts)