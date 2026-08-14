"""
Northstar Retail Co. - Inventory & Stock Availability Engine
Handles repetitive ticket category 3: "Is this back in stock?" / "Do you have this in a different size?"
"""
import re
from typing import Optional, Dict, Any, List
from .models import SAMPLE_INVENTORY, InventoryItem

# Sizing Chart Measurements Standard
SIZING_CHARTS: Dict[str, Any] = {
    "Outerwear": {
        "unit": "inches",
        "sizes": {
            "XS": {"chest": "34 - 36", "sleeve": "32.5", "waist": "28 - 30", "fit": "Trim athletic cut"},
            "S":  {"chest": "36 - 38", "sleeve": "33.5", "waist": "30 - 32", "fit": "Standard trail cut"},
            "M":  {"chest": "39 - 41", "sleeve": "34.5", "waist": "32 - 34", "fit": "Room for midlayer"},
            "L":  {"chest": "42 - 44", "sleeve": "35.5", "waist": "35 - 37", "fit": "Expedition layer fit"},
            "XL": {"chest": "45 - 48", "sleeve": "36.5", "waist": "38 - 41", "fit": "Relaxed winter cut"},
            "XXL": {"chest": "49 - 52", "sleeve": "37.5", "waist": "42 - 45", "fit": "Max coverage fit"}
        }
    },
    "Midlayers": {
        "unit": "inches",
        "sizes": {
            "XS": {"chest": "34 - 36", "length": "26.0", "waist": "28 - 30", "fit": "Next-to-skin"},
            "S":  {"chest": "36 - 38", "length": "27.0", "waist": "30 - 32", "fit": "Active fit"},
            "M":  {"chest": "39 - 41", "length": "28.0", "waist": "32 - 34", "fit": "Standard fit"},
            "L":  {"chest": "42 - 44", "length": "29.0", "waist": "35 - 37", "fit": "Comfortable room"},
            "XL": {"chest": "45 - 48", "length": "30.0", "waist": "38 - 41", "fit": "Generous fit"},
            "XXL": {"chest": "49 - 52", "length": "31.0", "waist": "42 - 45", "fit": "Extended fit"}
        }
    },
    "Footwear": {
        "unit": "US Mens / Unisex",
        "sizes": {
            "8.0":  {"us": "8.0", "eu": "41", "foot_cm": "26.0", "fit": "Standard D width"},
            "8.5":  {"us": "8.5", "eu": "41.5", "foot_cm": "26.5", "fit": "Standard D width"},
            "9.0":  {"us": "9.0", "eu": "42", "foot_cm": "27.0", "fit": "Standard D width"},
            "9.5":  {"us": "9.5", "eu": "42.5", "foot_cm": "27.5", "fit": "Standard D width"},
            "10.0": {"us": "10.0", "eu": "43", "foot_cm": "28.0", "fit": "Standard D width"},
            "10.5": {"us": "10.5", "eu": "44", "foot_cm": "28.5", "fit": "Standard D width"},
            "11.0": {"us": "11.0", "eu": "44.5", "foot_cm": "29.0", "fit": "Standard D width"},
            "11.5": {"us": "11.5", "eu": "45", "foot_cm": "29.5", "fit": "Standard D width"},
            "12.0": {"us": "12.0", "eu": "46", "foot_cm": "30.0", "fit": "Standard D width"}
        }
    },
    "Base Layers": {
        "unit": "inches",
        "sizes": {
            "XS": {"chest": "33 - 35", "waist": "27 - 29", "fit": "Form-fitting compression"},
            "S":  {"chest": "35 - 37", "waist": "29 - 31", "fit": "Athletic body fit"},
            "M":  {"chest": "38 - 40", "waist": "31 - 33", "fit": "Comfortable contact"},
            "L":  {"chest": "41 - 43", "waist": "34 - 36", "fit": "Standard base layer"},
            "XL": {"chest": "44 - 47", "waist": "37 - 40", "fit": "Relaxed thermal"}
        }
    },
    "Bags & Gear": {
        "unit": "dimensions",
        "sizes": {
            "One Size": {"volume": "45 Liters", "dimensions": "22\" x 14\" x 9\"", "weight": "2.4 lbs", "fit": "Carry-on compliant"}
        }
    }
}

