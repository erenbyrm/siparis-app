import React, { useState, useMemo } from "react";

type Product = {
  id: number;
  orderNo: number;
  code: string;
  name: string;
  price: number;
  kdv: number;
};

const initialProducts: Product[] = [];

export default function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [bulkText, setBulkText] = useState("");
  const [message, setMessage] = useState("");
  const [newOrderMode, setNewOrderMode] = useState(false);

  // ✅ HER ZAMAN SIRA NOYA GÖRE
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.orderNo - b.orderNo);
  }, [products]);

  // ✅ TOPLU YÜKLEME (SAĞLAM)
  const importProducts = () => {
    const rows = bulkText
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    let added = 0;
    let skipped: string[] = [];

    const newList: Product[] = [];

    rows.forEach((row, index) => {
      const parts = row.includes(";")
        ? row.split(";")
        : row.split(",");

      if (parts.length < 5) {
        skipped.push(`Satır ${index + 1}`);
        return;
      }

      const [orderNo, code, name, price, kdv] = parts;

      const parsed: Product = {
        id: Date.now() + index,
        orderNo: Number(orderNo),
        code: code.trim(),
        name: name.trim(),
        price: Number(String(price).replace(",", ".")),
        kdv: Number(kdv),
      };

      if (!parsed.code || !parsed.name || !parsed.price) {
        skipped.push(`Satır ${index + 1}`);
        return;
      }

      newList.push(parsed);
      added++;
    });

    setProducts((prev) => [...prev, ...newList]);

    const summary = [
      `Eklenen: ${added}`,
      `Atlanan: ${skipped.length}`,
      skipped.length ? "Hatalı satırlar: " + skipped.join(", ") : "",
    ];

    // 💥 HATA VERMEYEN SATIR
    setMessage(summary.join("\n"));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Sipariş Uygulaması</h2>

      {/* YENİ SİPARİŞ MODU */}
      {!newOrderMode && (
        <>
          <button onClick={() => setNewOrderMode(true)}>
            Yeni Sipariş
          </button>

          <h3>Ürünler</h3>
          {sortedProducts.map((p) => (
            <div key={p.id}>
              #{p.orderNo} - {p.code} - {p.name}
            </div>
          ))}

          <h3>Toplu Yükleme</h3>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={10}
            style={{ width: "100%" }}
          />

          <button onClick={importProducts}>Yükle</button>

          <pre>{message}</pre>
        </>
      )}

      {/* YENİ SİPARİŞ SAYFASI */}
      {newOrderMode && (
        <>
          <button onClick={() => setNewOrderMode(false)}>
            ← Geri
          </button>

          <h3>Yeni Sipariş Oluştur</h3>

          <div style={{ marginTop: 20 }}>
            <strong>Sipariş Özeti</strong>

            <div>Ara Toplam: 0</div>
            <div>İskonto: 0</div>
            <div>KDV: 0</div>
            <div>Genel Toplam: 0</div>
          </div>
        </>
      )}
    </div>
  );
}