# RoK Calculator — Tüm Hesaplama Formülleri (Referans)

Bu doküman, mevcut sitenin (`rok-calculator.com`) Angular paketinden çıkarılan **tüm hesaplama mantığını** sade biçimde anlatır. Kendi modern sitende birebir bu formülleri kullanabilirsin.

## Mimari notu
- Site **Angular**. Tüm hesap **tarayıcı tarafında (client-side)** çalışıyor; sunucu hesabı yok.
- Firestore (Firebase) sadece **kullanıcının girdiği değerleri kaydetmek** için kullanılıyor (login olunca). **Oyun sabitleri (maliyet tabloları) JS paketinin içinde gömülü** — sunucuya bağımlı değilsin.
- Büyük tablolar (`troop`, `equipment`, `vip`, `trading post`) `rok-extract.py` ile JSON olarak çıkarıldı → `rok-data/` klasörü.

---

## 1) Speedup (Hızlandırma) Hesabı

En basiti. Speedup'lar **dakika** cinsinden paketlerde tutulur. Her tür (building / training / research / healing / generic) için ayrı toplam alınır.

```
toplam_dakika = Σ (paket_dakikası × adet)
```

Kod:
```js
getTotal(t){ let o=0; Object.keys(t).forEach(r=>{ o += (+r) * t[+r] }); return o }
```

Paket denominasyonları (dakika):
- **Generic:** 1, 3, 5, 10, 15, 30, 60, 180, 480, 900, 1440, 4320, 10800, 43200
- **Building/Training/Research/Healing:** 1, 5, 10, 15, 30, 60, 180, 480 (+ bazılarında 900)

Gösterim: sonuç dakika → `saniye = 60 × dakika` → gün/saat/dakika biçimine çevrilir.

---

## 2) Trading Post (Kaynak Gönderme Vergisi)

İki yön var. Vergi oranı, ticaret merkezi seviyesine göre tablodan gelir (`rok-data/trading_post.json`). Seviye 1 = %35 … Seviye 25 = %8.

**Form 1 — "Karşı tarafa X ulaşması için ne göndermeliyim?"**
```
gönderilecek = ceil( hedef / (1 - vergiOranı) )
vergi        = gönderilecek - hedef
```

**Form 2 — "X gönderirsem karşıya ne ulaşır?"**
```
vergi   = ceil( gönderilen × vergiOranı )
ulaşan  = gönderilen - vergi
```

Her kaynak (food / wood / stone / gold) için ayrı ayrı uygulanır. Kod:
```js
form1Result = Math.ceil(amount * (1/(1-pct)));  form1Tax = form1Result - amount;
form2Tax    = Math.ceil(amount * pct);          form2Result = amount - form2Tax;
```

Vergi tablosu (seviye → oran): 1:.35, 2:.34, 3:.33, 4:.32, 5:.31, 6:.30, 7:.29, 8:.28, 9:.27, 10:.26, 11:.25, 12:.24, 13:.23, 14:.22, 15:.21, 16:.20, 17:.19, 18:.18, 19:.17, 20:.16, 21:.15, 22:.14, 23:.12, 24:.10, 25:.08

---

## 3) Training (MGE / Asker Eğitimi)

Kullanıcı kaynak (food/wood/stone/gold) ve speedup süresi girer; **kaç asker eğitebileceğini** ve harcamayı hesaplar. Birim başına maliyetler `getPerTroopType(trainingType, troopsType)` tablosundan gelir (`rok-data/troop_training.json`). `troopsType`: 1=infantry, 2=cavalry, 3=archer, 4=siege.

**Asker sayısı = kaynak ve süre kısıtlarının en küçüğü:**
```
adet_food  = floor(userFood  / birim.food)     (birim.food > 0 ise)
adet_wood  = floor(userWood  / birim.wood)
adet_stone = floor(userStone / birim.stone)
adet_gold  = floor(userGold  / birim.gold)

saniye = gün*86400 + saat*3600 + dakika*60
adet_süre = floor( saniye / birim.time × (1 + eğitimHızıBonusu/100) )

asker = min( girilen kaynak kısıtları )         (hiç kaynak girilmediyse sadece süre)
eğer hem kaynak hem süre girildiyse: asker = min(asker_kaynak, adet_süre)
```

**Harcama ve puanlar (asker sayısı × birim değer):**
```
spendFood = asker × birim.food   (wood/stone/gold aynı)
spendTime = asker × birim.time
totalPower     = asker × birim.power
totalMgePoints = asker × birim.mgePoints
totalKvkPoints = asker × birim.kvk

leftFood = max(0, userFood - spendFood)         (diğer kaynaklar ve süre aynı)
```

