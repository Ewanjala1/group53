"""
Northstar Retail Co. - Batch Ticket Simulation & Deflection Analytics
Simulates a real-world batch of 100 inbound support tickets across the 3 categories.
"""
import json
import random
from typing import List, Dict, Any
from .deflection_engine import NorthstarDeflectionEngine

SAMPLE_TICKET_PROMPTS = [
    # Category 1: Order status (35 tickets)
    ("Where is my order NST-9482? I need it for this weekend", "ORDER_STATUS"),
    ("Has my package shipped yet? Order number NST-1048", "ORDER_STATUS"),
    ("Tracking says in transit for NST-3319, why is it delayed?", "ORDER_STATUS"),
    ("Can I get an update on order NST-5520 please?", "ORDER_STATUS"),
    ("When will my delivery arrive? Tracking is FX-8839201948", "ORDER_STATUS"),
    ("Where is my order? Ordered 3 days ago NST-9482", "ORDER_STATUS"),
    ("Did order NST-7391 arrive today?", "ORDER_STATUS"),
    ("I need the tracking link for order NST-1048", "ORDER_STATUS"),
    ("What carrier is shipping my order NST-5520?", "ORDER_STATUS"),
    ("Is there a delay on NST-3319 to Austin TX?", "ORDER_STATUS"),
    
    # Category 2: Returns & refunds (35 tickets)
    ("How do I return the parka from order NST-7391?", "RETURNS_REFUNDS"),
    ("When will I get my refund for return RMA-2026-9041?", "RETURNS_REFUNDS"),
    ("Can I exchange my trail shoes for size 11?", "RETURNS_REFUNDS"),
    ("What is your return policy for items without original box?", "RETURNS_REFUNDS"),
    ("I got the wrong size in order NST-9482 how do I return it?", "RETURNS_REFUNDS"),
    ("How long do refunds take to show up on my credit card?", "RETURNS_REFUNDS"),
    ("Do I have to pay return shipping fees?", "RETURNS_REFUNDS"),
    ("Can I return final sale leather gloves?", "RETURNS_REFUNDS"),
    ("Where do I drop off my FedEx return package?", "RETURNS_REFUNDS"),
    ("Generate return label for order NST-7391", "RETURNS_REFUNDS"),

    # Category 3: Stock availability (25 tickets)
    ("Is the Apex Waterproof Shell size L in navy back in stock?", "STOCK_AVAILABILITY"),
    ("Do you have the TrailRunner Pro shoes in size 9.5?", "STOCK_AVAILABILITY"),
    ("When will you restock the Altitude Thermal Parka in Olive M?", "STOCK_AVAILABILITY"),
    ("Do you have CloudLoft Fleece Pullover in large?", "STOCK_AVAILABILITY"),
    ("Can I get notified when size Large Obsidian Navy is restocked?", "STOCK_AVAILABILITY"),
    ("What sizes are available for the Apex Shell?", "STOCK_AVAILABILITY"),
    ("Do you have size 10 in TrailRunner shoes in stock in Atlanta warehouse?", "STOCK_AVAILABILITY"),
    ("Is the black fleece out of stock?", "STOCK_AVAILABILITY"),

    # Edge cases / General inquiries (5 tickets)
    ("Can I speak to a live human representative?", "GENERAL_INQUIRY"),
    ("What are your holiday store hours?", "GENERAL_INQUIRY"),
    ("I want to cancel an order that was placed 2 minutes ago", "ORDER_STATUS"),
    ("Do you ship internationally to Canada?", "GENERAL_INQUIRY"),
    ("My package was stolen from my porch what do I do?", "ORDER_STATUS")
]

def run_simulation(total_tickets: int = 100) -> Dict[str, Any]:
    engine = NorthstarDeflectionEngine()
    
    # Generate 100 realistic tickets by sampling with slight variations
    tickets_processed: List[Dict[str, Any]] = []
    deflected_count = 0
    cat_counts = {"ORDER_STATUS": 0, "RETURNS_REFUNDS": 0, "STOCK_AVAILABILITY": 0, "GENERAL_INQUIRY": 0}
    cat_deflected = {"ORDER_STATUS": 0, "RETURNS_REFUNDS": 0, "STOCK_AVAILABILITY": 0, "GENERAL_INQUIRY": 0}
    
    first_names = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "Lucas", "Mia"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson"]

    for i in range(1, total_tickets + 1):
        prompt_template, expected_cat = SAMPLE_TICKET_PROMPTS[(i - 1) % len(SAMPLE_TICKET_PROMPTS)]
        cust_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        email = f"{cust_name.lower().replace(' ', '.')}@example.com"
        
        result = engine.process_inquiry(prompt_template, customer_email=email)
        cat = result["classification"]["category"]
        is_deflected = result["deflected"]
        
        if cat not in cat_counts:
            cat_counts[cat] = 0
            cat_deflected[cat] = 0
            
        cat_counts[cat] += 1
        if is_deflected:
            deflected_count += 1
            cat_deflected[cat] += 1

        tickets_processed.append({
            "ticket_id": f"TKT-2026-{1000 + i}",
            "customer_name": cust_name,
            "customer_email": email,
            "query": prompt_template,
            "category": cat,
            "confidence": result["classification"]["confidence"],
            "sentiment": result["classification"]["sentiment"],
            "deflected": is_deflected,
            "resolution_type": result["resolution_type"],
            "handling_time_seconds": 0.8 if is_deflected else 180.0  # 0.8s automated vs 3 min human
        })

    deflection_rate = round((deflected_count / total_tickets) * 100, 1)
    human_hours_saved = round((deflected_count * 12.5) / 60, 1)  # approx 12.5 min avg handle time per manual ticket
    cost_savings_usd = round(deflected_count * 6.50, 2)  # $6.50 avg cost per support ticket

    report = {
        "total_tickets": total_tickets,
        "deflected_count": deflected_count,
        "human_escalated_count": total_tickets - deflected_count,
        "deflection_rate_pct": deflection_rate,
        "human_hours_saved": human_hours_saved,
        "estimated_cost_savings_usd": cost_savings_usd,
        "category_breakdown": {
            k: {
                "total": cat_counts[k],
                "deflected": cat_deflected[k],
                "deflection_rate": round((cat_deflected[k] / cat_counts[k] * 100) if cat_counts[k] > 0 else 0, 1)
            }
            for k in cat_counts
        },
        "sample_tickets": tickets_processed[:15]
    }
    return report

if __name__ == "__main__":
    rep = run_simulation(100)
    print("=" * 60)
    print("NORTHSTAR RETAIL CO. - SUPPORT DEFLECTION SIMULATION REPORT")
    print("=" * 60)
    print(f"Total Processed Inquiries : {rep['total_tickets']}")
    print(f"Automated Deflections     : {rep['deflected_count']} ({rep['deflection_rate_pct']}%)")
    print(f"Human Queue Escalations   : {rep['human_escalated_count']}")
    print(f"Agent Hours Saved         : {rep['human_hours_saved']} hours")
    print(f"Estimated Cost Savings    : ${rep['estimated_cost_savings_usd']}")
    print("-" * 60)
    print("CATEGORY PERFORMANCE:")
    for cat, stats in rep['category_breakdown'].items():
        print(f"  • {cat:20}: {stats['deflected']}/{stats['total']} ({stats['deflection_rate']}%)")
    print("=" * 60)
