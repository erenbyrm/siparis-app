import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Users,
  Truck,
  Factory,
  ClipboardList,
  Search,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  UserCircle2,
  LogOut,
  RotateCcw,
  Eye,
  Save,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const STORAGE_KEYS = {
  products: "siparis_products_v18",
  users: "siparis_users_v18",
  orders: "siparis_orders_v18",
  customers: "siparis_customers_v18",
  currentUser: "siparis_current_user_v18",
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
    { id: uid(), ad: "Pazarlama", kullaniciAdi: "pazarlama", sifre: "1234", rol: "pazarlamaci" },
    { id: uid(), ad: "Üretim", kullaniciAdi: "uretim", sifre: "1234", rol: "uretim" },
    { id: uid(), ad: "Sevkiyat", kullaniciAdi: "sevkiyat", sifre: "1234", rol: "sevkiyat" },
  ];
}

function seedOrders(products, customers, users) {
  const p1 = products[0];
  const p2 = products[1];
  const p3 = products[2];
  const customer1 = customers[0];
  const customer2 = customers[1];
  const pazarlamaci = users.find((u) => u.rol === "pazarlamaci");

  return [
    {
      id: uid(),
      siparisNo: "SP-1001",
      tarih: today(),
      customerId: customer1.id,
      createdBy: pazarlamaci?.id,
      durum: "Müşteriden Onay Bekleniyor",
      aciklama: "İlk görüşme siparişi",
      kdvDahil: false,
      genelIskonto: 5,
      kalemler: [
        {
          id: uid(),
          productId: p1.id,
          urunAdi: p1.urunAdi,
          stokKodu: p1.stokKodu,
          miktar: 10,
          hazirMiktar: 0,
          sevkMiktar: 0,
          tamamlandi: false,
          listeFiyati: p1.fiyat,
          netFiyat: 1292,
          kdv: p1.kdv,
          satirIskonto: 0,
        },
      ],
    },
    {
      id: uid(),
      siparisNo: "SP-1002",
      tarih: today(),
      customerId: customer2.id,
      createdBy: pazarlamaci?.id,
      durum: "Müşteri Onayı Alındı",
      aciklama: "Onay alındı, üretim bekliyor",
      kdvDahil: true,
      genelIskonto: 0,
      kalemler: [
        {
          id: uid(),
          productId: p2.id,
          urunAdi: p2.urunAdi,
          stokKodu: p2.stokKodu,
          miktar: 7,
          hazirMiktar: 3,
          sevkMiktar: 1,
          tamamlandi: false,
          listeFiyati: p2.fiyat,
          netFiyat: p2.fiyat,
          kdv: p2.kdv,
          satirIskonto: 0,
        },
        {
          id: uid(),
          productId: p3.id,
          urunAdi: p3.urunAdi,
          stokKodu: p3.stokKodu,
          miktar: 4,
          hazirMiktar: 4,
          sevkMiktar: 2,
          tamamlandi: false,
          listeFiyati: p3.fiyat,
          netFiyat: p3.fiyat,
          kdv: p3.kdv,
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
    if (currentUser.rol === "pazarlamaci") return orders.filter((o) => o.createdBy === currentUser.id && o.durum !== "İptal" || o.createdBy === currentUser.id);
    if (currentUser.rol === "uretim") return orders.filter((o) => ["Müşteri Onayı Alındı", "Sevkiyata Hazır", "Tamamlandı"].includes(o.durum));
    if (currentUser.rol === "sevkiyat") return orders.filter((o) => ["Müşteri Onayı Alındı", "Sevkiyata Hazır", "Tamamlandı"].includes(o.durum));
    return orders;
  }, [orders, currentUser]);

  const stats = useMemo(() => {
    const toplamSiparis = orders.length;
    const bekleyen = orders.filter((o) => o.durum === "Müşteriden Onay Bekleniyor").length;
    const hazir = orders.filter((o) => o.durum === "Sevkiyata Hazır").length;
    const tamamlanan = orders.filter((o) => o.durum === "Tamamlandı").length;
    return { toplamSiparis, bekleyen, hazir, tamamlanan };
  }, [orders]);

  if (!currentUser) {
    return <LoginScreen users={users} setCurrentUser={setCurrentUser} />;
  }

  const roleTabs = {
    admin: [
      { key: "dashboard", label: "Panel", icon: ClipboardList },
      { key: "orders", label: "Siparişler", icon: FileText },
      { key: "customers", label: "Müşteriler", icon: Users },
      { key: "products", label: "Ürünler", icon: Package },
      { key: "users", label: "Kullanıcılar", icon: UserCircle2 },
    ],
    pazarlamaci: [
      { key: "dashboard", label: "Panel", icon: ClipboardList },
      { key: "orders", label: "Siparişler", icon: FileText },
      { key: "new-order", label: "Yeni Sipariş", icon: Plus },
    ],
    uretim: [
      { key: "dashboard", label: "Panel", icon: ClipboardList },
      { key: "production", label: "Üretim", icon: Factory },
    ],
    sevkiyat: [
      { key: "dashboard", label: "Panel", icon: ClipboardList },
      { key: "shipment", label: "Sevkiyat", icon: Truck },
    ],
  };

  const tabs = roleTabs[currentUser.rol] || roleTabs.admin;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl border-x">
        <Header currentUser={currentUser} onLogout={() => setCurrentUser(null)} />

        <main className="p-4 pb-28 space-y-4">
          {activeTab === "dashboard" && (
            <Dashboard stats={stats} visibleOrders={visibleOrders} customers={customers} currentUser={currentUser} />
          )}

          {activeTab === "orders" && (
            <OrdersScreen
              orders={visibleOrders}
              customers={customers}
              currentUser={currentUser}
              setOrders={setOrders}
              users={users}
            />
          )}

          {activeTab === "new-order" && (
            <NewOrderScreen
              products={sortedProducts}
              customers={customers}
              setCustomers={setCustomers}
              setOrders={setOrders}
              currentUser={currentUser}
            />
          )}

          {activeTab === "customers" && (
            <CustomersScreen customers={customers} setCustomers={setCustomers} />
          )}

          {activeTab === "products" && (
            <ProductsScreen products={sortedProducts} setProducts={setProducts} />
          )}

          {activeTab === "users" && (
            <UsersScreen users={users} setUsers={setUsers} />
          )}

          {activeTab === "production" && (
            <ProductionScreen orders={visibleOrders} setOrders={setOrders} currentUser={currentUser} />
          )}

          {activeTab === "shipment" && (
            <ShipmentScreen orders={visibleOrders} setOrders={setOrders} currentUser={currentUser} customers={customers} />
          )}
        </main>

        <BottomNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}

function Header({ currentUser, onLogout }) {
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
      <div>
        <div className="text-lg font-bold">Sipariş Takip</div>
        <div className="text-xs text-slate-500">{currentUser.ad} • {ROLES[currentUser.rol]}</div>
      </div>
      <Button variant="outline" size="sm" onClick={onLogout} className="rounded-2xl">
        <LogOut className="w-4 h-4 mr-2" /> Çıkış
      </Button>
    </div>
  );
}

function BottomNav({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white border-t px-2 py-2 grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-2xl text-xs ${active ? "bg-slate-900 text-white" : "text-slate-600"}`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm rounded-3xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Giriş Yap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Kullanıcı Adı" value={kullaniciAdi} onChange={(e) => setKullaniciAdi(e.target.value)} className="rounded-2xl h-11" />
          <Input placeholder="Şifre" type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} className="rounded-2xl h-11" />
          {hata && <div className="text-sm text-red-600">{hata}</div>}
          <Button onClick={handleLogin} className="w-full rounded-2xl h-11">Giriş</Button>
          <div className="text-xs text-slate-500 space-y-1">
            <div>admin / 1234</div>
            <div>pazarlama / 1234</div>
            <div>uretim / 1234</div>
            <div>sevkiyat / 1234</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Dashboard({ stats, visibleOrders, customers, currentUser }) {
  const latest = [...visibleOrders].slice(-5).reverse();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Toplam Sipariş" value={stats.toplamSiparis} />
        <StatCard title="Onay Bekleyen" value={stats.bekleyen} />
        <StatCard title="Sevkiyata Hazır" value={stats.hazir} />
        <StatCard title="Tamamlanan" value={stats.tamamlanan} />
      </div>
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Son Hareketler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {latest.length === 0 && <Empty text="Gösterilecek sipariş yok" />}
          {latest.map((o) => (
            <OrderMiniCard key={o.id} order={o} customer={customers.find((c) => c.id === o.customerId)} currentUser={currentUser} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="p-4">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function OrderMiniCard({ order, customer }) {
  return (
    <div className="border rounded-2xl p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-semibold">{order.siparisNo}</div>
          <div className="text-sm text-slate-500">{customer?.unvan || "Müşteri yok"}</div>
        </div>
        <StatusBadge value={order.durum} />
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  const classMap = {
    "Müşteriden Onay Bekleniyor": "bg-amber-100 text-amber-700",
    "Müşteri Onayı Alındı": "bg-blue-100 text-blue-700",
    "Sevkiyata Hazır": "bg-purple-100 text-purple-700",
    "Tamamlandı": "bg-green-100 text-green-700",
    "İptal": "bg-red-100 text-red-700",
  };
  return <Badge className={`rounded-xl ${classMap[value] || ""}`}>{value}</Badge>;
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

  const removeCustomer = (id) => setCustomers(customers.filter((c) => c.id !== id));

  return (
    <div className="space-y-4">
      <SearchInput value={search} onChange={setSearch} placeholder="Müşteri ara" />
      <Card className="rounded-3xl">
        <CardHeader><CardTitle>Yeni Müşteri</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Ünvan" value={form.unvan} onChange={(e) => setForm({ ...form, unvan: e.target.value })} className="rounded-2xl" />
          <Input placeholder="Yetkili" value={form.yetkili} onChange={(e) => setForm({ ...form, yetkili: e.target.value })} className="rounded-2xl" />
          <Input placeholder="Telefon" value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} className="rounded-2xl" />
          <Textarea placeholder="Not" value={form.not} onChange={(e) => setForm({ ...form, not: e.target.value })} className="rounded-2xl" />
          <Button onClick={addCustomer} className="w-full rounded-2xl"><Plus className="w-4 h-4 mr-2" /> Ekle</Button>
        </CardContent>
      </Card>
      {filtered.map((c) => (
        <Card key={c.id} className="rounded-3xl">
          <CardContent className="p-4 flex justify-between gap-3">
            <div>
              <div className="font-semibold">{c.unvan}</div>
              <div className="text-sm text-slate-500">{c.yetkili}</div>
              <div className="text-sm text-slate-500 flex items-center gap-1"><Phone className="w-4 h-4" /> {c.telefon}</div>
              {c.not ? <div className="text-xs text-slate-500 mt-2">{c.not}</div> : null}
            </div>
            <Button variant="outline" size="icon" className="rounded-2xl" onClick={() => removeCustomer(c.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
      {!filtered.length && <Empty text="Müşteri bulunamadı" />}
    </div>
  );
}

function ProductsScreen({ products, setProducts }) {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ siraNo: products.length ? Math.max(...products.map((p) => Number(p.siraNo || 0))) + 1 : 1, stokKodu: "", urunAdi: "", fiyat: "", kdv: 20 });

  const filtered = products.filter((p) => [p.stokKodu, p.urunAdi, String(p.siraNo)].join(" ").toLowerCase().includes(search.toLowerCase()));

  const addProduct = () => {
    if (!form.urunAdi.trim() || !form.stokKodu.trim()) return;
    setProducts([
      ...products,
      { id: uid(), siraNo: Number(form.siraNo), stokKodu: form.stokKodu, urunAdi: form.urunAdi, fiyat: Number(form.fiyat || 0), kdv: Number(form.kdv || 0) },
    ]);
    const nextNo = products.length ? Math.max(...products.map((p) => Number(p.siraNo || 0))) + 1 : 1;
    setForm({ siraNo: nextNo + 1, stokKodu: "", urunAdi: "", fiyat: "", kdv: 20 });
  };

  const removeProduct = (id) => setProducts(products.filter((p) => p.id !== id));

  return (
    <div className="space-y-4">
      <SearchInput value={search} onChange={setSearch} placeholder="Ürün ara" />
      <Card className="rounded-3xl">
        <CardHeader><CardTitle>Yeni Ürün</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Sıra No" type="number" value={form.siraNo} onChange={(e) => setForm({ ...form, siraNo: e.target.value })} className="rounded-2xl" />
          <Input placeholder="Stok Kodu" value={form.stokKodu} onChange={(e) => setForm({ ...form, stokKodu: e.target.value })} className="rounded-2xl" />
          <Input placeholder="Ürün Adı" value={form.urunAdi} onChange={(e) => setForm({ ...form, urunAdi: e.target.value })} className="rounded-2xl" />
          <Input placeholder="Liste Fiyatı" type="number" value={form.fiyat} onChange={(e) => setForm({ ...form, fiyat: e.target.value })} className="rounded-2xl" />
          <Input placeholder="KDV %" type="number" value={form.kdv} onChange={(e) => setForm({ ...form, kdv: e.target.value })} className="rounded-2xl" />
          <Button onClick={addProduct} className="w-full rounded-2xl"><Plus className="w-4 h-4 mr-2" /> Ekle</Button>
        </CardContent>
      </Card>
      {filtered.map((p) => (
        <Card key={p.id} className="rounded-3xl">
          <CardContent className="p-4 flex justify-between gap-3">
            <div>
              <div className="font-semibold">{p.siraNo}. {p.urunAdi}</div>
              <div className="text-sm text-slate-500">{p.stokKodu}</div>
              <div className="text-sm text-slate-500">Liste Fiyatı: {money(p.fiyat)}</div>
              <div className="text-sm text-slate-500">KDV: %{p.kdv}</div>
            </div>
            <Button variant="outline" size="icon" className="rounded-2xl" onClick={() => removeProduct(p.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
      {!filtered.length && <Empty text="Ürün bulunamadı" />}
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
  const removeUser = (id) => setUsers(users.filter((u) => u.id !== id));
  return (
    <div className="space-y-4">
      <Card className="rounded-3xl">
        <CardHeader><CardTitle>Yeni Kullanıcı</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Ad Soyad" value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} className="rounded-2xl" />
          <Input placeholder="Kullanıcı Adı" value={form.kullaniciAdi} onChange={(e) => setForm({ ...form, kullaniciAdi: e.target.value })} className="rounded-2xl" />
          <Input placeholder="Şifre" value={form.sifre} onChange={(e) => setForm({ ...form, sifre: e.target.value })} className="rounded-2xl" />
          <Select value={form.rol} onValueChange={(v) => setForm({ ...form, rol: v })}>
            <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Yönetici</SelectItem>
              <SelectItem value="pazarlamaci">Pazarlamacı</SelectItem>
              <SelectItem value="uretim">Üretim</SelectItem>
              <SelectItem value="sevkiyat">Sevkiyat</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addUser} className="w-full rounded-2xl"><Plus className="w-4 h-4 mr-2" /> Ekle</Button>
        </CardContent>
      </Card>
      {users.map((u) => (
        <Card key={u.id} className="rounded-3xl">
          <CardContent className="p-4 flex justify-between gap-3">
            <div>
              <div className="font-semibold">{u.ad}</div>
              <div className="text-sm text-slate-500">{u.kullaniciAdi}</div>
              <div className="text-sm text-slate-500">{ROLES[u.rol]}</div>
            </div>
            <Button variant="outline" size="icon" className="rounded-2xl" onClick={() => removeUser(u.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
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

  const filteredProducts = products.filter((p) => productSearch.trim() && [p.stokKodu, p.urunAdi].join(" ").toLowerCase().includes(productSearch.toLowerCase()));

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
        tamamlandi: false,
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

  const removeItem = (id) => setSelectedItems(selectedItems.filter((i) => i.id !== id));

  const totals = useMemo(() => {
    const araToplam = selectedItems.reduce((sum, i) => sum + Number(i.miktar || 0) * Number(i.netFiyat || 0) * (1 - Number(i.satirIskonto || 0) / 100), 0);
    const genelIndirimli = araToplam * (1 - Number(genelIskonto || 0) / 100);
    const kdvToplam = kdvDahil ? selectedItems.reduce((sum, i) => {
      const satir = Number(i.miktar || 0) * Number(i.netFiyat || 0) * (1 - Number(i.satirIskonto || 0) / 100);
      return sum + satir * (Number(i.kdv || 0) / 100);
    }, 0) * (1 - Number(genelIskonto || 0) / 100) : 0;
    return { araToplam, genelIndirimli, kdvToplam, genelToplam: genelIndirimli + kdvToplam };
  }, [selectedItems, genelIskonto, kdvDahil]);

  const createOrder = () => {
    if (!selectedItems.length) return;
    let finalCustomerId = customerId;
    if (customerMode === "new") {
      if (!newCustomer.unvan.trim()) return;
      const created = { id: uid(), ...newCustomer };
      setCustomers((prev) => [created, ...prev]);
      finalCustomerId = created.id;
    }
    setOrders((prev) => [
      {
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
      },
      ...prev,
    ]);
    setSelectedItems([]);
    setAciklama("");
    setGenelIskonto(0);
    setKdvDahil(false);
    setProductSearch("");
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl">
        <CardHeader><CardTitle>Müşteri</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant={customerMode === "select" ? "default" : "outline"} className="rounded-2xl" onClick={() => setCustomerMode("select")}>Var Olan</Button>
            <Button variant={customerMode === "new" ? "default" : "outline"} className="rounded-2xl" onClick={() => setCustomerMode("new")}>Yeni Müşteri</Button>
          </div>
          {customerMode === "select" ? (
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Müşteri seç" /></SelectTrigger>
              <SelectContent>
                {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.unvan}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-3">
              <Input placeholder="Ünvan" value={newCustomer.unvan} onChange={(e) => setNewCustomer({ ...newCustomer, unvan: e.target.value })} className="rounded-2xl" />
              <Input placeholder="Yetkili" value={newCustomer.yetkili} onChange={(e) => setNewCustomer({ ...newCustomer, yetkili: e.target.value })} className="rounded-2xl" />
              <Input placeholder="Telefon" value={newCustomer.telefon} onChange={(e) => setNewCustomer({ ...newCustomer, telefon: e.target.value })} className="rounded-2xl" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader><CardTitle>Ürün Ekle</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <SearchInput value={productSearch} onChange={setProductSearch} placeholder="Ürün aratmadan sonuç göstermez" />
          {!!productSearch.trim() && (
            <div className="space-y-2">
              {filteredProducts.map((p) => (
                <button key={p.id} onClick={() => addItem(p)} className="w-full text-left border rounded-2xl p-3 hover:bg-slate-50">
                  <div className="font-semibold">{p.siraNo}. {p.urunAdi}</div>
                  <div className="text-sm text-slate-500">{p.stokKodu} • {money(p.fiyat)}</div>
                </button>
              ))}
              {!filteredProducts.length && <Empty text="Ürün bulunamadı" />}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader><CardTitle>Seçilen Kalemler</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {selectedItems.length === 0 && <Empty text="Henüz ürün eklenmedi" />}
          {selectedItems.map((i) => (
            <div key={i.id} className="border rounded-2xl p-3 space-y-2">
              <div className="flex justify-between gap-2">
                <div>
                  <div className="font-semibold">{i.urunAdi}</div>
                  <div className="text-sm text-slate-500">{i.stokKodu}</div>
                </div>
                <Button variant="outline" size="icon" className="rounded-2xl" onClick={() => removeItem(i.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Miktar" value={i.miktar} onChange={(e) => updateItem(i.id, "miktar", e.target.value)} className="rounded-2xl" />
                <Input type="number" placeholder="Net Fiyat" value={i.netFiyat} onChange={(e) => updateItem(i.id, "netFiyat", e.target.value)} className="rounded-2xl" />
                <Input type="number" placeholder="Satır İskonto %" value={i.satirIskonto} onChange={(e) => updateItem(i.id, "satirIskonto", e.target.value)} className="rounded-2xl" />
                {kdvDahil && <Input type="number" placeholder="KDV %" value={i.kdv} onChange={(e) => updateItem(i.id, "kdv", e.target.value)} className="rounded-2xl" />}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2 items-center">
            <Input type="number" placeholder="Toplu İskonto %" value={genelIskonto} onChange={(e) => setGenelIskonto(e.target.value)} className="rounded-2xl" />
            <div className="flex items-center gap-2 border rounded-2xl px-3 h-10">
              <Checkbox checked={kdvDahil} onCheckedChange={(v) => setKdvDahil(Boolean(v))} />
              <span className="text-sm">KDV Dahil</span>
            </div>
          </div>
          <Textarea placeholder="Açıklama" value={aciklama} onChange={(e) => setAciklama(e.target.value)} className="rounded-2xl" />
          <div className="border rounded-2xl p-3 text-sm space-y-1 bg-slate-50">
            <div className="flex justify-between"><span>Ara Toplam</span><span>{money(totals.araToplam)}</span></div>
            <div className="flex justify-between"><span>İskonto Sonrası</span><span>{money(totals.genelIndirimli)}</span></div>
            <div className="flex justify-between"><span>KDV</span><span>{money(totals.kdvToplam)}</span></div>
            <div className="flex justify-between font-bold text-base"><span>Genel Toplam</span><span>{money(totals.genelToplam)}</span></div>
          </div>
          <Button onClick={createOrder} className="w-full rounded-2xl"><Save className="w-4 h-4 mr-2" /> Siparişi Kaydet</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersScreen({ orders, customers, currentUser, setOrders, users }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = orders.filter((o) => {
    const customer = customers.find((c) => c.id === o.customerId);
    const textOk = [o.siparisNo, customer?.unvan, o.durum].join(" ").toLowerCase().includes(search.toLowerCase());
    const filterOk = filter === "all" ? true : o.durum === filter;
    if (currentUser.rol === "admin") return textOk && filterOk;
    if (currentUser.rol === "pazarlamaci") {
      if (o.durum === "İptal") return o.createdBy === currentUser.id && textOk && filterOk;
      return o.createdBy === currentUser.id && textOk && filterOk;
    }
    return textOk && filterOk;
  });

  const totalAmount = (order) => {
    const subtotal = order.kalemler.reduce((sum, i) => sum + Number(i.miktar || 0) * Number(i.netFiyat || 0) * (1 - Number(i.satirIskonto || 0) / 100), 0);
    const discounted = subtotal * (1 - Number(order.genelIskonto || 0) / 100);
    const vat = order.kdvDahil ? order.kalemler.reduce((sum, i) => {
      const satir = Number(i.miktar || 0) * Number(i.netFiyat || 0) * (1 - Number(i.satirIskonto || 0) / 100);
      return sum + satir * (Number(i.kdv || 0) / 100);
    }, 0) * (1 - Number(order.genelIskonto || 0) / 100) : 0;
    return discounted + vat;
  };

  const updateStatus = (orderId, durum) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, durum } : o));
  };

  const revertCancelled = (orderId) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, durum: "Müşteriden Onay Bekleniyor" } : o));
  };

  return (
    <div className="space-y-4">
      <SearchInput value={search} onChange={setSearch} placeholder="Sipariş ara" />
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Durum filtrele" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tümü</SelectItem>
          {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      {filtered.map((o) => {
        const customer = customers.find((c) => c.id === o.customerId);
        const created = users.find((u) => u.id === o.createdBy);
        const isCancelled = o.durum === "İptal";
        const canSeeCancelled = currentUser.rol === "admin" || o.createdBy === currentUser.id;
        if (isCancelled && !canSeeCancelled) return null;
        return (
          <Card key={o.id} className="rounded-3xl overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between gap-2 items-start">
                <div>
                  <div className="font-bold">{o.siparisNo}</div>
                  <div className="text-sm text-slate-500">{customer?.unvan || "Müşteri yok"}</div>
                  <div className="text-xs text-slate-400">{o.tarih} • {created?.ad || ""}</div>
                </div>
                <StatusBadge value={o.durum} />
              </div>
              <div className="space-y-2">
                {o.kalemler.map((i) => (
                  <div key={i.id} className="border rounded-2xl p-3">
                    <div className="font-medium">{i.urunAdi}</div>
                    <div className="text-sm text-slate-500">{i.stokKodu}</div>
                    <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                      <div>Miktar: {i.miktar}</div>
                      <div>Hazır: {i.hazirMiktar}</div>
                      <div>Sevk: {i.sevkMiktar}</div>
                    </div>
                    {(currentUser.rol === "admin" || currentUser.rol === "pazarlamaci") && (
                      <div className="text-sm mt-2">Net Fiyat: {money(i.netFiyat)}</div>
                    )}
                  </div>
                ))}
              </div>
              {(currentUser.rol === "admin" || currentUser.rol === "pazarlamaci") && (
                <div className="border rounded-2xl p-3 bg-slate-50 font-semibold">Toplam: {money(totalAmount(o))}</div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {currentUser.rol === "admin" && o.durum !== "İptal" && (
                  <>
                    <Button variant="outline" className="rounded-2xl" onClick={() => updateStatus(o.id, "Müşteri Onayı Alındı")}>Onay Alındı</Button>
                    <Button variant="outline" className="rounded-2xl" onClick={() => updateStatus(o.id, "İptal")}><XCircle className="w-4 h-4 mr-2" /> İptal</Button>
                  </>
                )}
                {currentUser.rol === "pazarlamaci" && o.createdBy === currentUser.id && o.durum !== "İptal" && (
                  <Button variant="outline" className="rounded-2xl col-span-2" onClick={() => updateStatus(o.id, "İptal")}><XCircle className="w-4 h-4 mr-2" /> Siparişi İptal Et</Button>
                )}
                {o.durum === "İptal" && (currentUser.rol === "admin" || o.createdBy === currentUser.id) && (
                  <Button className="rounded-2xl col-span-2" onClick={() => revertCancelled(o.id)}><RotateCcw className="w-4 h-4 mr-2" /> İptali Geri Al</Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
      {!filtered.length && <Empty text="Sipariş bulunamadı" />}
    </div>
  );
}

function ProductionScreen({ orders, setOrders }) {
  const [search, setSearch] = useState("");
  const filtered = orders.filter((o) => o.durum !== "İptal" && [o.siparisNo, ...o.kalemler.map((i) => i.urunAdi)].join(" ").toLowerCase().includes(search.toLowerCase()));

  const markReady = (orderId, itemId, qty) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o;
      const kalemler = o.kalemler.map((i) => {
        if (i.id !== itemId) return i;
        const newHazir = Math.min(Number(i.miktar), Number(i.hazirMiktar || 0) + Number(qty || 0));
        return { ...i, hazirMiktar: newHazir };
      });
      const hepsiHazir = kalemler.every((i) => Number(i.hazirMiktar || 0) >= Number(i.miktar || 0));
      return { ...o, kalemler, durum: hepsiHazir ? "Sevkiyata Hazır" : o.durum };
    }));
  };

  return (
    <div className="space-y-4">
      <SearchInput value={search} onChange={setSearch} placeholder="Üretim siparişi ara" />
      {filtered.map((o) => (
        <Card key={o.id} className="rounded-3xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="font-bold">{o.siparisNo}</div>
              <StatusBadge value={o.durum} />
            </div>
            {o.kalemler.map((i) => (
              <ProductionItemRow key={i.id} item={i} onReady={(qty) => markReady(o.id, i.id, qty)} />
            ))}
          </CardContent>
        </Card>
      ))}
      {!filtered.length && <Empty text="Üretim bekleyen iş yok" />}
    </div>
  );
}

function ProductionItemRow({ item, onReady }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="border rounded-2xl p-3 space-y-2">
      <div className="font-medium">{item.urunAdi}</div>
      <div className="text-sm text-slate-500">Toplam: {item.miktar} • Hazır: {item.hazirMiktar}</div>
      <div className="flex gap-2">
        <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="rounded-2xl" />
        <Button className="rounded-2xl" onClick={() => onReady(qty)}><CheckCircle2 className="w-4 h-4 mr-2" /> Hazır Yap</Button>
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
        return { ...i, sevkMiktar: newSevk, tamamlandi: newSevk >= Number(i.miktar || 0) };
      });
      const hepsiTamam = kalemler.every((i) => Number(i.sevkMiktar || 0) >= Number(i.miktar || 0));
      return { ...o, kalemler, durum: hepsiTamam ? "Tamamlandı" : "Sevkiyata Hazır" };
    }));
  };

  return (
    <div className="space-y-4">
      <SearchInput value={search} onChange={setSearch} placeholder="Sevkiyat ara" />
      {filtered.map((o) => {
        const customer = customers.find((c) => c.id === o.customerId);
        return (
          <Card key={o.id} className="rounded-3xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">{o.siparisNo}</div>
                  <div className="text-sm text-slate-500">{customer?.unvan}</div>
                </div>
                <StatusBadge value={o.durum} />
              </div>
              {o.kalemler.map((i) => (
                <ShipmentItemRow key={i.id} item={i} onShip={(qty) => shipItem(o.id, i.id, qty)} />
              ))}
              <Button variant="outline" className="w-full rounded-2xl"><Truck className="w-4 h-4 mr-2" /> Sevkiyat Fişi Oluştur</Button>
            </CardContent>
          </Card>
        );
      })}
      {!filtered.length && <Empty text="Sevkiyat bekleyen iş yok" />}
    </div>
  );
}

function ShipmentItemRow({ item, onShip }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="border rounded-2xl p-3 space-y-2">
      <div className="font-medium">{item.urunAdi}</div>
      <div className="text-sm text-slate-500">Toplam: {item.miktar} • Hazır: {item.hazirMiktar} • Sevk: {item.sevkMiktar}</div>
      <div className="flex gap-2">
        <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="rounded-2xl" />
        <Button className="rounded-2xl" onClick={() => onShip(qty)}><Truck className="w-4 h-4 mr-2" /> Sevk Et</Button>
      </div>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9 rounded-2xl h-11" />
    </div>
  );
}

function Empty({ text }) {
  return <div className="text-sm text-slate-500 text-center py-6">{text}</div>;
}

export default App;
