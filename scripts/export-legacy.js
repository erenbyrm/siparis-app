// Eski uygulama açıkken tarayıcının geliştirici konsolunda çalıştırılır.
// Yalnızca ürün, müşteri ve siparişleri indirir. Hesap/şifre anahtarlarını okumaz.
(() => {
  const data = {};
  for (const name of ['products', 'customers', 'orders']) {
    const raw = localStorage.getItem('siparis_' + name + '_v20');
    data[name] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data[name])) throw new Error('Eski kayıt okunamadı: ' + name);
  }
  if (!Object.values(data).some(rows => rows.length)) throw new Error('Bu adreste eski kayıt bulunamadı.');
  const payload = {format:'siparis-legacy',version:20,exportedAt:new Date().toISOString(),data};
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  const link = document.createElement('a');
  link.href=url;link.download='siparis-eski-veri-yedegi.json';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
})();
