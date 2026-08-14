"""
Northstar Retail Co. - Core Data Models & Store Data
Part of the 1-Week Support Deflection Sprint MVP
"""
from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

@dataclass
class OrderItem:
    sku: str
    name: str
    size: str
    color: str
    quantity: int
    price: float
    is_final_sale: bool = False

@dataclass
class Order:
    order_id: str
    customer_name: str
    customer_email: str
    order_date: str
    status: str  # 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'
    carrier: str
    tracking_number: str
    estimated_delivery: str
    items: List[OrderItem]
    shipping_address: str
    last_checkpoint: str
    is_delayed: bool = False
    delay_reason: Optional[str] = None

@dataclass
class InventoryItem:
    sku: str
    name: str
    category: str
    size: str
    color: str
    stock_count: int
    warehouse_location: str
    restock_expected_date: Optional[str] = None
    alternatives_skus: List[str] = field(default_factory=list)

@dataclass
class ReturnRequest:
    rma_number: str
    order_id: str
    sku: str
    reason: str
    created_at: str
    status: str  # 'label_generated', 'in_transit_back', 'received_inspected', 'refund_issued'
    refund_amount: float
    refund_method: str
    prepaid_label_url: str

@dataclass
class Ticket:
    ticket_id: str
    customer_email: str
    customer_name: str
    subject: str
    raw_message: str
    category: str  # 'ORDER_STATUS', 'RETURNS_REFUNDS', 'STOCK_AVAILABILITY', 'GENERAL_INQUIRY', 'ESCALATION'
    confidence: float
    sentiment: str  # 'neutral', 'frustrated', 'urgent', 'positive'
    deflected: bool
    resolution_type: str  # 'AUTO_RESOLVED', 'SELF_SERVED', 'ROUTED_HUMAN'
    auto_response: str
    timestamp: str

# Sample Mock Database for Northstar Store
SAMPLE_ORDERS: Dict[str, Order] = {
    "NST-9482": Order(
        order_id="NST-9482",
        customer_name="Sarah Jenkins",
        customer_email="sarah.j@example.com",
        order_date="2026-08-10",
        status="out_for_delivery",
        carrier="FedEx Express",
        tracking_number="FX-8839201948",
        estimated_delivery="2026-08-13 (Today by 4:30 PM)",
        items=[
            OrderItem(sku="NST-APEX-NVY-M", name="Apex Waterproof Shell", size="M", color="Obsidian Navy", quantity=1, price=189.00)
        ],
        shipping_address="742 Evergreen Terrace, Seattle, WA 98101",
        last_checkpoint="Loaded onto delivery vehicle at Seattle Sorting Hub (8:14 AM)",
        is_delayed=False
    ),
    "NST-1048": Order(
        order_id="NST-1048",
        customer_name="Marcus Vance",
        customer_email="marcus.v@example.com",
        order_date="2026-08-08",
        status="in_transit",
        carrier="UPS Ground",
        tracking_number="1Z9999999999999999",
        estimated_delivery="2026-08-15",
        items=[
            OrderItem(sku="NST-TRL-SH-10", name="TrailRunner Pro Shoes", size="10.5", color="Clay / Ember", quantity=1, price=145.00),
            OrderItem(sku="NST-MRN-BLK-L", name="Merino Performance Socks (3-pk)", size="L", color="Charcoal", quantity=2, price=32.00)
        ],
        shipping_address="1200 Grand Ave, Denver, CO 80202",
        last_checkpoint="Departed UPS Regional Facility, Salt Lake City, UT (Aug 12, 11:30 PM)",
        is_delayed=False
    ),
    "NST-7391": Order(
        order_id="NST-7391",
        customer_name="Elena Rostova",
        customer_email="elena.r@example.com",
        order_date="2026-07-28",
        status="delivered",
        carrier="DHL Express",
        tracking_number="DHL-44829104",
        estimated_delivery="2026-08-02",
        items=[
            OrderItem(sku="NST-PRK-OLV-S", name="Altitude Thermal Parka", size="S", color="Alpine Olive", quantity=1, price=299.00),
            OrderItem(sku="NST-GLV-LTH-M", name="Arctic Grip Leather Gloves", size="M", color="Raw Tan", quantity=1, price=75.00, is_final_sale=True)
        ],
        shipping_address="450 Sutter St, San Francisco, CA 94108",
        last_checkpoint="Delivered at Front Porch / Signed by E. Rostova (Aug 02, 2:15 PM)",
        is_delayed=False
    ),
    "NST-5520": Order(
        order_id="NST-5520",
        customer_name="David Kim",
        customer_email="david.k@example.com",
        order_date="2026-08-11",
        status="processing",
        carrier="USPS Priority",
        tracking_number="9400100000000000000000",
        estimated_delivery="2026-08-17",
        items=[
            OrderItem(sku="NST-FLC-GRY-L", name="CloudLoft Fleece Pullover", size="L", color="Heather Gray", quantity=1, price=110.00)
        ],
        shipping_address="888 Michigan Ave, Chicago, IL 60611",
        last_checkpoint="Fulfillment center packing and barcoding (Seattle Facility)",
        is_delayed=False
    ),
    "NST-3319": Order(
        order_id="NST-3319",
        customer_name="Chloe Bennett",
        customer_email="chloe.b@example.com",
        order_date="2026-08-05",
        status="in_transit",
        carrier="FedEx Home",
        tracking_number="FX-1102948572",
        estimated_delivery="2026-08-16",
        items=[
            OrderItem(sku="NST-DUF-BLK-45", name="Expedition 45L Duffel Bag", size="One Size", color="Matte Black", quantity=1, price=165.00)
        ],
        shipping_address="310 Elm St, Austin, TX 78701",
        last_checkpoint="Weather delay in Memphis Hub (Rerouted via Dallas facility)",
        is_delayed=True,
        delay_reason="Severe regional thunderstorms delayed connecting cargo flight by 24h."
    )
}

