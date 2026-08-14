"""
Northstar Retail Co. - Order Status & Tracking Service
Handles repetitive ticket category 1: "Where is my order?" / "Has this shipped yet?"
"""
import re
from typing import Optional, Dict, Any, List
from .models import SAMPLE_ORDERS, Order, OrderItem

class OrderService:
    def __init__(self, orders_db: Optional[Dict[str, Order]] = None):
        self.orders = orders_db if orders_db is not None else SAMPLE_ORDERS

    def extract_order_id(self, query: str) -> Optional[str]:
        """Extracts order IDs matching NST-XXXX pattern from natural language text."""
        match = re.search(r'\b(NST-\d{4})\b', query, re.IGNORECASE)
        if match:
            return match.group(1).upper()
        # Fallback: pure 4-digit number if preceded by order / #
        num_match = re.search(r'(?:order|#)\s*(\d{4})\b', query, re.IGNORECASE)
        if num_match:
            candidate = f"NST-{num_match.group(1)}"
            if candidate in self.orders:
                return candidate
        return None

    def lookup_order(self, order_id_or_query: str, customer_email: Optional[str] = None) -> Optional[Order]:
        """Looks up an order by ID, email, or natural language query."""
        order_id = self.extract_order_id(order_id_or_query)
        if order_id and order_id in self.orders:
            return self.orders[order_id]
        
        # Direct key lookup
        clean_key = order_id_or_query.strip().upper()
        if clean_key in self.orders:
            return self.orders[clean_key]
            
        # Email lookup
        if customer_email:
            for order in self.orders.values():
                if order.customer_email.lower() == customer_email.strip().lower():
                    return order
                    
        return None

    def get_order_status_response(self, order_id_or_query: str, customer_email: Optional[str] = None) -> Dict[str, Any]:
        """Generates a complete self-serve deflection card and human-friendly response."""
        order = self.lookup_order(order_id_or_query, customer_email)
        
        if not order:
            return {
                "success": False,
                "deflected": False,
                "category": "ORDER_STATUS",
                "message": (
                    "We couldn't locate an order matching those details. Please provide a valid "
                    "Northstar Order Number (format: NST-XXXX) or verify the email used at checkout."
                ),
                "order": None,
                "suggested_actions": ["Search with Email Address", "Check Order Number on Receipt", "Connect to Support Agent"]
            }

        # Status humanization
        status_titles = {
            "processing": "📦 Preparing in Warehouse",
            "shipped": "🚚 Shipped - In Transit",
            "in_transit": "🚚 In Transit to Local Hub",
            "out_for_delivery": "⚡ Out for Delivery Today",
            "delivered": "✅ Delivered",
            "cancelled": "❌ Cancelled"
        }

        friendly_status = status_titles.get(order.status, order.status.title())
        item_names = ", ".join([f"{item.name} ({item.size})" for item in order.items])

        response_text = (
            f"Hello {order.customer_name}! Your order **{order.order_id}** is currently **{friendly_status}**.\n\n"
            f"• **Carrier**: {order.carrier}\n"
            f"• **Tracking Number**: `{order.tracking_number}`\n"
            f"• **Estimated Delivery**: **{order.estimated_delivery}**\n"
            f"• **Items**: {item_names}\n"
            f"• **Latest Checkpoint**: {order.last_checkpoint}"
        )

        if order.is_delayed:
            response_text += f"\n\n⚠️ **Notice of Delay**: {order.delay_reason}"

        return {
            "success": True,
            "deflected": True,
            "category": "ORDER_STATUS",
            "order_id": order.order_id,
            "status": order.status,
            "status_title": friendly_status,
            "message": response_text,
            "order": {
                "order_id": order.order_id,
                "customer_name": order.customer_name,
                "order_date": order.order_date,
                "status": order.status,
                "carrier": order.carrier,
                "tracking_number": order.tracking_number,
                "estimated_delivery": order.estimated_delivery,
                "shipping_address": order.shipping_address,
                "last_checkpoint": order.last_checkpoint,
                "is_delayed": order.is_delayed,
                "delay_reason": order.delay_reason,
                "items": [
                    {
                        "sku": i.sku,
                        "name": i.name,
                        "size": i.size,
                        "color": i.color,
                        "price": i.price,
                        "quantity": i.quantity,
                        "is_final_sale": i.is_final_sale
                    } for i in order.items
                ]
            },
            "suggested_actions": [
                f"Track live on {order.carrier}",
                "Sign up for SMS alerts",
                "Change Delivery Instructions"
            ]
        }
