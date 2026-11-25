"""
Fetches live stats across competitive programming platforms and generates stats.json.
Used by the scheduled GitHub Actions workflow.
"""

import json
import ssl
import sys
import urllib.request
from typing import Any, Dict

# Create a permissive SSL context for environments with local certificate restrictions
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE


def fetch_url(url: str, timeout: int = 15) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/119.0.0.0 Safari/537.36"
            ),
            "Accept": "application/json, text/html, */*",
        },
    )
    with urllib.request.urlopen(req, context=SSL_CTX, timeout=timeout) as resp:
        return resp.read()


def get_codeforces_stats(handle: str = "Saptarshi_codes") -> Dict[str, Any]:
    try:
        user_raw = fetch_url(f"https://codeforces.com/api/user.info?handles={handle}")
        user_data = json.loads(user_raw.decode("utf-8"))["result"][0]

        subs_raw = fetch_url(f"https://codeforces.com/api/user.status?handle={handle}")
        subs_data = json.loads(subs_raw.decode("utf-8"))["result"]

        solved_problems = set()
        for sub in subs_data:
            if sub.get("verdict") == "OK" and "problem" in sub:
                p = sub["problem"]
                c_id = p.get("contestId")
                p_idx = p.get("index")
                if c_id is not None and p_idx is not None:
                    solved_problems.add((c_id, p_idx))

        return {
            "handle": handle,
            "rating": user_data.get("rating"),
            "maxRating": user_data.get("maxRating"),
            "rank": user_data.get("rank"),
            "maxRank": user_data.get("maxRank"),
            "solved": len(solved_problems),
        }
    except Exception as e:
        print(f"Warning: Failed to fetch Codeforces stats: {e}", file=sys.stderr)
        return {"handle": handle, "rating": 1318, "maxRating": 1383, "rank": "pupil", "solved": 48}


# def get_atcoder_stats(handle: str = "SaptarshiCodes") -> Dict[str, Any]:
#     res: Dict[str, Any] = {"handle": handle, "rating": None, "maxRating": None, "rank": None, "solved": None}
#     try:
#         hist_raw = fetch_url(f"https://atcoder.jp/users/{handle}/history/json")
#         history = json.loads(hist_raw.decode("utf-8"))
#         ratings = [entry["NewRating"] for entry in history if "NewRating" in entry]
#         if ratings:
#             res["rating"] = ratings[-1]
#             res["maxRating"] = max(ratings)
#     except Exception as e:
#         print(f"Warning: Failed to fetch AtCoder contest history: {e}", file=sys.stderr)
#
#     try:
#         ken_raw = fetch_url(f"https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user={handle}")
#         ken_data = json.loads(ken_raw.decode("utf-8"))
#         res["rank"] = ken_data.get("rank")
#         res["solved"] = ken_data.get("count")
#     except Exception as e:
#         print(f"Warning: Failed to fetch Kenkoooo AtCoder AC rank: {e}", file=sys.stderr)
#
#     if res["rating"] is None:
#         res["rating"] = 80
#         res["maxRating"] = 80
#     if res["solved"] is None:
#         res["solved"] = 4
#         res["rank"] = 414821
#
#     return res


def get_codechef_stats(handle: str = "saptarshi010") -> Dict[str, Any]:
    try:
        raw = fetch_url(f"https://codechefapi.vercel.app/{handle}")
        data = json.loads(raw.decode("utf-8"))
        return {
            "handle": handle,
            "rating": data.get("currentRating"),
            "maxRating": data.get("highestRating"),
            "stars": data.get("stars"),
            "rank": data.get("globalRank"),
            "countryRank": data.get("countryRank"),
            "solved": data.get("numberOfProblemsSolved"),
        }
    except Exception as e:
        print(f"Warning: Failed to fetch CodeChef stats: {e}", file=sys.stderr)
        return {
            "handle": handle,
            "rating": 1445,
            "maxRating": 1445,
            "stars": "2★",
            "rank": 33837,
            "countryRank": 32161,
            "solved": 14,
        }


def get_leetcode_stats(handle: str = "saptarshi_codes") -> Dict[str, Any]:
    res: Dict[str, Any] = {
        "handle": handle,
        "rating": None,
        "contestRank": None,
        "rank": None,
        "solved": None,
        "easy": None,
        "medium": None,
        "hard": None,
    }
    try:
        raw = fetch_url(f"https://cp-rating-api.vercel.app/leetcode/{handle}")
        data = json.loads(raw.decode("utf-8"))
        res["rank"] = data.get("rank")
        res["solved"] = data.get("problemsSolved")
        subs = data.get("submissions", [])
        if len(subs) > 1:
            res["easy"] = subs[1].get("count")
        if len(subs) > 2:
            res["medium"] = subs[2].get("count")
        if len(subs) > 3:
            res["hard"] = subs[3].get("count")
    except Exception as e:
        print(f"Warning: Failed to fetch LeetCode profile: {e}", file=sys.stderr)

    try:
        contest_raw = fetch_url(f"https://alfa-leetcode-api.onrender.com/{handle}/contest")
        cdata = json.loads(contest_raw.decode("utf-8"))
        if "contestRating" in cdata:
            res["rating"] = round(cdata["contestRating"])
        res["contestRank"] = cdata.get("contestGlobalRanking")
    except Exception as e:
        print(f"Warning: Failed to fetch LeetCode contest data: {e}", file=sys.stderr)

    return res


def main():
    print("Collecting stats across platforms...")
    stats = {
        "codeforces": get_codeforces_stats(),
        # "atcoder": get_atcoder_stats(),
        "codechef": get_codechef_stats(),
        "leetcode": get_leetcode_stats(),
    }

    with open("stats.json", "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)

    print("Successfully wrote stats.json:")
    print(json.dumps(stats, indent=2))


if __name__ == "__main__":
    main()
