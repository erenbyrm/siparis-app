import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleSlash,
  FileDown,
  Lock,
  LogOut,
  MessageCircle,
  Minus,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings2,
  Shield,
  ShoppingCart,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type Product = {
  id: number;
  orderNo: number;
  code: string;
  name: string;
  price: number;
  kdvRate: number;
};

type Customer = {
  id: number;
  name: string;
  company: string;
  phone: string;
  address: string;
  note: string;
};

type UserRole = "admin" | "pazarlamaci" | "uretim" | "sevkiyat";

type AppUser = {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  active: boolean;
};

type DiscountType = "percent" | "amount";

type DiscountState = {
  type: DiscountType;
  value: number | "";
};

type OrderStatus =
  | "Müşteriden Onay Bekleniyor"
  | "Müşteri Onayı Alındı"
  | "Yönetici Onayı Bekleniyor"
  | "Yönetici Onayladı"
  | "Hazırlanıyor"
  | "Sevkiyata Hazır"
  | "Tamamlandı"
  | "İptal";

type OrderLine = Product & {
  quantity: number;
  priceAfterDiscount: number;
  pendingQuantity: number;
  readyForShipmentQuantity: number;
  sentQuantity: number;
};

type ShipmentRecord = {
  id: string;
  createdAt: string;
  createdBy: string;
  items: Array<{
    itemId: number;
    code: string;
    name: string;
    quantity: number;
  }>;
};

type OrderRecord = {
  id: string;
  createdAt: string;
  createdBy: string;
  createdByUserId: number;
  customer: Customer;
  items: OrderLine[];
  globalDiscount: DiscountState;
  vatRate: number;
  status: OrderStatus;
  shipments: ShipmentRecord[];
  customerApprovedAt?: string;
  customerApprovedBy?: string;
  managerApprovedAt?: string;
  managerApprovedBy?: string;
  cancelledAt?: string;
  cancelledBy?: string;
};

type CartItem = Product & { quantity: number };
type SearchQuantityMap = Record<number, string>;
type ShipmentDraftMap = Record<string, string>;
type ReadyDraftMap = Record<string, string>;
type ExpandedOrderMap = Record<string, boolean>;

type ProductDraft = {
  orderNo: string;
  code: string;
  name: string;
  price: string;
  kdvRate: string;
};

type CustomerDraft = {
  name: string;
  company: string;
  phone: string;
  address: string;
  note: string;
};

type UserDraft = {
  username: string;
  password: string;
  role: UserRole;
  active: boolean;
};

type UserScreen = "dashboard" | "order_form";
type AdminSection = "none" | "orders" | "products" | "customers" | "users";

type BulkImportRow = {
  code: string;
  name: string;
  price: string;
  kdvRate: string;
};

const PRODUCTS_KEY = "siparis_products_v20";
const USERS_KEY = "siparis_users_v20";
const ORDERS_KEY = "siparis_orders_v20";
const CURRENT_USER_KEY = "siparis_current_user_v20";
const CUSTOMERS_KEY = "siparis_customers_v20";

const initialProducts: Product[] = [
  { id: 1, orderNo: 1, code: "SCC22", name: "2 + 2 Çift Çıkışlı Premium Alüminyum Merdiven", price: 1360, kdvRate: 20 },
  { id: 2, orderNo: 2, code: "SCC33", name: "3 + 3 Çift Çıkışlı Premium Alüminyum Merdiven", price: 1755, kdvRate: 20 },
  { id: 3, orderNo: 3, code: "SCC44", name: "4 + 4 Çift Çıkışlı Premium Alüminyum Merdiven", price: 2310, kdvRate: 20 },
  { id: 4, orderNo: 4, code: "SCC55", name: "5 + 5 Çift Çıkışlı Premium Alüminyum Merdiven", price: 2880, kdvRate: 20 },
  { id: 5, orderNo: 5, code: "SCC66", name: "6 + 6 Çift Çıkışlı Premium Alüminyum Merdiven", price: 3440, kdvRate: 20 },
];

const initialCustomers: Customer[] = [
  { id: 1, name: "Mehmet Yılmaz", company: "Yılmaz Hırdavat", phone: "0532 555 12 34", address: "Konya Organize Sanayi", note: "Örnek müşteri" },
  { id: 2, name: "Ayşe Demir", company: "Demir Ticaret", phone: "0533 222 45 67", address: "Konya Karatay", note: "Örnek müşteri" },
  { id: 3, name: "Hasan Kaya", company: "Kaya Yapı", phone: "0542 777 80 90", address: "Konya Selçuklu", note: "Örnek müşteri" },
];

const initialUsers: AppUser[] = [
  { id: 1, username: "EREN", password: "3736", role: "admin", active: true },
  { id: 2, username: "PAZARLAMACI", password: "2222", role: "pazarlamaci", active: true },
  { id: 3, username: "ÜRETİM", password: "1111", role: "uretim", active: true },
  { id: 4, username: "SEVKIYAT", password: "0000", role: "sevkiyat", active: true },
];