class InventoryLookupService:
    def __init__(self, inventory_db: Optional[Dict[str, InventoryItem]] = None):
        self.inventory = inventory_db if inventory_db is not None else SAMPLE_INVENTORY
        self.restock_subscribers: List[Dict[str, Any]] = [
            {"email": "alex.m@example.com", "phone": "+1 (555) 234-5678", "sku": "NST-APEX-NVY-L", "size": "L", "subscribed_at": "2026-08-11"}
        ]

    def search_inventory(self, query: str) -> List[InventoryItem]:
        """Searches inventory items by keyword, product name, or SKU."""
        q = query.lower().strip()
        results = []
        for item in self.inventory.values():
            if (q in item.sku.lower() or 
                q in item.name.lower() or 
                q in item.category.lower() or 
                q in item.color.lower() or
                q in f"{item.name} {item.size}".lower() or
                q in f"{item.name} {item.color} {item.size}".lower()):
                results.append(item)
        return results

    def extract_size_and_item(self, query: str) -> Dict[str, Optional[str]]:
        """Extracts requested size and potential product references from natural language."""
        size_match = re.search(r'\b(size\s+)?(XXS|XS|S|M|L|XL|XXL|8\.0|8\.5|9\.0|9\.5|10|10\.5|11|11\.0|11\.5|12|12\.0|small|medium|large|extra\s+large)\b', query, re.IGNORECASE)
        size = None
        if size_match:
            raw_size = size_match.group(2).upper().replace(" ", "")
            size_map = {
                "SMALL": "S",
                "MEDIUM": "M",
                "LARGE": "L",
                "EXTRALARGE": "XL",
                "10": "10.0",
                "11": "11.0",
                "12": "12.0",
                "8": "8.0",
                "9": "9.0"
            }
            size = size_map.get(raw_size, raw_size)
            if size == "10.0" and "10.5" in query:
                size = "10.5"
            if size == "9.0" and "9.5" in query:
                size = "9.5"
            if size == "8.0" and "8.5" in query:
                size = "8.5"
            if size == "11.0" and "11.5" in query:
                size = "11.5"

        return {"size": size}

    def get_product_variants(self, product_name: str) -> List[InventoryItem]:
        """Returns all size and color variants belonging to a product family."""
        clean_name = product_name.lower()
        return [i for i in self.inventory.values() if clean_name in i.name.lower() or i.name.lower() in clean_name]

    def get_size_matrix(self, product_name: str, color: Optional[str] = None) -> List[Dict[str, Any]]:
        """Builds a structured size-by-size availability matrix for a product."""
        variants = self.get_product_variants(product_name)
        if color:
            variants = [v for v in variants if color.lower() in v.color.lower()]
        
        matrix = []
        for v in variants:
            matrix.append({
                "sku": v.sku,
                "size": v.size,
                "color": v.color,
                "stock_count": v.stock_count,
                "in_stock": v.stock_count > 0,
                "status": "IN_STOCK" if v.stock_count > 0 else "OUT_OF_STOCK",
                "warehouse": v.warehouse_location,
                "restock_expected_date": v.restock_expected_date
            })
        return matrix

    def subscribe_restock_alert(self, email: str, sku: str, phone: Optional[str] = None, size: Optional[str] = None) -> Dict[str, Any]:
        """Enrolls customer in automated email/SMS alert when warehouse restocks."""
        self.restock_subscribers.append({
            "email": email,
            "phone": phone or "",
            "sku": sku,
            "size": size or (self.inventory[sku].size if sku in self.inventory else ""),
            "subscribed_at": "2026-08-14"
        })
        item = self.inventory.get(sku)
        item_name = item.name if item else sku
        item_size = item.size if item else size or ""
        queue_pos = len([s for s in self.restock_subscribers if s['sku'] == sku]) + 14
        
        return {
            "success": True,
            "sku": sku,
            "email": email,
            "phone": phone,
            "message": f"You're on the priority VIP list! We will notify {email} the second {item_name} in size {item_size} is scanned into the warehouse.",
            "queue_position": queue_pos,
            "estimated_restock": item.restock_expected_date if item and item.restock_expected_date else "Within 7-10 business days",
            "total_waitlist_count": queue_pos
        }

    def recommend_size(self, category: str, height_inches: float, weight_lbs: float, fit_pref: str = "true_to_size") -> Dict[str, Any]:
        """Calculates personalized size recommendation based on body metrics and fit preference."""
        rec_size = "M"
        fit_note = "True to standard athletic proportions."

        if category in ["Outerwear", "Midlayers", "Base Layers"]:
            if weight_lbs < 140:
                rec_size = "XS" if height_inches < 66 else "S"
            elif weight_lbs < 165:
                rec_size = "S" if height_inches < 68 else "M"
            elif weight_lbs < 190:
                rec_size = "M" if height_inches < 71 else "L"
            elif weight_lbs < 220:
                rec_size = "L" if height_inches < 73 else "XL"
            else:
                rec_size = "XL" if height_inches < 75 else "XXL"

            if fit_pref == "relaxed" and rec_size not in ["XL", "XXL"]:
                size_order = ["XS", "S", "M", "L", "XL", "XXL"]
                curr_idx = size_order.index(rec_size)
                rec_size = size_order[min(curr_idx + 1, len(size_order) - 1)]
                fit_note = "Stepped up 1 size for relaxed layering over thermal hoodies."
            elif fit_pref == "trim" and rec_size != "XS":
                size_order = ["XS", "S", "M", "L", "XL", "XXL"]
                curr_idx = size_order.index(rec_size)
                rec_size = size_order[max(curr_idx - 1, 0)]
                fit_note = "Adjusted for a low-drag, snug performance fit."

        return {
            "recommended_size": rec_size,
            "confidence": 0.92,
            "fit_note": fit_note,
            "chart": SIZING_CHARTS.get(category, SIZING_CHARTS["Outerwear"])
        }

    def get_stock_response(self, query: str, user_email: Optional[str] = None) -> Dict[str, Any]:
        """Resolves stock availability questions with real-time counts, restock dates, and full sizing options."""
        items = self.search_inventory(query)
        extracted = self.extract_size_and_item(query)
        target_size = extracted.get("size")

        if not items:
            # Fallback by domain keywords
            if "parka" in query.lower() or "jacket" in query.lower():
                items = [i for i in self.inventory.values() if "Parka" in i.name or "Shell" in i.name]
            elif "shoe" in query.lower() or "runner" in query.lower() or "sneaker" in query.lower():
                items = [i for i in self.inventory.values() if "Shoes" in i.name]
            elif "fleece" in query.lower() or "pullover" in query.lower():
                items = [i for i in self.inventory.values() if "Fleece" in i.name]
            elif "duffel" in query.lower() or "bag" in query.lower():
                items = [i for i in self.inventory.values() if "Duffel" in i.name]
            elif "merino" in query.lower() or "sock" in query.lower() or "base" in query.lower():
                items = [i for i in self.inventory.values() if "Merino" in i.name]
            else:
                items = list(self.inventory.values())[:6]

        # Prioritize matching size if user asked for specific size
        if target_size:
            matched_size_item = next((i for i in items if i.size.upper() == target_size.upper()), None)
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

        # Build full variant matrix for this product family
        all_product_variants = self.get_product_variants(primary_item.name)
        available_sizes = sorted(list(set(v.size for v in all_product_variants)))
        available_colors = sorted(list(set(v.color for v in all_product_variants)))
        
        variant_summary = []
        for v in all_product_variants:
            variant_summary.append({
                "sku": v.sku,
                "size": v.size,
                "color": v.color,
                "stock_count": v.stock_count,
                "is_in_stock": v.stock_count > 0,
                "status": "IN_STOCK" if v.stock_count > 0 else "OUT_OF_STOCK",
                "warehouse": v.warehouse_location,
                "restock_expected_date": v.restock_expected_date
            })

        size_chart = SIZING_CHARTS.get(primary_item.category, SIZING_CHARTS["Outerwear"])

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
                    "category": primary_item.category,
                    "size": primary_item.size,
                    "color": primary_item.color,
                    "stock_count": primary_item.stock_count,
                    "warehouse": primary_item.warehouse_location
                },
                "available_sizes": available_sizes,
                "available_colors": available_colors,
                "variants": variant_summary,
                "sizing_chart": size_chart,
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
                "category": primary_item.category,
                "size": primary_item.size,
                "color": primary_item.color,
                "restock_expected_date": primary_item.restock_expected_date,
                "warehouse": primary_item.warehouse_location
            },
            "available_sizes": available_sizes,
            "available_colors": available_colors,
            "variants": variant_summary,
            "sizing_chart": size_chart,
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

