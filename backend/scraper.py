import praw
import os
import random
import time
import re
from dotenv import load_dotenv

load_dotenv()

# Attempt to initialize reddit, but don't crash if it fails
try:
    reddit = praw.Reddit(
        client_id=os.getenv("REDDIT_CLIENT_ID"),
        client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
        user_agent=os.getenv("REDDIT_USER_AGENT")
    )
except Exception as e:
    print(f"Could not initialize Reddit API client: {e}. Mock mode will be used.")
    reddit = None

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

MOCK_TEMPLATES = [
    # Academics
    ("Academics", "The grading system this semester is absolutely brutal", "Half the class failed the midsem in CS. The professor is super harsh and refuses to give relative grading. I am really stressed about my CGPA.", "negative"),
    ("Academics", "CS101 lectures are actually amazing!", "The new professor explains concepts so well. The labs are interactive and highly engaging. Really enjoying this course so far!", "positive"),
    ("Academics", "Tips for managing study schedule for endsems?", "Having a hard time balancing daily quizzes and lab submissions. Any seniors have advice on how to study efficiently?", "neutral"),
    ("Academics", "Extremely tough research paper published by our lab", "Our team successfully published our deep learning research in a top tier conference! Incredible work by everyone involved.", "positive"),
    # Placements
    ("Placements", "Incredible placements this year! Average package is up", "So many top tier tech companies visited on Day 1. The average package has crossed 28 LPA for CS/EE. Feeling very happy and optimistic!", "positive"),
    ("Placements", "Recession hitting placements hard, very stressful time", "Fewer companies are hiring this season and package offers are lower. Many students are still unplaced. It's a very tense atmosphere on campus.", "negative"),
    ("Placements", "How to prepare for upcoming summer internships?", "What resources are best for DSA and system design? Should I focus on competitive programming or web development projects?", "neutral"),
    ("Placements", "Offered a PPO at my dream company!", "Got the pre-placement offer today after a rigorous 2-month internship. Hard work finally paid off! So excited!", "positive"),
    # Hostel Life
    ("Hostel Life", "Mess food is absolutely disgusting and inedible", "We literally found insects in the rice today. The mess committee is doing nothing despite multiple complaints. This is completely unacceptable!", "negative"),
    ("Hostel Life", "Hostel canteen is the absolute best part of campus", "The night canteen serves the most delicious double cheese maggi and chai. Perfect place to hang out with friends after a late night study session.", "positive"),
    ("Hostel Life", "New warden guidelines for hostel entry times", "The warden issued a circular stating that all students must return by 10 PM. There is a lot of discussion about this among students.", "neutral"),
    ("Hostel Life", "Hot water issues in hostel bathrooms are resolved!", "They finally installed the new solar geysers. Clean, warm water is available 24/7 now. Big improvement.", "positive"),
    # Fests & Culture
    ("Fests & Culture", "The upcoming cultural fest is going to be spectacular!", "The line-up of artists is insane. The design team has done an incredible job decorating the campus. Can't wait for the concert night!", "positive"),
    ("Fests & Culture", "Disappointing event management at the tech fest yesterday", "The main event was delayed by 3 hours, and the sound system kept failing. The organizers were very rude. It was a complete waste of time.", "negative"),
    ("Fests & Culture", "Club selections are starting next week", "All major cultural, technical, and sports clubs are holding orientations. Highly recommend freshers to join at least one club!", "neutral"),
    # Mental Health
    ("Mental Health", "Extremely burnt out and overwhelmed by academic pressure", "Constant quizzes, assignments, and projects. I haven't slept properly in weeks and my anxiety is through the roof. I don't know what to do.", "negative"),
    ("Mental Health", "Huge shoutout to the student counseling services", "I was going through a tough time and decided to visit the campus counselor. They were incredibly empathetic and helped me manage my stress. Highly recommend!", "positive"),
    ("Mental Health", "Need advice on coping with loneliness on campus", "Feeling very disconnected from everyone here. It seems like everyone has already formed their groups. How do you make friends?", "negative"),
    # Administration
    ("Administration", "Dean office takes forever to process simple documents", "I have been waiting for over two weeks just to get a simple NOC certificate for my internship. The administration is extremely slow and bureaucratic.", "negative"),
    ("Administration", "New campus registration portal is actually smooth", "Surprisingly, the fee payment and course registration finished in under 5 minutes without any crash this year. Kudos to the admin team for fixing it!", "positive"),
    ("Administration", "Fee hike protest meeting scheduled tomorrow", "The student senate is organizing a discussion regarding the recent fee hike. Everyone is requested to attend and voice their opinions.", "neutral"),
    # Infrastructure
    ("Infrastructure", "The new sports complex and gym is absolutely top class!", "State of the art equipment, clean courts, and great lighting. It's an amazing addition to the campus infrastructure.", "positive"),
    ("Infrastructure", "Library Wi-fi is constantly dropping, extremely annoying", "Can't even open research papers because the connection is so slow and unstable. How are we supposed to study like this?", "negative"),
    ("Infrastructure", "New lab equipment has finally arrived", "We just unboxed new GPU clusters for our deep learning lab. Can't wait to run some heavy models on these!", "positive")
]

