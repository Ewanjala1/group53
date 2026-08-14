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
    "NST-APEX-BLK-L": InventoryItem(
        sku="NST-APEX-BLK-L",
        name="Apex Waterproof Shell",
        category="Outerwear",
        size="L",
        color="Stealth Black",
        stock_count=12,
        warehouse_location="Dallas Distribution Center"
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
    "NST-TRL-SH-9": InventoryItem(
        sku="NST-TRL-SH-9",
        name="TrailRunner Pro Shoes",
        category="Footwear",
        size="9.5",
        color="Clay / Ember",
        stock_count=0,
        warehouse_location="Atlanta Facility",
        restock_expected_date="2026-08-28",
        alternatives_skus=["NST-TRL-SH-10", "NST-TRL-SH-95-GRY"]
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
        alternatives_skus=["NST-PRK-OLV-S", "NST-APEX-NVY-M"]
    ),
    "NST-FLC-GRY-L": InventoryItem(
        sku="NST-FLC-GRY-L",
        name="CloudLoft Fleece Pullover",
        category="Midlayers",
        size="L",
        color="Heather Gray",
        stock_count=23,
        warehouse_location="Seattle Hub"
    )
}
