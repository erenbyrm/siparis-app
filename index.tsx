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
  Shield,
  Trash2,
  User,
} from "lucide-react";

type Product = {
  id: number;
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
};

type CartItem = Product & { quantity: number };

type SearchQuantityMap = Record<number, string>;
type ShipmentDraftMap = Record<string, string>;
type ReadyDraftMap = Record<string, string>;
type ExpandedOrderMap = Record<string, boolean>;

const PRODUCTS_KEY = "siparis_products_v18";
const USERS_KEY = "siparis_users_v18";
const ORDERS_KEY = "siparis_orders_v18";
const CURRENT_USER_KEY = "siparis_current_user_v18";
const CUSTOMERS_KEY = "siparis_customers_v18";

const initialProducts: Product[] = [
  { id: 1, code: "SCC22", name: "2 + 2 Çift Çıkışlı Premium Alüminyum Merdiven", price: 1360, kdvRate: 20 },
  { id: 2, code: "SCC33", name: "3 + 3 Çift Çıkışlı Premium Alüminyum Merdiven", price: 1755, kdvRate: 20 },
  { id: 3, code: "SCC44", name: "4 + 4 Çift Çıkışlı Premium Alüminyum Merdiven", price: 2310, kdvRate: 20 },
  { id: 4, code: "SCC55", name: "5 + 5 Çift Çıkışlı Premium Alüminyum Merdiven", price: 2880, kdvRate: 20 },
  { id: 5, code: "SCC66", name: "6 + 6 Çift Çıkışlı Premium Alüminyum Merdiven", price: 3440, kdvRate: 20 },
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
    id: "SIP-200001",
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
    shipments: [
      {
        id: "SH-200001-1",
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
    id: "SIP-200002",
    createdAt: "28.03.2026 10:20",
    createdBy: "PAZARLAMACI",
    createdByUserId: 2,
    customer: initialCustomers[1],
    items: [
      { ...initialProducts[2], quantity: 3, priceAfterDiscount: 2310, pendingQuantity: 0, readyForShipmentQuantity: 0, sentQuantity: 3 },
    ],
    globalDiscount: { type: "percent", value: 0 },
    vatRate: 20,
    status: "Tamamlandı",
    shipments: [
      {
        id: "SH-200002-1",
        createdAt: "28.03.2026 12:20",
        createdBy: "SEVKIYAT",
        items: [{ itemId: 3, code: initialProducts[2].code, name: initialProducts[2].name, quantity: 3 }],
      },
    ],
  },
  {
    id: "SIP-200003",
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
    status: "Müşteri Onayı Alındı",
    shipments: [],
  },
  {
    id: "SIP-200004",
    createdAt: "28.03.2026 11:40",
    createdBy: "PAZARLAMACI",
    createdByUserId: 2,
    customer: initialCustomers[0],
    items: [
      { ...initialProducts[0], quantity: 2, priceAfterDiscount: 1360, pendingQuantity: 2, readyForShipmentQuantity: 0, sentQuantity: 0 },
    ],
    globalDiscount: { type: "percent", value: 0 },
    vatRate: 20,
    status: "Müşteriden Onay Bekleniyor",
    shipments: [],
  },
  {
    id: "SIP-200005",
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
    shipments: [],
  },
  {
    id: "SIP-200006",
    createdAt: "28.03.2026 13:30",
    createdBy: "PAZARLAMACI",
    createdByUserId: 2,
    customer: initialCustomers[0],
    items: [
      { ...initialProducts[3], quantity: 1, priceAfterDiscount: 2880, pendingQuantity: 1, readyForShipmentQuantity: 0, sentQuantity: 0 },
    ],
    globalDiscount: { type: "percent", value: 0 },
    vatRate: 20,
    status: "İptal",
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
  return currentStatus ?? "Müşteri Onayı Alındı";
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

function buildOrderMessage(order: OrderRecord) {
  const totals = calcOrderTotals(order);
  return [
    "Sipariş Formu",
    `Sipariş No: ${order.id}`,
    `Durum: ${order.status}`,
    `Müşteri: ${order.customer.name}`,
    "",
    ...order.items.map(
      (item, index) =>
        `${index + 1}. [${item.code}] ${item.name} | ${item.quantity} Adet | ${formatTRY(item.priceAfterDiscount)}`
    ),
    "",
    `Genel Toplam: ${formatTRY(totals.grandTotal)}`,
  ].join("\n");
}

function buildShipmentMessage(order: OrderRecord, shipment: ShipmentRecord) {
  return [
    "Sevkiyat Fişi",
    `Sipariş No: ${order.id}`,
    `Sevkiyat No: ${shipment.id}`,
    `Müşteri: ${order.customer.name}`,
    "",
    ...shipment.items.map(
      (item, index) => `${index + 1}. [${item.code}] ${item.name} | ${item.quantity} Adet`
    ),
  ].join("\n");
}

function stepperButtonStyle(): React.CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 999,
    border: "1px solid #d1d5db",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
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

  const dec = () => {
    onChange(String(Math.max(numeric - 1, min)));
  };

  const inc = () => {
    const next = typeof max === "number" ? Math.min(numeric + 1, max) : numeric + 1;
    onChange(String(next));
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button type="button" onClick={dec} style={stepperButtonStyle()}>
        <Minus size={14} />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle(), textAlign: "center" }}
      />
      <button type="button" onClick={inc} style={stepperButtonStyle()}>
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

  const [customerDraft, setCustomerDraft] = useState<Customer>({
    id: -1,
    name: "",
    company: "",
    phone: "",
    address: "",
    note: "",
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const [searchQuantities, setSearchQuantities] = useState<SearchQuantityMap>({});
  const [shipmentDrafts, setShipmentDrafts] = useState<ShipmentDraftMap>({});
  const [readyDrafts, setReadyDrafts] = useState<ReadyDraftMap>({});
  const [expandedOrders, setExpandedOrders] = useState<ExpandedOrderMap>({});

  const [pendingSearch, setPendingSearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminFilter, setAdminFilter] = useState<"all" | OrderStatus>("all");

  const [userScreen, setUserScreen] = useState<UserScreen>("dashboard");
  const [adminScreen, setAdminScreen] = useState<AdminScreen>("dashboard");

  useEffect(() => {
    setProducts(readStorage(PRODUCTS_KEY, initialProducts));
    setUsers(readStorage(USERS_KEY, initialUsers));
    setCustomers(readStorage(CUSTOMERS_KEY, initialCustomers));
    setOrders(readStorage(ORDERS_KEY, initialOrders));
    setCurrentUserId(readStorage(CURRENT_USER_KEY, null));
  }, []);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    const next: SearchQuantityMap = {};
    products.forEach((p) => {
      next[p.id] = "1";
    });
    setSearchQuantities(next);
  }, [products]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId]
  );

  const isAdmin = currentUser?.role === "admin";
  const canManageProduction = currentUser?.role === "uretim" || currentUser?.role === "admin";
  const canManageShipping = currentUser?.role === "sevkiyat" || currentUser?.role === "admin";
  const canCreateOrders = currentUser?.role === "pazarlamaci";

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    return products.filter(
      (p) => p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    );
  }, [products, search]);

  const baseVisibleOrders = useMemo(() => {
    if (!currentUser) return [] as OrderRecord[];

    if (currentUser.role === "admin") return orders;

    if (currentUser.role === "pazarlamaci") {
      return orders.filter(
        (o) =>
          o.createdByUserId === currentUser.id ||
          (o.status === "İptal" && o.createdByUserId === currentUser.id)
      );
    }

    if (currentUser.role === "uretim") {
      return orders.filter(
        (o) =>
          o.status !== "Müşteriden Onay Bekleniyor" &&
          o.status !== "İptal"
      );
    }

    return orders.filter(
      (o) =>
        o.status === "Sevkiyata Hazır" ||
        o.status === "Tamamlandı" ||
        o.items.some((item) => item.readyForShipmentQuantity > 0 || item.sentQuantity > 0)
    );
  }, [orders, currentUser]);

  const pendingOrders = useMemo(() => {
    return baseVisibleOrders.filter((o) => o.status !== "Tamamlandı");
  }, [baseVisibleOrders]);

  const filteredPendingOrders = useMemo(() => {
    const q = pendingSearch.toLowerCase().trim();
    if (!q) return pendingOrders;
    return pendingOrders.filter((o) =>
      [o.id, o.customer.name, o.customer.company, o.createdBy, o.createdAt, o.status]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [pendingOrders, pendingSearch]);

  const adminOrderResults = useMemo(() => {
    if (!isAdmin) return [] as OrderRecord[];
    let list = orders;

    if (adminFilter !== "all") {
      list = list.filter((o) => o.status === adminFilter);
    }

    const q = adminSearch.toLowerCase().trim();
    if (q) {
      list = list.filter((o) =>
        [o.id, o.customer.name, o.customer.company, o.createdBy, o.createdAt, o.status]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    return list;
  }, [orders, isAdmin, adminFilter, adminSearch]);

  const processedCart = useMemo(() => {
    return cart.map((item) => {
      const current = products.find((p) => p.id === item.id) ?? item;
      const priceAfterDiscount = getDiscountedPrice(
        current.price,
        globalDiscount.type,
        globalDiscount.value
      );
      return {
        ...current,
        quantity: item.quantity,
        priceAfterDiscount,
      };
    });
  }, [cart, products, globalDiscount]);

  const effectiveVatRate = vatEnabled ? normalizeNumber(vatRate) : 0;

  const cartTotals = useMemo(() => {
    const baseTotal = processedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const subTotal = processedCart.reduce(
      (sum, item) => sum + item.priceAfterDiscount * item.quantity,
      0
    );
    const vatTotal = subTotal * (effectiveVatRate / 100);
    return {
      baseTotal,
      discountTotal: baseTotal - subTotal,
      subTotal,
      vatTotal,
      grandTotal: subTotal + vatTotal,
    };
  }, [processedCart, effectiveVatRate]);

  const orderNo = useMemo(() => {
    return `SIP-${Date.now().toString().slice(-6)}`;
  }, [processedCart.length]);

  const login = () => {
    const user = users.find(
      (u) =>
        u.username.toUpperCase() === loginUsername.trim().toUpperCase() &&
        u.password === loginPassword.trim()
    );

    if (!user) {
      setLoginMessage("Kullanıcı Adı Veya Şifre Hatalı.");
      return;
    }

    if (!user.active) {
      setLoginMessage("Bu Kullanıcı Pasif Durumda.");
      return;
    }

    setCurrentUserId(user.id);
    setLoginUsername("");
    setLoginPassword("");
    setLoginMessage("");
    setUserScreen("dashboard");
    setAdminScreen("dashboard");
  };

  const logout = () => {
    setCurrentUserId(null);
    setCart([]);
    setUserScreen("dashboard");
    setAdminScreen("dashboard");
  };

  const addToCart = (product: Product, quantity = 1) => {
    const safeQuantity = Math.max(quantity, 1);
    setCart((prev) => {
      const existing = prev.find((x) => x.id === product.id);
      if (existing) {
        return prev.map((x) =>
          x.id === product.id ? { ...x, quantity: x.quantity + safeQuantity } : x
        );
      }
      return [...prev, { ...product, quantity: safeQuantity }];
    });
  };

  const addFromSearch = (product: Product) => {
    const quantity = Math.max(normalizeNumber(searchQuantities[product.id] ?? "1"), 1);
    addToCart(product, quantity);
    setSearchQuantities((prev) => ({ ...prev, [product.id]: "1" }));
  };

  const updateQuantity = (id: number, value: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(normalizeNumber(value), 0) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const resetOrderForm = () => {
    setCart([]);
    setSearch("");
    setSelectedCustomerId(null);
    setCustomerDraft({
      id: -1,
      name: "",
      company: "",
      phone: "",
      address: "",
      note: "",
    });
    setGlobalDiscount({ type: "percent", value: 0 });
    setVatEnabled(false);
    setVatRate(20);
    setUserScreen("dashboard");
  };

  const createOrder = () => {
    if (!currentUser || currentUser.role !== "pazarlamaci") return;
    if (!processedCart.length) return;
    if (!customerDraft.name.trim()) return;

    const chosenCustomer =
      selectedCustomerId != null
        ? customers.find((c) => c.id === selectedCustomerId) ?? customerDraft
        : customerDraft;

    const items: OrderLine[] = processedCart.map((item) => ({
      ...item,
      pendingQuantity: item.quantity,
      readyForShipmentQuantity: 0,
      sentQuantity: 0,
    }));

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

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    if (!currentUser) return;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const isOwner = order.createdByUserId === currentUser.id;

        if (order.status === "İptal") {
          if (currentUser.role === "pazarlamaci" && isOwner && status === "Müşteriden Onay Bekleniyor") {
            return { ...order, status: "Müşteriden Onay Bekleniyor" };
          }
          return order;
        }

        if (currentUser.role === "pazarlamaci") {
          if (isOwner && status === "Müşteri Onayı Alındı") return { ...order, status };
          if (isOwner && status === "İptal") return { ...order, status: "İptal" };
          return order;
        }

        if (currentUser.role === "sevkiyat") {
          if (status === "Tamamlandı") return { ...order, status };
          return order;
        }

        if (currentUser.role === "admin") {
          if (status === "İptal" || status === "Tamamlandı" || status === "Müşteri Onayı Alındı") {
            return { ...order, status };
          }
          return order;
        }

        return order;
      })
    );
  };

  const markReadySelectedItems = (orderId: string) => {
    if (!canManageProduction) return;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId || order.status === "İptal") return order;

        let changed = false;

        const nextItems = order.items.map((item) => {
          const key = `${orderId}_${item.id}`;
          const qty = Math.min(item.pendingQuantity, Math.max(normalizeNumber(readyDrafts[key]), 0));

          if (qty <= 0) return item;

          changed = true;

          return {
            ...item,
            pendingQuantity: item.pendingQuantity - qty,
            readyForShipmentQuantity: item.readyForShipmentQuantity + qty,
          };
        });

        if (!changed) return order;

        return {
          ...order,
          items: nextItems,
          status: deriveOrderStatus(nextItems, order.status),
        };
      })
    );

    setReadyDrafts((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`${orderId}_`)) next[key] = "";
      });
      return next;
    });
  };

  const shipSelectedItems = (orderId: string) => {
    if (!canManageShipping || !currentUser) return;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId || order.status === "İptal") return order;

        const shipmentItems: ShipmentRecord["items"] = [];

        const nextItems = order.items.map((item) => {
          const key = `${orderId}_${item.id}`;
          const qty = Math.min(
            item.readyForShipmentQuantity,
            Math.max(normalizeNumber(shipmentDrafts[key]), 0)
          );

          if (qty <= 0) return item;

          shipmentItems.push({
            itemId: item.id,
            code: item.code,
            name: item.name,
            quantity: qty,
          });

          return {
            ...item,
            readyForShipmentQuantity: item.readyForShipmentQuantity - qty,
            sentQuantity: item.sentQuantity + qty,
          };
        });

        if (!shipmentItems.length) return order;

        const shipment: ShipmentRecord = {
          id: `SH-${Date.now().toString().slice(-6)}`,
          createdAt: new Date().toLocaleString("tr-TR"),
          createdBy: currentUser.username,
          items: shipmentItems,
        };

        return {
          ...order,
          items: nextItems,
          shipments: [shipment, ...order.shipments],
          status: deriveOrderStatus(nextItems, order.status),
        };
      })
    );

    setShipmentDrafts((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`${orderId}_`)) next[key] = "";
      });
      return next;
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const printOrder = (order: OrderRecord) => {
    const totals = calcOrderTotals(order);
    const html = `
      <html>
        <head>
          <title>${order.id}</title>
          <style>
            body { font-family: Arial; padding: 24px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Sipariş Formu</h1>
          <p><strong>Sipariş:</strong> ${order.id}</p>
          <p><strong>Müşteri:</strong> ${order.customer.name}</p>
          <table>
            <thead>
              <tr>
                <th>Kod</th>
                <th>Ürün</th>
                <th>Adet</th>
                <th>Gönderilen</th>
                <th>Bekleyen</th>
                <th>Net Fiyat</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                    <tr>
                      <td>${item.code}</td>
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                      <td>${item.sentQuantity}</td>
                      <td>${item.pendingQuantity}</td>
                      <td>${formatTRY(item.priceAfterDiscount)}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
          <p><strong>Genel Toplam:</strong> ${formatTRY(totals.grandTotal)}</p>
        </body>
      </html>
    `;
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
          <p><strong>Sipariş:</strong> ${order.id}</p>
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
              ${shipment.items
                .map(
                  (item) => `
                    <tr>
                      <td>${item.code}</td>
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                    </tr>`
                )
                .join("")}
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
    window.open(`https://wa.me/?text=${encodeURIComponent(buildOrderMessage(order))}`, "_blank");
  };

  const shareShipment = (order: OrderRecord, shipment: ShipmentRecord) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShipmentMessage(order, shipment))}`, "_blank");
  };

  if (!currentUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #f1f5f9, #ffffff, #f1f5f9)",
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 420, margin: "0 auto", paddingTop: 32 }}>
          <div style={{ ...cardStyle(), overflow: "hidden", padding: 0 }}>
            <div
              style={{
                background: "linear-gradient(to right, #0f172a, #334155)",
                color: "#fff",
                padding: 24,
                textAlign: "center",
              }}
            >
              <h1 style={{ margin: 0, fontSize: 28 }}>Sipariş Yönetimi</h1>
              <p style={{ marginTop: 10, opacity: 0.8 }}>Kullanıcı adı ve şifre ile giriş yap.</p>
            </div>

            <div style={{ padding: 24, display: "grid", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 12, top: 14, color: "#94a3b8" }} />
                <input
                  style={{ ...inputStyle(), paddingLeft: 36 }}
                  placeholder="Kullanıcı Adı"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value.toUpperCase())}
                />
              </div>

              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 12, top: 14, color: "#94a3b8" }} />
                <input
                  type="password"
                  style={{ ...inputStyle(), paddingLeft: 36 }}
                  placeholder="Şifre"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                />
              </div>

              {loginMessage ? (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    borderRadius: 14,
                    padding: 12,
                    fontSize: 14,
                  }}
                >
                  {loginMessage}
                </div>
              ) : null}

              <button style={buttonStyle(true)} onClick={login}>
                Giriş Yap
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderOrderCard = (order: OrderRecord, adminPrefix = "") => {
    const isOwner = currentUser.id === order.createdByUserId;
    const isAdminUser = currentUser.role === "admin";
    const isShipmentUser = currentUser.role === "sevkiyat";
    const showPrices = currentUser.role === "admin" || currentUser.role === "pazarlamaci";
    const expandedKey = `${adminPrefix}${order.id}`;
    const expanded = !!expandedOrders[expandedKey];
    const totals = calcOrderTotals(order);

    return (
      <div key={expandedKey} style={{ ...cardStyle(), border: "1px solid #e5e7eb" }}>
        <button
          type="button"
          onClick={() => toggleExpanded(expandedKey)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            textAlign: "left",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            padding: 0,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>{order.customer.name}</div>
            <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
              {order.id} • {order.createdAt}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <span style={{ border: "1px solid #d1d5db", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>
                {order.status}
              </span>
              <span style={{ background: "#f1f5f9", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>
                {order.createdBy}
              </span>
            </div>
          </div>
          {expanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
        </button>

        {expanded ? (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 16,
                padding: 12,
                fontSize: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Müşteri</span>
                <span>{order.customer.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ color: "#64748b" }}>Firma</span>
                <span>{order.customer.company || "-"}</span>
              </div>
              {showPrices ? (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontWeight: 700 }}>
                  <span>Genel Toplam</span>
                  <span>{formatTRY(totals.grandTotal)}</span>
                </div>
              ) : null}
            </div>

            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {order.items.map((item) => {
                const key = `${order.id}_${item.id}`;
                return (
                  <div
                    key={key}
                    style={{
                      background: "#f8fafc",
                      borderRadius: 16,
                      padding: 12,
                      fontSize: 14,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>
                          [{item.code}] {item.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                          Sipariş: {item.quantity} • Hazır: {item.readyForShipmentQuantity} • Gönderilen: {item.sentQuantity} • Bekleyen: {item.pendingQuantity}
                        </div>
                      </div>
                      {showPrices ? <div style={{ fontWeight: 700 }}>{formatTRY(item.priceAfterDiscount)}</div> : null}
                    </div>

                    {canManageProduction && order.status !== "İptal" && item.pendingQuantity > 0 ? (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Sevkiyata Hazır Adet</div>
                        <StepperInput
                          value={readyDrafts[key] ?? ""}
                          min={0}
                          max={item.pendingQuantity}
                          onChange={(value) =>
                            setReadyDrafts((prev) => ({ ...prev, [key]: value }))
                          }
                        />
                      </div>
                    ) : null}

                    {canManageShipping && order.status !== "İptal" && item.readyForShipmentQuantity > 0 ? (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Gönderilecek Adet</div>
                        <StepperInput
                          value={shipmentDrafts[key] ?? ""}
                          min={0}
                          max={item.readyForShipmentQuantity}
                          onChange={(value) =>
                            setShipmentDrafts((prev) => ({ ...prev, [key]: value }))
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {(isOwner || isAdminUser) && order.status === "Müşteriden Onay Bekleniyor" ? (
                <button style={buttonStyle()} onClick={() => updateOrderStatus(order.id, "Müşteri Onayı Alındı")}>
                  <Shield size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Onay Alındı
                </button>
              ) : null}

              {isOwner && order.status === "İptal" ? (
                <button style={buttonStyle()} onClick={() => updateOrderStatus(order.id, "Müşteriden Onay Bekleniyor")}>
                  <RotateCcw size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  İptali Kaldır
                </button>
              ) : null}

              {canManageProduction && order.status !== "İptal" ? (
                <button style={buttonStyle()} onClick={() => markReadySelectedItems(order.id)}>
                  <CheckCircle2 size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Sevkiyata Hazır
                </button>
              ) : null}

              {canManageShipping && order.status !== "İptal" ? (
                <>
                  <button style={buttonStyle()} onClick={() => shipSelectedItems(order.id)}>
                    <Send size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                    Seçileni Gönder
                  </button>
                  <button style={buttonStyle()} onClick={() => updateOrderStatus(order.id, "Tamamlandı")}>
                    <CheckCircle2 size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                    Tamamlandı
                  </button>
                </>
              ) : null}

              {(isOwner || isAdminUser) && order.status !== "İptal" ? (
                <button style={buttonStyle()} onClick={() => updateOrderStatus(order.id, "İptal")}>
                  <CircleSlash size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  İptal
                </button>
              ) : null}

              {showPrices ? (
                <button style={buttonStyle()} onClick={() => printOrder(order)}>
                  <FileDown size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Yazdır
                </button>
              ) : null}

              {showPrices ? (
                <button style={buttonStyle()} onClick={() => shareOrder(order)}>
                  <MessageCircle size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  WhatsApp
                </button>
              ) : null}
            </div>

            {order.shipments.length > 0 ? (
              <div
                style={{
                  marginTop: 12,
                  border: "1px dashed #cbd5e1",
                  borderRadius: 16,
                  padding: 12,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Gönderim Geçmişi</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {order.shipments.map((shipment) => (
                    <div key={shipment.id} style={{ background: "#f8fafc", borderRadius: 16, padding: 12 }}>
                      <div style={{ fontWeight: 700 }}>
                        {shipment.createdAt} • {shipment.createdBy}
                      </div>
                      <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
                        {shipment.items.map((si) => (
                          <div key={`${shipment.id}_${si.itemId}`} style={{ fontSize: 12, color: "#475569" }}>
                            [{si.code}] {si.name} • {si.quantity} Adet
                          </div>
                        ))}
                      </div>
                      {isShipmentUser || isAdminUser ? (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                          <button style={buttonStyle()} onClick={() => printShipment(order, shipment)}>
                            <FileDown size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                            Sevkiyat Fişi
                          </button>
                          <button style={buttonStyle()} onClick={() => shareShipment(order, shipment)}>
                            <MessageCircle size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                            WhatsApp
                          </button>
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

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", paddingBottom: 40 }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(255,255,255,0.95)",
          borderBottom: "1px solid #e5e7eb",
          padding: 16,
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ maxWidth: 420, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>Mobil Sipariş</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              {currentUser.username} • {getRoleLabel(currentUser.role)}
            </div>
          </div>
          <button style={buttonStyle()} onClick={logout}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 420, margin: "0 auto", padding: 16, display: "grid", gap: 16 }}>
        {canCreateOrders && userScreen === "dashboard" ? (
          <div style={{ ...cardStyle(), overflow: "hidden", padding: 0 }}>
            <div style={{ background: "linear-gradient(to right, #0f172a, #334155)", color: "#fff", padding: 20 }}>
              <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: 2 }}>
                Pazarlamacı Paneli
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
                Hoş Geldin, {currentUser.username}
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <button
                style={{ ...buttonStyle(true), width: "100%" }}
                onClick={() => {
                  resetOrderForm();
                  setUserScreen("order_form");
                }}
              >
                <Plus size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
                Yeni Sipariş
              </button>
            </div>
          </div>
        ) : null}

        {canCreateOrders && userScreen === "order_form" ? (
          <>
            <div style={cardStyle()}>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...buttonStyle(), flex: 1 }} onClick={resetOrderForm}>
                  <ArrowLeft size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Geri
                </button>
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Müşteri Seç / Ekle</div>
              <div style={{ display: "grid", gap: 10 }}>
                <input
                  style={inputStyle()}
                  placeholder="Müşteri Adı"
                  value={customerDraft.name}
                  onChange={(e) => setCustomerDraft((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  style={inputStyle()}
                  placeholder="Firma Adı"
                  value={customerDraft.company}
                  onChange={(e) => setCustomerDraft((prev) => ({ ...prev, company: e.target.value }))}
                />
                <input
                  style={inputStyle()}
                  placeholder="Telefon"
                  value={customerDraft.phone}
                  onChange={(e) => setCustomerDraft((prev) => ({ ...prev, phone: e.target.value }))}
                />
                <textarea
                  style={{ ...inputStyle(), minHeight: 70 }}
                  placeholder="Adres"
                  value={customerDraft.address}
                  onChange={(e) => setCustomerDraft((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Kayıtlı Müşteriler</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomerId(customer.id);
                        setCustomerDraft(customer);
                      }}
                      style={{
                        textAlign: "left",
                        borderRadius: 14,
                        border:
                          selectedCustomerId === customer.id
                            ? "1px solid #0f172a"
                            : "1px solid #d1d5db",
                        background:
                          selectedCustomerId === customer.id ? "#f8fafc" : "#fff",
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{customer.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                        {customer.company}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>
                <Search size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Ürün Ara
              </div>
              <input
                style={inputStyle()}
                placeholder="Stok Kodu Veya Stok Adı Yaz"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {search.trim() === "" ? (
                  <div style={{ color: "#64748b", fontSize: 14 }}>Arama Yapınca Ürünler Görünür.</div>
                ) : filteredProducts.length === 0 ? (
                  <div style={{ color: "#64748b", fontSize: 14 }}>Uygun Ürün Bulunamadı.</div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      style={{
                        borderRadius: 16,
                        border: "1px solid #e5e7eb",
                        background: "#f8fafc",
                        padding: 12,
                      }}
                    >
                      <div style={{ display: "flex", gap: 10 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 16,
                            background: "#e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Package size={18} color="#475569" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ border: "1px solid #d1d5db", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>
                              {product.code}
                            </span>
                            <span style={{ background: "#e2e8f0", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>
                              {formatTRY(product.price)}
                            </span>
                          </div>
                          <div style={{ marginTop: 8, fontWeight: 700 }}>{product.name}</div>
                        </div>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Adet</div>
                        <StepperInput
                          value={searchQuantities[product.id] ?? "1"}
                          min={1}
                          onChange={(value) =>
                            setSearchQuantities((prev) => ({ ...prev, [product.id]: value }))
                          }
                        />
                      </div>

                      <button
                        style={{ ...buttonStyle(true), width: "100%", marginTop: 10 }}
                        onClick={() => addFromSearch(product)}
                      >
                        <Plus size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                        Ekle
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Fiyatlandırma</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>İskonto Tipi</div>
                  <select
                    value={globalDiscount.type}
                    onChange={(e) =>
                      setGlobalDiscount((prev) => ({
                        ...prev,
                        type: e.target.value as DiscountType,
                      }))
                    }
                    style={inputStyle()}
                  >
                    <option value="percent">Yüzde (%)</option>
                    <option value="amount">Tutar (₺)</option>
                  </select>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Toplu İskonto</div>
                  <input
                    type="number"
                    min="0"
                    value={globalDiscount.value}
                    onChange={(e) =>
                      setGlobalDiscount((prev) => ({
                        ...prev,
                        value: e.target.value === "" ? "" : Math.max(Number(e.target.value), 0),
                      }))
                    }
                    style={inputStyle()}
                  />
                </div>
              </div>

              <div style={{ marginTop: 12, border: "1px solid #d1d5db", borderRadius: 16, padding: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={vatEnabled}
                    onChange={(e) => setVatEnabled(e.target.checked)}
                  />
                  <span>Kdv Uygula</span>
                </label>

                {vatEnabled ? (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Kdv %</div>
                    <input
                      type="number"
                      min="0"
                      value={vatRate}
                      onChange={(e) =>
                        setVatRate(e.target.value === "" ? "" : Math.max(Number(e.target.value), 0))
                      }
                      style={inputStyle()}
                    />
                  </div>
                ) : (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                    Sipariş varsayılan olarak Kdvsiz başlar.
                  </div>
                )}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Sipariş Sepeti</div>
              {processedCart.length === 0 ? (
                <div style={{ color: "#64748b", fontSize: 14 }}>Henüz Ürün Eklenmedi.</div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {processedCart.map((item) => (
                    <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ border: "1px solid #d1d5db", borderRadius: 999, padding: "4px 10px", fontSize: 12 }}>
                              {item.code}
                            </span>
                            <span style={{ fontSize: 12, color: "#64748b" }}>
                              Liste Fiyatı: {formatTRY(item.price)}
                            </span>
                          </div>
                          <div style={{ marginTop: 8, fontWeight: 700 }}>{item.name}</div>
                          <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                            Net Fiyat: {formatTRY(item.priceAfterDiscount)}
                          </div>
                        </div>
                        <button style={buttonStyle()} onClick={() => removeFromCart(item.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Miktar</div>
                        <StepperInput
                          value={String(item.quantity)}
                          min={1}
                          onChange={(value) => updateQuantity(item.id, value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Sipariş Özeti</div>
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 12, fontSize: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Brüt Tutar</span>
                  <span>{formatTRY(cartTotals.baseTotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span>İskonto</span>
                  <span>- {formatTRY(cartTotals.discountTotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span>Ara Toplam</span>
                  <span>{formatTRY(cartTotals.subTotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span>Kdv</span>
                  <span>{formatTRY(cartTotals.vatTotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid #e5e7eb", fontWeight: 800 }}>
                  <span>Genel Toplam</span>
                  <span>{formatTRY(cartTotals.grandTotal)}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                <button
                  style={buttonStyle()}
                  onClick={() => {
                    const tempOrder: OrderRecord = {
                      id: orderNo,
                      createdAt: new Date().toLocaleString("tr-TR"),
                      createdBy: currentUser.username,
                      createdByUserId: currentUser.id,
                      customer: customerDraft,
                      items: processedCart.map((item) => ({
                        ...item,
                        pendingQuantity: item.quantity,
                        readyForShipmentQuantity: 0,
                        sentQuantity: 0,
                      })),
                      globalDiscount,
                      vatRate: effectiveVatRate,
                      status: "Müşteriden Onay Bekleniyor",
                      shipments: [],
                    };
                    printOrder(tempOrder);
                  }}
                >
                  <FileDown size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Yazdır
                </button>

                <button
                  style={{ ...buttonStyle(true) }}
                  onClick={() => {
                    const tempOrder: OrderRecord = {
                      id: orderNo,
                      createdAt: new Date().toLocaleString("tr-TR"),
                      createdBy: currentUser.username,
                      createdByUserId: currentUser.id,
                      customer: customerDraft,
                      items: processedCart.map((item) => ({
                        ...item,
                        pendingQuantity: item.quantity,
                        readyForShipmentQuantity: 0,
                        sentQuantity: 0,
                      })),
                      globalDiscount,
                      vatRate: effectiveVatRate,
                      status: "Müşteriden Onay Bekleniyor",
                      shipments: [],
                    };
                    shareOrder(tempOrder);
                  }}
                >
                  <MessageCircle size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  WhatsApp
                </button>
              </div>

              <button
                style={{ ...buttonStyle(true), width: "100%", marginTop: 12 }}
                onClick={createOrder}
              >
                Siparişi Kaydet
              </button>
            </div>
          </>
        ) : null}

        {isAdmin ? (
          <>
            {adminScreen === "dashboard" ? (
              <div style={{ ...cardStyle(), overflow: "hidden", padding: 0 }}>
                <div style={{ background: "linear-gradient(to right, #0f172a, #334155)", color: "#fff", padding: 20 }}>
                  <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: 2 }}>
                    Yönetici Paneli
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>
                    Hoş Geldin, {currentUser.username}
                  </div>
                </div>
                <div style={{ padding: 20, display: "grid", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 14, background: "#f8fafc" }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Toplam Sipariş</div>
                      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{orders.length}</div>
                    </div>
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 14, background: "#f8fafc" }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Bekleyen</div>
                      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>
                        {orders.filter((o) => o.status !== "Tamamlandı" && o.status !== "İptal").length}
                      </div>
                    </div>
                  </div>
                  <button
                    style={{ ...buttonStyle(true), width: "100%" }}
                    onClick={() => setAdminScreen("orders")}
                  >
                    <Search size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                    Siparişler
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={cardStyle()}>
                  <button style={{ ...buttonStyle(), width: "100%" }} onClick={() => setAdminScreen("dashboard")}>
                    <ArrowLeft size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                    Geri
                  </button>
                </div>

                <div style={cardStyle()}>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Sipariş Filtresi</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    <select
                      value={adminFilter}
                      onChange={(e) => setAdminFilter(e.target.value as "all" | OrderStatus)}
                      style={inputStyle()}
                    >
                      <option value="all">Tümü</option>
                      <option value="Müşteriden Onay Bekleniyor">Müşteriden Onay Bekleniyor</option>
                      <option value="Müşteri Onayı Alındı">Müşteri Onayı Alındı</option>
                      <option value="Hazırlanıyor">Hazırlanıyor</option>
                      <option value="Sevkiyata Hazır">Sevkiyata Hazır</option>
                      <option value="Tamamlandı">Tamamlandı</option>
                      <option value="İptal">İptal</option>
                    </select>

                    <input
                      style={inputStyle()}
                      placeholder="Siparişlerde Ara"
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div style={cardStyle()}>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Sipariş Sonuçları</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {adminOrderResults.length === 0
                      ? <div style={{ color: "#64748b", fontSize: 14 }}>Sonuç Yok.</div>
                      : adminOrderResults.map((order) => renderOrderCard(order, "admin_"))}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div style={cardStyle()}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Siparişler</div>
            <input
              style={{ ...inputStyle(), marginBottom: 12 }}
              placeholder="Sipariş Ara"
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
            />
            <div style={{ display: "grid", gap: 10 }}>
              {filteredPendingOrders.length === 0
                ? <div style={{ color: "#64748b", fontSize: 14 }}>Sipariş Yok.</div>
                : filteredPendingOrders.map((order) => renderOrderCard(order))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
