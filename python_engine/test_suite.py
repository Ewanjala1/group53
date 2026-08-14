"""
Northstar Retail Co. - Deflection MVP Test Suite
Verifies all 3 support deflection categories, edge cases, and anti-black-box criteria.
"""
import unittest
from .order_service import OrderService
from .returns_engine import ReturnsEngine
from .inventory_lookup import InventoryLookupService
from .ticket_classifier import TicketClassifier
from .deflection_engine import NorthstarDeflectionEngine
from .models import SAMPLE_ORDERS, SAMPLE_INVENTORY

class TestNorthstarDeflectionEngine(unittest.TestCase):
    def setUp(self):
        self.engine = NorthstarDeflectionEngine()
        self.order_service = OrderService(SAMPLE_ORDERS)
        self.returns_engine = ReturnsEngine(SAMPLE_ORDERS)
        self.inventory_service = InventoryLookupService(SAMPLE_INVENTORY)
        self.classifier = TicketClassifier()

    # Category 1: Order Status Tests
    def test_order_status_lookup_valid(self):
        result = self.order_service.get_order_status_response("Where is my order NST-9482?")
        self.assertTrue(result["success"])
        self.assertTrue(result["deflected"])
        self.assertEqual(result["order_id"], "NST-9482")
        self.assertEqual(result["status"], "out_for_delivery")
        self.assertIn("FedEx Express", result["message"])

    def test_order_status_lookup_delayed(self):
        result = self.order_service.get_order_status_response("Is NST-3319 delayed?")
        self.assertTrue(result["success"])
        self.assertTrue(result["order"]["is_delayed"])
        self.assertIn("thunderstorms", result["message"])

    def test_order_status_not_found(self):
        result = self.order_service.get_order_status_response("Where is order NST-9999?")
        self.assertFalse(result["success"])
        self.assertFalse(result["deflected"])

    # Category 2: Returns & Refunds Tests
    def test_return_eligibility_standard(self):
        order = SAMPLE_ORDERS["NST-7391"]
        eligibility = self.returns_engine.check_return_eligibility(order)
        self.assertTrue(eligibility["can_return_any"])
        # Final sale item should be ineligible
        ineligible_skus = [i["sku"] for i in eligibility["ineligible_items"]]
        self.assertIn("NST-GLV-LTH-M", ineligible_skus)

    def test_instant_rma_creation(self):
        res = self.returns_engine.create_instant_rma("NST-7391", "NST-PRK-OLV-S", "Wrong Size")
        self.assertTrue(res["success"])
        self.assertTrue(res["rma_number"].startswith("RMA-2026-"))
        self.assertEqual(res["refund_amount"], 299.00)

    def test_refund_timeline_query(self):
        res = self.returns_engine.get_returns_refund_response("When will I get my refund back?")
        self.assertTrue(res["deflected"])
        self.assertIn("3–5 business days", res["message"])

    # Category 3: Stock Availability Tests
    def test_inventory_in_stock(self):
        res = self.inventory_service.get_stock_response("Is the Apex Waterproof Shell in M navy in stock?")
        self.assertTrue(res["deflected"])
        self.assertEqual(res["status"], "IN_STOCK")
        self.assertGreater(res["item"]["stock_count"], 0)

    def test_inventory_out_of_stock_with_restock_date(self):
        res = self.inventory_service.get_stock_response("Do you have the Apex Shell in size L in obsidian navy?")
        self.assertTrue(res["deflected"])
        self.assertEqual(res["status"], "OUT_OF_STOCK")
        self.assertIsNotNone(res["item"]["restock_expected_date"])

    def test_restock_subscription(self):
        sub = self.inventory_service.subscribe_restock_alert("tester@northstar.example", "NST-APEX-NVY-L")
        self.assertTrue(sub["success"])
        self.assertIn("VIP list", sub["message"])

    def test_size_matrix_lookup(self):
        matrix = self.inventory_service.get_size_matrix("Apex Waterproof Shell", "Obsidian Navy")
        self.assertGreater(len(matrix), 3)
        sizes = [m["size"] for m in matrix]
        self.assertIn("M", sizes)
        self.assertIn("L", sizes)
        # Size M should be in stock, L out of stock
        size_m = next(m for m in matrix if m["size"] == "M")
        size_l = next(m for m in matrix if m["size"] == "L")
        self.assertTrue(size_m["in_stock"])
        self.assertFalse(size_l["in_stock"])

    def test_size_recommendation_engine(self):
        rec = self.inventory_service.recommend_size("Outerwear", height_inches=72, weight_lbs=185, fit_pref="true_to_size")
        self.assertIn("recommended_size", rec)
        self.assertIn(rec["recommended_size"], ["M", "L"])
        self.assertIn("chart", rec)

    # Classification & End-to-End Deflection Tests
    def test_ticket_classification_high_confidence(self):
        c1 = self.classifier.classify("Track my package NST-1048")
        self.assertEqual(c1["category"], "ORDER_STATUS")
        self.assertGreaterEqual(c1["confidence"], 0.70)

        c2 = self.classifier.classify("How do I return my unworn sweater for a refund?")
        self.assertEqual(c2["category"], "RETURNS_REFUNDS")

        c3 = self.classifier.classify("Is the size 10 trail runner sneaker back in stock?")
        self.assertEqual(c3["category"], "STOCK_AVAILABILITY")

    def test_end_to_end_deflection_dispatcher(self):
        res = self.engine.process_inquiry("Where is my order NST-9482?")
        self.assertTrue(res["deflected"])
        self.assertEqual(res["resolution_type"], "AUTO_RESOLVED")

def run_tests():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestNorthstarDeflectionEngine)
    runner = unittest.TextTestRunner(verbosity=2)
    return runner.run(suite)

if __name__ == "__main__":
    unittest.main()
