# BigQuery Release Pulse

**BigQuery Release Pulse** คือเว็บแอปพลิเคชันระบบสารสนเทศส่วนบุคคล (SPA) สำหรับติดตามบันทึกการอัปเดตและรายการปรับปรุงคุณสมบัติ (Release Notes) ของ Google Cloud BigQuery แบบเรียลไทม์ พร้อมด้วยเครื่องมือเขียนและร่างโพสต์แชร์ข่าวสารไปยังแพลตฟอร์ม X (Twitter) ได้ในคลิกเดียว

---

## 🚀 ฟังก์ชันหลัก (Features)

* **Real-time Parsing:** ดึงข้อมูลและแปลงโครงสร้างข้อมูลโดยตรงจาก Atom XML Feed ของ Google Cloud
* **Divided Updates:** แบ่งส่วนข้อมูลอัปเดตย่อย ๆ ในแต่ละวันออกเป็นหมวดหมู่ตามความสำคัญ เช่น `Feature` (ฟีเจอร์ใหม่), `Announcement` (ประกาศ), `Issue` (รายงานปัญหา) และ `Deprecation` (สิ่งที่จะยกเลิกใช้งาน)
* **Keyword Filter & Search:** ระบบค้นหาและตัวกรองหน้าบ้านแบบตอบสนองทันที (Reactive Search & Filters)
* **Tweet Composer Station:**
  - ไฮไลท์การ์ดอัปเดตที่สนใจเพื่อสร้างร่างเนื้อหาทวีตแบบกึ่งอัตโนมัติ
  - วงกลมประเมินขีดจำกัดตัวอักษร 280 ตัว (Character Counter Ring Indicator) ที่คำนวณโควต้าอักขระของ X อ้างอิงลิงก์จริง
  - ปุ่มส่งออกข้อมูลไปที่หน้า X Web Intent สำหรับโพสต์แชร์ได้ทันที
* **Asynchronous Update:** อัปเดตข้อมูลแบบ Asynchronous (AJAX) ผ่านปุ่ม Refresh พร้อมสปินเนอร์สวยงามโดยไม่ต้องโหลดหน้าเว็บใหม่

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

* **Backend:** Python Flask
* **HTML Parser:** BeautifulSoup4 (bs4), xml.etree.ElementTree
* **Frontend:** Vanilla HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3 (Glassmorphism & Neon Design)
* **Icons & Fonts:** FontAwesome 6, Google Fonts (Outfit, Plus Jakarta Sans)

---

## 📂 โครงสร้างโฟลเดอร์ (Project Directory Structure)

```text
bq-releases-notes/
├── app.py                  # เซิร์ฟเวอร์และตัวรันแอปพลิเคชัน Flask
├── templates/
│   └── index.html          # ไฟล์สเกเลตันโครงสร้างหลัก UI
├── static/
│   ├── css/
│   │   └── style.css       # รูปแบบการตกแต่ง ธีมมืด (Dark Mode & UI)
│   └── js/
│   │   └── app.js          # สคริปต์ควบคุมการทำงานและโต้ตอบหน้าบ้านทั้งหมด
├── .gitignore              # ไฟล์กำหนดข้อยกเว้นไฟล์ที่ไม่ต้องการให้เข้าสู่ Git
└── README.md               # เอกสารประกอบการพัฒนาโปรเจ็กต์นี้
```

---

## 💻 การติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)
* ติดตั้ง Python 3.10 ขึ้นไป

### 2. การดาวน์โหลดและตั้งค่าโปรเจ็กต์ (Setup)
ติดตั้งแพ็กเกจที่จำเป็นสำหรับ Python:
```bash
python -m pip install flask requests beautifulsoup4
```

### 3. การรันแอปพลิเคชัน (Running the App)
เริ่มการรันเซิร์ฟเวอร์จำลอง:
```bash
python app.py
```

เมื่อระบบพร้อมทำงาน ให้เปิดบราวเซอร์และเข้าสู่ที่อยู่นี้:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🔗 ลิงก์ที่เกี่ยวข้อง (Links)
* **GitHub Repository:** [https://github.com/Alogous/antigravity-event-talks-app](https://github.com/Alogous/antigravity-event-talks-app)
* **Official Google XML Source:** [https://docs.cloud.google.com/feeds/bigquery-release-notes.xml](https://docs.cloud.google.com/feeds/bigquery-release-notes.xml)