SAMPLE_INVENTORY: Dict[str, InventoryItem] = {
    # Apex Waterproof Shell - Obsidian Navy
    "NST-APEX-NVY-XS": InventoryItem(
        sku="NST-APEX-NVY-XS",
        name="Apex Waterproof Shell",
        category="Outerwear",
        size="XS",
        color="Obsidian Navy",
        stock_count=5,
        warehouse_location="Seattle Fulfillment Hub (Aisle 4A)"
    ),
    "NST-APEX-NVY-S": InventoryItem(
        sku="NST-APEX-NVY-S",
        name="Apex Waterproof Shell",
        category="Outerwear",
        size="S",
        color="Obsidian Navy",
        stock_count=9,
        warehouse_location="Seattle Fulfillment Hub (Aisle 4A)"
    ),
    "NST-APEX-NVY-M": InventoryItem(
        sku="NST-APEX-NVY-M",
        name="Apex Waterproof Shell",
        category="Outerwear",
        size="M",
        color="Obsidian Navy",
        stock_count=18,
        warehouse_location="Seattle Fulfillment Hub (Aisle 4B)"
    ),
    "NST-APEX-NVY-L": InventoryItem(
        sku="NST-APEX-NVY-L",
        name="Apex Waterproof Shell",
        category="Outerwear",
        size="L",
        color="Obsidian Navy",
        stock_count=0,
        warehouse_location="Seattle Fulfillment Hub",
        restock_expected_date="2026-08-22",
        alternatives_skus=["NST-APEX-NVY-M", "NST-APEX-BLK-L", "NST-PRK-OLV-L"]
    ),
    "NST-APEX-NVY-XL": InventoryItem(
        sku="NST-APEX-NVY-XL",
        name="Apex Waterproof Shell",
        category="Outerwear",
        size="XL",
        color="Obsidian Navy",
        stock_count=7,
        warehouse_location="Seattle Fulfillment Hub (Aisle 4C)"
    ),
    "NST-APEX-NVY-XXL": InventoryItem(
        sku="NST-APEX-NVY-XXL",
        name="Apex Waterproof Shell",
        category="Outerwear",
        size="XXL",
        color="Obsidian Navy",
        stock_count=2,
        warehouse_location="Seattle Fulfillment Hub (Aisle 4C)"
    ),

    # Apex Waterproof Shell - Stealth Black
    "NST-APEX-BLK-S": InventoryItem(
        sku="NST-APEX-BLK-S",
        name="Apex Waterproof Shell",
        category="Outerwear",
        size="S",
        color="Stealth Black",
        stock_count=8,
        warehouse_location="Dallas Distribution Center"
    ),
    "NST-APEX-BLK-M": InventoryItem(
        sku="NST-APEX-BLK-M",
        name="Apex Waterproof Shell",
        category="Outerwear",
        size="M",
        color="Stealth Black",
        stock_count=14,
        warehouse_location="Dallas Distribution Center"
    ),
    "NST-APEX-BLK-L": InventoryItem(
        sku="NST-APEX-BLK-L",
        name="Apex Waterproof Shell",
        category="Outerwear",
        size="L",
        color="Stealth Black",
        stock_count=12,
        warehouse_location="Dallas Distribution Center"
    ),
    "NST-APEX-BLK-XL": InventoryItem(
        sku="NST-APEX-BLK-XL",
        name="Apex Waterproof Shell",
        category="Outerwear",
        size="XL",
        color="Stealth Black",
        stock_count=6,
        warehouse_location="Dallas Distribution Center"
    ),

    # Apex Waterproof Shell - Alpine Moss
    "NST-APEX-MOS-M": InventoryItem(
        sku="NST-APEX-MOS-M",
        name="Apex Waterproof Shell",
        category="Outerwear",
        size="M",
        color="Alpine Moss",
        stock_count=11,
        warehouse_location="Seattle Hub"
    ),
    "NST-APEX-MOS-L": InventoryItem(
        sku="NST-APEX-MOS-L",
        name="Apex Waterproof Shell",
        category="Outerwear",
        size="L",
        color="Alpine Moss",
        stock_count=6,
        warehouse_location="Seattle Hub"
    ),

    # TrailRunner Pro Shoes - Clay / Ember
    "NST-TRL-SH-80": InventoryItem(
        sku="NST-TRL-SH-80",
        name="TrailRunner Pro Shoes",
        category="Footwear",
        size="8.0",
        color="Clay / Ember",
        stock_count=6,
        warehouse_location="Atlanta Facility"
    ),
    "NST-TRL-SH-85": InventoryItem(
        sku="NST-TRL-SH-85",
        name="TrailRunner Pro Shoes",
        category="Footwear",
        size="8.5",
        color="Clay / Ember",
        stock_count=12,
        warehouse_location="Atlanta Facility"
    ),
    "NST-TRL-SH-9": InventoryItem(
        sku="NST-TRL-SH-9",
        name="TrailRunner Pro Shoes",
        category="Footwear",
        size="9.5",
        color="Clay / Ember",
        stock_count=0,
        warehouse_location="Atlanta Facility",
        restock_expected_date="2026-08-28",
        alternatives_skus=["NST-TRL-SH-10", "NST-TRL-GLC-95", "NST-TRL-SH-85"]
    ),
    "NST-TRL-SH-10": InventoryItem(
        sku="NST-TRL-SH-10",
        name="TrailRunner Pro Shoes",
        category="Footwear",
        size="10.5",
        color="Clay / Ember",
        stock_count=4,
        warehouse_location="Atlanta Facility"
    ),
    "NST-TRL-SH-11": InventoryItem(
        sku="NST-TRL-SH-11",
        name="TrailRunner Pro Shoes",
        category="Footwear",
        size="11.0",
        color="Clay / Ember",
        stock_count=8,
        warehouse_location="Atlanta Facility"
    ),
    "NST-TRL-SH-12": InventoryItem(
        sku="NST-TRL-SH-12",
        name="TrailRunner Pro Shoes",
        category="Footwear",
        size="12.0",
        color="Clay / Ember",
        stock_count=5,
        warehouse_location="Atlanta Facility"
    ),

    # TrailRunner Pro Shoes - Glacier / Slate
    "NST-TRL-GLC-95": InventoryItem(
        sku="NST-TRL-GLC-95",
        name="TrailRunner Pro Shoes",
        category="Footwear",
        size="9.5",
        color="Glacier / Slate",
        stock_count=7,
        warehouse_location="Chicago Facility"
    ),
    "NST-TRL-GLC-105": InventoryItem(
        sku="NST-TRL-GLC-105",
        name="TrailRunner Pro Shoes",
        category="Footwear",
        size="10.5",
        color="Glacier / Slate",
        stock_count=10,
        warehouse_location="Chicago Facility"
    ),

    # Altitude Thermal Parka - Alpine Olive
    "NST-PRK-OLV-XS": InventoryItem(
        sku="NST-PRK-OLV-XS",
        name="Altitude Thermal Parka",
        category="Outerwear",
        size="XS",
        color="Alpine Olive",
        stock_count=3,
        warehouse_location="Seattle Hub"
    ),
    "NST-PRK-OLV-S": InventoryItem(
        sku="NST-PRK-OLV-S",
        name="Altitude Thermal Parka",
        category="Outerwear",
        size="S",
        color="Alpine Olive",
        stock_count=8,
        warehouse_location="Seattle Hub"
    ),
    "NST-PRK-OLV-M": InventoryItem(
        sku="NST-PRK-OLV-M",
        name="Altitude Thermal Parka",
        category="Outerwear",
        size="M",
        color="Alpine Olive",
        stock_count=0,
        warehouse_location="Seattle Hub",
        restock_expected_date="2026-09-05",
        alternatives_skus=["NST-PRK-OLV-S", "NST-PRK-BLK-M", "NST-APEX-NVY-M"]
    ),
    "NST-PRK-OLV-L": InventoryItem(
        sku="NST-PRK-OLV-L",
        name="Altitude Thermal Parka",
        category="Outerwear",
        size="L",
        color="Alpine Olive",
        stock_count=11,
        warehouse_location="Seattle Hub"
    ),
    "NST-PRK-OLV-XL": InventoryItem(
        sku="NST-PRK-OLV-XL",
        name="Altitude Thermal Parka",
        category="Outerwear",
        size="XL",
        color="Alpine Olive",
        stock_count=4,
        warehouse_location="Seattle Hub"
    ),

    # Altitude Thermal Parka - Matte Black
    "NST-PRK-BLK-S": InventoryItem(
        sku="NST-PRK-BLK-S",
        name="Altitude Thermal Parka",
        category="Outerwear",
        size="S",
        color="Matte Black",
        stock_count=6,
        warehouse_location="Denver Fulfillment"
    ),
    "NST-PRK-BLK-M": InventoryItem(
        sku="NST-PRK-BLK-M",
        name="Altitude Thermal Parka",
        category="Outerwear",
        size="M",
        color="Matte Black",
        stock_count=15,
        warehouse_location="Denver Fulfillment"
    ),
    "NST-PRK-BLK-L": InventoryItem(
        sku="NST-PRK-BLK-L",
        name="Altitude Thermal Parka",
        category="Outerwear",
        size="L",
        color="Matte Black",
        stock_count=8,
        warehouse_location="Denver Fulfillment"
    ),

    # CloudLoft Fleece Pullover - Heather Gray
    "NST-FLC-GRY-XS": InventoryItem(
        sku="NST-FLC-GRY-XS",
        name="CloudLoft Fleece Pullover",
        category="Midlayers",
        size="XS",
        color="Heather Gray",
        stock_count=6,
        warehouse_location="Seattle Hub"
    ),
    "NST-FLC-GRY-S": InventoryItem(
        sku="NST-FLC-GRY-S",
        name="CloudLoft Fleece Pullover",
        category="Midlayers",
        size="S",
        color="Heather Gray",
        stock_count=14,
        warehouse_location="Seattle Hub"
    ),
    "NST-FLC-GRY-M": InventoryItem(
        sku="NST-FLC-GRY-M",
        name="CloudLoft Fleece Pullover",
        category="Midlayers",
        size="M",
        color="Heather Gray",
        stock_count=20,
        warehouse_location="Seattle Hub"
    ),
    "NST-FLC-GRY-L": InventoryItem(
        sku="NST-FLC-GRY-L",
        name="CloudLoft Fleece Pullover",
        category="Midlayers",
        size="L",
        color="Heather Gray",
        stock_count=23,
        warehouse_location="Seattle Hub"
    ),
    "NST-FLC-GRY-XL": InventoryItem(
        sku="NST-FLC-GRY-XL",
        name="CloudLoft Fleece Pullover",
        category="Midlayers",
        size="XL",
        color="Heather Gray",
        stock_count=0,
        warehouse_location="Seattle Hub",
        restock_expected_date="2026-09-10",
        alternatives_skus=["NST-FLC-GRY-L", "NST-FLC-SPR-XL"]
    ),
    "NST-FLC-GRY-XXL": InventoryItem(
        sku="NST-FLC-GRY-XXL",
        name="CloudLoft Fleece Pullover",
        category="Midlayers",
        size="XXL",
        color="Heather Gray",
        stock_count=4,
        warehouse_location="Seattle Hub"
    ),

    # CloudLoft Fleece Pullover - Forest Spruce
    "NST-FLC-SPR-M": InventoryItem(
        sku="NST-FLC-SPR-M",
        name="CloudLoft Fleece Pullover",
        category="Midlayers",
        size="M",
        color="Forest Spruce",
        stock_count=9,
        warehouse_location="Seattle Hub"
    ),
    "NST-FLC-SPR-L": InventoryItem(
        sku="NST-FLC-SPR-L",
        name="CloudLoft Fleece Pullover",
        category="Midlayers",
        size="L",
        color="Forest Spruce",
        stock_count=15,
        warehouse_location="Seattle Hub"
    ),
    "NST-FLC-SPR-XL": InventoryItem(
        sku="NST-FLC-SPR-XL",
        name="CloudLoft Fleece Pullover",
        category="Midlayers",
        size="XL",
        color="Forest Spruce",
        stock_count=5,
        warehouse_location="Seattle Hub"
    ),

    # Expedition 45L Duffel Bag
    "NST-DUF-BLK-45": InventoryItem(
        sku="NST-DUF-BLK-45",
        name="Expedition 45L Duffel Bag",
        category="Bags & Gear",
        size="One Size",
        color="Matte Black",
        stock_count=16,
        warehouse_location="Dallas Distribution Center"
    ),
    "NST-DUF-ORG-45": InventoryItem(
        sku="NST-DUF-ORG-45",
        name="Expedition 45L Duffel Bag",
        category="Bags & Gear",
        size="One Size",
        color="Signal Orange",
        stock_count=4,
        warehouse_location="Dallas Distribution Center"
    ),
    "NST-DUF-NVY-45": InventoryItem(
        sku="NST-DUF-NVY-45",
        name="Expedition 45L Duffel Bag",
        category="Bags & Gear",
        size="One Size",
        color="Navy Storm",
        stock_count=0,
        warehouse_location="Dallas Distribution Center",
        restock_expected_date="2026-08-26",
        alternatives_skus=["NST-DUF-BLK-45", "NST-DUF-ORG-45"]
    ),

    # Merino Performance Base Layer
    "NST-MRN-BLK-S": InventoryItem(
        sku="NST-MRN-BLK-S",
        name="Merino Performance Base Layer",
        category="Base Layers",
        size="S",
        color="Charcoal",
        stock_count=19,
        warehouse_location="Salt Lake City Hub"
    ),
    "NST-MRN-BLK-M": InventoryItem(
        sku="NST-MRN-BLK-M",
        name="Merino Performance Base Layer",
        category="Base Layers",
        size="M",
        color="Charcoal",
        stock_count=24,
        warehouse_location="Salt Lake City Hub"
    ),
    "NST-MRN-BLK-L": InventoryItem(
        sku="NST-MRN-BLK-L",
        name="Merino Performance Base Layer",
        category="Base Layers",
        size="L",
        color="Charcoal",
        stock_count=15,
        warehouse_location="Salt Lake City Hub"
    ),
    "NST-MRN-BLK-XL": InventoryItem(
        sku="NST-MRN-BLK-XL",
        name="Merino Performance Base Layer",
        category="Base Layers",
        size="XL",
        color="Charcoal",
        stock_count=2,
        warehouse_location="Salt Lake City Hub"
    ),
}