def categorize_post(text):
    text_lower = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return category
    return "General"

def _generate_mock_posts(iit_key, limit=50):
    posts = []
    # Seed based on iit_key to have consistent results per run, but keep it diverse
    random.seed(hash(iit_key) % 10000)
    
    # Custom skew for different IITs to make the comparison visually interesting
    skews = {
        "IITB":   {"positive": 0.5, "negative": 0.3},
        "IITM":   {"positive": 0.6, "negative": 0.2},
        "IITP":   {"positive": 0.4, "negative": 0.4},
        "IITD":   {"positive": 0.4, "negative": 0.5},
        "IITKgp": {"positive": 0.5, "negative": 0.3},
        "IITBHU": {"positive": 0.4, "negative": 0.4},
        "IITG":   {"positive": 0.5, "negative": 0.3},
    }
    skew = skews.get(iit_key, {"positive": 0.4, "negative": 0.4})
    
    # Filter templates by sentiment skew
    pos_templates = [t for t in MOCK_TEMPLATES if t[3] == "positive"]
    neg_templates = [t for t in MOCK_TEMPLATES if t[3] == "negative"]
    neu_templates = [t for t in MOCK_TEMPLATES if t[3] == "neutral"]
    
    now = time.time()
    
    for i in range(min(limit, 40)):
        r = random.random()
        if r < skew["positive"]:
            template = random.choice(pos_templates)
        elif r < skew["positive"] + skew["negative"]:
            template = random.choice(neg_templates)
        else:
            template = random.choice(neu_templates)
            
        category, title, body, _ = template
        
        # Add some custom IIT mention inside title/body to make it highly authentic with word boundaries
        full_title = re.sub(r'\bour\b', f"{iit_key}'s", title, flags=re.IGNORECASE)
        full_title = re.sub(r'\bcampus\b', f"{iit_key} campus", full_title, flags=re.IGNORECASE)
        
        full_body = re.sub(r'\bour\b', f"{iit_key}'s", body, flags=re.IGNORECASE)
        full_body = re.sub(r'\bcampus\b', f"{iit_key} campus", full_body, flags=re.IGNORECASE)
        
        posts.append({
            "iit":       iit_key,
            "post_id":   f"mock_{iit_key.lower()}_{i}_{random.randint(1000, 9999)}",
            "title":     full_title,
            "body":      full_body[:500],
            "score":     random.randint(10, 450),
            "comments":  random.randint(2, 85),
            "created":   now - random.randint(1800, 7 * 86400), # up to 7 days old
            "category":  category,
            "subreddit": IIT_SUBREDDITS.get(iit_key, "iit"),
        })
        
    return posts

def scrape_iit(iit_key, limit=100):
    sub_name = IIT_SUBREDDITS.get(iit_key)
    if not sub_name:
        return []

    # If Reddit client is not initialized or credentials are placeholder
    client_id = os.getenv("REDDIT_CLIENT_ID")
    if not reddit or not client_id or "your_" in client_id or client_id == "":
        return _generate_mock_posts(iit_key, limit)

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
        print(f"Error scraping {iit_key}: {e}. Falling back to mock data.")
        return _generate_mock_posts(iit_key, limit)
        
    if not posts:
        return _generate_mock_posts(iit_key, limit)
    return posts