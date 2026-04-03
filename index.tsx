import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEYS = {
  products: "siparis_products_v20",
  users: "siparis_users_v20",
  orders: "siparis_orders_v20",
  customers: "siparis_customers_v20",
  currentUser: "siparis_current_user_v20",
};

const ROLES = {
  admin: "Yönetici",
  pazarlamaci: "Pazarlamacı",
  uretim: "Üretim",
  sevkiyat: "Sevkiyat",
};

const ORDER_STATUSES = [
  "Müşteriden Onay Bekleniyor",
  "Müşteri Onayı Alındı",
  "Sevkiyata Hazır",
  "Tamamlandı",
  "İptal",
];

const styles = {
  appBg: {
    minHeight: "100vh",
    background: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
    color: "#111827",
  },
  container: {
    maxWidth: 480,
    margin: "0 auto",
    minHeight: "100vh",
    background: "#ffffff",
    boxShadow: "0 0 20px rgba(0,0,0,0.08)",
    paddingBottom: 90,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  page: {
    padding: 16,
  },
  section: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 12,
  },
  row: {
    display: "flex",
    gap: 8,
  },
  input: {
    width: "100%",
    height: 42,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "0 12px",
    fontSize: 14,
    boxSizing: "border-box",
    marginBottom: 10,
  },
  textarea: {
    width: "100%",
    minHeight: 90,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    boxSizing: "border-box",
    resize: "vertical",
    marginBottom: 10,
  },
  button: {
    height: 42,
    border: "none",
    borderRadius: 10,
    background: "#111827",
    color: "white",
    fontSize: 14,
    fontWeight: 700,
    padding: "0 14px",
    cursor: "pointer",
  },
  buttonSecondary: {
    height: 42,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    background: "#fff",
    color: "#111827",
    fontSize: 14,
    fontWeight: 700,
    padding: "0 14px",
    cursor: "pointer",
  },
  dangerButton: {
    height: 42,
    border: "1px solid #fecaca",
    borderRadius: 10,
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: 14,
    fontWeight: 700,
    padding: "0 14px",
    cursor: "pointer",
  },
  smallButton: {
    height: 36,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    background: "#fff",
    color: "#111827",
    fontSize: 13,
    fontWeight: 700,
    padding: "0 12px",
    cursor: "pointer",
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    background: "#fff",
  },
  muted: {
    color: "#6b7280",
    fontSize: 13,
  },
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: 480,
    margin: "0 auto",
    background: "#fff",
    borderTop: "1px solid #e5e7eb",
    display: "grid",
    gap: 8,
    padding: 10,
  },
  navButton: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    borderRadius: 12,
    height: 42,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
  },
  navButtonActive: {
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    borderRadius: 12,
    height: 42,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    background: "#fff",
  },
};

