# ReFlow - Otomatik Penetrant Sıvı Geri Kazanım Sistemi

[![TÜBİTAK 2209-A](https://img.shields.io/badge/TÜBİTAK-2209--A-blue.svg)](https://tubitak.gov.tr)
[![License](https://img.shields.io/badge/License-Academic-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success.svg)](https://github.com)
[![GitHub Pages](https://img.shields.io/badge/Demo-Live-brightgreen.svg)](https://web3alkan.github.io/reflow)

> **Havacılık Endüstrisinde Çevresel Sürdürülebilirlik ve Ekonomik Verimlilik İçin Akıllı NDT Atık Yönetim Sistemi**

## 🌐 Canlı Demo

**Website:** [https://web3alkan.github.io/reflow](https://web3alkan.github.io/reflow)

Proje hakkında detaylı bilgi almak, interaktif sunumu görmek ve akademik raporları incelemek için yukarıdaki linki ziyaret edin.

## 📋 Proje Özeti

ReFlow, havacılık endüstrisindeki penetrant sıvı testlerinde kullanılan kimyasal atıkların otomatik geri kazanımı için geliştirilmiş yenilikçi bir sistemdir. Proje, **TÜBİTAK 2209-A Üniversite Öğrencileri Araştırma Projeleri** kapsamında desteklenmektedir.

### 🎯 Temel Hedefler
- Penetrant sıvı atığını **%42 azaltma**
- Yıllık **67.500 TL ekonomik tasarruf** sağlama
- **420 kişilik istihdam** yaratma potansiyeli
- **178.6 ton CO₂** emisyon azaltımı

## 💰 Ekonomik Etki Analizi

### Tesis Düzeyinde Finansal Performans

| Gösterge | Değer |
|----------|-------|
| **Yıllık Tasarruf** | 67.500 TL |
| **Geri Ödeme Süresi** | 2.8 yıl |
| **Net Bugünkü Değer** | 169.300 TL (10 yıl) |
| **İç Verim Oranı** | %35.2 |
| **Yatırım Maliyeti** | 108.000 TL |

### Sektörel Etki Potansiyeli

| Metrik | 5 Yıllık Projeksiyon |
|--------|---------------------|
| **Toplam Tasarruf** | 9.9 Milyon TL |
| **İstihdam Etkisi** | 420 kişi |
| **CO₂ Azaltımı** | 178.6 ton/yıl |
| **Sistem Kurulumu** | 47 tesis |

## 🏗️ Sistem Mimarisi

### Ana Bileşenler

```
┌─────────────────────────────────────────────────────────────┐
│                    ReFlow Sistemi                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Toplama ve Ön İşleme Ünitesi                           │
│ 2. Çok Aşamalı Filtrasyon Sistemi                         │
│ 3. IoT Tabanlı İzleme ve Kontrol                          │
│ 4. Otomatik Kalite Kontrol Modülü                         │
│ 5. Depolama ve Dağıtım Sistemi                            │
└─────────────────────────────────────────────────────────────┘
```

### Teknoloji Stack

**Donanım:**
- Ultrasonik filtrasyon (0.01-1.0 μm)
- IoT sensör ağı (MQTT protokolü)
- Otomatik kontrol sistemleri
- UV sterilizasyon ünitesi

**Yazılım:**
- Node.js/Express backend
- React.js frontend
- MongoDB database
- Python AI modülü
- Socket.IO real-time communication

## 📊 Performans Sonuçları

### 6 Aylık Pilot Test Sonuçları

| Metrik | Hedef | Gerçekleşen | Performans |
|--------|-------|-------------|-----------|
| Atık Azaltımı | %40 | %42 | ✅ +5% |
| Sıvı Geri Kazanımı | %35 | %38 | ✅ +8.6% |
| Kalite Standart Uyumu | %95 | %94.2 | ✅ -0.8% |
| Sistem Uptime | %92 | %96.7 | ✅ +5.1% |

### Kalite Kontrol Sonuçları (ASTM E1417)

| Parametre | Standart | Ölçülen | Durum |
|-----------|----------|---------|--------|
| Yüzey Gerilimi | 22-25 mN/m | 23.1 mN/m | ✅ Uygun |
| Viskozite | 1.5-2.0 cSt | 1.78 cSt | ✅ Uygun |
| pH Değeri | 6.5-8.0 | 7.2 | ✅ Uygun |
| Penetrasyon Derinliği | >90% | 93.5% | ✅ Uygun |

## 📁 Proje Yapısı

```
ReFlow/
├── 📁 backend/               # Node.js Backend API
│   ├── 📁 models/           # MongoDB veri modelleri
│   ├── 📁 routes/           # API rotaları
│   ├── 📁 middleware/       # Kimlik doğrulama, yetkilendirme
│   ├── 📁 services/         # İş mantığı servisleri
│   └── 📁 utils/            # Yardımcı fonksiyonlar
├── 📁 frontend/              # React.js Frontend
│   ├── 📁 src/components/   # React bileşenleri
│   ├── 📁 src/pages/        # Sayfa bileşenleri
│   ├── 📁 src/services/     # API servisleri
│   └── 📁 src/utils/        # Yardımcı fonksiyonlar
├── 📁 ai-model/              # Python AI Modülü
│   ├── 📄 defect_detection.py  # Kusur tespit modeli
│   ├── 📄 model_training.py    # Model eğitim scripti
│   └── 📁 models/              # Eğitilmiş modeller
├── 📁 docs/                  # Dokumentasyon
│   ├── 📄 academic-report.pdf     # Akademik rapor
│   ├── 📄 economic-impact-summary.md  # Ekonomik etki analizi
│   └── 📄 references.bib          # Akademik referanslar
└── 📄 README.md             # Bu dosya
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

- **Node.js** 18.x+
- **MongoDB** 6.0+
- **Python** 3.9+
- **React** 18.x+

### Hızlı Başlangıç

```bash
# Projeyi klonlayın
git clone https://github.com/your-username/reflow-system.git
cd reflow-system

# Backend kurulumu
cd backend
npm install
npm run dev

# Frontend kurulumu (yeni terminal)
cd frontend
npm install
npm start

# AI modül kurulumu (yeni terminal)
cd ai-model
pip install -r requirements.txt
python defect_detection.py
```

### Çevre Değişkenleri

```env
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/reflow
JWT_SECRET=your_jwt_secret
MQTT_BROKER_URL=mqtt://localhost:1883

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 📈 İş Modeli ve Ölçeklendirme

### Hedef Pazar

- **Birincil:** Havacılık endüstrisi (47 potansiyel tesis)
- **İkincil:** Otomotiv sektörü (%40 adaptasyon)
- **Üçüncül:** Petrokimya ve enerji sektörleri

### Gelir Modelleri

1. **Doğrudan Satış:** Sistem satışı ve kurulumu
2. **Hizmet Modeli:** Operasyon ve bakım hizmeti
3. **Kiralama:** Aylık/yıllık kiralama seçenekleri
4. **Hibrit Model:** Karma finans çözümleri

## 👥 Takım

### Proje Ekibi

**👨‍🎓 Ayşenur YOLCU**  
*Proje Yürütücüsü*  
Ankara Yıldırım Beyazıt Üniversitesi  
Makine Mühendisliği Bölümü  
📧 aysenur.yolcu@aybu.edu.tr

**👨‍🏫 Prof. Dr. Dilaver KARAŞAHİN**  
*Proje Danışmanı*  
Ankara Yıldırım Beyazıt Üniversitesi  
📧 dilaver.karasahin@aybu.edu.tr

## 📚 Akademik Katkılar

### Yayınlar ve Sunumlar

- **Akademik Rapor:** "ReFlow Sistemi: Havacılık Endüstrisinde Penetrant Sıvı Geri Kazanımı" (18 sayfa)
- **Ekonomik Analiz:** Makroekonomik etki değerlendirmesi ve sektörel analiz
- **Teknoloji Transferi:** Endüstri 4.0 entegrasyonu ve ölçeklendirme stratejileri

### Araştırma Katkıları

1. Penetrant sıvı geri kazanım teknolojilerinin ekonomik analiz metodolojisi
2. Sektörel düzeyde makroekonomik etki ölçüm modeli
3. Havacılık endüstrisinde çevre teknolojileri adopsiyon analizi
4. Teknoloji transfer ve ölçeklendirme stratejileri çerçevesi

## 🌱 Çevresel Etki

### Sürdürülebilirlik Hedefleri

| Metrik | Yıllık Tasarruf (Tesis Başına) | Sektörel Toplam |
|--------|-------------------------------|------------------|
| **Kimyasal Atık** | 1.2 ton | 56.4 ton |
| **CO₂ Emisyonu** | 3.8 ton | 178.6 ton |
| **Su Tüketimi** | 18.500 L | 869.500 L |
| **Enerji** | 4.200 kWh | 197.400 kWh |

### UN SDG Uyumu

- **SDG 9:** Endüstri, İnovasyon ve Altyapı
- **SDG 12:** Sorumlu Üretim ve Tüketim
- **SDG 13:** İklim Eylemi
- **SDG 17:** Amaçlar için Ortaklıklar

## 📋 Risk Analizi

### Finansal Riskler

| Senaryo | Olasılık | NPV | Geri Ödeme |
|---------|----------|-----|------------|
| Optimistik | %25 | 245.000 TL | 2.1 yıl |
| Baz Durum | %50 | 169.300 TL | 2.8 yıl |
| Kötümser | %25 | 98.500 TL | 3.9 yıl |

### Risk Azaltım Stratejileri

- Modüler sistem tasarımı ile esneklik
- Çoklu gelir modeli yaklaşımı
- Kamu desteklerinden faydalanma
- Teknoloji ortaklıkları kurma

## 🎯 Politika Önerileri

### Kamu Politikası Destekleri

1. **Vergi Teşvikleri:** %15 vergi indirimi
2. **Hızlandırılmış Amortisman:** 3 → 2 yıl
3. **Düşük Faizli Krediler:** KOSGEB/TÜBİTAK destekleri
4. **Çevre Standartları:** Zorunlu geri dönüşüm kotaları

### Sektörel İş Birliği

- Havacılık kümeleri düzeyinde ortak yatırım
- Üniversite-sanayi AR-GE ortaklıkları
- Teknoparklar bünyesinde incubation programları
- Uluslararası teknoloji transfer anlaşmaları

## 🔮 Gelecek Planları

### Teknoloji Roadmap

**Kısa Vadeli (6-12 ay):**
- Pilot tesislerde yaygınlaştırma
- Sistem optimizasyonu ve iyileştirmeler
- Regulatory onayların alınması

**Orta Vadeli (1-3 yıl):**
- Yapay zeka entegrasyonu geliştirilmesi
- Blockchain kalite izlenebilirlik platformu
- Diğer sektörlere adaptasyon

**Uzun Vadeli (3-5 yıl):**
- Uluslararası pazar genişlemesi
- Nano-teknoloji destekli filtrasyon
- Endüstri 4.0 tam entegrasyonu

## 📞 İletişim

### Proje İletişim Bilgileri

**📧 E-posta:** aysenur.yolcu@aybu.edu.tr  
**🏛️ Kurum:** Ankara Yıldırım Beyazıt Üniversitesi  
**📍 Adres:** Çankaya/Ankara, Türkiye  
**🔗 LinkedIn:** [Proje Profili](https://linkedin.com/in/reflow-project)

### Destek ve Katkı

Bu proje açık kaynak geliştirme modelini benimser. Katkılarınızı memnuniyetle karşılarız:

1. **Fork** edin
2. **Feature branch** oluşturun (`git checkout -b feature/AmazingFeature`)
3. **Commit** edin (`git commit -m 'Add some AmazingFeature'`)
4. **Push** edin (`git push origin feature/AmazingFeature`)
5. **Pull Request** açın

## 📜 Lisans

Bu proje akademik amaçlı geliştirilmiştir. Detaylar için [LICENSE](LICENSE) dosyasını inceleyiniz.

## 🙏 Teşekkürler

- **TÜBİTAK 2209-A** desteği için
- **AYBU Makine Mühendisliği Bölümü** laboratuvar imkanları için
- Alan araştırmasına katılan **havacılık şirketleri** için
- Proje geliştirme sürecinde destek veren tüm **akademisyen ve uzmanlar** için

---

<div align="center">

**ReFlow Projesi - 2024**  
*Çevresel Sürdürülebilirlik için Teknolojik İnovasyon*

[![TÜBİTAK](https://img.shields.io/badge/TÜBİTAK-2209--A-blue.svg)](https://tubitak.gov.tr)
[![AYBU](https://img.shields.io/badge/AYBU-Makine%20Mühendisliği-red.svg)](https://aybu.edu.tr)

</div> 