Örnek birim maliyet (training tier 1):
| tip | food | wood | stone | gold | time | power | mge | kvk |
|---|---|---|---|---|---|---|---|---|
| infantry | 800 | 800 | 0 | 400 | 120 | 10 | 100 | 20 |
| cavalry | 800 | 0 | 600 | 400 | 120 | 10 | 100 | 20 |
| archer | 0 | 800 | 600 | 400 | 120 | 10 | 100 | 20 |
| siege | 500 | 500 | 400 | 400 | 120 | 10 | 100 | 20 |

(Tüm tier'lar için tam tablo: `rok-data/troop_training.json`)

---

## 4) Healing (Yaralı Asker İyileştirme)

Her tier (T1–T5) için yaralı asker sayısı girilir (infantry/archer/cavalry/siege ayrı). Maliyet sabitleri **kodda gömülü** (`calcRss` argümanları).

**Kaynak maliyeti (tier başına, kaynak başına):**
```
maliyet = inf×c_inf + archer×c_arch + cavalry×c_cav + siege×c_siege
RSS indirimi varsa: maliyet × (100 - healingRssReduction) / 100
```

Tier başına `calcRss(birim_inf, birim_arch, birim_cav, birim_siege)` sabitleri:

| Tier | Food (inf,arch,cav,siege) | Wood | Stone | Gold | birim Time |
|---|---|---|---|---|---|
| T1 | 20,16,24,24 | 20,24,16,24 | 0,0,0,0 | 0,0,0,0 | 3 sn |
| T2 | 40,0,40,26 | 40,40,0,26 | 0,30,30,20 | 0,0,0,0 | 1 sn? |
| T3 | 60,0,60,40 | 60,60,0,40 | 0,44,44,30 | 4,4,4,4 | 2 sn |
| T4 | 120,0,120,80 | 120,120,0,80 | 0,90,90,60 | 8,8,8,8 | 3 sn |
| T5 | (kodda devamı) | | | | 4 sn |

> Not: argüman sırası kodda `(infantry, archer, cavalry, siege)`. Yukarıda aynen verildi.

**Süre:**
```
süre = yaralıSayısı × birimTime
healingSpeedBonus varsa: süre / (1 + healingSpeedBonus/100)
```

**Alliance Help (ittifak yardımı) indirimi** (hem süre hem genel):
```
eğer (süre × yardım/100) küçükse:  süre -= 3dk × yardımSayısı    (her yardım ~3 dk siler)
değilse: her yardım süreyi %1 azaltır → süre × 0.99^yardımSayısı
(kod: applyhelp(t,o){ return t==0 ? o : applyhelp(t-1, o - 0.01*o) })
```

Toplamlar tüm tier'ların toplamıdır: `totalFood = t1Food + t2Food + … + t5Food` (diğerleri aynı).

---

## 5) Building & Research (Bina / Araştırma Yükseltme)

Kullanıcı `levelFrom → levelTo` aralığı seçer. Sistem o aralıktaki **her seviyenin** maliyetini toplar. Seviye başına veriler bir liste tablosundan gelir (food/wood/stone/gold/book/arrow cost, power & mge reward, time cost).

```
seçilen aralıktaki her level için:
  foodCost  += level.foodCost   (wood/stone/gold/book/arrow aynı)
  powerReward    += level.powerReward
  mgePointsReward+= level.mgePointsReward
  timeCost  += düzeltilmişSüre
```

**Süre düzeltmesi (speedup bonusu):**
```
süre = buildingSpeedBonus > 0 ? level.timeCost / (1 + buildingSpeedBonus/100) : level.timeCost
```

**Alliance Help:**
```
eğer (süre × yardım/100) < 3dk×yardım:  süre -= 3dk × yardım   (0'ın altına inmez)
değilse: helpTime(süre, yardım) → her yardım: süre × 100/101  (yani ~%0.99 azaltma, yinelemeli)
(kod: helpTime(t,o){ return o==0 ? t : helpTime(100*t/101, o-1) })
```

> Building ve Research aynı motoru kullanır; fark sadece veri tablosudur. Seviye tabloları büyük olduğundan extract script ile çekilmeli (bkz. aşağıda "geliştirme").

---

## 6) VIP Seviyesi

`levelFrom → levelTo` arası gereken VIP puanı = aralıktaki seviye puanlarının toplamı − mevcut puan. Tablo `rok-data/vip.json`.

Seviye → puan: 1:200, 2:400, 3:1200, 4:3500, 5:6000, 6:11500, 7:17500, 8:35000, 9:75000, 10:150000, 11:250000, 12:350000, 13:500000, 14:750000, 15:1000000, 16:1500000, 17:2500000, 18:4000000

```
gereken = Σ(levelFrom+1 .. levelTo seviyelerinin puanı) - currentVipPoints
```

---

## 7) Resource Pack (Kaynak Paketi)

Farklı boyutlardaki paketleri büyükten küçüğe **bölüştürerek** toplam kaynağı bulur (oyundaki paket açma mantığını taklit eder). Paket türleri: Lvl1A, Lvl1B, Lvl1C, Lvl2, Lvl3.

Örnek (Lvl1A — adet `s`):
```
büyük = ceil(s/2);  kalan = s - büyük
toplam_1 += 1000 × büyük            // 1e3 birimlik
if kalan>0: toplam_2 += 1000 × kalan
```
Lvl1B (adet `a`): `ceil(a/3)` → 1000'lik, `ceil((a-h)/2)` → 1000'lik, kalan → 750'lik.
Lvl1C (adet `l`): 4'e/3'e/2'ye bölünür → 1000/1000/750/500 birimlik kademeler.
Lvl2: aynı kademeler ama birimler 10000 / 10000 / 7500 / 5000.
Lvl3: daha büyük birimler (kodun devamında).

> Bu hesaplayıcı diğerlerinden farklı: birim değer × adet değil, **kademeli bölüştürme** var. Birebir kopyalamak istersen `updateResPacksTotal` fonksiyonunu olduğu gibi al.

---

## 8) Gems / Action Points / Tome of Knowledge (Envanter Toplamı)

Hepsi aynı **ağırlıklı toplam** mantığı (speedup'la birebir aynı `getTotal`):
```
toplam = Σ (birim_değeri × adet)
```
- **Gems** denominasyonları: 0, 5, 10, 50, 100, 200, 500, 650, 1000, 2000
- **Action Points** denominasyonları: 50, 100, 500, 1000
- **Tome of Knowledge (EXP):** her tome boyutu × adet (değerler `new v(...)` örneklerinde; nadirlik bazlı)

---

## 9) Equipment (Ekipman Üretim Maliyeti)

Her ekipman parçası 7 slottan birinde (weapon/helmet/chest/gloves/legs/boots/accessories). Her parça için:
- nadirlik (Common→Legendary)
- isim, renk
- **4 üretim aşamasının malzeme miktarı** (`new v(C,UC,R,E,M)` → her aşamada hangi nadirlikten kaç malzeme)
- power (güç katkısı)

Toplam üretim maliyeti = seçilen parçaların malzeme miktarlarının nadirlik bazında toplamı. Tam liste: `rok-data/equipment.json` (114 parça çıkarıldı).

Örnek: *Sharp Longsword* (Common) → 100 common malzeme, power 100.000.

---

## 10) Commander (EXP / Sculpture)

Komutan tipi (Legendary/Epic/Elite/Advanced) ve skill seviyeleri (1→2→3→4, from/to) seçilir. Hedef seviyelere ulaşmak için gereken **EXP** ve **sculpture (heykel)** nadirlik bazlı tablolardan toplanır (`new v` örnekleri). Mantık: seçilen aralıktaki her skill yükseltmesinin maliyetini toplama.

---

## Ortak yardımcılar
- **Zaman gösterimi:** saniye → `gün/saat/dakika/saniye`. (`convertToTimeStr(saniye)`)
- **Sayı gösterimi:** `toLocaleString()` (binlik ayraç).
- **Alliance help iki model:** kısa sürelerde sabit −3dk/yardım; uzun sürelerde çarpımsal (`×0.99` veya `×100/101` her yardım).

---

## Büyük tabloları kendin çıkarmak (token yakmadan)
`rok-extract.py` script'ini, sitenin `main.<hash>.js` dosyasıyla çalıştır:

```bash
python3 rok-extract.py main.3025b2dfacfe4513.js
```

Çıktı `rok-data/` klasöründe JSON olarak: `troop_training`, `trading_post`, `vip`, `denominations`, `equipment`. Building/Research seviye tablolarını da eklemek istersen script'teki desene bakıp `getBuildingListItem` / seviye listesi fonksiyonunu aynı yöntemle parse edebilirsin (o tablolar Firestore'dan da geliyor olabilir; o durumda ağ sekmesinden JSON yanıtını yakala).

> Hepsi senin oyun verin; formüller oyun mekaniği. Tek dikkat: sitenin metin/isim/tasarımını kopyalama, sadece hesap mantığını kullan.
