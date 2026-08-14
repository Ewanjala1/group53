"""
Northstar Retail Co. - Core Support Deflection Dispatcher
Coordinates Order Status, Returns/Refunds, and Stock Inquiries to achieve >80% automated resolution.
"""
from typing import Dict, Any, Optional
from .models import SAMPLE_ORDERS, SAMPLE_INVENTORY
from .order_service import OrderService
from .returns_engine import ReturnsEngine
from .inventory_lookup import InventoryLookupService
from .ticket_classifier import TicketClassifier

class NorthstarDeflectionEngine:
    def __init__(self):
        self.order_service = OrderService(SAMPLE_ORDERS)
        self.returns_engine = ReturnsEngine(SAMPLE_ORDERS)
        self.inventory_service = InventoryLookupService(SAMPLE_INVENTORY)
        self.classifier = TicketClassifier()

    def process_inquiry(self, query: str, customer_email: Optional[str] = None, order_id: Optional[str] = None) -> Dict[str, Any]:
        """Main dispatcher entry point that categorizes and deflects inbound customer inquiries."""
        classification = self.classifier.classify(query)
        cat = classification["category"]
        conf = classification["confidence"]

        # Extract explicit order ID from text if not provided
        if not order_id:
            order_id = self.order_service.extract_order_id(query)

        # Route to appropriate domain module
        if cat == "ORDER_STATUS":
            result = self.order_service.get_order_status_response(query, customer_email)
            flow_name = "Order Tracking & ETA Resolution"
        elif cat == "RETURNS_REFUNDS":
            result = self.returns_engine.get_returns_refund_response(query, order_id)
            flow_name = "Instant RMA & Refund Policy Automation"
        elif cat == "STOCK_AVAILABILITY":
            result = self.inventory_service.get_stock_response(query, customer_email)
            flow_name = "Real-Time Inventory & Size Availability"
        else:
            flow_name = "General Support & Triage"
            result = {
                "success": False,
                "deflected": False,
                "category": "GENERAL_INQUIRY",
                "message": (
                    "Thank you for contacting Northstar Support! To get you the quickest answer, "
                    "would you like to check **Order Tracking**, start a **Return / Refund**, or check **Stock Availability**?"
                ),
                "suggested_actions": [
                    "Check Order Status (NST-XXXX)",
                    "Start a Return / Refund",
                    "Check Stock & Sizing"
                ]
            }

        is_deflected = result.get("deflected", False)
        resolution_type = "AUTO_RESOLVED" if is_deflected else "ROUTED_HUMAN"

        return {
            "query": query,
            "classification": classification,
            "flow_name": flow_name,
            "deflected": is_deflected,
            "resolution_type": resolution_type,
            "response": result.get("message", ""),
            "data": result,
            "suggested_actions": result.get("suggested_actions", [])
        }

if __name__ == "__main__":
    engine = NorthstarDeflectionEngine()
    test_queries = [
        "Where is my order NST-9482? Is it delayed?",
        "How do I return my parka from order NST-7391?",
        "Do you have the Apex Waterproof Shell in size L in navy? When is it back in stock?"
    ]
    for q in test_queries:
        print(f"\n--- Testing Query: '{q}' ---")
        res = engine.process_inquiry(q)
        print(f"Flow: {res['flow_name']} | Deflected: {res['deflected']} (Confidence: {res['classification']['confidence']})")
        print(f"Response:\n{res['response']}")
