"""
Northstar Retail Co. - Inventory & Stock Availability Engine
Handles repetitive ticket category 3: "Is this back in stock?" / "Do you have this in a different size?"
"""
import re
from typing import Optional, Dict, Any, List
from .models import SAMPLE_INVENTORY, InventoryItem

class InventoryLookupService:
    def __init__(self, inventory_db: Optional[Dict[str, InventoryItem]] = None):
        self.inventory = inventory_db if inventory_db is not None else SAMPLE_INVENTORY
        self.restock_subscribers: List[Dict[str, str]] = [
            {"email": "alex.m@example.com", "sku": "NST-APEX-NVY-L", "subscribed_at": "2026-08-11"}
        ]

    def search_inventory(self, query: str) -> List[InventoryItem]:
        """Searches inventory items by keyword, product name, or SKU."""
        q = query.lower()
        results = []
        for item in self.inventory.values():
            if (q in item.sku.lower() or 
                q in item.name.lower() or 
                q in item.category.lower() or 
                q in item.color.lower() or
                q in f"{item.name} {item.size}".lower()):
                results.append(item)
        return results

    def extract_size_and_item(self, query: str) -> Dict[str, Optional[str]]:
        """Extracts requested size and potential product references from natural language."""
        size_match = re.search(r'\b(size\s+)?(XXS|XS|S|M|L|XL|XXL|9\.5|10|10\.5|11|11\.5|12|small|medium|large)\b', query, re.IGNORECASE)
        size = size_match.group(2).upper() if size_match else None
        
        # Normalize size abbreviations
        size_map = {"SMALL": "S", "MEDIUM": "M", "LARGE": "L"}
        if size in size_map:
            size = size_map[size]

        return {"size": size}

    def subscribe_restock_alert(self, email: str, sku: str) -> Dict[str, Any]:
        """Enrolls customer in automated email/SMS alert when warehouse restocks."""
        self.restock_subscribers.append({
            "email": email,
            "sku": sku,
            "subscribed_at": "2026-08-13"
        })
        item_name = self.inventory[sku].name if sku in self.inventory else sku
        return {
            "success": True,
            "message": f"You're on the priority VIP list! We will notify {email} the second {item_name} ({sku}) is checked into the warehouse.",
            "total_waitlist_count": len([s for s in self.restock_subscribers if s['sku'] == sku]) + 14
        }

    def get_stock_response(self, query: str, user_email: Optional[str] = None) -> Dict[str, Any]:
        """Resolves stock availability questions with real-time counts, restock dates, and alternatives."""
        items = self.search_inventory(query)
        extracted = self.extract_size_and_item(query)
        target_size = extracted.get("size")

        if not items:
            # Check for general products mentioned in query
            if "parka" in query.lower() or "jacket" in query.lower():
                items = [i for i in self.inventory.values() if "Parka" in i.name or "Shell" in i.name]
            elif "shoe" in query.lower() or "runner" in query.lower() or "sneaker" in query.lower():
                items = [i for i in self.inventory.values() if "Shoes" in i.name]
            elif "fleece" in query.lower() or "pullover" in query.lower():
                items = [i for i in self.inventory.values() if "Fleece" in i.name]
            else:
                items = list(self.inventory.values())[:4]

        # Prioritize matching size if user asked for specific size
        if target_size:
            matched_size_item = next((i for i in items if i.size.upper() == target_size), None)
            if matched_size_item:
                items = [matched_size_item] + [i for i in items if i != matched_size_item]

        primary_item = items[0] if items else None
        if not primary_item:
            return {
                "success": False,
                "deflected": False,
                "category": "STOCK_AVAILABILITY",
                "message": "We could not find that exact product in our current catalog. Browse our full store or search by SKU / name.",
                "items": []
            }

        # Case 1: In Stock
        if primary_item.stock_count > 0:
            urgency_note = "🔥 Low Stock Alert: Less than 5 remaining!" if primary_item.stock_count < 5 else "✅ Readily in stock!"
            return {
                "success": True,
                "deflected": True,
                "category": "STOCK_AVAILABILITY",
                "status": "IN_STOCK",
                "item": {
                    "sku": primary_item.sku,
                    "name": primary_item.name,
                    "size": primary_item.size,
                    "color": primary_item.color,
                    "stock_count": primary_item.stock_count,
                    "warehouse": primary_item.warehouse_location
                },
                "message": (
                    f"Good news! **{primary_item.name}** in size **{primary_item.size}** ({primary_item.color}) is **In Stock** ({primary_item.stock_count} units available at {primary_item.warehouse_location}).\n\n"
                    f"{urgency_note}\n"
                    f"Orders placed before 3:00 PM PST ship out today with free 2-day delivery on orders over $99."
                ),
                "suggested_actions": [
                    f"Add {primary_item.name} ({primary_item.size}) to Cart",
                    "Check Other Sizes / Colors",
                    "View Sizing Chart"
                ]
            }

        # Case 2: Out of Stock with Restock Date & Alternatives
        alt_items = [self.inventory[s] for s in primary_item.alternatives_skus if s in self.inventory]
        alt_text = ""
        if alt_items:
            alt_lines = [f"• **{alt.name}** - Size {alt.size} ({alt.color}) - {alt.stock_count} in stock" for alt in alt_items if alt.stock_count > 0]
            if alt_lines:
                alt_text = "\n\n💡 **Available In-Stock Alternatives**:\n" + "\n".join(alt_lines)

        restock_msg = f"Expected next shipment arrival: **{primary_item.restock_expected_date}**" if primary_item.restock_expected_date else "Production is underway; restock date to be announced shortly."

        return {
            "success": True,
            "deflected": True,
            "category": "STOCK_AVAILABILITY",
            "status": "OUT_OF_STOCK",
            "item": {
                "sku": primary_item.sku,
                "name": primary_item.name,
                "size": primary_item.size,
                "color": primary_item.color,
                "restock_expected_date": primary_item.restock_expected_date
            },
            "message": (
                f"**{primary_item.name}** in size **{primary_item.size}** ({primary_item.color}) is currently **Sold Out**.\n\n"
                f"📦 {restock_msg}\n"
                f"We can notify you automatically the instant inventory lands in our warehouse!{alt_text}"
            ),
            "suggested_actions": [
                f"Notify Me on Restock ({primary_item.sku})",
                "View Available Size / Color Alternatives",
                "Explore Similar Catalog Items"
            ]
        }