const money = (n) => `${Number(n || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getBadgeStyle(value) {
  const base = { ...styles.badge };
  if (value === "Müşteriden Onay Bekleniyor") return { ...base, background: "#fef3c7", color: "#92400e" };
  if (value === "Müşteri Onayı Alındı") return { ...base, background: "#dbeafe", color: "#1d4ed8" };
  if (value === "Sevkiyata Hazır") return { ...base, background: "#ede9fe", color: "#6d28d9" };
  if (value === "Tamamlandı") return { ...base, background: "#dcfce7", color: "#166534" };
  if (value === "İptal") return { ...base, background: "#fee2e2", color: "#b91c1c" };
  return base;
}

function seedProducts() {
  return [
    { id: uid(), siraNo: 1, stokKodu: "SCC22", urunAdi: "2 + 2 Çift Çıkışlı Premium Alüminyum Merdiven", fiyat: 1360, kdv: 20 },
    { id: uid(), siraNo: 2, stokKodu: "SCC33", urunAdi: "3 + 3 Çift Çıkışlı Premium Alüminyum Merdiven", fiyat: 1755, kdv: 20 },
    { id: uid(), siraNo: 3, stokKodu: "SCC44", urunAdi: "4 + 4 Çift Çıkışlı Premium Alüminyum Merdiven", fiyat: 2310, kdv: 20 },
    { id: uid(), siraNo: 4, stokKodu: "SCC55", urunAdi: "5 + 5 Çift Çıkışlı Premium Alüminyum Merdiven", fiyat: 2880, kdv: 20 },
    { id: uid(), siraNo: 5, stokKodu: "SCC66", urunAdi: "6 + 6 Çift Çıkışlı Premium Alüminyum Merdiven", fiyat: 3440, kdv: 20 },
  ];
}

function seedCustomers() {
  return [
    { id: uid(), unvan: "Yıldız Yapı", yetkili: "Mehmet Demir", telefon: "05320000001", not: "Peşin çalışıyor" },
    { id: uid(), unvan: "Konya Merdiven Market", yetkili: "Ali Kaya", telefon: "05320000002", not: "Sık sipariş verir" },
    { id: uid(), unvan: "Anadolu Endüstri", yetkili: "Hasan Çetin", telefon: "05320000003", not: "Kurumsal müşteri" },
  ];
}

function seedUsers() {
  return [
    { id: uid(), ad: "Yönetici", kullaniciAdi: "admin", sifre: "1234", rol: "admin" },
    { id: uid(), ad: "Pazarlamacı", kullaniciAdi: "pazarlama", sifre: "1234", rol: "pazarlamaci" },
    { id: uid(), ad: "Üretim", kullaniciAdi: "uretim", sifre: "1234", rol: "uretim" },
    { id: uid(), ad: "Sevkiyat", kullaniciAdi: "sevkiyat", sifre: "1234", rol: "sevkiyat" },
  ];
}

function seedOrders(products, customers, users) {
  const pazarlamaci = users.find((u) => u.rol === "pazarlamaci");
  return [
    {
      id: uid(),
      siparisNo: "SP-1001",
      tarih: today(),
      customerId: customers[0].id,
      createdBy: pazarlamaci.id,
      durum: "Müşteriden Onay Bekleniyor",
      aciklama: "İlk sipariş",
      kdvDahil: false,
      genelIskonto: 5,
      kalemler: [
        {
          id: uid(),
          productId: products[0].id,
          urunAdi: products[0].urunAdi,
          stokKodu: products[0].stokKodu,
          miktar: 10,
          hazirMiktar: 0,
          sevkMiktar: 0,
          listeFiyati: products[0].fiyat,
          netFiyat: 1292,
          kdv: products[0].kdv,
          satirIskonto: 0,
        },
      ],
    },
  ];
}

function App() {
  const [products, setProducts] = useState(() => load(STORAGE_KEYS.products, []));
  const [customers, setCustomers] = useState(() => load(STORAGE_KEYS.customers, []));
  const [users, setUsers] = useState(() => load(STORAGE_KEYS.users, []));
  const [orders, setOrders] = useState(() => load(STORAGE_KEYS.orders, []));
  const [currentUser, setCurrentUser] = useState(() => load(STORAGE_KEYS.currentUser, null));
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!products.length && !customers.length && !users.length && !orders.length) {
      const sp = seedProducts();
      const sc = seedCustomers();
      const su = seedUsers();
      const so = seedOrders(sp, sc, su);
      setProducts(sp);
      setCustomers(sc);
      setUsers(su);
      setOrders(so);
    }
  }, []);

  useEffect(() => save(STORAGE_KEYS.products, products), [products]);
  useEffect(() => save(STORAGE_KEYS.customers, customers), [customers]);
  useEffect(() => save(STORAGE_KEYS.users, users), [users]);
  useEffect(() => save(STORAGE_KEYS.orders, orders), [orders]);
  useEffect(() => save(STORAGE_KEYS.currentUser, currentUser), [currentUser]);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => Number(a.siraNo || 0) - Number(b.siraNo || 0)),
    [products]
  );

  const visibleOrders = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.rol === "admin") return orders;
    if (currentUser.rol === "pazarlamaci") return orders.filter((o) => o.createdBy === currentUser.id);
    if (currentUser.rol === "uretim") return orders.filter((o) => ["Müşteri Onayı Alındı", "Sevkiyata Hazır", "Tamamlandı"].includes(o.durum));
    if (currentUser.rol === "sevkiyat") return orders.filter((o) => ["Müşteri Onayı Alındı", "Sevkiyata Hazır", "Tamamlandı"].includes(o.durum));
    return orders;
  }, [orders, currentUser]);

  const stats = useMemo(() => ({
    toplamSiparis: orders.length,
    bekleyen: orders.filter((o) => o.durum === "Müşteriden Onay Bekleniyor").length,
    hazir: orders.filter((o) => o.durum === "Sevkiyata Hazır").length,
    tamamlanan: orders.filter((o) => o.durum === "Tamamlandı").length,
  }), [orders]);

  if (!currentUser) {
    return <LoginScreen users={users} setCurrentUser={setCurrentUser} />;
  }

  const roleTabs = {
    admin: ["dashboard", "orders", "customers", "products", "users"],
    pazarlamaci: ["dashboard", "orders", "new-order"],
    uretim: ["dashboard", "production"],
    sevkiyat: ["dashboard", "shipment"],
  };

  const labels = {
    dashboard: "Panel",
    orders: "Siparişler",
    customers: "Müşteriler",
    products: "Ürünler",
    users: "Kullanıcılar",
    "new-order": "Yeni Sipariş",
    production: "Üretim",
    shipment: "Sevkiyat",
  };

  const tabs = roleTabs[currentUser.rol] || roleTabs.admin;

  return (
    <div style={styles.appBg}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Sipariş Takip</div>
            <div style={styles.muted}>{currentUser.ad} • {ROLES[currentUser.rol]}</div>
          </div>
          <button style={styles.buttonSecondary} onClick={() => setCurrentUser(null)}>Çıkış</button>
        </div>

        <div style={styles.page}>
          {activeTab === "dashboard" && <Dashboard stats={stats} visibleOrders={visibleOrders} customers={customers} />}
          {activeTab === "orders" && <OrdersScreen orders={visibleOrders} customers={customers} currentUser={currentUser} setOrders={setOrders} users={users} />}
          {activeTab === "customers" && <CustomersScreen customers={customers} setCustomers={setCustomers} />}
          {activeTab === "products" && <ProductsScreen products={sortedProducts} setProducts={setProducts} />}
          {activeTab === "users" && <UsersScreen users={users} setUsers={setUsers} />}
          {activeTab === "new-order" && <NewOrderScreen products={sortedProducts} customers={customers} setCustomers={setCustomers} setOrders={setOrders} currentUser={currentUser} />}
          {activeTab === "production" && <ProductionScreen orders={visibleOrders} setOrders={setOrders} />}
          {activeTab === "shipment" && <ShipmentScreen orders={visibleOrders} setOrders={setOrders} customers={customers} />}
        </div>

        <div style={{ ...styles.nav, gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={activeTab === tab ? styles.navButtonActive : styles.navButton}
            >
              {labels[tab]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ users, setCurrentUser }) {
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");

  const handleLogin = () => {
    const found = users.find((u) => u.kullaniciAdi === kullaniciAdi && u.sifre === sifre);
    if (!found) {
      setHata("Kullanıcı adı veya şifre hatalı");
      return;
    }
    setCurrentUser(found);
  };

  return (
    <div style={{ ...styles.appBg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 14 }}>Giriş Yap</div>
        <input style={styles.input} placeholder="Kullanıcı Adı" value={kullaniciAdi} onChange={(e) => setKullaniciAdi(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Şifre" value={sifre} onChange={(e) => setSifre(e.target.value)} />
        {hata ? <div style={{ color: "#b91c1c", fontSize: 13, marginBottom: 10 }}>{hata}</div> : null}
        <button style={{ ...styles.button, width: "100%" }} onClick={handleLogin}>Giriş</button>
        <div style={{ marginTop: 12, ...styles.muted, lineHeight: 1.7 }}>
          <div>admin / 1234</div>
          <div>pazarlama / 1234</div>
          <div>uretim / 1234</div>
          <div>sevkiyat / 1234</div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ stats, visibleOrders, customers }) {
  return (
    <div>
      <div style={styles.statGrid}>
        <div style={styles.statBox}><div style={styles.muted}>Toplam Sipariş</div><div style={{ fontSize: 24, fontWeight: 700 }}>{stats.toplamSiparis}</div></div>
        <div style={styles.statBox}><div style={styles.muted}>Onay Bekleyen</div><div style={{ fontSize: 24, fontWeight: 700 }}>{stats.bekleyen}</div></div>
        <div style={styles.statBox}><div style={styles.muted}>Sevkiyata Hazır</div><div style={{ fontSize: 24, fontWeight: 700 }}>{stats.hazir}</div></div>
        <div style={styles.statBox}><div style={styles.muted}>Tamamlanan</div><div style={{ fontSize: 24, fontWeight: 700 }}>{stats.tamamlanan}</div></div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Son Siparişler</div>
        {visibleOrders.length === 0 ? <div style={styles.muted}>Gösterilecek sipariş yok</div> : visibleOrders.slice().reverse().slice(0, 5).map((o) => {
          const customer = customers.find((c) => c.id === o.customerId);
          return (
            <div key={o.id} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{o.siparisNo}</div>
                  <div style={styles.muted}>{customer?.unvan || "Müşteri yok"}</div>
                </div>
                <span style={getBadgeStyle(o.durum)}>{o.durum}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CustomersScreen({ customers, setCustomers }) {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ unvan: "", yetkili: "", telefon: "", not: "" });

  const filtered = customers.filter((c) => [c.unvan, c.yetkili, c.telefon].join(" ").toLowerCase().includes(search.toLowerCase()));

  const addCustomer = () => {
    if (!form.unvan.trim()) return;
    setCustomers([{ id: uid(), ...form }, ...customers]);
    setForm({ unvan: "", yetkili: "", telefon: "", not: "" });
  };

  return (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Yeni Müşteri</div>
        <input style={styles.input} placeholder="Müşteri ara" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input style={styles.input} placeholder="Ünvan" value={form.unvan} onChange={(e) => setForm({ ...form, unvan: e.target.value })} />
        <input style={styles.input} placeholder="Yetkili" value={form.yetkili} onChange={(e) => setForm({ ...form, yetkili: e.target.value })} />
        <input style={styles.input} placeholder="Telefon" value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
        <textarea style={styles.textarea} placeholder="Not" value={form.not} onChange={(e) => setForm({ ...form, not: e.target.value })} />
        <button style={{ ...styles.button, width: "100%" }} onClick={addCustomer}>Müşteri Ekle</button>
      </div>

      {filtered.map((c) => (
        <div key={c.id} style={styles.card}>
          <div style={{ fontWeight: 700 }}>{c.unvan}</div>
          <div style={styles.muted}>{c.yetkili}</div>
          <div style={styles.muted}>{c.telefon}</div>
          {c.not ? <div style={{ ...styles.muted, marginTop: 6 }}>{c.not}</div> : null}
        </div>
      ))}
    </div>
  );
}

function ProductsScreen({ products, setProducts }) {
  const [search, setSearch] = useState("");
  const nextNo = products.length ? Math.max(...products.map((p) => Number(p.siraNo || 0))) + 1 : 1;
  const [form, setForm] = useState({ siraNo: nextNo, stokKodu: "", urunAdi: "", fiyat: "", kdv: 20 });

  const filtered = products.filter((p) => [String(p.siraNo), p.stokKodu, p.urunAdi].join(" ").toLowerCase().includes(search.toLowerCase()));

  const addProduct = () => {
    if (!form.urunAdi.trim() || !form.stokKodu.trim()) return;
    const newProduct = {
      id: uid(),
      siraNo: Number(form.siraNo),
      stokKodu: form.stokKodu,
      urunAdi: form.urunAdi,
      fiyat: Number(form.fiyat || 0),
      kdv: Number(form.kdv || 0),
    };
    setProducts([...products, newProduct]);
    setForm({ siraNo: Number(form.siraNo) + 1, stokKodu: "", urunAdi: "", fiyat: "", kdv: 20 });
  };

  return (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Yeni Ürün</div>
        <input style={styles.input} placeholder="Ürün ara" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Sıra No" value={form.siraNo} onChange={(e) => setForm({ ...form, siraNo: e.target.value })} />
        <input style={styles.input} placeholder="Stok Kodu" value={form.stokKodu} onChange={(e) => setForm({ ...form, stokKodu: e.target.value })} />
        <input style={styles.input} placeholder="Ürün Adı" value={form.urunAdi} onChange={(e) => setForm({ ...form, urunAdi: e.target.value })} />
        <input style={styles.input} type="number" placeholder="Liste Fiyatı" value={form.fiyat} onChange={(e) => setForm({ ...form, fiyat: e.target.value })} />
        <input style={styles.input} type="number" placeholder="KDV %" value={form.kdv} onChange={(e) => setForm({ ...form, kdv: e.target.value })} />
        <button style={{ ...styles.button, width: "100%" }} onClick={addProduct}>Ürün Ekle</button>
      </div>

      {filtered.map((p) => (
        <div key={p.id} style={styles.card}>
          <div style={{ fontWeight: 700 }}>{p.siraNo}. {p.urunAdi}</div>
          <div style={styles.muted}>{p.stokKodu}</div>
          <div style={styles.muted}>Liste Fiyatı: {money(p.fiyat)}</div>
          <div style={styles.muted}>KDV: %{p.kdv}</div>
        </div>
      ))}
    </div>
  );
}

function UsersScreen({ users, setUsers }) {
  const [form, setForm] = useState({ ad: "", kullaniciAdi: "", sifre: "", rol: "pazarlamaci" });

  const addUser = () => {
    if (!form.ad || !form.kullaniciAdi || !form.sifre) return;
    setUsers([...users, { id: uid(), ...form }]);
    setForm({ ad: "", kullaniciAdi: "", sifre: "", rol: "pazarlamaci" });
  };

  return (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Yeni Kullanıcı</div>
        <input style={styles.input} placeholder="Ad Soyad" value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} />
        <input style={styles.input} placeholder="Kullanıcı Adı" value={form.kullaniciAdi} onChange={(e) => setForm({ ...form, kullaniciAdi: e.target.value })} />
        <input style={styles.input} placeholder="Şifre" value={form.sifre} onChange={(e) => setForm({ ...form, sifre: e.target.value })} />
        <select style={styles.input} value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
          <option value="admin">Yönetici</option>
          <option value="pazarlamaci">Pazarlamacı</option>
          <option value="uretim">Üretim</option>
          <option value="sevkiyat">Sevkiyat</option>
        </select>
        <button style={{ ...styles.button, width: "100%" }} onClick={addUser}>Kullanıcı Ekle</button>
      </div>

      {users.map((u) => (
        <div key={u.id} style={styles.card}>
          <div style={{ fontWeight: 700 }}>{u.ad}</div>
          <div style={styles.muted}>{u.kullaniciAdi}</div>
          <div style={styles.muted}>{ROLES[u.rol]}</div>
        </div>
      ))}
    </div>
  );
}

function NewOrderScreen({ products, customers, setCustomers, setOrders, currentUser }) {
  const [customerMode, setCustomerMode] = useState("select");
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [newCustomer, setNewCustomer] = useState({ unvan: "", yetkili: "", telefon: "", not: "" });
  const [productSearch, setProductSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [genelIskonto, setGenelIskonto] = useState(0);
  const [kdvDahil, setKdvDahil] = useState(false);
  const [aciklama, setAciklama] = useState("");

  const filteredProducts = productSearch.trim()
    ? products.filter((p) => [p.stokKodu, p.urunAdi].join(" ").toLowerCase().includes(productSearch.toLowerCase()))
    : [];

  const addItem = (product) => {
    if (selectedItems.find((i) => i.productId === product.id)) return;
    setSelectedItems([
      ...selectedItems,
      {
        id: uid(),
        productId: product.id,
        urunAdi: product.urunAdi,
        stokKodu: product.stokKodu,
        miktar: 1,
        hazirMiktar: 0,
        sevkMiktar: 0,
        listeFiyati: Number(product.fiyat || 0),
        netFiyat: Number(product.fiyat || 0),
        kdv: Number(product.kdv || 0),
        satirIskonto: 0,
      },
    ]);
  };

  const updateItem = (id, field, value) => {
    setSelectedItems(selectedItems.map((i) => i.id === id ? { ...i, [field]: Number.isFinite(Number(value)) ? Number(value) : value } : i));
  };

  const createOrder = () => {
    if (!selectedItems.length) return;
    let finalCustomerId = customerId;
    if (customerMode === "new") {
      if (!newCustomer.unvan.trim()) return;
      const c = { id: uid(), ...newCustomer };
      setCustomers((prev) => [c, ...prev]);
      finalCustomerId = c.id;
    }
    setOrders((prev) => [{
      id: uid(),
      siparisNo: `SP-${1000 + prev.length + 1}`,
      tarih: today(),
      customerId: finalCustomerId,
      createdBy: currentUser.id,
      durum: "Müşteriden Onay Bekleniyor",
      aciklama,
      kdvDahil,
      genelIskonto: Number(genelIskonto || 0),
      kalemler: selectedItems,
    }, ...prev]);
    setSelectedItems([]);
    setAciklama("");
    setGenelIskonto(0);
    setKdvDahil(false);
    setProductSearch("");
  };

  const totals = useMemo(() => {
    const araToplam = selectedItems.reduce((sum, i) => sum + Number(i.miktar || 0) * Number(i.netFiyat || 0) * (1 - Number(i.satirIskonto || 0) / 100), 0);
    const indirimli = araToplam * (1 - Number(genelIskonto || 0) / 100);
    const kdvToplam = kdvDahil
      ? selectedItems.reduce((sum, i) => sum + (Number(i.miktar || 0) * Number(i.netFiyat || 0) * (1 - Number(i.satirIskonto || 0) / 100) * (Number(i.kdv || 0) / 100)), 0) * (1 - Number(genelIskonto || 0) / 100)
      : 0;
    return { araToplam, indirimli, kdvToplam, genelToplam: indirimli + kdvToplam };
  }, [selectedItems, genelIskonto, kdvDahil]);

  return (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Müşteri</div>
        <div style={{ ...styles.row, marginBottom: 10 }}>
          <button style={customerMode === "select" ? styles.button : styles.buttonSecondary} onClick={() => setCustomerMode("select")}>Var Olan</button>
          <button style={customerMode === "new" ? styles.button : styles.buttonSecondary} onClick={() => setCustomerMode("new")}>Yeni Müşteri</button>
        </div>
        {customerMode === "select" ? (
          <select style={styles.input} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.unvan}</option>)}
          </select>
        ) : (
          <>
            <input style={styles.input} placeholder="Ünvan" value={newCustomer.unvan} onChange={(e) => setNewCustomer({ ...newCustomer, unvan: e.target.value })} />
            <input style={styles.input} placeholder="Yetkili" value={newCustomer.yetkili} onChange={(e) => setNewCustomer({ ...newCustomer, yetkili: e.target.value })} />
            <input style={styles.input} placeholder="Telefon" value={newCustomer.telefon} onChange={(e) => setNewCustomer({ ...newCustomer, telefon: e.target.value })} />
          </>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Ürün Ekle</div>
        <input style={styles.input} placeholder="Ürün ara" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
        {filteredProducts.map((p) => (
          <div key={p.id} style={styles.card}>
            <div style={{ fontWeight: 700 }}>{p.siraNo}. {p.urunAdi}</div>
            <div style={styles.muted}>{p.stokKodu} • {money(p.fiyat)}</div>
            <button style={{ ...styles.smallButton, marginTop: 8 }} onClick={() => addItem(p)}>Ekle</button>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Seçilen Kalemler</div>
        {selectedItems.length === 0 ? <div style={styles.muted}>Henüz ürün eklenmedi</div> : selectedItems.map((i) => (
          <div key={i.id} style={styles.card}>
            <div style={{ fontWeight: 700 }}>{i.urunAdi}</div>
            <div style={styles.muted}>{i.stokKodu}</div>
            <div style={{ ...styles.row, marginTop: 8 }}>
              <input style={styles.input} type="number" placeholder="Miktar" value={i.miktar} onChange={(e) => updateItem(i.id, "miktar", e.target.value)} />
              <input style={styles.input} type="number" placeholder="Net Fiyat" value={i.netFiyat} onChange={(e) => updateItem(i.id, "netFiyat", e.target.value)} />
            </div>
            <div style={styles.row}>
              <input style={styles.input} type="number" placeholder="Satır İskonto %" value={i.satirIskonto} onChange={(e) => updateItem(i.id, "satirIskonto", e.target.value)} />
              {kdvDahil ? <input style={styles.input} type="number" placeholder="KDV %" value={i.kdv} onChange={(e) => updateItem(i.id, "kdv", e.target.value)} /> : null}
            </div>
          </div>
        ))}

        <input style={styles.input} type="number" placeholder="Toplu İskonto %" value={genelIskonto} onChange={(e) => setGenelIskonto(e.target.value)} />
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 14 }}>
          <input type="checkbox" checked={kdvDahil} onChange={(e) => setKdvDahil(e.target.checked)} />
          KDV Dahil
        </label>
        <textarea style={styles.textarea} placeholder="Açıklama" value={aciklama} onChange={(e) => setAciklama(e.target.value)} />

        <div style={{ ...styles.card, background: "#f9fafb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>Ara Toplam</span><strong>{money(totals.araToplam)}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>İskonto Sonrası</span><strong>{money(totals.indirimli)}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>KDV</span><strong>{money(totals.kdvToplam)}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Genel Toplam</span><strong>{money(totals.genelToplam)}</strong></div>
        </div>

        <button style={{ ...styles.button, width: "100%" }} onClick={createOrder}>Siparişi Kaydet</button>
      </div>
    </div>
  );
}

function OrdersScreen({ orders, customers, currentUser, setOrders, users }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = orders.filter((o) => {
    const customer = customers.find((c) => c.id === o.customerId);
    const text = [o.siparisNo, customer?.unvan, o.durum].join(" ").toLowerCase();
    const textOk = text.includes(search.toLowerCase());
    const filterOk = filter === "all" ? true : o.durum === filter;
    return textOk && filterOk;
  });

  const totalAmount = (order) => {
    const subtotal = order.kalemler.reduce((sum, i) => sum + Number(i.miktar || 0) * Number(i.netFiyat || 0) * (1 - Number(i.satirIskonto || 0) / 100), 0);
    const discounted = subtotal * (1 - Number(order.genelIskonto || 0) / 100);
    const vat = order.kdvDahil ? order.kalemler.reduce((sum, i) => sum + (Number(i.miktar || 0) * Number(i.netFiyat || 0) * (1 - Number(i.satirIskonto || 0) / 100) * (Number(i.kdv || 0) / 100)), 0) * (1 - Number(order.genelIskonto || 0) / 100) : 0;
    return discounted + vat;
  };

  const updateStatus = (orderId, durum) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, durum } : o));
  };

  const revertCancelled = (orderId) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, durum: "Müşteriden Onay Bekleniyor" } : o));
  };

  return (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Siparişler</div>
        <input style={styles.input} placeholder="Sipariş ara" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={styles.input} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tümü</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.map((o) => {
        const customer = customers.find((c) => c.id === o.customerId);
        const created = users.find((u) => u.id === o.createdBy);
        return (
          <div key={o.id} style={styles.section}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{o.siparisNo}</div>
                <div style={styles.muted}>{customer?.unvan || "Müşteri yok"}</div>
                <div style={styles.muted}>{o.tarih} • {created?.ad || ""}</div>
              </div>
              <span style={getBadgeStyle(o.durum)}>{o.durum}</span>
            </div>

            {o.kalemler.map((i) => (
              <div key={i.id} style={styles.card}>
                <div style={{ fontWeight: 700 }}>{i.urunAdi}</div>
                <div style={styles.muted}>{i.stokKodu}</div>
                <div style={{ ...styles.muted, marginTop: 6 }}>Miktar: {i.miktar} • Hazır: {i.hazirMiktar} • Sevk: {i.sevkMiktar}</div>
                {(currentUser.rol === "admin" || currentUser.rol === "pazarlamaci") ? <div style={{ ...styles.muted, marginTop: 6 }}>Net Fiyat: {money(i.netFiyat)}</div> : null}
              </div>
            ))}

            {(currentUser.rol === "admin" || currentUser.rol === "pazarlamaci") ? <div style={{ ...styles.card, background: "#f9fafb", fontWeight: 700 }}>Toplam: {money(totalAmount(o))}</div> : null}

            <div style={styles.row}>
              {currentUser.rol === "admin" && o.durum !== "İptal" ? <button style={styles.buttonSecondary} onClick={() => updateStatus(o.id, "Müşteri Onayı Alındı")}>Onay Alındı</button> : null}
              {o.durum !== "İptal" ? <button style={styles.dangerButton} onClick={() => updateStatus(o.id, "İptal")}>İptal</button> : null}
              {o.durum === "İptal" ? <button style={styles.button} onClick={() => revertCancelled(o.id)}>İptali Geri Al</button> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProductionScreen({ orders, setOrders }) {
  const [search, setSearch] = useState("");
  const filtered = orders.filter((o) => o.durum !== "İptal" && [o.siparisNo, ...o.kalemler.map((i) => i.urunAdi)].join(" ").toLowerCase().includes(search.toLowerCase()));

  const markReady = (orderId, itemId, qty) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o;
      const kalemler = o.kalemler.map((i) => i.id !== itemId ? i : { ...i, hazirMiktar: Math.min(Number(i.miktar), Number(i.hazirMiktar || 0) + Number(qty || 0)) });
      const hepsiHazir = kalemler.every((i) => Number(i.hazirMiktar || 0) >= Number(i.miktar || 0));
      return { ...o, kalemler, durum: hepsiHazir ? "Sevkiyata Hazır" : o.durum };
    }));
  };

  return (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Üretim</div>
        <input style={styles.input} placeholder="Üretim ara" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {filtered.map((o) => (
        <div key={o.id} style={styles.section}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <strong>{o.siparisNo}</strong>
            <span style={getBadgeStyle(o.durum)}>{o.durum}</span>
          </div>
          {o.kalemler.map((i) => <ProductionRow key={i.id} item={i} onReady={(qty) => markReady(o.id, i.id, qty)} />)}
        </div>
      ))}
    </div>
  );
}

function ProductionRow({ item, onReady }) {
  const [qty, setQty] = useState(1);
  return (
    <div style={styles.card}>
      <div style={{ fontWeight: 700 }}>{item.urunAdi}</div>
      <div style={styles.muted}>Toplam: {item.miktar} • Hazır: {item.hazirMiktar}</div>
      <div style={styles.row}>
        <input style={styles.input} type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
        <button style={styles.button} onClick={() => onReady(qty)}>Hazır Yap</button>
      </div>
    </div>
  );
}

function ShipmentScreen({ orders, setOrders, customers }) {
  const [search, setSearch] = useState("");
  const filtered = orders.filter((o) => o.durum !== "Müşteriden Onay Bekleniyor" && o.durum !== "İptal" && [o.siparisNo, ...o.kalemler.map((i) => i.urunAdi)].join(" ").toLowerCase().includes(search.toLowerCase()));

  const shipItem = (orderId, itemId, qty) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o;
      const kalemler = o.kalemler.map((i) => {
        if (i.id !== itemId) return i;
        const maxShippable = Math.min(Number(i.hazirMiktar || 0), Number(i.miktar || 0));
        const newSevk = Math.min(maxShippable, Number(i.sevkMiktar || 0) + Number(qty || 0));
        return { ...i, sevkMiktar: newSevk };
      });
      const hepsiTamam = kalemler.every((i) => Number(i.sevkMiktar || 0) >= Number(i.miktar || 0));
      return { ...o, kalemler, durum: hepsiTamam ? "Tamamlandı" : "Sevkiyata Hazır" };
    }));
  };

  return (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Sevkiyat</div>
        <input style={styles.input} placeholder="Sevkiyat ara" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {filtered.map((o) => {
        const customer = customers.find((c) => c.id === o.customerId);
        return (
          <div key={o.id} style={styles.section}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <strong>{o.siparisNo}</strong>
                <div style={styles.muted}>{customer?.unvan}</div>
              </div>
              <span style={getBadgeStyle(o.durum)}>{o.durum}</span>
            </div>
            {o.kalemler.map((i) => <ShipmentRow key={i.id} item={i} onShip={(qty) => shipItem(o.id, i.id, qty)} />)}
          </div>
        );
      })}
    </div>
  );
}

function ShipmentRow({ item, onShip }) {
  const [qty, setQty] = useState(1);
  return (
    <div style={styles.card}>
      <div style={{ fontWeight: 700 }}>{item.urunAdi}</div>
      <div style={styles.muted}>Toplam: {item.miktar} • Hazır: {item.hazirMiktar} • Sevk: {item.sevkMiktar}</div>
      <div style={styles.row}>
        <input style={styles.input} type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
        <button style={styles.button} onClick={() => onShip(qty)}>Sevk Et</button>
      </div>
    </div>
  );
}

export default App;
