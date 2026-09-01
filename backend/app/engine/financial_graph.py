import datetime
from typing import Dict, Any, List, Optional

class FinancialRelationshipGraph:
    """
    Builds and queries the internal linked financial relationship graph:
    Company -> Vendor -> Invoice -> Payment -> Bank Transaction -> Ledger Entry -> Tax Record -> Audit Log.
    Used by the Investigation Agent to trace financial data lineage.
    """
    def __init__(self):
        self.nodes = {}
        self.edges = []

    def add_node(self, node_id: str, entity_type: str, label: str, properties: Dict[str, Any] = None):
        self.nodes[node_id] = {
            "node_id": node_id,
            "type": entity_type,
            "label": label,
            "properties": properties or {}
        }

    def add_edge(self, source_id: str, target_id: str, relation_type: str, confidence: float = 1.0):
        self.edges.append({
            "edge_id": f"EDGE-{len(self.edges)+1}",
            "source": source_id,
            "target": target_id,
            "relation": relation_type,
            "confidence": confidence
        })

    def get_lineage_trace(self, start_node_id: str) -> Dict[str, Any]:
        """
        Traces financial lineage from invoice -> payment -> bank -> ledger -> tax -> audit.
        """
        visited_nodes = []
        connected_edges = []
        
        queue = [start_node_id]
        visited_ids = set()

        while queue:
            curr = queue.pop(0)
            if curr in visited_ids:
                continue
            visited_ids.add(curr)
            
            if curr in self.nodes:
                visited_nodes.append(self.nodes[curr])

            for edge in self.edges:
                if edge["source"] == curr and edge["target"] not in visited_ids:
                    connected_edges.append(edge)
                    queue.append(edge["target"])
                elif edge["target"] == curr and edge["source"] not in visited_ids:
                    connected_edges.append(edge)
                    queue.append(edge["source"])

        return {
            "root_id": start_node_id,
            "node_count": len(visited_nodes),
            "edge_count": len(connected_edges),
            "nodes": visited_nodes,
            "edges": connected_edges
        }

def build_demo_financial_graph(org_name: str = "NovaTech AI Systems") -> Dict[str, Any]:
    graph = FinancialRelationshipGraph()
    
    # 1. Company
    graph.add_node("ORG-1", "COMPANY", org_name, {"revenue": "₹18.4 Cr", "cash": "₹4.82 Cr"})
    
    # 2. Vendors & Customers
    graph.add_node("VND-1", "VENDOR", "Alpha Supplies Corp", {"category": "Hardware & Office", "risk": "HIGH"})
    graph.add_node("VND-2", "VENDOR", "AWS Cloud Services", {"category": "Cloud Infrastructure", "risk": "LOW"})
    graph.add_node("CST-1", "CUSTOMER", "ABC Corp Enterprise", {"receivable": "₹18.0L", "risk": "MEDIUM"})
    
    # Edges Org -> Vendors / Customers
    graph.add_edge("ORG-1", "VND-1", "PURCHASES_FROM")
    graph.add_edge("ORG-1", "VND-2", "SUBSCRIBED_TO")
    graph.add_edge("ORG-1", "CST-1", "SELLS_TO")

    # 3. Invoices
    graph.add_node("INV-881", "INVOICE", "INV-2026-881", {"amount": 485000.0, "status": "Flagged", "is_duplicate": True})
    graph.add_node("INV-880", "INVOICE", "INV-2026-880", {"amount": 485000.0, "status": "Pending"})
    graph.add_node("INV-904", "INVOICE", "INV-REC-904", {"amount": 1800000.0, "status": "Overdue"})

    graph.add_edge("VND-1", "INV-881", "ISSUED_INVOICE")
    graph.add_edge("VND-1", "INV-880", "ISSUED_INVOICE")
    graph.add_edge("CST-1", "INV-904", "OWES_INVOICE")

    # 4. Bank Payments & Transactions
    graph.add_node("TXN-9021", "BANK_TXN", "TXN-9021 (Alpha Card Payment)", {"amount": 485000.0, "status": "Flagged"})
    graph.add_node("TXN-9020", "BANK_TXN", "TXN-9020 (AWS Bank Transfer)", {"amount": 284000.0, "status": "Completed"})
    
    graph.add_edge("INV-881", "TXN-9021", "PAID_VIA", confidence=0.91)
    graph.add_edge("VND-2", "TXN-9020", "PAID_VIA", confidence=0.98)

    # 5. Ledger Accounts & Tax
    graph.add_node("GL-401", "LEDGER_ENTRY", "GL-401 (Office Hardware Expense)", {"debit": 411016.0})
    graph.add_node("TAX-18", "TAX_RECORD", "GST-18% (CGST 9% + SGST 9%)", {"tax_amount": 73984.0, "gstin": "27AAACN9012K1Z5"})

    graph.add_edge("TXN-9021", "GL-401", "POSTED_TO")
    graph.add_edge("INV-881", "TAX-18", "TAXED_AS")

    return graph.get_lineage_trace("INV-881")
