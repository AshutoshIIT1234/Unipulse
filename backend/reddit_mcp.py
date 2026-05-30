# Reddit MCP Server for UniPulse
# Uses Hawstein's mcp-server-reddit (no API key needed)

# Run with: uvx mcp-server-reddit
# Or: pip install mcp-server-reddit && python -m mcp_server_reddit

# For Claude Desktop / Cursor / Windsurf, add to config:
"""
{
  "mcpServers": {
    "reddit": {
      "command": "uvx",
      "args": ["mcp-server-reddit"]
    }
  }
}
"""

# Tools available:
# - get_hot_posts(subreddit, limit) - Get hot posts from a subreddit
# - get_new_posts(subreddit, limit) - Get new posts from a subreddit
# - get_top_posts(subreddit, limit) - Get top posts from a subreddit
# - get_post(post_id) - Get a specific post by ID
# - get_comments(post_id, limit) - Get comments for a post
# - get_subreddit_info(subreddit) - Get subreddit info

# Example usage in UniPulse:
# Subreddits for IITs:
IIT_SUBREDDITS = {
    "IITB":   "iitbombay",
    "IITM":   "iitmadras",
    "IITP":   "iitpatna",
    "IITD":   "iitdelhi",
    "IITKgp": "iitkgp",
    "IITBHU": "iitbhu",
    "IITG":   "iitguwahati",
}

if __name__ == "__main__":
    print("Install with: uvx mcp-server-reddit")
    print("Or: pip install mcp-server-reddit")