from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text):
    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]

    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"

    return {
        "compound": round(compound, 4),
        "positive": round(scores["pos"], 4),
        "negative": round(scores["neg"], 4),
        "neutral":  round(scores["neu"], 4),
        "label":    label,
    }

def analyze_posts(posts):
    results = []
    for post in posts:
        text = post["title"] + " " + post.get("body", "")
        sentiment = analyze_sentiment(text)
        results.append({**post, **sentiment})
    return results