export type TicketCategory =
  | "ORDER_STATUS"
  | "RETURNS_REFUNDS"
  | "STOCK_AVAILABILITY"
  | "GENERAL_INQUIRY"
  | "ESCALATION";

export type TicketStatus = "OPEN" | "DEFLECTED_BOT" | "RESOLVED_SELF_SERVE" | "ESCALATED_HUMAN" | "PENDING_CUSTOMER";

export interface OrderItem {
  sku: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  is_final_sale?: boolean;
}

export interface OrderData {
  order_id: string;
  customer_name: string;
  customer_email?: string;
  order_date: string;
  status: "processing" | "shipped" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled";
  carrier: string;
  tracking_number: string;
  estimated_delivery: string;
  shipping_address: string;
  last_checkpoint: string;
  is_delayed: boolean;
  delay_reason?: string | null;
  items: OrderItem[];
}

export interface ReturnRequestRecord {
  rma_number: string;
  order_id: string;
  sku: string;
  reason: string;
  created_at: string;
  status: "label_generated" | "in_transit_back" | "received_inspected" | "refund_issued";
  refund_amount: number;
  refund_method: string;
  prepaid_label_url: string;
}

export interface InventoryItemData {
  sku: string;
  name: string;
  category: string;
  size: string;
  color: string;
  stock_count: number;
  warehouse_location: string;
  restock_expected_date?: string | null;
  alternatives_skus?: string[];
}

export interface SupportTicket {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  query: string;
  category: TicketCategory;
  confidence: number;
  sentiment: "frustrated" | "neutral" | "urgent" | "positive";
  deflected: boolean;
  resolution_type: "AUTO_RESOLVED" | "SELF_SERVED" | "ROUTED_HUMAN";
  handling_time_seconds: number;
  timestamp: string;
  response_summary: string;
}

export interface DeflectionAnalyticsReport {
  total_tickets: number;
  deflected_count: number;
  human_escalated_count: number;
  deflection_rate_pct: number;
  human_hours_saved: number;
  estimated_cost_savings_usd: number;
  category_breakdown: Record<string, { total: number; deflected: number; deflection_rate: number }>;
  sample_tickets: SupportTicket[];
}

// Assignment 1: Charter & Sprint Board Types
export type PodRole = 
  | "Product Lead & Client Liaison"
  | "Lead Backend Python Engineer"
  | "Full-Stack Integration Dev"
  | "QA & Deflection Data Specialist"
  | "Customer Support Ops Engineer";

export interface PodMember {
  id: string;
  name: string;
  role: PodRole;
  avatar: string;
  email: string;
  bio: string;
  assignedTasksCount: number;
  completedTasksCount: number;
}

export type SprintTaskStatus = "BACKLOG" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export interface SprintTask {
  id: string; // e.g. TASK-01
  title: string;
  description: string;
  ownerId: string;
  ownerName: string;
  day: 1 | 2 | 3 | 4 | 5;
  priority: "HIGH" | "MEDIUM" | "CRITICAL";
  estimatedHours: number; // Strictly <= 4h per anti-black-box rule
  status: SprintTaskStatus;
  definitionOfDone: string; // Single checkable sentence
  associatedCommit?: string;
  category: "ORDER_STATUS" | "RETURNS_REFUNDS" | "STOCK_AVAILABILITY" | "ARCHITECTURE" | "AUDIT_DELIVERABLES";
  updatedAt: string;
}

// Assignment 2: Audit Trail & Commit Types
export interface CommitRecord {
  hash: string;
  type: "feat" | "fix" | "test" | "refactor" | "docs" | "chore";
  message: string; // Follows strictly: <type>: <what changed> - <why it matters>
  authorName: string;
  authorEmail: string;
  timestamp: string;
  day: number;
  branch: string;
  taskId: string;
  filesChanged: string[];
  insertions: number;
  deletions: number;
}

export interface BoardStatusMove {
  id: string;
  taskId: string;
  taskTitle: string;
  fromStatus: SprintTaskStatus;
  toStatus: SprintTaskStatus;
  movedBy: string;
  timestamp: string;
  day: number;
  isSameDay: boolean;
}

// Assignment 3: Diagnostic & Confidential Peer Reliability Index
export interface BaselineDiagnosticItem {
  id: string;
  area: string;
  question: string;
  day1SoloResponse: string;
  initialRating: number; // 1-5
  day5FinalReflection: string;
  growthRating: number; // 1-5
}

export interface PeerReliabilityScore {
  targetMemberId: string;
  targetMemberName: string;
  evaluatedByRole: string;
  // 5 Confidential Questions
  q1_reliability: number; // 1-5: Did they deliver assigned <=4h tasks on schedule without silent blocking?
  q2_codeCraft: number; // 1-5: Did their Python/code contributions follow anti-black-box DoD and strict standards?
  q3_communication: number; // 1-5: Did they update the board same-day and flag roadblocks before 24h?
  q4_taskOwnership: number; // 1-5: Did they take full ownership of their deliverable slices without requiring micromanagement?
  q5_collaboration: number; // 1-5: Were their code reviews and pod interactions constructive and client-ready?
  confidentialComment: string;
}
