# Minimalist Layout Content Specifications

Analisis kapasitas konten (Content Capacity) untuk memastikan layout tetap estetis dan tidak overlap per Ratio.

---

## 1. Minimalist Flat (`minimalist-flat.json`)

**Type:** Narrative / Reading Focused
**Font Size:** 20px (Uniform)

| Ratio              | Max Characters | Max Words | Adjustment Factor | Analysis                                                                     |
| :----------------- | :------------- | :-------- | :---------------- | :--------------------------------------------------------------------------- |
| **4:5 (Portrait)** | **1000**       | **150**   | 1.0x (Base)       | Standard reading flow.                                                       |
| **9:16 (Story)**   | **1500**       | **220**   | ~1.5x             | Font size reduced to 16px. High vertical capacity.                           |
| **3:4 (Portrait)** | **1100**       | **165**   | ~1.1x             | Slightly taller than 4:5 (+10% height). Good for slightly longer paragraphs. |

## 2. Minimalist Accent (`minimalist-accent.json`)

**Type:** Pointers / List
**Font Size:** 22px (Uniform)

| Ratio              | Max Characters | Max Words | Adjustment Factor | Analysis                               |
| :----------------- | :------------- | :-------- | :---------------- | :------------------------------------- |
| **4:5 (Portrait)** | **700**        | **110**   | 1.0x (Base)       | Max 4-5 list items.                    |
| **9:16 (Story)**   | **900**        | **140**   | ~1.3x             | Can accommodate 6-7 list items easily. |
| **3:4 (Portrait)** | **770**        | **120**   | ~1.1x             | Comfortable for 5 solid list items.    |

## 3. Minimalist Dynamic (`minimalist-dynamic.json`)

**Type:** Impact / Headline
**Font Size:** Mixed (14px - 48px)

| Ratio              | Max Characters | Max Words | Adjustment Factor | Analysis                                                  |
| :----------------- | :------------- | :-------- | :---------------- | :-------------------------------------------------------- |
| **4:5 (Portrait)** | **400**        | **60**    | 1.0x (Base)       | Balanced whitespace.                                      |
| **9:16 (Story)**   | **500**        | **80**    | ~1.25x            | Hero text can be stacked vertically without issue.        |
| **3:4 (Portrait)** | **440**        | **65**    | ~1.1x             | Offers slightly more breathing room for headers than 4:5. |

---

## General Rules per Ratio

### 9:16 (Story Mode)

- **Vertical Freedom:** Area vertikal sangat lega. Cocok untuk menumpuk elemen (Stacking).
- **Narrow Width:** Lebar terbatas, kalimat panjang akan lebih cepat wrapping ke baris baru.
- **Recommendation:** Pecah paragraf panjang menjadi lebih banyak blok kecil vertikal.

### 3:4 (Portrait Mode)

- **Similar to 4:5:** Karakteristik sangat mirip dengan 4:5, tapi sedikit lebih tinggi.
- **Safe Zone:** Aman digunakan untuk konten yang sedikit lebih panjang dari limit 4:5.
- **Recommendation:** Gunakan strukturnya sama dengan 4:5, jangan dipaksakan seperti 9:16.
