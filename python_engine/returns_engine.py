"""
Northstar Retail Co. - Returns & Refund Automation Engine
Handles repetitive ticket category 2: "How do I return this?" / "When will I get my refund?"
"""
import random
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from .models import SAMPLE_ORDERS, Order, ReturnRequest

class ReturnsEngine:
    RETURN_WINDOW_DAYS = 30

    def __init__(self, orders_db: Optional[Dict[str, Order]] = None):
        self.orders = orders_db if orders_db is not None else SAMPLE_ORDERS
        self.rma_records: Dict[str, ReturnRequest] = {
            "RMA-2026-9041": ReturnRequest(
                rma_number="RMA-2026-9041",
                order_id="NST-7391",
                sku="NST-PRK-OLV-S",
                reason="Wrong Size - Wanted Medium",
                created_at="2026-08-04",
                status="refund_issued",
                refund_amount=299.00,
                refund_method="Original Payment (Visa ending 4242)",
                prepaid_label_url="https://returns.northstar.example/labels/RMA-2026-9041.pdf"
            )
        }

    def check_return_eligibility(self, order: Order, sku: Optional[str] = None) -> Dict[str, Any]:
        """Evaluates whether an order and specific item are eligible for return."""
        try:
            order_dt = datetime.strptime(order.order_date, "%Y-%m-%d")
        except Exception:
            order_dt = datetime.now() - timedelta(days=5)

        days_since_order = (datetime.now() - order_dt).days
        is_within_window = days_since_order <= self.RETURN_WINDOW_DAYS

        eligible_items = []
        ineligible_items = []

        for item in order.items:
            if item.is_final_sale:
                ineligible_items.append({
                    "sku": item.sku,
                    "name": item.name,
                    "reason": "Final Sale / Clearance item - not eligible for returns"
                })
            elif not is_within_window:
                ineligible_items.append({
                    "sku": item.sku,
                    "name": item.name,
                    "reason": f"Exceeds Northstar 30-day policy window ({days_since_order} days since order)"
                })
            else:
                eligible_items.append({
                    "sku": item.sku,
                    "name": item.name,
                    "size": item.size,
                    "price": item.price
                })

        return {
            "order_id": order.order_id,
            "days_since_order": days_since_order,
            "is_within_window": is_within_window,
            "eligible_items": eligible_items,
            "ineligible_items": ineligible_items,
            "can_return_any": len(eligible_items) > 0
        }

    def create_instant_rma(self, order_id: str, sku: str, reason: str) -> Dict[str, Any]:
        """Generates an instant self-serve RMA label and refund guarantee without human support."""
        if order_id not in self.orders:
            return {"success": False, "message": f"Order {order_id} not found."}

        order = self.orders[order_id]
        item = next((i for i in order.items if i.sku == sku), order.items[0])

        if item.is_final_sale:
            return {
                "success": False,
                "message": f"Item {item.name} is marked Final Sale and cannot be returned."
            }

        rma_number = f"RMA-2026-{random.randint(1000, 9999)}"
        prepaid_url = f"https://returns.northstar.example/labels/{rma_number}.pdf"
        
        req = ReturnRequest(
            rma_number=rma_number,
            order_id=order_id,
            sku=item.sku,
            reason=reason,
            created_at=datetime.now().strftime("%Y-%m-%d"),
            status="label_generated",
            refund_amount=item.price * item.quantity,
            refund_method="Original Payment (Visa ending 4242)",
            prepaid_label_url=prepaid_url
        )
        self.rma_records[rma_number] = req

        return {
            "success": True,
            "rma_number": rma_number,
            "refund_amount": req.refund_amount,
            "refund_method": req.refund_method,
            "prepaid_label_url": prepaid_url,
            "item_name": item.name,
            "estimated_refund_window": "3-5 business days after carrier scans return package"
        }

    def get_returns_refund_response(self, query: str, order_id: Optional[str] = None) -> Dict[str, Any]:
        """Generates conversational resolution for returns and refund timing questions."""
        # Check if customer is asking about refund status
        if "when" in query.lower() or "refund status" in query.lower() or "money back" in query.lower():
            return {
                "success": True,
                "deflected": True,
                "category": "RETURNS_REFUNDS",
                "sub_intent": "REFUND_TIMELINE",
                "message": (
                    "💳 **Northstar Refund Timeline & Policy**:\n\n"
                    "1. **Drop-off**: Once you hand your return to FedEx / UPS, our warehouse receives it in 2–4 business days.\n"
                    "2. **Inspection**: Our quality team inspects items within 24 hours of arrival.\n"
                    "3. **Payout**: Refunds are automatically posted to your original payment method within **3–5 business days**.\n\n"
                    "✨ *Instant Store Credit Option*: If you prefer Northstar Store Credit, you receive it immediately upon drop-off scan + an extra 10% bonus credit!"
                ),
                "suggested_actions": [
                    "Start a New Return",
                    "Track Existing RMA Status",
                    "Claim Instant 10% Bonus Store Credit"
                ]
            }

        # General return how-to or order return
        if order_id and order_id in self.orders:
            order = self.orders[order_id]
            eligibility = self.check_return_eligibility(order)
            
            if eligibility["can_return_any"]:
                items_str = ", ".join([i["name"] for i in eligibility["eligible_items"]])
                return {
                    "success": True,
                    "deflected": True,
                    "category": "RETURNS_REFUNDS",
                    "sub_intent": "INITIATE_RETURN",
                    "order_id": order_id,
                    "eligibility": eligibility,
                    "message": (
                        f"Great news! Your order **{order_id}** is within our 30-day hassle-free return window.\n\n"
                        f"• **Eligible Items**: {items_str}\n"
                        f"• **Return Fee**: $0.00 (Prepaid shipping label provided)\n"
                        f"• **Drop-off**: Any FedEx Drop Box or Walgreens location\n\n"
                        f"Click below to generate your instant QR code and printable return label in 1 click."
                    ),
                    "suggested_actions": [
                        "Generate Instant Return Label",
                        "Exchange for Another Size ($0 fee)",
                        "Find Nearest Drop-off Location"
                    ]
                }

        # Self-serve policy overview
        return {
            "success": True,
            "deflected": True,
            "category": "RETURNS_REFUNDS",
            "sub_intent": "POLICY_AND_SELF_SERVE",
            "message": (
                "📦 **Northstar 30-Day Hassle-Free Returns**:\n\n"
                "• All unworn items with tags attached can be returned or exchanged within **30 days** of delivery.\n"
                "• Returns are **100% free** when choosing an exchange or Northstar store credit.\n"
                "• No printer required! Use the QR code at any FedEx location and they will print the label for you.\n\n"
                "Please enter your **Order Number (NST-XXXX)** below to generate your prepaid label immediately."
            ),
            "suggested_actions": [
                "Enter Order Number (NST-XXXX)",
                "Look up by Email",
                "View Full Return Policy"
            ]
        }
