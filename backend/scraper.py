import praw
import os
from dotenv import load_dotenv

load_dotenv()

reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT")
)

IIT_SUBREDDITS = {
    "IITB":   "iitbombay",
    "IITM":   "iitmadras",
    "IITP":   "iitpatna",
    "IITD":   "iitdelhi",
    "IITKgp": "iitkgp",
    "IITBHU": "iitbhu",
    "IITG":   "iitguwahati",
}

CATEGORY_KEYWORDS = {
    "Academics":      ["exam", "professor", "course", "grade", "cgpa", "study", "lecture"],
    "Placements":     ["placement", "internship", "package", "company", "offer", "recruit"],
    "Hostel Life":    ["hostel", "mess", "food", "room", "warden", "dorm", "canteen"],
    "Fests & Culture":["fest", "cultural", "techfest", "mood indigo", "spring fest", "event"],
    "Mental Health":  ["stress", "anxiety", "depression", "counseling", "mental", "burnout"],
    "Administration": ["admin", "dean", "rule", "policy", "fee", "bureaucracy", "portal"],
    "Infrastructure": ["lab", "library", "wifi", "facility", "building", "campus", "gym"],
}

def categorize_post(text):
    text_lower = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return category
    return "General"

def scrape_iit(iit_key, limit=100):
    sub_name = IIT_SUBREDDITS.get(iit_key)
    if not sub_name:
        return []

    posts = []
    try:
        subreddit = reddit.subreddit(sub_name)
        for post in subreddit.hot(limit=limit):
            posts.append({
                "iit":       iit_key,
                "post_id":   post.id,
                "title":     post.title,
                "body":      post.selftext[:500],
                "score":     post.score,
                "comments":  post.num_comments,
                "created":   post.created_utc,
                "category":  categorize_post(post.title + " " + post.selftext),
                "subreddit": sub_name,
            })
    except Exception as e:
        print(f"Error scraping {iit_key}: {e}")
    return posts