const initialOrders: OrderRecord[] = [
  {
    id: "SIP-300001",
    createdAt: "28.03.2026 09:15",
    createdBy: "PAZARLAMACI",
    createdByUserId: 2,
    customer: initialCustomers[0],
    items: [
      { ...initialProducts[0], quantity: 6, priceAfterDiscount: 1224, pendingQuantity: 4, readyForShipmentQuantity: 0, sentQuantity: 2 },
      { ...initialProducts[1], quantity: 4, priceAfterDiscount: 1579.5, pendingQuantity: 2, readyForShipmentQuantity: 1, sentQuantity: 1 },
    ],
    globalDiscount: { type: "percent", value: 10 },
    vatRate: 20,
    status: "Sevkiyata Hazır",
    customerApprovedAt: "28.03.2026 09:30",
    customerApprovedBy: "PAZARLAMACI",
    managerApprovedAt: "28.03.2026 09:45",
    managerApprovedBy: "EREN",
    shipments: [
      {
        id: "SH-300001-1",
        createdAt: "28.03.2026 10:45",
        createdBy: "SEVKIYAT",
        items: [
          { itemId: 1, code: initialProducts[0].code, name: initialProducts[0].name, quantity: 2 },
          { itemId: 2, code: initialProducts[1].code, name: initialProducts[1].name, quantity: 1 },
        ],
      },
    ],
  },
  {
    id: "SIP-300002",
    createdAt: "28.03.2026 10:20",
    createdBy: "PAZARLAMACI",
    createdByUserId: 2,
    customer: initialCustomers[1],
    items: [{ ...initialProducts[2], quantity: 3, priceAfterDiscount: 2310, pendingQuantity: 0, readyForShipmentQuantity: 0, sentQuantity: 3 }],
    globalDiscount: { type: "percent", value: 0 },
    vatRate: 20,
    status: "Tamamlandı",
    customerApprovedAt: "28.03.2026 10:30",
    customerApprovedBy: "PAZARLAMACI",
    managerApprovedAt: "28.03.2026 10:40",
    managerApprovedBy: "EREN",
    shipments: [
      {
        id: "SH-300002-1",
        createdAt: "28.03.2026 12:20",
        createdBy: "SEVKIYAT",
        items: [{ itemId: 3, code: initialProducts[2].code, name: initialProducts[2].name, quantity: 3 }],
      },
    ],
  },
  {
    id: "SIP-300003",
    createdAt: "28.03.2026 11:05",
    createdBy: "PAZARLAMACI",
    createdByUserId: 2,
    customer: initialCustomers[2],
    items: [
      { ...initialProducts[3], quantity: 5, priceAfterDiscount: 2736, pendingQuantity: 5, readyForShipmentQuantity: 0, sentQuantity: 0 },
      { ...initialProducts[4], quantity: 2, priceAfterDiscount: 3268, pendingQuantity: 2, readyForShipmentQuantity: 0, sentQuantity: 0 },
    ],
    globalDiscount: { type: "percent", value: 5 },
    vatRate: 20,
    status: "Yönetici Onayı Bekleniyor",
    customerApprovedAt: "28.03.2026 11:20",
    customerApprovedBy: "PAZARLAMACI",
    shipments: [],
  },
  {
    id: "SIP-300004",
    createdAt: "28.03.2026 11:40",
    createdBy: "PAZARLAMACI",
    createdByUserId: 2,
    customer: initialCustomers[0],
    items: [{ ...initialProducts[0], quantity: 2, priceAfterDiscount: 1360, pendingQuantity: 2, readyForShipmentQuantity: 0, sentQuantity: 0 }],
    globalDiscount: { type: "percent", value: 0 },
    vatRate: 20,
    status: "Müşteriden Onay Bekleniyor",
    shipments: [],
  },
  {
    id: "SIP-300005",
    createdAt: "28.03.2026 12:10",
    createdBy: "PAZARLAMACI",
    createdByUserId: 2,
    customer: initialCustomers[1],
    items: [
      { ...initialProducts[1], quantity: 5, priceAfterDiscount: 1667.25, pendingQuantity: 3, readyForShipmentQuantity: 0, sentQuantity: 0 },
      { ...initialProducts[4], quantity: 1, priceAfterDiscount: 3268, pendingQuantity: 1, readyForShipmentQuantity: 0, sentQuantity: 0 },
    ],
    globalDiscount: { type: "percent", value: 5 },
    vatRate: 20,
    status: "Hazırlanıyor",
    customerApprovedAt: "28.03.2026 12:15",
    customerApprovedBy: "PAZARLAMACI",
    managerApprovedAt: "28.03.2026 12:20",
    managerApprovedBy: "EREN",
    shipments: [],
  },
  {
    id: "SIP-300006",
    createdAt: "28.03.2026 13:30",
    createdBy: "PAZARLAMACI",
    createdByUserId: 2,
    customer: initialCustomers[0],
    items: [{ ...initialProducts[3], quantity: 1, priceAfterDiscount: 2880, pendingQuantity: 1, readyForShipmentQuantity: 0, sentQuantity: 0 }],
    globalDiscount: { type: "percent", value: 0 },
    vatRate: 20,
    status: "İptal",
    cancelledAt: "28.03.2026 13:45",
    cancelledBy: "EREN",
    shipments: [],
  },
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function formatTRY(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function normalizeNumber(value: string | number | ""): number {
  if (value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRoleLabel(role: UserRole): string {
  if (role === "admin") return "Yönetici";
  if (role === "uretim") return "Üretim";
  if (role === "sevkiyat") return "Sevkiyat";
  return "Pazarlamacı";
}

function normalizeSearchText(value: string): string {
  return String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesSearch(fields: Array<string | number | undefined | null>, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const queryParts = normalizedQuery.split(" ").filter(Boolean);
  const haystack = normalizeSearchText(fields.filter((field) => field !== undefined && field !== null).join(" "));

  return queryParts.every((part) => haystack.includes(part));
}

function scoreSearch(fields: Array<string | number | undefined | null>, query: string): number {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;

  const haystack = normalizeSearchText(fields.filter((field) => field !== undefined && field !== null).join(" "));
  let score = 0;

  if (haystack.startsWith(normalizedQuery)) score += 100;
  if (haystack.includes(normalizedQuery)) score += 50;

  normalizedQuery.split(" ").filter(Boolean).forEach((part) => {
    if (haystack.startsWith(part)) score += 20;
    if (haystack.includes(part)) score += 10;
  });

  return score;
}

function getDiscountedPrice(price: number, discountType: DiscountType, discountValue: number | ""): number {
  const value = normalizeNumber(discountValue);
  if (discountType === "percent") {
    return Math.max(price - (price * Math.min(Math.max(value, 0), 100)) / 100, 0);
  }
  return Math.max(price - value, 0);
}

function deriveOrderStatus(items: OrderLine[], currentStatus?: OrderStatus): OrderStatus {
  const totalPending = items.reduce((sum, item) => sum + item.pendingQuantity, 0);
  const totalReady = items.reduce((sum, item) => sum + item.readyForShipmentQuantity, 0);
  const totalSent = items.reduce((sum, item) => sum + item.sentQuantity, 0);

  if (currentStatus === "İptal") return "İptal";
  if (totalPending === 0 && totalSent > 0) return "Tamamlandı";
  if (totalReady > 0) return "Sevkiyata Hazır";
  if (totalSent > 0) return "Hazırlanıyor";
  return currentStatus ?? "Yönetici Onayladı";
}

function calcOrderTotals(order: OrderRecord) {
  const baseTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subTotal = order.items.reduce((sum, item) => sum + item.priceAfterDiscount * item.quantity, 0);
  const vatTotal = subTotal * (order.vatRate / 100);
  return {
    baseTotal,
    subTotal,
    vatTotal,
    grandTotal: subTotal + vatTotal,
  };
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function getStatusStyle(status: string): React.CSSProperties {
  switch (status) {
    case "İptal":
      return { background: "#fee2e2", color: "#b91c1c" };
    case "Müşteriden Onay Bekleniyor":
      return { background: "#fef9c3", color: "#92400e" };
    case "Müşteri Onayı Alındı":
      return { background: "#dbeafe", color: "#1d4ed8" };
    case "Yönetici Onayı Bekleniyor":
      return { background: "#e0f2fe", color: "#0369a1" };
    case "Yönetici Onayladı":
      return { background: "#dbeafe", color: "#1e40af" };
    case "Hazırlanıyor":
      return { background: "#ede9fe", color: "#6d28d9" };
    case "Sevkiyata Hazır":
      return { background: "#ffedd5", color: "#c2410c" };
    case "Tamamlandı":
      return { background: "#dcfce7", color: "#166534" };
    default:
      return { background: "#f1f5f9", color: "#334155" };
  }
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    borderRadius: 14,
    border: "1px solid #d1d5db",
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };
}

function cardStyle(): React.CSSProperties {
  return {
    background: "#fff",
    borderRadius: 24,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    padding: 16,
  };
}

function buttonStyle(primary = false): React.CSSProperties {
  return {
    borderRadius: 14,
    border: primary ? "1px solid #0f172a" : "1px solid #d1d5db",
    background: primary ? "#0f172a" : "#fff",
    color: primary ? "#fff" : "#111827",
    padding: "10px 14px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  };
}

function smallIconButtonStyle(): React.CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 999,
    border: "1px solid #d1d5db",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };
}

function StepperInput({
  value,
  onChange,
  min = 0,
  max,
}: {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
}) {
  const numeric = normalizeNumber(value);

  const dec = () => onChange(String(Math.max(numeric - 1, min)));
  const inc = () => onChange(String(typeof max === "number" ? Math.min(numeric + 1, max) : numeric + 1));

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button type="button" onClick={dec} style={smallIconButtonStyle()}>
        <Minus size={14} />
      </button>
      <input type="number" min={min} max={max} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle(), textAlign: "center" }} />
      <button type="button" onClick={inc} style={smallIconButtonStyle()}>
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [vatEnabled, setVatEnabled] = useState(false);
  const [vatRate, setVatRate] = useState<number | "">(20);
  const [globalDiscount, setGlobalDiscount] = useState<DiscountState>({ type: "percent", value: 0 });

  const [customerDraft, setCustomerDraft] = useState<CustomerDraft>({ name: "", company: "", phone: "", address: "", note: "" });
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerPanelOpen, setCustomerPanelOpen] = useState(false);
  const [customerFormSearch, setCustomerFormSearch] = useState("");

  const [searchQuantities, setSearchQuantities] = useState<SearchQuantityMap>({});
  const [shipmentDrafts, setShipmentDrafts] = useState<ShipmentDraftMap>({});
  const [readyDrafts, setReadyDrafts] = useState<ReadyDraftMap>({});
  const [expandedOrders, setExpandedOrders] = useState<ExpandedOrderMap>({});

  const [pendingSearch, setPendingSearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminFilter, setAdminFilter] = useState<"all" | OrderStatus>("all");

  const [userScreen, setUserScreen] = useState<UserScreen>("dashboard");
  const [adminSection, setAdminSection] = useState<AdminSection>("none");

  const [productDraft, setProductDraft] = useState<ProductDraft>({ orderNo: "", code: "", name: "", price: "", kdvRate: "20" });
  const [customerManageDraft, setCustomerManageDraft] = useState<CustomerDraft>({ name: "", company: "", phone: "", address: "", note: "" });
  const [userDraft, setUserDraft] = useState<UserDraft>({ username: "", password: "", role: "pazarlamaci", active: true });
  const [bulkProductText, setBulkProductText] = useState(`Sıra No	Stok Kodu	Ürün Adı	Fiyat	Kdv
1	ABC01	Örnek Ürün	1000	20`);

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const [productMessage, setProductMessage] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");

  const [completedSectionOpen, setCompletedSectionOpen] = useState(false);
  const [completedSearch, setCompletedSearch] = useState("");

  useEffect(() => {
    setProducts(readStorage(PRODUCTS_KEY, initialProducts));
    setUsers(readStorage(USERS_KEY, initialUsers));
    setCustomers(readStorage(CUSTOMERS_KEY, initialCustomers));
    setOrders(readStorage(ORDERS_KEY, initialOrders));
    setCurrentUserId(readStorage(CURRENT_USER_KEY, null));
  }, []);

  useEffect(() => { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUserId)); }, [currentUserId]);

  useEffect(() => {
    const next: SearchQuantityMap = {};
    products.forEach((p) => { next[p.id] = searchQuantities[p.id] ?? "1"; });
    setSearchQuantities(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  const currentUser = useMemo(() => users.find((u) => u.id === currentUserId) ?? null, [users, currentUserId]);
  const isAdmin = currentUser?.role === "admin";
  const canManageProduction = currentUser?.role === "uretim";
  const canManageShipping = currentUser?.role === "sevkiyat";
  const canCreateOrders = currentUser?.role === "pazarlamaci";

  const filteredProducts = useMemo(() => {
    const q = normalizeSearchText(search);
    if (!q) return [] as Product[];

    return products.filter((p) => normalizeSearchText(p.code) === q);
  }, [products, search]);

  const managerProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const orderDiff = Number(a.orderNo || 0) - Number(b.orderNo || 0);
      if (orderDiff !== 0) return orderDiff;
      return Number(a.id || 0) - Number(b.id || 0);
    });
  }, [products]);

  const managerCustomers = useMemo(() => {
    const q = customerSearch.trim();
    if (!q) return [...customers].sort((a, b) => b.id - a.id);

    return [...customers]
      .filter((c) => matchesSearch([c.name, c.company, c.phone, c.address, c.note], q))
      .sort((a, b) => scoreSearch([b.name, b.company, b.phone, b.address, b.note], q) - scoreSearch([a.name, a.company, a.phone, a.address, a.note], q));
  }, [customers, customerSearch]);

  const formCustomers = useMemo(() => {
    const q = customerFormSearch.trim();
    if (!q) return [...customers].sort((a, b) => b.id - a.id);

    return [...customers]
      .filter((c) => matchesSearch([c.name, c.company, c.phone, c.address, c.note], q))
      .sort((a, b) => scoreSearch([b.name, b.company, b.phone, b.address, b.note], q) - scoreSearch([a.name, a.company, a.phone, a.address, a.note], q));
  }, [customers, customerFormSearch]);

  const managerUsers = useMemo(() => {
    const q = normalizeSearchText(userSearch);
    if (!q) return [...users].sort((a, b) => b.id - a.id);

    const qParts = q.split(" ").filter(Boolean);

    return [...users]
      .filter((u) => {
        const combined = normalizeSearchText([u.username, getRoleLabel(u.role), u.active ? "aktif" : "pasif"].join(" "));
        return qParts.every((part) => combined.includes(part));
      })
      .sort((a, b) => b.id - a.id);
  }, [users, userSearch]);

  const baseVisibleOrders = useMemo(() => {
    if (!currentUser) return [] as OrderRecord[];

    if (currentUser.role === "admin") return orders;
    if (currentUser.role === "pazarlamaci") return orders.filter((o) => o.createdByUserId === currentUser.id);
    if (currentUser.role === "uretim") return orders.filter((o) => ["Yönetici Onayladı", "Hazırlanıyor", "Sevkiyata Hazır", "Tamamlandı"].includes(o.status));
    return orders.filter((o) => ["Sevkiyata Hazır", "Tamamlandı"].includes(o.status) || o.items.some((item) => item.readyForShipmentQuantity > 0 || item.sentQuantity > 0));
  }, [orders, currentUser]);

  const parseCreatedAt = (value: string) => {
    const [datePart, timePart = "00:00"] = value.split(" ");
    const [day, month, year] = datePart.split(".");
    return new Date(`${year}-${month}-${day}T${timePart}`).getTime() || 0;
  };

  const filteredPendingOrders = useMemo(() => {
    const q = normalizeSearchText(pendingSearch);
    const sorted = [...baseVisibleOrders].sort((a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt));
    if (!q) return sorted;

    const qParts = q.split(" ").filter(Boolean);

    return sorted.filter((o) => {
      const combined = normalizeSearchText([o.id, o.customer.name, o.customer.company, o.createdBy, o.createdAt, o.status].join(" "));
      return qParts.every((part) => combined.includes(part));
    });
  }, [baseVisibleOrders, pendingSearch]);

  const completedOrders = useMemo(() => {
    return [...baseVisibleOrders]
      .filter((o) => o.status === "Tamamlandı")
      .sort((a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt));
  }, [baseVisibleOrders]);

  const filteredCompletedOrders = useMemo(() => {
    const q = normalizeSearchText(completedSearch);
    if (!q) return completedOrders;

    const qParts = q.split(" ").filter(Boolean);

    return completedOrders.filter((o) => {
      const combined = normalizeSearchText([o.id, o.customer.name, o.customer.company, o.createdBy, o.createdAt, o.status].join(" "));
      return qParts.every((part) => combined.includes(part));
    });
  }, [completedOrders, completedSearch]);

  const adminOrderResults = useMemo(() => {
    if (!isAdmin) return [] as OrderRecord[];
    let list = [...orders].sort((a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt));
    if (adminFilter !== "all") list = list.filter((o) => o.status === adminFilter);

    const q = normalizeSearchText(adminSearch);
    if (!q) return list;

    const qParts = q.split(" ").filter(Boolean);

    return list.filter((o) => {
      const combined = normalizeSearchText([o.id, o.customer.name, o.customer.company, o.createdBy, o.createdAt, o.status].join(" "));
      return qParts.every((part) => combined.includes(part));
    });
  }, [orders, isAdmin, adminFilter, adminSearch]);

  const processedCart = useMemo(() => {
    return cart.map((item) => {
      const current = products.find((p) => p.id === item.id) ?? item;
      return {
        ...current,
        quantity: item.quantity,
        priceAfterDiscount: getDiscountedPrice(current.price, globalDiscount.type, globalDiscount.value),
      };
    });
  }, [cart, products, globalDiscount]);

  const effectiveVatRate = vatEnabled ? normalizeNumber(vatRate) : 0;

  const cartTotals = useMemo(() => {
    const baseTotal = processedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const subTotal = processedCart.reduce((sum, item) => sum + item.priceAfterDiscount * item.quantity, 0);
    const vatTotal = subTotal * (effectiveVatRate / 100);
    return { baseTotal, discountTotal: baseTotal - subTotal, subTotal, vatTotal, grandTotal: subTotal + vatTotal };
  }, [processedCart, effectiveVatRate]);

  const orderNo = useMemo(() => `SIP-${Date.now().toString().slice(-6)}`, [processedCart.length]);

  const login = () => {
    const user = users.find((u) => u.username.toUpperCase() === loginUsername.trim().toUpperCase() && u.password === loginPassword.trim());
    if (!user) return setLoginMessage("Kullanıcı Adı Veya Şifre Hatalı.");
    if (!user.active) return setLoginMessage("Bu Kullanıcı Pasif Durumda.");
    setCurrentUserId(user.id);
    setLoginUsername("");
    setLoginPassword("");
    setLoginMessage("");
    setUserScreen("dashboard");
    setAdminSection("none");
  };

  const logout = () => {
    setCurrentUserId(null);
    setCart([]);
    setUserScreen("dashboard");
    setAdminSection("none");
  };

  const addToCart = (product: Product, quantity = 1) => {
    const safeQuantity = Math.max(quantity, 1);
    setCart((prev) => {
      const existing = prev.find((x) => x.id === product.id);
      if (existing) return prev.map((x) => (x.id === product.id ? { ...x, quantity: x.quantity + safeQuantity } : x));
      return [...prev, { ...product, quantity: safeQuantity }];
    });
  };

  const addFromSearch = (product: Product) => {
    const quantity = Math.max(normalizeNumber(searchQuantities[product.id] ?? "1"), 1);
    addToCart(product, quantity);
    setSearchQuantities((prev) => ({ ...prev, [product.id]: "1" }));
  };

  const updateQuantity = (id: number, value: string) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(normalizeNumber(value), 0) } : item)).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((item) => item.id !== id));

  const resetOrderForm = () => {
    setCart([]);
    setSearch("");
    setSelectedCustomerId(null);
    setCustomerDraft({ name: "", company: "", phone: "", address: "", note: "" });
    setGlobalDiscount({ type: "percent", value: 0 });
    setVatEnabled(false);
    setVatRate(20);
    setUserScreen("dashboard");
  };

  const createOrder = () => {
    if (!currentUser || currentUser.role !== "pazarlamaci") return;
    if (!processedCart.length) return;
    if (!customerDraft.name.trim()) return;

    const chosenCustomer: Customer = selectedCustomerId != null
      ? customers.find((c) => c.id === selectedCustomerId) ?? { id: generateId(), ...customerDraft }
      : { id: generateId(), ...customerDraft };

    const items: OrderLine[] = processedCart.map((item) => ({ ...item, pendingQuantity: item.quantity, readyForShipmentQuantity: 0, sentQuantity: 0 }));

    const newOrder: OrderRecord = {
      id: orderNo,
      createdAt: new Date().toLocaleString("tr-TR"),
      createdBy: currentUser.username,
      createdByUserId: currentUser.id,
      customer: chosenCustomer,
      items,
      globalDiscount,
      vatRate: effectiveVatRate,
      status: "Müşteriden Onay Bekleniyor",
      shipments: [],
    };

    setOrders((prev) => [newOrder, ...prev]);
    resetOrderForm();
  };

  const approveCustomer = (orderId: string) => {
    if (!currentUser || currentUser.role !== "pazarlamaci") return;
    setOrders((prev) => prev.map((order) => {
      if (order.id !== orderId || order.createdByUserId !== currentUser.id) return order;
      if (order.status !== "Müşteriden Onay Bekleniyor") return order;
      return {
        ...order,
        status: "Yönetici Onayı Bekleniyor",
        customerApprovedAt: new Date().toLocaleString("tr-TR"),
        customerApprovedBy: currentUser.username,
      };
    }));
  };

  const managerApprove = (orderId: string) => {
    if (!currentUser || currentUser.role !== "admin") return;
    setOrders((prev) => prev.map((order) => {
      if (order.id !== orderId || order.status !== "Yönetici Onayı Bekleniyor") return order;
      return {
        ...order,
        status: "Yönetici Onayladı",
        managerApprovedAt: new Date().toLocaleString("tr-TR"),
        managerApprovedBy: currentUser.username,
      };
    }));
  };

  const managerCancel = (orderId: string) => {
    if (!currentUser || currentUser.role !== "admin") return;
    setOrders((prev) => prev.map((order) => {
      if (order.id !== orderId) return order;
      if (order.status === "Tamamlandı") return order;
      return {
        ...order,
        status: "İptal",
        cancelledAt: new Date().toLocaleString("tr-TR"),
        cancelledBy: currentUser.username,
      };
    }));
  };

  const ownerCancel = (orderId: string) => {
    if (!currentUser || currentUser.role !== "pazarlamaci") return;
    setOrders((prev) => prev.map((order) => {
      if (order.id !== orderId || order.createdByUserId !== currentUser.id) return order;
      if (["Tamamlandı", "İptal"].includes(order.status)) return order;
      return {
        ...order,
        status: "İptal",
        cancelledAt: new Date().toLocaleString("tr-TR"),
        cancelledBy: currentUser.username,
      };
    }));
  };

  const ownerUncancel = (orderId: string) => {
    if (!currentUser || currentUser.role !== "pazarlamaci") return;
    setOrders((prev) => prev.map((order) => {
      if (order.id !== orderId || order.createdByUserId !== currentUser.id || order.status !== "İptal") return order;
      return {
        ...order,
        status: "Müşteriden Onay Bekleniyor",
        cancelledAt: undefined,
        cancelledBy: undefined,
      };
    }));
  };

  const markReadySelectedItems = (orderId: string) => {
    if (!canManageProduction || !currentUser) return;
    setOrders((prev) => prev.map((order) => {
      if (order.id !== orderId || order.status === "İptal") return order;
      let changed = false;
      const nextItems = order.items.map((item) => {
        const key = `${orderId}_${item.id}`;
        const qty = Math.min(item.pendingQuantity, Math.max(normalizeNumber(readyDrafts[key]), 0));
        if (qty <= 0) return item;
        changed = true;
        return { ...item, pendingQuantity: item.pendingQuantity - qty, readyForShipmentQuantity: item.readyForShipmentQuantity + qty };
      });
      if (!changed) return order;
      return { ...order, items: nextItems, status: deriveOrderStatus(nextItems, "Hazırlanıyor") };
    }));
    setReadyDrafts((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => { if (key.startsWith(`${orderId}_`)) next[key] = ""; });
      return next;
    });
  };

  const shipSelectedItems = (orderId: string) => {
    if (!canManageShipping || !currentUser) return;
    setOrders((prev) => prev.map((order) => {
      if (order.id !== orderId || order.status === "İptal") return order;
      const shipmentItems: ShipmentRecord["items"] = [];
      const nextItems = order.items.map((item) => {
        const key = `${orderId}_${item.id}`;
        const qty = Math.min(item.readyForShipmentQuantity, Math.max(normalizeNumber(shipmentDrafts[key]), 0));
        if (qty <= 0) return item;
        shipmentItems.push({ itemId: item.id, code: item.code, name: item.name, quantity: qty });
        return { ...item, readyForShipmentQuantity: item.readyForShipmentQuantity - qty, sentQuantity: item.sentQuantity + qty };
      });
      if (!shipmentItems.length) return order;
      const shipment: ShipmentRecord = { id: `SH-${Date.now().toString().slice(-6)}`, createdAt: new Date().toLocaleString("tr-TR"), createdBy: currentUser.username, items: shipmentItems };
      return { ...order, items: nextItems, shipments: [shipment, ...order.shipments], status: deriveOrderStatus(nextItems, order.status) };
    }));
    setShipmentDrafts((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => { if (key.startsWith(`${orderId}_`)) next[key] = ""; });
      return next;
    });
  };

  const buildPrintableOrderHtml = (order: OrderRecord, titleText: string) => {
    const totals = calcOrderTotals(order);
    return `
      <html>
        <head>
          <title>${order.id}</title>
          <style>
            body { font-family: Arial; padding: 24px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f5f5f5; }
            .meta p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <h1>${titleText}</h1>
          <div class="meta">
            <p><strong>No:</strong> ${order.id}</p>
            <p><strong>Tarih / Saat:</strong> ${order.createdAt}</p>
            <p><strong>İşlemi Yapan:</strong> ${order.createdBy}</p>
            <p><strong>Müşteri:</strong> ${order.customer.name}</p>
            <p><strong>Firma:</strong> ${order.customer.company || "-"}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Kod</th>
                <th>Ürün</th>
                <th>Adet</th>
                <th>Birim Fiyat</th>
                <th>Tutar</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item) => `
                <tr>
                  <td>${item.code}</td>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatTRY(item.priceAfterDiscount)}</td>
                  <td>${formatTRY(item.priceAfterDiscount * item.quantity)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <p><strong>Ara Toplam:</strong> ${formatTRY(totals.subTotal)}</p>
          <p><strong>Kdv:</strong> ${formatTRY(totals.vatTotal)}</p>
          <p><strong>Genel Toplam:</strong> ${formatTRY(totals.grandTotal)}</p>
          ${order.customerApprovedAt ? `<p><strong>Müşteri Onayı:</strong> ${order.customerApprovedAt} / ${order.customerApprovedBy ?? "-"}</p>` : ""}
          ${order.managerApprovedAt ? `<p><strong>Yönetici Onayı:</strong> ${order.managerApprovedAt} / ${order.managerApprovedBy ?? "-"}</p>` : ""}
        </body>
      </html>
    `;
  };

  const printOrder = (order: OrderRecord) => {
    const titleText = ["Müşteriden Onay Bekleniyor", "Yönetici Onayı Bekleniyor"].includes(order.status) ? "Teklif" : "Sipariş";
    const html = buildPrintableOrderHtml(order, titleText);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const printShipment = (order: OrderRecord, shipment: ShipmentRecord) => {
    const html = `
      <html>
        <head>
          <title>${shipment.id}</title>
          <style>
            body { font-family: Arial; padding: 24px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Sevkiyat Fişi</h1>
          <p><strong>Sevkiyat No:</strong> ${shipment.id}</p>
          <p><strong>Sipariş No:</strong> ${order.id}</p>
          <p><strong>Tarih / Saat:</strong> ${shipment.createdAt}</p>
          <p><strong>İşlemi Yapan:</strong> ${shipment.createdBy}</p>
          <p><strong>Müşteri:</strong> ${order.customer.name}</p>
          <table>
            <thead>
              <tr>
                <th>Kod</th>
                <th>Ürün</th>
                <th>Adet</th>
              </tr>
            </thead>
            <tbody>
              ${shipment.items.map((item) => `
                <tr>
                  <td>${item.code}</td>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const shareOrder = (order: OrderRecord) => {
    const totals = calcOrderTotals(order);
    const titleText = ["Müşteriden Onay Bekleniyor", "Yönetici Onayı Bekleniyor"].includes(order.status) ? "Teklif" : "Sipariş";
    const text = [
      titleText,
      `No: ${order.id}`,
      `Tarih / Saat: ${order.createdAt}`,
      `İşlemi Yapan: ${order.createdBy}`,
      `Müşteri: ${order.customer.name}`,
      "",
      ...order.items.map((item, index) => `${index + 1}. [${item.code}] ${item.name} | ${item.quantity} Adet | ${formatTRY(item.priceAfterDiscount)}`),
      "",
      `Ara Toplam: ${formatTRY(totals.subTotal)}`,
      `Kdv: ${formatTRY(totals.vatTotal)}`,
      `Genel Toplam: ${formatTRY(totals.grandTotal)}`,
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareShipment = (order: OrderRecord, shipment: ShipmentRecord) => {
    const text = [
      "Sevkiyat Fişi",
      `Sevkiyat No: ${shipment.id}`,
      `Sipariş No: ${order.id}`,
      `Tarih / Saat: ${shipment.createdAt}`,
      `İşlemi Yapan: ${shipment.createdBy}`,
      `Müşteri: ${order.customer.name}`,
      "",
      ...shipment.items.map((item, index) => `${index + 1}. [${item.code}] ${item.name} | ${item.quantity} Adet`),
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const saveProduct = () => {
    if (!productDraft.code.trim()) return setProductMessage("Stok Kodu Boş Olamaz.");
    if (!productDraft.name.trim()) return setProductMessage("Ürün Adı Boş Olamaz.");
    if (normalizeNumber(productDraft.price) <= 0) return setProductMessage("Fiyat 0'dan Büyük Olmalı.");

    const normalizedCode = productDraft.code.trim().toUpperCase();
    const existingByCode = products.find((p) => p.code.trim().toUpperCase() === normalizedCode);

    const product: Product = {
      id: editingProductId ?? existingByCode?.id ?? generateId(),
      orderNo: normalizeNumber(productDraft.orderNo) > 0 ? normalizeNumber(productDraft.orderNo) : (existingByCode?.orderNo ?? products.length + 1),
      code: normalizedCode,
      name: productDraft.name.trim(),
      price: normalizeNumber(productDraft.price),
      kdvRate: normalizeNumber(productDraft.kdvRate),
    };

    setProducts((prev) => {
      const exists = prev.some((p) => p.code.trim().toUpperCase() === normalizedCode);
      const updated = exists
        ? prev.map((p) => (p.code.trim().toUpperCase() === normalizedCode || p.id === editingProductId ? { ...p, ...product } : p))
        : [...prev, product];
      const sorted = [...updated].sort((a, b) => a.orderNo - b.orderNo);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(sorted));
      return sorted;
    });

    setEditingProductId(null);
    setProductDraft({ orderNo: "", code: "", name: "", price: "", kdvRate: "20" });
    setProductMessage(existingByCode ? "Ürün Güncellendi." : "Ürün Kaydedildi.");
  };

  const saveCustomer = () => {
    if (!customerManageDraft.name.trim()) return setCustomerMessage("Müşteri Adı Boş Olamaz.");
    const customer: Customer = {
      id: editingCustomerId ?? generateId(),
      name: customerManageDraft.name.trim(),
      company: customerManageDraft.company.trim(),
      phone: customerManageDraft.phone.trim(),
      address: customerManageDraft.address.trim(),
      note: customerManageDraft.note.trim(),
    };
    setCustomers((prev) => {
      const updated = editingCustomerId == null ? [customer, ...prev] : prev.map((c) => (c.id === editingCustomerId ? customer : c));
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated));
      return updated;
    });
    setEditingCustomerId(null);
    setCustomerManageDraft({ name: "", company: "", phone: "", address: "", note: "" });
    setCustomerMessage("Müşteri Kaydedildi.");
  };

  const saveUser = () => {
    if (!userDraft.username.trim()) return setUserMessage("Kullanıcı Adı Boş Olamaz.");
    if (!userDraft.password.trim()) return setUserMessage("Şifre Boş Olamaz.");
    if (users.some((u) => u.username.trim().toUpperCase() === userDraft.username.trim().toUpperCase() && u.id !== editingUserId)) {
      return setUserMessage("Bu Kullanıcı Adı Zaten Kayıtlı.");
    }
    const user: AppUser = {
      id: editingUserId ?? generateId(),
      username: userDraft.username.trim().toUpperCase(),
      password: userDraft.password.trim(),
      role: userDraft.role,
      active: userDraft.active,
    };
    setUsers((prev) => {
      const updated = editingUserId == null ? [user, ...prev] : prev.map((u) => (u.id === editingUserId ? user : u));
      localStorage.setItem(USERS_KEY, JSON.stringify(updated));
      return updated;
    });
    setEditingUserId(null);
    setUserDraft({ username: "", password: "", role: "pazarlamaci", active: true });
    setUserMessage("Kullanıcı Kaydedildi.");
  };

  const importProductsFromText = () => {
    const normalizedText = bulkProductText.replaceAll(String.fromCharCode(13), "");
    const rows = normalizedText
      .split(String.fromCharCode(10))
      .map((x) => x.trim())
      .filter(Boolean);

    if (!rows.length) {
      setProductMessage("Yüklenecek veri bulunamadı.");
      return;
    }

    const skippedRows: string[] = [];
    let addedCount = 0;
    let updatedCount = 0;

    const parseDelimitedRow = (row: string): string[] => {
      if (row.includes(";")) {
        return row.split(";").map((p) => p.trim());
      }
      if (row.includes("	")) {
        return row.split("	").map((p) => p.trim());
      }

      const rawParts = row.split(",").map((p) => p.trim());
      if (rawParts.length < 5) return [];

      const orderNoRaw = rawParts[0] ?? "";
      const codeRaw = rawParts[1] ?? "";
      const kdvRateRaw = rawParts[rawParts.length - 1] ?? "";

      if (rawParts.length >= 6 && /^\d+$/.test(rawParts[rawParts.length - 3] ?? "") && /^\d+$/.test(rawParts[rawParts.length - 2] ?? "") && /^\d+$/.test(kdvRateRaw ?? "")) {
        const priceRaw = `${rawParts[rawParts.length - 3]}.${rawParts[rawParts.length - 2]}`;
        const nameRaw = rawParts.slice(2, rawParts.length - 3).join(",");
        return [orderNoRaw, codeRaw, nameRaw, priceRaw, kdvRateRaw];
      }

      const priceRaw = rawParts[rawParts.length - 2] ?? "";
      const nameRaw = rawParts.slice(2, rawParts.length - 2).join(",");
      return [orderNoRaw, codeRaw, nameRaw, priceRaw, kdvRateRaw];
    };

    const looksLikeHeader = (parts: string[]) => {
      const first = normalizeSearchText(parts[0] ?? "");
      const second = normalizeSearchText(parts[1] ?? "");
      return first.includes("sira") || first.includes("sıra") || second.includes("stok") || second.includes("kod");
    };

    setProducts((prev) => {
      const mapByCode = new Map(prev.map((p) => [p.code.trim().toUpperCase(), p] as const));

      rows.forEach((row, index) => {
        const parts = parseDelimitedRow(row);
        if (!parts.length) {
          skippedRows.push(`${index + 1}. satır: kolon sayısı yetersiz`);
          return;
        }

        if (index === 0 && looksLikeHeader(parts)) {
          return;
        }

        if (parts.length < 5) {
          skippedRows.push(`${index + 1}. satır: eksik alan`);
          return;
        }

        const [orderNoRaw, codeRaw, nameRaw, priceRaw, kdvRateRaw] = parts;
        const orderNo = normalizeNumber(String(orderNoRaw).replace(",", "."));
        const code = String(codeRaw || "").trim().toUpperCase();
        const name = String(nameRaw || "").trim();
        const price = normalizeNumber(String(priceRaw).replace(",", "."));
        const kdvRate = normalizeNumber(String(kdvRateRaw).replace(",", "."));

        if (!code) {
          skippedRows.push(`${index + 1}. satır: stok kodu boş`);
          return;
        }
        if (!name) {
          skippedRows.push(`${index + 1}. satır: ürün adı boş`);
          return;
        }
        if (price <= 0) {
          skippedRows.push(`${index + 1}. satır: fiyat hatalı`);
          return;
        }

        const existing = mapByCode.get(code);
        const nextOrderNo = orderNo > 0 ? orderNo : existing?.orderNo ?? mapByCode.size + 1;

        mapByCode.set(code, {
          id: existing?.id ?? generateId(),
          orderNo: nextOrderNo,
          code,
          name,
          price,
          kdvRate: kdvRate > 0 ? kdvRate : existing?.kdvRate ?? 20,
        });

        if (existing) updatedCount += 1;
        else addedCount += 1;
      });

      const sorted = [...mapByCode.values()].sort((a, b) => {
        const orderDiff = Number(a.orderNo || 0) - Number(b.orderNo || 0);
        if (orderDiff !== 0) return orderDiff;
        return Number(a.id || 0) - Number(b.id || 0);
      });
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(sorted));
      return sorted;
    });

    const summaryLines = [
      `Toplu ürün yükleme tamamlandı.`,
      `Eklenen: ${addedCount}`,
      `Güncellenen: ${updatedCount}`,
      `Atlanan: ${skippedRows.length}`,
    ];

    if (skippedRows.length) {
      summaryLines.push("Atlanan satırlar:");
      skippedRows.slice(0, 20).forEach((line) => summaryLines.push(`- ${line}`));
      if (skippedRows.length > 20) {
        summaryLines.push(`- ... ve ${skippedRows.length - 20} satır daha`);
      }
    }

    setProductMessage(summaryLines.join("\n"));
  };

  const renderOrderCard = (order: OrderRecord, prefix = "") => {
    const isOwner = currentUser?.id === order.createdByUserId;
    const showPrices = currentUser?.role === "admin" || currentUser?.role === "pazarlamaci";
    const expandedKey = `${prefix}${order.id}`;
    const expanded = !!expandedOrders[expandedKey];
    const totals = calcOrderTotals(order);

    return (
      <div key={expandedKey} style={{ ...cardStyle(), border: "1px solid #e5e7eb" }}>
        <button
          type="button"
          onClick={() => setExpandedOrders((prev) => ({ ...prev, [expandedKey]: !prev[expandedKey] }))}
          style={{ width: "100%", background: "transparent", border: "none", textAlign: "left", display: "flex", justifyContent: "space-between", gap: 12, padding: 0, cursor: "pointer" }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>{order.customer.name}</div>
            <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>{order.id} • {order.createdAt}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <span style={{ ...getStatusStyle(order.status), borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
                {order.status}
              </span>
              <span style={{ background: "#f1f5f9", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>{order.createdBy}</span>
            </div>
          </div>
          {expanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
        </button>

        {expanded ? (
          <div style={{ marginTop: 14 }}>
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 12, fontSize: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Müşteri</span><span>{order.customer.name}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}><span style={{ color: "#64748b" }}>Firma</span><span>{order.customer.company || "-"}</span></div>
              {showPrices ? <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontWeight: 700 }}><span>Genel Toplam</span><span>{formatTRY(totals.grandTotal)}</span></div> : null}
              {order.customerApprovedAt ? <div style={{ marginTop: 8, fontSize: 12, color: "#475569" }}>Müşteri Onayı: {order.customerApprovedAt} / {order.customerApprovedBy}</div> : null}
              {order.managerApprovedAt ? <div style={{ marginTop: 4, fontSize: 12, color: "#475569" }}>Yönetici Onayı: {order.managerApprovedAt} / {order.managerApprovedBy}</div> : null}
              {order.cancelledAt ? <div style={{ marginTop: 4, fontSize: 12, color: "#b91c1c" }}>İptal: {order.cancelledAt} / {order.cancelledBy}</div> : null}
            </div>

            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {order.items.map((item) => {
                const key = `${order.id}_${item.id}`;
                return (
                  <div key={key} style={{ background: "#f8fafc", borderRadius: 16, padding: 12, fontSize: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>[{item.code}] {item.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                          Sipariş: {item.quantity} • Hazır: {item.readyForShipmentQuantity} • Gönderilen: {item.sentQuantity} • Bekleyen: {item.pendingQuantity}
                        </div>
                      </div>
                      {showPrices ? <div style={{ fontWeight: 700 }}>{formatTRY(item.priceAfterDiscount)}</div> : null}
                    </div>

                    {canManageProduction && order.status !== "İptal" && item.pendingQuantity > 0 ? (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Sevkiyata Hazır Adet</div>
                        <StepperInput value={readyDrafts[key] ?? ""} min={0} max={item.pendingQuantity} onChange={(value) => setReadyDrafts((prev) => ({ ...prev, [key]: value }))} />
                      </div>
                    ) : null}

                    {canManageShipping && order.status !== "İptal" && item.readyForShipmentQuantity > 0 ? (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Gönderilecek Adet</div>
                        <StepperInput value={shipmentDrafts[key] ?? ""} min={0} max={item.readyForShipmentQuantity} onChange={(value) => setShipmentDrafts((prev) => ({ ...prev, [key]: value }))} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {currentUser?.role === "pazarlamaci" && isOwner && order.status === "Müşteriden Onay Bekleniyor" ? (
                <button style={buttonStyle()} onClick={() => approveCustomer(order.id)}><Shield size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Müşteri Onayı Alındı</button>
              ) : null}

              {currentUser?.role === "admin" && order.status === "Yönetici Onayı Bekleniyor" ? (
                <>
                  <button style={buttonStyle()} onClick={() => managerApprove(order.id)}><CheckCircle2 size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Yönetici Onayla</button>
                  <button style={buttonStyle()} onClick={() => managerCancel(order.id)}><CircleSlash size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> İptal Et</button>
                </>
              ) : null}

              {currentUser?.role === "pazarlamaci" && isOwner && !["Tamamlandı", "İptal"].includes(order.status) ? (
                <button style={buttonStyle()} onClick={() => ownerCancel(order.id)}><CircleSlash size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> İptal</button>
              ) : null}

              {currentUser?.role === "pazarlamaci" && isOwner && order.status === "İptal" ? (
                <button style={buttonStyle()} onClick={() => ownerUncancel(order.id)}><RotateCcw size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> İptali Kaldır</button>
              ) : null}

              {canManageProduction && order.status !== "İptal" ? (
                <button style={buttonStyle()} onClick={() => markReadySelectedItems(order.id)}><CheckCircle2 size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Sevkiyata Hazır</button>
              ) : null}

              {canManageShipping && order.status !== "İptal" ? (
                <button style={buttonStyle()} onClick={() => shipSelectedItems(order.id)}><Send size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Seçileni Gönder</button>
              ) : null}

              {(currentUser?.role === "admin" || (currentUser?.role === "pazarlamaci" && isOwner)) ? (
                <button style={buttonStyle()} onClick={() => printOrder(order)}><FileDown size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Sipariş Yazdır</button>
              ) : null}

              {(currentUser?.role === "admin" || (currentUser?.role === "pazarlamaci" && isOwner)) ? (
                <button style={buttonStyle()} onClick={() => shareOrder(order)}><MessageCircle size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> WhatsApp</button>
              ) : null}
            </div>

            {order.shipments.length > 0 ? (
              <div style={{ marginTop: 12, border: "1px dashed #cbd5e1", borderRadius: 16, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Gönderim Geçmişi</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {order.shipments.map((shipment) => (
                    <div key={shipment.id} style={{ background: "#f8fafc", borderRadius: 16, padding: 12 }}>
                      <div style={{ fontWeight: 700 }}>{shipment.createdAt} • {shipment.createdBy}</div>
                      <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
                        {shipment.items.map((si) => <div key={`${shipment.id}_${si.itemId}`} style={{ fontSize: 12, color: "#475569" }}>[{si.code}] {si.name} • {si.quantity} Adet</div>)}
                      </div>
                      {currentUser?.role === "admin" || currentUser?.role === "sevkiyat" ? (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                          <button style={buttonStyle()} onClick={() => printShipment(order, shipment)}><FileDown size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Sevkiyat Yazdır</button>
                          <button style={buttonStyle()} onClick={() => shareShipment(order, shipment)}><MessageCircle size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> WhatsApp</button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  const sectionHeader = (title: string, key: AdminSection, icon?: React.ReactNode) => (
    <button type="button" onClick={() => setAdminSection((prev) => (prev === key ? "none" : key))} style={{ ...cardStyle(), width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", border: "none", cursor: "pointer", textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#0f172a" }}>{icon}{title}</div>
      {adminSection === key ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
    </button>
  );

  if (!currentUser) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #f1f5f9, #ffffff, #f1f5f9)", padding: 16, boxSizing: "border-box" }}>
        <div style={{ maxWidth: 420, margin: "0 auto", paddingTop: 32 }}>
          <div style={{ ...cardStyle(), overflow: "hidden", padding: 0 }}>
            <div style={{ background: "linear-gradient(to right, #0f172a, #334155)", color: "#fff", padding: 24, textAlign: "center" }}>
              <h1 style={{ margin: 0, fontSize: 28 }}>Sipariş Yönetimi</h1>
              <p style={{ marginTop: 10, opacity: 0.8 }}>Kullanıcı adı ve şifre ile giriş yap.</p>
            </div>
            <div style={{ padding: 24, display: "grid", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 12, top: 14, color: "#94a3b8" }} />
                <input style={{ ...inputStyle(), paddingLeft: 36 }} placeholder="Kullanıcı Adı" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value.toUpperCase())} />
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 12, top: 14, color: "#94a3b8" }} />
                <input type="password" style={{ ...inputStyle(), paddingLeft: 36 }} placeholder="Şifre" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
              </div>
              {loginMessage ? <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 14, padding: 12, fontSize: 14 }}>{loginMessage}</div> : null}
              <button style={buttonStyle(true)} onClick={login}>Giriş Yap</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", paddingBottom: 40 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,0.95)", borderBottom: "1px solid #e5e7eb", padding: 16, backdropFilter: "blur(8px)" }}>
        <div style={{ maxWidth: 420, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>Mobil Sipariş</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{currentUser.username} • {getRoleLabel(currentUser.role)}</div>
          </div>
          <button style={buttonStyle()} onClick={logout}><LogOut size={16} /></button>
        </div>
      </div>

      <div style={{ maxWidth: 420, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
        {canCreateOrders && userScreen === "dashboard" ? (
          <div style={{ ...cardStyle(), overflow: "hidden", padding: 0 }}>
            <div style={{ background: "linear-gradient(to right, #0f172a, #334155)", color: "#fff", padding: 20 }}>
              <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: 2 }}>Pazarlamacı Paneli</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>Hoş Geldin, {currentUser.username}</div>
            </div>
            <div style={{ padding: 20 }}>
              <button style={{ ...buttonStyle(true), width: "100%" }} onClick={() => { resetOrderForm(); setUserScreen("order_form"); }}><Plus size={16} style={{ marginRight: 8, verticalAlign: "middle" }} /> Yeni Sipariş</button>
            </div>
          </div>
        ) : null}

        {canCreateOrders && userScreen === "order_form" ? (
          <>
            <div style={cardStyle()}>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...buttonStyle(), flex: 1 }} onClick={resetOrderForm}><ArrowLeft size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Geri</button>
              </div>
            </div>

            <div style={cardStyle()}>
              <button
                type="button"
                onClick={() => setCustomerPanelOpen((prev) => !prev)}
                style={{ width: "100%", background: "transparent", border: "none", padding: 0, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ fontWeight: 700 }}>Müşteri Seç / Ekle</div>
                {customerPanelOpen ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </button>
              {customerPanelOpen ? (
                <>
                  <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                    <input
                      style={inputStyle()}
                      placeholder="Müşteri ara: ad, soyad, firma, telefon..."
                      value={customerFormSearch}
                      onChange={(e) => setCustomerFormSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Kayıtlı Müşteriler</div>
                    <div style={{ display: "grid", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                      {formCustomers.length === 0 ? <div style={{ color: "#64748b", fontSize: 13 }}>Uygun müşteri bulunamadı.</div> : formCustomers.map((customer) => (
                        <button key={customer.id} type="button" onClick={() => { setSelectedCustomerId(customer.id); setCustomerDraft({ name: customer.name, company: customer.company, phone: customer.phone, address: customer.address, note: customer.note }); }} style={{ textAlign: "left", borderRadius: 14, border: selectedCustomerId === customer.id ? "1px solid #0f172a" : "1px solid #d1d5db", background: selectedCustomerId === customer.id ? "#f8fafc" : "#fff", padding: 12, cursor: "pointer" }}>
                          <div style={{ fontWeight: 700 }}>{customer.name}</div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{customer.company}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{customer.phone}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: 16, borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>Yeni Müşteri Ekle</div>
                    <div style={{ display: "grid", gap: 10 }}>
                      <input style={inputStyle()} placeholder="Müşteri Adı" value={customerDraft.name} onChange={(e) => setCustomerDraft((prev) => ({ ...prev, name: e.target.value }))} />
                      <input style={inputStyle()} placeholder="Firma Adı" value={customerDraft.company} onChange={(e) => setCustomerDraft((prev) => ({ ...prev, company: e.target.value }))} />
                      <input style={inputStyle()} placeholder="Telefon" value={customerDraft.phone} onChange={(e) => setCustomerDraft((prev) => ({ ...prev, phone: e.target.value }))} />
                      <textarea style={{ ...inputStyle(), minHeight: 70 }} placeholder="Adres" value={customerDraft.address} onChange={(e) => setCustomerDraft((prev) => ({ ...prev, address: e.target.value }))} />
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}><Search size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Ürün Ara</div>
              <input style={inputStyle()} placeholder="Tam stok kodunu yaz" value={search} onChange={(e) => setSearch(e.target.value)} />
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {search.trim() === "" ? <div style={{ color: "#64748b", fontSize: 14 }}>Stok kodu yazılınca ürün görünür.</div> : filteredProducts.length === 0 ? <div style={{ color: "#64748b", fontSize: 14 }}>Bu stok koduna ait ürün bulunamadı.</div> : filteredProducts.map((product) => (
                  <div key={product.id} style={{ borderRadius: 16, border: "1px solid #e5e7eb", background: "#f8fafc", padding: 12 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 16, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={18} color="#475569" /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ border: "1px solid #d1d5db", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>{product.code}</span>
                          <span style={{ background: "#e2e8f0", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>{formatTRY(product.price)}</span>
                        </div>
                        <div style={{ marginTop: 8, fontWeight: 700 }}>{product.name}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Adet</div>
                      <StepperInput value={searchQuantities[product.id] ?? "1"} min={1} onChange={(value) => setSearchQuantities((prev) => ({ ...prev, [product.id]: value }))} />
                    </div>
                    <button style={{ ...buttonStyle(true), width: "100%", marginTop: 10 }} onClick={() => addFromSearch(product)}><Plus size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Ekle</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Fiyatlandırma</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>İskonto Tipi</div>
                  <select value={globalDiscount.type} onChange={(e) => setGlobalDiscount((prev) => ({ ...prev, type: e.target.value as DiscountType }))} style={inputStyle()}>
                    <option value="percent">Yüzde (%)</option>
                    <option value="amount">Tutar (₺)</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Toplu İskonto</div>
                  <input type="number" min="0" value={globalDiscount.value} onChange={(e) => setGlobalDiscount((prev) => ({ ...prev, value: e.target.value === "" ? "" : Math.max(Number(e.target.value), 0) }))} style={inputStyle()} />
                </div>
              </div>
              <div style={{ marginTop: 12, border: "1px solid #d1d5db", borderRadius: 16, padding: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="checkbox" checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} /><span>Kdv Uygula</span></label>
                {vatEnabled ? (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Kdv %</div>
                    <input type="number" min="0" value={vatRate} onChange={(e) => setVatRate(e.target.value === "" ? "" : Math.max(Number(e.target.value), 0))} style={inputStyle()} />
                  </div>
                ) : <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>Sipariş varsayılan olarak kdvsiz başlar.</div>}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}><ShoppingCart size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Sipariş Sepeti</div>
              {processedCart.length === 0 ? <div style={{ color: "#64748b", fontSize: 14 }}>Henüz ürün eklenmedi.</div> : (
                <div style={{ display: "grid", gap: 10 }}>
                  {processedCart.map((item) => (
                    <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ border: "1px solid #d1d5db", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>{item.code}</span>
                            <span style={{ fontSize: 12, color: "#64748b" }}>Liste Fiyatı: {formatTRY(item.price)}</span>
                          </div>
                          <div style={{ marginTop: 8, fontWeight: 700 }}>{item.name}</div>
                          <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>Net Fiyat: {formatTRY(item.priceAfterDiscount)}</div>
                        </div>
                        <button style={buttonStyle()} onClick={() => removeFromCart(item.id)}><Trash2 size={14} /></button>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Miktar</div>
                        <StepperInput value={String(item.quantity)} min={1} onChange={(value) => updateQuantity(item.id, value)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Sipariş Özeti</div>
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 12, fontSize: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Ara Toplam</span><span>{formatTRY(cartTotals.subTotal)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}><span>Kdv</span><span>{formatTRY(cartTotals.vatTotal)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid #e5e7eb", fontWeight: 800 }}><span>Genel Toplam</span><span>{formatTRY(cartTotals.grandTotal)}</span></div>
              </div>
              <button style={{ ...buttonStyle(true), width: "100%", marginTop: 12 }} onClick={createOrder}>Siparişi Kaydet</button>
            </div>
          </>
        ) : null}

        {isAdmin ? (
          <>
            <div style={{ ...cardStyle(), overflow: "hidden", padding: 0 }}>
              <div style={{ background: "linear-gradient(to right, #0f172a, #334155)", color: "#fff", padding: 20 }}>
                <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: 2 }}>Yönetici Paneli</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>Hoş Geldin, {currentUser.username}</div>
              </div>
              <div style={{ padding: 20, display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 14, background: "#f8fafc" }}><div style={{ fontSize: 12, color: "#64748b" }}>Toplam Sipariş</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{orders.length}</div></div>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 14, background: "#f8fafc" }}><div style={{ fontSize: 12, color: "#64748b" }}>Onay Bekleyen</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{orders.filter((o) => o.status === "Yönetici Onayı Bekleniyor").length}</div></div>
                </div>
              </div>
            </div>

            {sectionHeader("Siparişler", "orders", <Search size={16} />)}
            {adminSection === "orders" ? (
              <div style={cardStyle()}>
                <div style={{ display: "grid", gap: 10 }}>
                  <select value={adminFilter} onChange={(e) => setAdminFilter(e.target.value as "all" | OrderStatus)} style={inputStyle()}>
                    <option value="all">Tümü</option>
                    <option value="Müşteriden Onay Bekleniyor">Müşteriden Onay Bekleniyor</option>
                    <option value="Yönetici Onayı Bekleniyor">Yönetici Onayı Bekleniyor</option>
                    <option value="Yönetici Onayladı">Yönetici Onayladı</option>
                    <option value="Hazırlanıyor">Hazırlanıyor</option>
                    <option value="Sevkiyata Hazır">Sevkiyata Hazır</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                    <option value="İptal">İptal</option>
                  </select>
                  <input style={inputStyle()} placeholder="Siparişlerde ara" value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} />
                </div>
                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>{adminOrderResults.length === 0 ? <div style={{ color: "#64748b", fontSize: 14 }}>Sonuç yok.</div> : adminOrderResults.map((order) => renderOrderCard(order, "admin_"))}</div>
              </div>
            ) : null}

            {sectionHeader("Ürün Yönetimi", "products", <Settings2 size={16} />)}
            {adminSection === "products" ? (
              <div style={cardStyle()}>
                <div style={{ display: "grid", gap: 10 }}>
                  <input style={inputStyle()} type="number" min="1" placeholder="Sıra No" value={productDraft.orderNo} onChange={(e) => setProductDraft((prev) => ({ ...prev, orderNo: e.target.value }))} />
                  <input style={inputStyle()} placeholder="Stok Kodu" value={productDraft.code} onChange={(e) => setProductDraft((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} />
                  <input style={inputStyle()} placeholder="Ürün Adı" value={productDraft.name} onChange={(e) => setProductDraft((prev) => ({ ...prev, name: e.target.value }))} />
                  <input style={inputStyle()} type="number" min="0" placeholder="Fiyat" value={productDraft.price} onChange={(e) => setProductDraft((prev) => ({ ...prev, price: e.target.value }))} />
                  <input style={inputStyle()} type="number" min="0" placeholder="Kdv %" value={productDraft.kdvRate} onChange={(e) => setProductDraft((prev) => ({ ...prev, kdvRate: e.target.value }))} />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button style={buttonStyle()} onClick={() => { setEditingProductId(null); setProductDraft({ orderNo: "", code: "", name: "", price: "", kdvRate: "20" }); setProductMessage(""); }}><RotateCcw size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Temizle</button>
                  <button style={buttonStyle(true)} onClick={saveProduct}><Save size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Kaydet</button>
                </div>

                <div style={{ marginTop: 16, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Toplu Ürün Yükleme</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Biçim: Sıra No; Stok Kodu; Ürün Adı; Fiyat; Kdv veya tab ayrımlı veri. Aynı stok kodu varsa yeni kayıt açılmaz, son yüklediğin bilgiyle güncellenir.</div>
                  <textarea style={{ ...inputStyle(), minHeight: 120 }} value={bulkProductText} onChange={(e) => setBulkProductText(e.target.value)} />
                  <button style={{ ...buttonStyle(true), marginTop: 10 }} onClick={importProductsFromText}><UserPlus size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Toplu Yükle</button>
                  {productMessage ? (
                    <div style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#334155", marginTop: 10, padding: 10, background: "#f8fafc", borderRadius: 12, border: "1px solid #e5e7eb" }}>{productMessage}</div>
                  ) : null}
                </div>

                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                  {managerProducts.map((product) => (
                    <div key={product.id} style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>#{product.orderNo} • {product.code}</div>
                          <div style={{ marginTop: 4, fontSize: 13 }}>{product.name}</div>
                          <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>{formatTRY(product.price)} • Kdv %{product.kdvRate}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button style={buttonStyle()} onClick={() => { setEditingProductId(product.id); setProductDraft({ orderNo: String(product.orderNo), code: product.code, name: product.name, price: String(product.price), kdvRate: String(product.kdvRate) }); setProductMessage(""); }}><Pencil size={14} /></button>
                          <button style={buttonStyle()} onClick={() => setProducts((prev) => { const updated = prev.filter((p) => p.id !== product.id); localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated)); return updated; })}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {sectionHeader("Müşteri Yönetimi", "customers", <Users size={16} />)}
            {adminSection === "customers" ? (
              <div style={cardStyle()}>
                <div style={{ display: "grid", gap: 10 }}>
                  <input style={inputStyle()} placeholder="Müşteri Adı" value={customerManageDraft.name} onChange={(e) => setCustomerManageDraft((prev) => ({ ...prev, name: e.target.value }))} />
                  <input style={inputStyle()} placeholder="Firma Adı" value={customerManageDraft.company} onChange={(e) => setCustomerManageDraft((prev) => ({ ...prev, company: e.target.value }))} />
                  <input style={inputStyle()} placeholder="Telefon" value={customerManageDraft.phone} onChange={(e) => setCustomerManageDraft((prev) => ({ ...prev, phone: e.target.value }))} />
                  <textarea style={{ ...inputStyle(), minHeight: 70 }} placeholder="Adres" value={customerManageDraft.address} onChange={(e) => setCustomerManageDraft((prev) => ({ ...prev, address: e.target.value }))} />
                  <textarea style={{ ...inputStyle(), minHeight: 70 }} placeholder="Not" value={customerManageDraft.note} onChange={(e) => setCustomerManageDraft((prev) => ({ ...prev, note: e.target.value }))} />
                </div>
                {customerMessage ? <div style={{ marginTop: 10, padding: 12, borderRadius: 14, background: "#f8fafc", fontSize: 13 }}>{customerMessage}</div> : null}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button style={buttonStyle()} onClick={() => { setEditingCustomerId(null); setCustomerManageDraft({ name: "", company: "", phone: "", address: "", note: "" }); setCustomerMessage(""); }}><RotateCcw size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Temizle</button>
                  <button style={buttonStyle(true)} onClick={saveCustomer}><Save size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Kaydet</button>
                </div>
                <input style={{ ...inputStyle(), marginTop: 14 }} placeholder="Müşteri ara: ad, soyad, firma, telefon..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                  {managerCustomers.map((customer) => (
                    <div key={customer.id} style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>{customer.name}</div>
                          <div style={{ marginTop: 4, fontSize: 13 }}>{customer.company}</div>
                          <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>{customer.phone}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button style={buttonStyle()} onClick={() => { setEditingCustomerId(customer.id); setCustomerManageDraft({ name: customer.name, company: customer.company, phone: customer.phone, address: customer.address, note: customer.note }); setCustomerMessage(""); }}><Pencil size={14} /></button>
                          <button style={buttonStyle()} onClick={() => setCustomers((prev) => { const updated = prev.filter((c) => c.id !== customer.id); localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated)); return updated; })}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {sectionHeader("Kullanıcı Yönetimi", "users", <UserPlus size={16} />)}
            {adminSection === "users" ? (
              <div style={cardStyle()}>
                <div style={{ display: "grid", gap: 10 }}>
                  <input style={inputStyle()} placeholder="Kullanıcı Adı" value={userDraft.username} onChange={(e) => setUserDraft((prev) => ({ ...prev, username: e.target.value.toUpperCase() }))} />
                  <input style={inputStyle()} placeholder="Şifre" value={userDraft.password} onChange={(e) => setUserDraft((prev) => ({ ...prev, password: e.target.value }))} />
                  <select value={userDraft.role} onChange={(e) => setUserDraft((prev) => ({ ...prev, role: e.target.value as UserRole }))} style={inputStyle()}>
                    <option value="pazarlamaci">Pazarlamacı</option>
                    <option value="admin">Yönetici</option>
                    <option value="uretim">Üretim</option>
                    <option value="sevkiyat">Sevkiyat</option>
                  </select>
                  <select value={userDraft.active ? "active" : "passive"} onChange={(e) => setUserDraft((prev) => ({ ...prev, active: e.target.value === "active" }))} style={inputStyle()}>
                    <option value="active">Aktif</option>
                    <option value="passive">Pasif</option>
                  </select>
                </div>
                {userMessage ? <div style={{ marginTop: 10, padding: 12, borderRadius: 14, background: "#f8fafc", fontSize: 13 }}>{userMessage}</div> : null}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button style={buttonStyle()} onClick={() => { setEditingUserId(null); setUserDraft({ username: "", password: "", role: "pazarlamaci", active: true }); setUserMessage(""); }}><RotateCcw size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Temizle</button>
                  <button style={buttonStyle(true)} onClick={saveUser}><Save size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Kaydet</button>
                </div>
                <input style={{ ...inputStyle(), marginTop: 14 }} placeholder="Kullanıcı ara" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                  {managerUsers.map((user) => (
                    <div key={user.id} style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>{user.username}</div>
                          <div style={{ marginTop: 4, fontSize: 13 }}>{getRoleLabel(user.role)}</div>
                          <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>{user.active ? "Aktif" : "Pasif"}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button style={buttonStyle()} onClick={() => { setEditingUserId(user.id); setUserDraft({ username: user.username, password: user.password, role: user.role, active: user.active }); setUserMessage(""); }}><Pencil size={14} /></button>
                          <button style={buttonStyle()} onClick={() => {
                            if (["EREN", "PAZARLAMACI", "ÜRETİM", "SEVKIYAT"].includes(user.username)) return;
                            setUsers((prev) => { const updated = prev.filter((u) => u.id !== user.id); localStorage.setItem(USERS_KEY, JSON.stringify(updated)); return updated; });
                          }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div style={cardStyle()}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Siparişler</div>
            <input style={{ ...inputStyle(), marginBottom: 12 }} placeholder="Sipariş ara" value={pendingSearch} onChange={(e) => setPendingSearch(e.target.value)} />
            <div style={{ display: "grid", gap: 10 }}>
              {filteredPendingOrders.filter((o) => o.status !== "Tamamlandı").length === 0 ? <div style={{ color: "#64748b", fontSize: 14 }}>Sipariş yok.</div> : filteredPendingOrders.filter((o) => o.status !== "Tamamlandı").map((order) => renderOrderCard(order))}
              <div style={{ marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setCompletedSectionOpen((prev) => !prev)}
                  style={{ ...buttonStyle(), width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span>Tamamlanan Siparişler</span>
                  {completedSectionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {completedSectionOpen ? (
                  <div style={{ marginTop: 10, border: "1px solid #e5e7eb", borderRadius: 16, padding: 12 }}>
                    <input style={{ ...inputStyle(), marginBottom: 12 }} placeholder="Tamamlananlarda ara" value={completedSearch} onChange={(e) => setCompletedSearch(e.target.value)} />
                    <div style={{ display: "grid", gap: 10 }}>
                      {filteredCompletedOrders.length === 0 ? <div style={{ color: "#64748b", fontSize: 14 }}>Tamamlanan sipariş yok.</div> : filteredCompletedOrders.map((order) => renderOrderCard(order, "completed_"))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
