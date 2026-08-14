"""
Northstar Retail Co. - Ticket Classifier & Triage Automation
Classifies tickets across the 3 key categories with sentiment and confidence scoring.
"""
import re
from typing import Dict, Any, Tuple

class TicketClassifier:
    CATEGORY_KEYWORDS = {
        "ORDER_STATUS": [
            r"\b(where('?s|\s+is)\s+my\s+order)\b",
            r"\b(track|tracking|shipped|shipping|carrier|fedex|ups|dhl|usps|delivery|package|eta|delayed|transit)\b",
            r"\b(nst-\d{4})\b",
            r"\b(has\s+(this|my\s+order)\s+shipped)\b",
            r"\b(when\s+will\s+it\s+arrive)\b",
            r"\b(status\s+of\s+my\s+order)\b"
        ],
        "RETURNS_REFUNDS": [
            r"\b(return|refund|exchange|rma|send\s+back|money\s+back|credit|reimburse|return\s+label|drop\s*off)\b",
            r"\b(how\s+do\s+i\s+return)\b",
            r"\b(when\s+will\s+i\s+get\s+my\s+refund)\b",
            r"\b(wrong\s+size|damaged|defective|unworn|store\s+credit)\b"
        ],
        "STOCK_AVAILABILITY": [
            r"\b(in\s*stock|back\s+in\s+stock|out\s+of\s+stock|sold\s+out|restock|inventory|size\s+\w+|available)\b",
            r"\b(do\s+you\s+have\s+this\s+in)\b",
            r"\b(different\s+size|different\s+color|when\s+will\s+you\s+have)\b",
            r"\b(sizing|restock\s+date|waitlist)\b"
        ]
    }

    FRUSTRATION_KEYWORDS = [
        r"\b(angry|furious|terrible|horrible|unacceptable|scam|lawyer|chargeback|fraud|dispute|awful|ridiculous)\b",
        r"\b(immediately|asap|urgent|emergency|now!|ruined)\b"
    ]

    def classify(self, text: str) -> Dict[str, Any]:
        """Classifies text into categories, detects sentiment, and computes deflection confidence."""
        clean_text = text.lower()
        
        scores: Dict[str, float] = {
            "ORDER_STATUS": 0.0,
            "RETURNS_REFUNDS": 0.0,
            "STOCK_AVAILABILITY": 0.0
        }

        for cat, patterns in self.CATEGORY_KEYWORDS.items():
            for pat in patterns:
                matches = re.findall(pat, clean_text)
                if matches:
                    scores[cat] += len(matches) * 1.5

        # Boost Order Status if order ID pattern found
        if re.search(r'\bnst-\d{4}\b', clean_text):
            scores["ORDER_STATUS"] += 3.0

        # Determine top category
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_cat, top_score = sorted_scores[0]

        # Calculate normalized confidence
        total_score = sum(scores.values())
        if total_score == 0:
            category = "GENERAL_INQUIRY"
            confidence = 0.35
        else:
            confidence = min(0.98, max(0.45, top_score / (total_score + 0.5)))
            category = top_cat if top_score > 0 else "GENERAL_INQUIRY"

        # Sentiment Analysis
        is_frustrated = any(re.search(pat, clean_text) for pat in self.FRUSTRATION_KEYWORDS)
        sentiment = "frustrated" if is_frustrated else ("urgent" if "urgent" in clean_text or "asap" in clean_text else "neutral")

        # Determine auto-deflect eligibility (Anti-black-box threshold: confidence >= 0.60 & not extreme escalation)
        can_auto_deflect = confidence >= 0.60 and category in ["ORDER_STATUS", "RETURNS_REFUNDS", "STOCK_AVAILABILITY"]

        return {
            "category": category,
            "confidence": round(confidence, 2),
            "sentiment": sentiment,
            "can_auto_deflect": can_auto_deflect,
            "scores": {k: round(v, 2) for k, v in scores.items()}
        }
