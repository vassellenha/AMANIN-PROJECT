"use strict";

window.AmaninI18n = (() => {
  const LANG_KEY = "amanin_lang";

  const dict = {
    id: {
      "nav.beranda": "Beranda",
      "nav.berita": "Berita",
      "nav.cekrisiko": "Cek Risiko",
      "nav.riwayat": "Riwayat",
      "nav.profil": "Profil",
      "nav.masuk": "Masuk",
      "nav.kembali": "Kembali ke Landing Page",

      "splash.status": "Menyiapkan ruang aman digitalmu…",

      "landing.title": "AMANIN — Lindungi Diri dari Penipuan Digital",
      "landing.hero.eyebrow": "CEK DULU. BARU PERCAYA.",
      "landing.hero.title.html": "Jangan asal klik.<br><span>Pastikan dulu.</span>",
      "landing.hero.desc": "Lindungi diri dari penipuan digital. Periksa chat, tautan, screenshot, dan QR sebelum kamu percaya atau membayar.",
      "landing.hero.cta": "Scan Cepat Tanpa Login",
      "landing.hero.assurance1": "Gratis digunakan",
      "landing.hero.assurance2": "Tanpa perlu login",
      "landing.hero.card.kicker": "Contoh pemeriksaan",
      "landing.hero.card.sub": "Pesan yang kamu terima",
      "landing.hero.card.msg": "“Paket tertahan. Konfirmasi alamatmu lewat tautan ini.”",
      "landing.hero.card.warn.title": "Tautan mencurigakan",
      "landing.hero.card.warn.sub": "Periksa sebelum dibuka",

      "landing.steps.eyebrow": "NGGAK PERLU AKUN",
      "landing.steps.title.html": "Mulai lebih aman<br> dalam 3 langkah.",
      "landing.steps.desc": "Periksa hal yang terasa mencurigakan sebelum kamu klik, balas, atau bayar.",
      "landing.steps.demo": "MULAI SCAN GRATIS",
      "landing.step1.number": "LANGKAH 01",
      "landing.step1.title": "Mulai tanpa daftar",
      "landing.step1.desc": "Buka pemeriksaan gratis langsung dari browser. Nggak perlu bikin akun atau memasukkan data pribadi.",
      "landing.step2.number": "LANGKAH 02",
      "landing.step2.title": "Pilih yang bikin ragu",
      "landing.step2.desc": "Tempel isi chat atau periksa tautan dan screenshot yang terasa janggal.",
      "landing.step2.card.title": "Contoh pesan masuk",
      "landing.step2.card.sender": "Pesan tidak dikenal",
      "landing.step2.card.msg": "“Akun kamu akan diblokir. Verifikasi sekarang lewat tautan ini.”",
      "landing.step3.number": "LANGKAH 03",
      "landing.step3.title": "Pahami risikonya",
      "landing.step3.desc": "Lihat indikasi dan saran langkah aman sebelum kamu mengambil keputusan.",
      "landing.step3.card.label": "HASIL PEMERIKSAAN",
      "landing.step3.card.title": "Waspada tautan",
      "landing.step3.card.desc": "Jangan masukkan kata sandi atau kode OTP di halaman ini.",
      "landing.step3.card.status": "Risiko terdeteksi",

      "landing.features.eyebrow": "SATU TEMPAT, LEBIH WASPADA",
      "landing.features.title": "Kenali risikonya sebelum terlambat.",
      "landing.features.desc": "Empat cara praktis untuk memeriksa hal yang sering kamu temui setiap hari.",
      "landing.feature1.title": "Scan Chat",
      "landing.feature1.desc": "Periksa pesan WhatsApp, SMS, dan Telegram yang terasa mencurigakan.",
      "landing.feature2.title": "Screenshot Scanner",
      "landing.feature2.desc": "Cek bukti transfer, struk, atau DM sebelum menindaklanjuti.",
      "landing.feature3.title": "Tautan / Link",
      "landing.feature3.desc": "Periksa alamat web, phishing, dan tautan pendek yang menyamarkan tujuan.",
      "landing.feature4.title": "QR Code Guard",
      "landing.feature4.desc": "Kenali tujuan QR atau QRIS sebelum membuka tautan atau membayar.",

      "landing.radar.label": "RADAR TERKINI",
      "landing.radar.sublabel": "PERINGATAN KEAMANAN",
      "landing.radar.title": "Waspada hari ini",
      "landing.radar.desc": "Marak phishing QRIS tempelan di SPBU & masjid. Periksa nama penerima dan tujuan QR sebelum membayar.",

      "landing.closing.title": "Ragu? Periksa dulu.",
      "landing.closing.desc": "Mulai pemeriksaan langsung dari perangkatmu.",
      "landing.closing.cta": "Mulai Scan",

      "landing.chat1": "“Paket Anda tertahan di bea cukai. Bayar Rp150.000 lewat tautan ini.”",
      "landing.chat2": "🔍 Dicek pakai AMANIN...",
      "landing.chat3": "⚠️ Terdeteksi pola phishing — jangan diklik",
      "landing.chat4": "✅ Hubungi kurir resmi untuk pastikan status paket",

      "landing.testimonial.label": "❤️ Dipercaya ribuan pengguna di Indonesia",
      "landing.testimonial.role": "Pengguna AMANIN",
      "landing.testimonial.q1": "“Hampir klik link resi paket palsu, untung sempat dicek dulu pakai AMANIN.”",
      "landing.testimonial.q2": "“QRIS tempelan di parkiran ternyata nomor rekening beda nama. AMANIN langsung kasih peringatan.”",
      "landing.testimonial.q3": "“Dapat chat katanya menang undian, saya tempel ke AMANIN, langsung ketahuan pola phishing-nya.”",
      "landing.testimonial.q4": "“Simpel banget, tinggal screenshot chat mencurigakan terus langsung dicek. Nggak perlu daftar akun.”",
      "landing.testimonial.q5": "“Ada yang kirim file APK ngaku dari kurir. AMANIN kasih tau itu modus yang sering dipakai penipu.”",
      "landing.testimonial.q6": "“Setiap mau transfer ke rekening baru, saya cek dulu polanya di AMANIN. Jadi lebih tenang.”",

      "landing.footer.tagline": "Lebih waspada, lebih aman beraktivitas digital.",
      "landing.footer.privasi": "Kebijakan Privasi",
      "landing.footer.syarat": "Syarat &amp; Ketentuan",
      "landing.footer.kontak": "Hubungi Kami",
      "landing.footer.privasi.body": "Gambar dan teks yang kamu pilih untuk diperiksa diproses di browser. Jangan unggah atau bagikan informasi rahasia seperti PIN dan kode OTP.",
      "landing.footer.syarat.body": "Hasil pemeriksaan merupakan indikasi awal, bukan jaminan keamanan atau pengganti verifikasi melalui kanal resmi.",
      "landing.footer.copyright": "© 2026 AMANIN. Hak Cipta Dilindungi.",

      "login.title": "Selamat datang.",
      "login.kicker": "RUANG AMAN DIGITALMU",
      "login.desc": "Masuk atau lanjutkan sebagai tamu untuk mulai memeriksa.",
      "login.username": "Username",
      "login.username.ph": "Username kamu",
      "login.email": "Email",
      "login.email.ph": "nama@email.com",
      "login.submit": "Masuk ke AMANIN",
      "login.or": "atau",
      "login.guest": "Lanjutkan sebagai tamu",
      "login.back": "Kembali ke landing page",
      "login.visual.title": "Cek dulu, baru percaya.",
      "login.visual.desc": "Satu ruang aman untuk memeriksa chat, tautan, QR, dan pembayaran sebelum kamu bertindak.",
      "login.visual.point1": "Diproses langsung di perangkatmu",
      "login.visual.point2": "Gratis, tanpa iklan",
      "login.visual.point3": "Dipercaya ribuan pengguna",

      "dashboard.title": "AMANIN — Beranda",
      "dashboard.brand.sub": "Beranda",
      "dashboard.welcome.sub": "Lindungi transaksi & interaksi digitalmu hari ini.",
      "dashboard.safety.status": "Status: AMAN",
      "dashboard.safety.pill": "Perisai Aktif",
      "dashboard.safety.updated": "Terakhir diperbarui: Baru saja",
      "dashboard.alert.kicker": "WAWASAN SIBER",
      "dashboard.alert.tag": "Scam · Fraud · Privasi",
      "dashboard.alert.text": "Kenali tanda penipuan sebelum klik tautan atau scan QR",
      "dashboard.hero.ailabel": "AI Multi-Vector Defense v2.4",
      "dashboard.hero.title": "Apa yang ingin kamu cek?",
      "dashboard.hero.desc": "Cek sebelum percaya, klik, atau bayar. AI AMANIN siap menganalisis risiko penipuan dalam 3 detik.",
      "dashboard.hero.cta": "Scan Cepat Sekarang",
      "dashboard.category.title": "Kategori Deteksi",
      "dashboard.category.sub": "6 Sensor Siaga",
      "dashboard.cat1.title": "Scan Chat",
      "dashboard.cat1.sub": "WhatsApp, SMS, Telegram",
      "dashboard.cat2.title": "Screenshot",
      "dashboard.cat2.sub": "Bukti transfer, struk, DM",
      "dashboard.cat3.title": "Tautan / Link",
      "dashboard.cat3.sub": "Web phishing, bit.ly palsu",
      "dashboard.cat4.title": "QR Code",
      "dashboard.cat4.sub": "Cek stiker QRIS palsu",
      "dashboard.cat5.title": "No. / Rekening",
      "dashboard.cat5.sub": "Cek pola sebelum transfer",
      "dashboard.cat6.title": "Pembayaran",
      "dashboard.cat6.sub": "Virtual Account, e-Wallet",
      "dashboard.recent.title": "Pemeriksaan Terakhir",
      "dashboard.recent.all": "Lihat Semua",
      "dashboard.news.title": "Berita & Wawasan Siber",
      "dashboard.news.all": "Lihat semua",
      "dashboard.news.featured.cat": "SCAM & PHISHING",
      "dashboard.news.featured.title": "Kenali pesan phishing sebelum klik tautan",
      "dashboard.news.featured.desc": "Periksa tanda bahaya dan cara melindungi akunmu.",
      "dashboard.news.chip1": "Fraud pembayaran",
      "dashboard.news.chip2": "Privasi & keamanan akun",

      "profile.kicker": "AKUN AMANIN",
      "profile.title": "Manajemen Profil",
      "profile.close": "Tutup profil",
      "profile.desc.user": "Ganti username dan foto profilmu.",
      "profile.desc.guest": "Atur username dan foto profil untuk personalisasi AMANIN.",
      "profile.avatar.title": "Foto profil",
      "profile.avatar.desc": "Ganti foto atau pilih gambar baru.",
      "profile.avatar.upload": "Pilih foto",
      "profile.avatar.reset": "Hapus foto",
      "profile.username": "Username",
      "profile.username.ph": "Username kamu",
      "profile.username.hint": "2–32 karakter: huruf, angka, titik, garis bawah, atau tanda hubung.",
      "profile.email": "Email",
      "profile.email.ph": "Opsional",
      "profile.submit": "Simpan Profil",
      "profile.signin": "Masuk dengan profil",
      "profile.logout": "Keluar ke Landing Page",

      "scan.title": "Cek Risiko — AMANIN",
      "scan.brand.sub": "Cek Risiko",
      "scan.back": "Beranda",
      "scan.intro.kicker": "PERLINDUNGAN AMANIN",
      "scan.intro.title": "Cek sebelum kamu percaya.",
      "scan.intro.desc": "Pindai QR atau periksa screenshot chat untuk mencari tanda-tanda penipuan.",
      "scan.tab.qr": "QR Code",
      "scan.tab.chat": "Chat & Gambar",
      "scan.qr.title": "Pindai QR Code",
      "scan.qr.desc": "Pastikan tujuan QR aman sebelum membuka atau membayar.",
      "scan.qr.upload.title": "Upload gambar QR",
      "scan.qr.upload.desc": "JPG, PNG atau WebP · gambar diproses di perangkatmu",
      "scan.qr.upload.btn": "Pilih Gambar",
      "scan.qr.remove": "Ganti gambar",
      "scan.qr.analyze": "Pindai QR",
      "scan.qr.camera": "Buka Kamera",
      "scan.qr.cameraupload": "Ambil foto QR / pilih dari galeri",
      "scan.qr.status.idle": "Arahkan kamera ke QR atau unggah gambarnya.",

      "scan.ctx.chat.badge": "Scan Chat",
      "scan.ctx.chat.heading": "Input teks percakapan",
      "scan.ctx.chat.subtitle": "Tempel pesan yang mencurigakan untuk memeriksa pola scam.",
      "scan.ctx.chat.placeholder": "Tempel pesan di sini... Contoh: “Akun Anda akan diblokir. Verifikasi sekarang di https://bit.ly/...”",
      "scan.ctx.chat.action": "Analisis Percakapan",
      "scan.ctx.chat.idle": "Isi atau tempel pesan untuk memulai analisis.",
      "scan.ctx.chat.sourcetitle": "Cuplikan percakapan",
      "scan.ctx.screenshot.badge": "Screenshot",
      "scan.ctx.link.badge": "Tautan / Link",
      "scan.ctx.link.heading": "Periksa tautan yang kamu terima",
      "scan.ctx.link.subtitle": "Tempel link lengkap untuk memeriksa domain, pemendek tautan, dan pola phishing.",
      "scan.ctx.link.placeholder": "Tempel tautan lengkap di sini... Contoh: https://promo-hadiah-resmi.com/klaim",
      "scan.ctx.link.action": "Periksa Tautan",
      "scan.ctx.link.idle": "Tempel tautan untuk memulai analisis.",
      "scan.ctx.link.sourcetitle": "Tautan yang diperiksa",
      "scan.ctx.rekening.badge": "No. / Rekening",
      "scan.ctx.rekening.heading": "Periksa nomor HP atau rekening",
      "scan.ctx.rekening.subtitle": "Masukkan nomornya, tambahkan konteks pesan di bawah kalau ada.",
      "scan.ctx.rekening.placeholder": "Opsional: tempel pesan atau percakapan terkait nomor ini...",
      "scan.ctx.rekening.action": "Periksa Nomor",
      "scan.ctx.rekening.idle": "Isi nomor HP atau rekening untuk memulai analisis.",
      "scan.ctx.rekening.sourcetitle": "Nomor yang diperiksa",
      "scan.ctx.pembayaran.badge": "Pembayaran",
      "scan.ctx.pembayaran.heading": "Periksa detail pembayaran",
      "scan.ctx.pembayaran.subtitle": "Isi nominal dan penerima, tambahkan detail VA/QRIS di bawah kalau ada.",
      "scan.ctx.pembayaran.placeholder": "Opsional: tempel detail Virtual Account/QRIS atau pesan terkait...",
      "scan.ctx.pembayaran.action": "Periksa Pembayaran",
      "scan.ctx.pembayaran.idle": "Isi nominal dan penerima untuk memulai analisis.",
      "scan.ctx.pembayaran.sourcetitle": "Pembayaran yang diperiksa",

      "scan.quick.rekening.label": "Nomor HP atau Rekening",
      "scan.quick.rekening.ph": "Contoh: 081234567890",
      "scan.quick.pay.amount.label": "Nominal (Rp)",
      "scan.quick.pay.amount.ph": "Contoh: 150000",
      "scan.quick.pay.name.label": "Nama Penerima / Merchant",
      "scan.quick.pay.name.ph": "Contoh: Toko Aman",

      "scan.charcount": "karakter",
      "scan.processed": "Diproses di perangkat",
      "scan.tool.paste": "Tempel Clipboard",
      "scan.tool.example": "Contoh Scam",
      "scan.ss.or": "atau periksa dari screenshot",
      "scan.ss.title": "Periksa screenshot chat",
      "scan.ss.desc": "OCR membaca teks, lalu memeriksa tautan dan pola pesan mencurigakan.",
      "scan.ss.upload.title": "Upload screenshot chat",
      "scan.ss.upload.desc": "WhatsApp, SMS, DM, bukti transfer · JPG, PNG atau WebP",
      "scan.ss.upload.btn": "Pilih Screenshot",
      "scan.ss.camera": "Ambil foto screenshot",
      "scan.ss.analyze": "Periksa Screenshot",
      "scan.ss.idle": "Pilih screenshot untuk mulai memeriksa. Foto tidak diunggah ke server.",

      "scan.privacy": "Privasi kamu terjaga.",
      "scan.privacy.desc": "Gambar dan teks diproses langsung di browser dan tidak dikirim ke server AMANIN.",
      "scan.disclaimer": "Hasil pemeriksaan adalah indikasi awal, bukan jaminan keamanan. Jangan masukkan PIN, OTP, atau kata sandi.",

      "scan.loading.kicker": "PEMERIKSAAN AMANIN",
      "scan.loading.title": "Memeriksa dengan teliti",
      "scan.loading.desc": "Menganalisis pola risiko secara lokal di perangkatmu.",
      "scan.loading.privacy": "Data kamu tetap di perangkat",
      "scan.result.title": "Hasil Analisis",
      "scan.result.done": "Analisis selesai",
      "scan.result.content": "Konten diperiksa",
      "scan.result.why": "Kenapa hasilnya begini?",
      "scan.result.indicators": "Indikator pemeriksaan",
      "scan.result.safety": "Langkah aman",
      "scan.result.disclaimer": "Analisis ini adalah indikasi awal berdasarkan pola yang dikenali. Verifikasi pengirim, situs, dan penerima melalui kanal resmi.",
      "scan.result.backbtn": "Kembali ke pemeriksaan",
      "scan.result.scorestatus": "STATUS",
      "scan.result.scorelabel": "SKOR RISIKO",

      "berita.title": "Berita Siber — AMANIN",
      "berita.brand.sub": "Berita Siber",
      "berita.intro.kicker": "CYBER INTELLIGENCE",
      "berita.intro.title": "Radar Scam & Siber",
      "berita.intro.desc": "Kenali modus penipuan digital, pahami risikonya, dan ambil langkah aman sebelum bertindak.",
      "berita.briefing.title": "Wawasan keamanan digital",
      "berita.briefing.desc": "Modus umum dan panduan untuk melindungi diri",
      "berita.tag1": "Phishing",
      "berita.tag2": "Fraud",
      "berita.tag3": "Privasi",
      "berita.feed.kicker": "TETAP TERINFORMASI",
      "berita.feed.title": "Modus & Panduan",
      "berita.feed.note": "Pilihan AMANIN",
      "berita.filter.all": "Semua",
      "berita.filter.scam": "Scam",
      "berita.filter.fraud": "Fraud",
      "berita.filter.security": "Keamanan",
      "berita.empty": "Belum ada artikel pada kategori ini.",
      "berita.sourcenote": "Konten ini merupakan panduan edukasi umum, bukan laporan statistik real-time. Ikuti kanal resmi untuk informasi dan pelaporan terbaru.",

      "berita.a1.visual": "CEK SEBELUM KLIK",
      "berita.a1.cat": "SCAM & PHISHING",
      "berita.a1.source": "Panduan AMANIN",
      "berita.a1.title": "Pesan mendesak dan tautan asing: kenali ciri phishing",
      "berita.a1.desc": "Penipu dapat menyamar sebagai bank, kurir, atau layanan digital. Waspadai pesan yang menekanmu untuk segera login, membuka tautan, atau memberikan OTP dan PIN.",
      "berita.a1.take.title": "Yang bisa kamu lakukan",
      "berita.a1.take.desc": "Buka aplikasi atau situs resmi secara mandiri. Jangan gunakan tautan dari pesan yang belum terverifikasi.",
      "berita.a1.action": "Periksa isi pesan",

      "berita.a2.cat": "FRAUD PEMBAYARAN",
      "berita.a2.source": "Panduan AMANIN",
      "berita.a2.title": "Bayar lewat QR? Pastikan nama penerima sebelum konfirmasi",
      "berita.a2.desc": "Setelah memindai QR, cocokkan nama merchant dan nominal yang muncul di aplikasi pembayaran. Batalkan transaksi jika informasinya berbeda atau terasa janggal.",
      "berita.a2.action": "Periksa QR dengan AMANIN",

      "berita.a3.cat": "FILE & MALWARE",
      "berita.a3.source": "Panduan AMANIN",
      "berita.a3.title": "Jangan asal memasang file APK dari chat",
      "berita.a3.desc": "File aplikasi yang dikirim melalui pesan dapat menyamar sebagai undangan, resi, atau dokumen. Hindari memasang file dari sumber yang tidak dikenal dan jangan berikan akses sensitif.",
      "berita.a3.take.title": "Perlu diingat",
      "berita.a3.take.desc": "Jangan mengaktifkan izin aksesibilitas atau membagikan kode OTP atas instruksi dari pengirim file.",

      "berita.a4.cat": "KEAMANAN AKUN",
      "berita.a4.source": "Panduan AMANIN",
      "berita.a4.title": "Jaga akun dengan kata sandi unik dan verifikasi dua langkah",
      "berita.a4.desc": "Gunakan kata sandi berbeda untuk tiap layanan, aktifkan verifikasi tambahan, dan jangan pernah membagikan kode pemulihan kepada orang lain.",
      "berita.a4.action": "Kunjungi BSSN",

      "berita.a5.cat": "PELAPORAN",
      "berita.a5.source": "Kanal resmi",
      "berita.a5.title": "Jika terkena penipuan transaksi, segera hubungi kanal resmi",
      "berita.a5.desc": "Simpan bukti percakapan dan transaksi. Untuk penipuan transaksi keuangan, Indonesia Anti-Scam Centre (IASC) menyediakan kanal pengaduan bagi masyarakat.",
      "berita.a5.action": "Buka IASC OJK",

      "riwayat.title": "Riwayat — AMANIN",
      "riwayat.brand.sub": "Riwayat",
      "riwayat.heading": "Riwayat Pemeriksaan",
      "riwayat.clear": "Hapus Semua",
      "riwayat.empty": "Belum ada pemeriksaan. Mulai scan untuk melihat riwayatnya di sini.",
      "riwayat.confirmclear": "Hapus semua riwayat pemeriksaan? Tindakan ini tidak dapat dibatalkan.",
      "riwayat.cleared": "Riwayat berhasil dihapus",

      "history.type.qr": "QR Code",
      "history.type.chat": "Chat",
      "history.type.screenshot": "Screenshot",
      "history.type.link": "Tautan / Link",
      "history.type.rekening": "No. / Rekening",
      "history.type.pembayaran": "Pembayaran",
      "history.level.bahaya": "Bahaya",
      "history.level.waspada": "Waspada",
      "history.level.aman": "Aman",

      "toast.darkon": "Mode gelap diaktifkan",
      "toast.darkoff": "Mode terang diaktifkan",
      "toast.avatarready": "Foto profil siap digunakan",
      "toast.avatarremove": "Foto profil akan dihapus setelah disimpan",
      "toast.profileupdated": "Profil berhasil diperbarui",

      "common.guest": "Tamu",
      "common.greeting": "Halo",
      "common.justnow": "Baru saja",
      "common.minago": "{n} menit lalu",
      "common.hourago": "{n} jam lalu",
      "common.dayago": "{n} hari lalu",
      "profile.alt.default": "Foto profil",
      "profile.alt.named": "Foto profil {name}",
      "profile.alt.preview": "Pratinjau foto profil",

      "auth.err.storageread": "Browser tidak mengizinkan akses penyimpanan lokal. Periksa pengaturan privasi browser.",
      "auth.err.storagewrite": "Data tidak dapat disimpan di browser ini. Periksa pengaturan penyimpanan browser.",
      "auth.err.avatartype": "Pilih file gambar untuk foto profil.",
      "auth.err.avatarsize": "Ukuran foto maksimal 8 MB.",
      "auth.err.avatarcanvas": "Foto tidak bisa diproses di browser ini.",
      "auth.err.avatarencode": "Foto gagal diproses.",
      "auth.err.avatardecode": "Foto tidak dapat dibuka. Pilih gambar lain.",
      "auth.err.loginrequired": "Isi username dan email dengan benar untuk melanjutkan.",
      "auth.err.usernameempty": "Username tidak boleh kosong.",
      "auth.err.usernameformat": "Username harus 2–32 karakter: huruf, angka, titik, garis bawah, atau tanda hubung.",
      "auth.err.emailformat": "Format email belum benar.",
      "auth.err.sessionclear": "Tidak dapat menghapus sesi. Periksa pengaturan penyimpanan browser.",

      "scan.rule.otp": "Pesan meminta data rahasia seperti OTP, PIN, atau kata sandi.",
      "scan.rule.apk": "Pesan menyebut file APK atau pemasangan aplikasi dari luar toko resmi.",
      "scan.rule.accountblock": "Ada tekanan untuk memulihkan atau memverifikasi akun.",
      "scan.rule.prize": "Ada iming-iming hadiah, voucher, atau penawaran gratis.",
      "scan.rule.urgency": "Pesan menggunakan tekanan waktu atau bahasa mendesak.",
      "scan.rule.payment": "Pesan mengarahkan pembayaran atau transfer.",

      "scan.url.invalid": "Format tautan tidak dikenali; jangan buka sebelum memverifikasi alamatnya.",
      "scan.url.nohttps": "Tautan tidak menggunakan HTTPS.",
      "scan.url.ipaddress": "Alamat tujuan berupa alamat IP, bukan nama situs biasa.",
      "scan.url.shortener": "Tautan menggunakan layanan pemendek sehingga tujuan akhirnya tersembunyi.",
      "scan.url.idn": "Nama domain memakai karakter internasional yang perlu diperiksa dengan saksama.",
      "scan.url.keyword": "Nama domain mengandung kata yang sering dipakai untuk menyamar sebagai halaman akun atau promosi.",
      "scan.url.subdomain": "Subdomain tujuan cukup panjang dan sebaiknya diverifikasi.",

      "scan.msg.nospecific": "Tidak ditemukan indikator spesifik dari pola yang diperiksa.",
      "scan.msg.nopattern": "Tidak ditemukan kata pemicu atau tautan mencurigakan yang dikenali.",
      "scan.msg.statusunscored": "Konten belum terbaca",
      "scan.msg.statusdanger": "Risiko tinggi · waspada",
      "scan.msg.statuscaution": "Perlu diperiksa",
      "scan.msg.statussafe": "Risiko rendah terdeteksi",
      "scan.msg.resultmsgunscored": "Konten belum bisa diberi skor. Coba periksa dengan gambar atau teks yang lebih jelas.",
      "scan.msg.resultmsgdanger": "Ditemukan beberapa sinyal kuat yang perlu kamu tangani dengan hati-hati.",
      "scan.msg.resultmsgcaution": "Ada pola yang sebaiknya diverifikasi sebelum kamu bertindak.",
      "scan.msg.resultmsgsafe": "Tidak ditemukan pola risiko umum dalam pemeriksaan ini.",
      "scan.msg.findingstitle": "{count} indikator pemeriksaan",
      "scan.msg.findingstagdanger": "Perlu diwaspadai",
      "scan.msg.findingstagcaution": "Cek kembali",
      "scan.msg.findingstagsafe": "Pola umum",
      "scan.msg.advicetitledanger": "Jangan lanjutkan dulu",
      "scan.msg.advicetitledefault": "Langkah aman",
      "scan.msg.advicedanger": "Jangan klik tautan, kirim uang, atau bagikan OTP/PIN. Hubungi pihak terkait lewat aplikasi atau nomor resmi.",
      "scan.msg.advicecaution": "Pastikan identitas pengirim dan tujuan secara terpisah melalui kanal resmi sebelum membayar atau membagikan data.",
      "scan.msg.advicesafe": "Tetap cek alamat situs dan identitas pengirim. Tidak ada pola yang terdeteksi bukan berarti pesan pasti aman.",
      "scan.msg.gaugelabel": "Skor indikasi risiko {score} dari 100",
      "scan.msg.foundlink": "Tautan ditemukan: {url}",

      "scan.msg.ready": "Siap dianalisis di perangkat.",
      "scan.msg.incomplete": "Lengkapi data di atas untuk memulai analisis.",
      "scan.msg.analyzing": "Menganalisis pola di perangkat…",
      "scan.msg.startanalysis": "Membaca data dan memeriksa tanda-tanda penipuan.",
      "scan.msg.donelocal": "Analisis selesai. Data tidak keluar dari perangkat.",
      "scan.msg.fillfirst": "Lengkapi data di atas terlebih dahulu.",

      "scan.msg.titledanger": "Ada tanda risiko tinggi",
      "scan.msg.titlecaution": "Perlu diperiksa lebih lanjut",
      "scan.msg.titlesafe": "Tidak ada pola umum yang terdeteksi",
      "scan.msg.subtitlepattern": "Pemeriksaan pola lokal · bukan verifikasi identitas pengirim",
      "scan.msg.bodydanger": "Ditemukan beberapa pola yang sering ditemukan pada penipuan. Jangan klik tautan atau bagikan kode dan data rahasia.",
      "scan.msg.bodycaution": "Ada pola yang perlu diwaspadai. Verifikasi pengirim dan tujuan melalui kanal resmi sebelum bertindak.",
      "scan.msg.bodysafe": "Tidak ditemukan pola umum yang mencurigakan. Hasil ini bukan jaminan bahwa data ini aman.",

      "scan.quick.composerekening": "Nomor HP/Rekening yang diperiksa: {number}.",
      "scan.quick.composepay": "Pembayaran ke {name} sebesar {amount}.",
      "scan.quick.payamountempty": "jumlah tidak diisi",
      "scan.quick.paynameempty": "penerima tidak diisi",
      "scan.quick.rekeningshort": "Nomor terlalu pendek untuk format HP/rekening yang umum di Indonesia.",
      "scan.quick.rekeningrepeated": "Nomor terdiri dari digit yang berulang terus-menerus; pola ini sering dipakai pada nomor palsu.",
      "scan.quick.paylarge": "Nominal pembayaran cukup besar; pastikan kamu benar-benar mengenali penerimanya sebelum membayar.",

      "scan.err.format": "Format tidak didukung. Pilih gambar JPG, PNG, WebP, GIF, atau BMP.",
      "scan.err.size": "Ukuran gambar maksimal 12 MB. Kompres gambar lalu coba lagi.",
      "scan.err.imageopenfail": "Gambar tidak dapat dibuka. Coba pilih file gambar lain.",
      "scan.err.imageloadfail": "Gambar gagal dimuat. Coba pilih file gambar lain.",

      "scan.qr.msgready": "Gambar siap dipindai.",
      "scan.qr.msgphotoready": "Foto siap dipindai.",
      "scan.qr.toastuploaded": "QR code berhasil diunggah",
      "scan.qr.toastphotoloaded": "Foto QR berhasil dimuat",
      "scan.qr.msgreading": "Membaca gambar dan mencari QR…",
      "scan.qr.notfoundtitle": "QR belum ditemukan",
      "scan.qr.notfoundsubtitle": "Gambar sudah diproses di perangkat",
      "scan.qr.notfoundbody": "Pastikan QR terlihat jelas, tidak terpotong, dan tidak buram. Jika gambar berisi screenshot chat, gunakan tab Chat & Gambar.",
      "scan.qr.notfoundstatus": "Tidak menemukan QR pada gambar.",
      "scan.qr.notfoundanalysis": "Gambar sudah diperiksa, tetapi pola QR belum terbaca. Pastikan kode terlihat utuh, fokus, dan mendapat pencahayaan yang cukup.",
      "scan.qr.notfoundfinding": "Coba unggah gambar yang lebih jelas atau ambil foto dari jarak lebih dekat.",
      "scan.qr.linktitledanger": "Tautan QR perlu diwaspadai",
      "scan.qr.linktitlecaution": "Periksa tujuan QR ini",
      "scan.qr.linktitlesafe": "QR berisi tautan",
      "scan.qr.linksubtitle": "Analisis format dan alamat — bukan verifikasi reputasi situs",
      "scan.qr.linkbodyfindings": "Ditemukan beberapa hal yang sebaiknya diperiksa sebelum membuka tautan.",
      "scan.qr.linkbodynofindings": "Tidak ditemukan pola umum yang mencurigakan pada alamat. Ini bukan jaminan bahwa situs aman.",
      "scan.qr.linkfallbackfinding": "Tetap pastikan nama situs dan penerima benar sebelum memasukkan data atau melakukan pembayaran.",
      "scan.qr.linkstatus": "QR berhasil dibaca. Jangan buka otomatis; cek alamat di bawah.",
      "scan.qr.linkanalysisfindings": "Ditemukan pola yang perlu diperiksa sebelum membuka tautan.",
      "scan.qr.sourcetitlelink": "Tautan yang dibaca dari QR",
      "scan.qr.contenttitle": "QR berhasil dibaca",
      "scan.qr.contentsubtitle": "Konten QR bukan tautan web",
      "scan.qr.paymentbody": "QR tampaknya berisi format pembayaran. Pastikan nama merchant, nominal, dan penerima di aplikasi pembayaran sebelum menyetujui.",
      "scan.qr.nonlinkbody": "Periksa isi dan tujuan QR ini sebelum bertindak. QR non-tautan tidak otomatis berarti aman.",
      "scan.qr.contentfinding": "Pemindaian ini tidak memvalidasi identitas penerima atau status pembayaran.",
      "scan.qr.contentstatus": "QR berhasil dibaca di perangkat.",
      "scan.qr.sourcetitlecontent": "Konten QR",
      "scan.qr.errgeneric": "Gambar QR tidak dapat diproses.",
      "scan.qr.errdetectfail": "Pemindai QR gagal memproses gambar: {reason}",
      "scan.qr.errdetectfailreason": "format QR tidak didukung.",
      "scan.qr.errnotavailable": "Pemindai QR belum tersedia. Periksa koneksi internet, lalu muat ulang halaman.",

      "scan.ocr.errincompatible": "Mesin pembaca teks tidak kompatibel. Muat ulang halaman lalu coba lagi.",
      "scan.ocr.msgscanning": "Memindai teks pada gambar… {percent}%",
      "scan.ocr.msgreadingstatus": "Membaca teks screenshot… {percent}%",
      "scan.ocr.msgpreparing": "Menyiapkan pembaca teks untuk gambar.",
      "scan.ocr.msgpreparingstatus": "Menyiapkan pembaca teks Indonesia dan Inggris…",
      "scan.ocr.errnoresponse": "Mesin pembaca teks tidak merespons. Muat ulang halaman lalu coba lagi.",
      "scan.ocr.errloadfail": "Mesin pembaca teks gagal dimuat. Periksa koneksi internet, lalu coba lagi.",
      "scan.ocr.msgstart": "Membaca teks pada screenshot dan memeriksa pola risikonya.",
      "scan.ocr.msgpreparingchecker": "Menyiapkan pemeriksa teks di perangkat…",
      "scan.ocr.notfoundtitle": "Teks belum terbaca",
      "scan.ocr.notfoundsubtitle": "Screenshot sudah diproses di perangkat",
      "scan.ocr.notfoundbody": "Coba gambar dengan teks lebih besar, terang, dan tidak terpotong. Kamu bisa upload gambar yang lebih jelas lalu coba lagi.",
      "scan.ocr.notfoundstatus": "Belum ada teks yang bisa dianalisis.",
      "scan.ocr.notfoundanalysis": "Screenshot sudah diproses di perangkat, tetapi teksnya belum cukup jelas untuk dianalisis.",
      "scan.ocr.notfoundfinding": "Gunakan gambar yang lebih terang, teks lebih besar, dan tidak terpotong.",
      "scan.ocr.bodydanger": "Screenshot mengandung beberapa tanda yang sering muncul pada pesan penipuan. Jangan klik tautan atau bagikan data rahasia.",
      "scan.ocr.bodycaution": "Ada pola yang perlu kamu waspadai. Pastikan pengirim dan tujuan pembayaran melalui kanal resmi.",
      "scan.ocr.bodysafe": "Tidak menemukan pola umum yang mencurigakan pada teks yang terbaca. Hasil ini tidak menjamin pesan aman.",
      "scan.ocr.sourcetitle": "Teks yang terbaca dari screenshot",
      "scan.ocr.viewtext": "Lihat teks yang terbaca",
      "scan.ocr.toastuploaded": "Screenshot chat berhasil diunggah",
      "scan.ocr.msgready": "Screenshot siap diperiksa.",
      "scan.ocr.donestatus": "Pemeriksaan selesai. Teks screenshot tidak keluar dari perangkat.",
      "scan.ocr.failstatus": "Pemeriksaan gagal: {error}",
      "scan.ocr.errdefault": "mesin OCR tidak dapat dijalankan.",

      "scan.cam.errnohttps": "Kamera langsung butuh HTTPS atau localhost. Gunakan tombol Kamera / Galeri di ponsel untuk memotret QR.",
      "scan.cam.errnodetector": "Pemindai QR belum tersedia. Periksa koneksi internet, lalu unggah gambar QR.",
      "scan.cam.msgactive": "Kamera aktif. Arahkan ke QR; hasil tidak dibuka otomatis.",
      "scan.cam.errdenied": "Izin kamera ditolak. Aktifkan izin kamera di browser atau unggah gambar QR.",
      "scan.cam.errnotfound": "Kamera tidak ditemukan. Unggah gambar QR untuk melanjutkan.",
      "scan.cam.errgeneric": "Kamera tidak bisa dibuka: {reason}",
      "scan.cam.errgenericreason": "periksa izin atau koneksi aman.",
      "scan.cam.msgstart": "Membaca QR dan memeriksa tujuan kontennya.",
      "scan.cam.linkbodyfindings": "Jangan buka sebelum memeriksa temuan berikut.",
      "scan.cam.linkbodynofindings": "Tidak ditemukan pola umum yang mencurigakan pada alamat. Tetap pastikan tujuan situs sebelum melanjutkan.",
      "scan.cam.linkfinding": "Jangan masukkan kata sandi, PIN, atau OTP dari tautan yang tidak diminta.",
      "scan.cam.paymentbody": "QR tampaknya berisi format pembayaran. Pastikan nama merchant dan nominal sebelum menyetujui.",
      "scan.cam.nonlinkbody": "Tinjau konten QR ini sebelum melanjutkan. QR non-tautan belum tentu aman.",
      "scan.cam.msgscanfail": "Pemindaian kamera gagal: {error}",
      "scan.cam.msgscansuccess": "QR berhasil dipindai. Tidak ada tautan yang dibuka otomatis.",
      "scan.cam.msgclosed": "Kamera ditutup. Unggah gambar atau buka kamera lagi.",

      "scan.msg.clipboardunavailable": "Akses clipboard tidak tersedia di browser ini.",
      "scan.msg.clipboardempty": "Clipboard kosong. Salin pesan terlebih dahulu.",
      "scan.msg.clipboardtoolong": "Teks terlalu panjang dan dipotong menjadi 2.000 karakter.",
      "scan.msg.clipboardfailsuffix": "Tempel langsung ke kolom teks.",
      "scan.msg.clipboardfaildefault": "Clipboard tidak dapat diakses.",

      "lang.id": "Indonesia",
      "lang.en": "English",
    },
    en: {
      "nav.beranda": "Home",
      "nav.berita": "News",
      "nav.cekrisiko": "Check Risk",
      "nav.riwayat": "History",
      "nav.profil": "Profile",
      "nav.masuk": "Sign In",
      "nav.kembali": "Back to Landing Page",

      "splash.status": "Setting up your safe digital space…",

      "landing.title": "AMANIN — Protect Yourself from Digital Scams",
      "landing.hero.eyebrow": "CHECK FIRST. THEN TRUST.",
      "landing.hero.title.html": "Don't just click.<br><span>Check it first.</span>",
      "landing.hero.desc": "Protect yourself from digital scams. Check chats, links, screenshots, and QR codes before you trust or pay.",
      "landing.hero.cta": "Quick Scan, No Login",
      "landing.hero.assurance1": "Free to use",
      "landing.hero.assurance2": "No login needed",
      "landing.hero.card.kicker": "Sample check",
      "landing.hero.card.sub": "Message you received",
      "landing.hero.card.msg": "“Your package is on hold. Confirm your address via this link.”",
      "landing.hero.card.warn.title": "Suspicious link",
      "landing.hero.card.warn.sub": "Check before opening",

      "landing.steps.eyebrow": "NO ACCOUNT NEEDED",
      "landing.steps.title.html": "Get safer in<br> 3 simple steps.",
      "landing.steps.desc": "Check anything that feels suspicious before you click, reply, or pay.",
      "landing.steps.demo": "START FREE SCAN",
      "landing.step1.number": "STEP 01",
      "landing.step1.title": "Start without signing up",
      "landing.step1.desc": "Open a free check straight from your browser. No account or personal data needed.",
      "landing.step2.number": "STEP 02",
      "landing.step2.title": "Pick what feels off",
      "landing.step2.desc": "Paste chat content or check links and screenshots that feel suspicious.",
      "landing.step2.card.title": "Sample incoming message",
      "landing.step2.card.sender": "Unknown sender",
      "landing.step2.card.msg": "“Your account will be blocked. Verify now via this link.”",
      "landing.step3.number": "STEP 03",
      "landing.step3.title": "Understand the risk",
      "landing.step3.desc": "See the indicators and safe next steps before you make a decision.",
      "landing.step3.card.label": "CHECK RESULT",
      "landing.step3.card.title": "Suspicious link",
      "landing.step3.card.desc": "Don't enter your password or OTP code on this page.",
      "landing.step3.card.status": "Risk detected",

      "landing.features.eyebrow": "ONE PLACE, MORE AWARENESS",
      "landing.features.title": "Spot the risk before it's too late.",
      "landing.features.desc": "Four practical ways to check the things you run into every day.",
      "landing.feature1.title": "Scan Chat",
      "landing.feature1.desc": "Check WhatsApp, SMS, and Telegram messages that feel suspicious.",
      "landing.feature2.title": "Screenshot Scanner",
      "landing.feature2.desc": "Check transfer proof, receipts, or DMs before acting on them.",
      "landing.feature3.title": "Link / URL",
      "landing.feature3.desc": "Check web addresses, phishing attempts, and shortened links hiding their destination.",
      "landing.feature4.title": "QR Code Guard",
      "landing.feature4.desc": "Know where a QR or QRIS code leads before opening or paying.",

      "landing.radar.label": "LATEST RADAR",
      "landing.radar.sublabel": "SECURITY ALERT",
      "landing.radar.title": "Watch out today",
      "landing.radar.desc": "Fake QRIS stickers are spreading at gas stations & mosques. Check the recipient name and QR destination before paying.",

      "landing.closing.title": "Not sure? Check it first.",
      "landing.closing.desc": "Start a check right from your device.",
      "landing.closing.cta": "Start Scan",

      "landing.chat1": "“Your package is held at customs. Pay Rp150,000 via this link.”",
      "landing.chat2": "🔍 Checking with AMANIN...",
      "landing.chat3": "⚠️ Phishing pattern detected — don't click it",
      "landing.chat4": "✅ Contact the official courier to confirm the status",

      "landing.testimonial.label": "❤️ Trusted by thousands of users in Indonesia",
      "landing.testimonial.role": "AMANIN user",
      "landing.testimonial.q1": "“I almost clicked a fake delivery link — good thing I checked it with AMANIN first.”",
      "landing.testimonial.q2": "“A QRIS sticker in a parking lot turned out to have a mismatched account name. AMANIN flagged it right away.”",
      "landing.testimonial.q3": "“Got a message claiming I won a lottery. I pasted it into AMANIN and it caught the phishing pattern instantly.”",
      "landing.testimonial.q4": "“Super simple — just screenshot the suspicious chat and check it right away. No account needed.”",
      "landing.testimonial.q5": "“Someone sent an APK file claiming to be from a courier. AMANIN warned me it's a common scam tactic.”",
      "landing.testimonial.q6": "“Before transferring to a new account, I always check the pattern on AMANIN first. Much more peace of mind.”",

      "landing.footer.tagline": "Stay more alert, stay safer online.",
      "landing.footer.privasi": "Privacy Policy",
      "landing.footer.syarat": "Terms &amp; Conditions",
      "landing.footer.kontak": "Contact Us",
      "landing.footer.privasi.body": "Images and text you choose to check are processed in your browser. Don't upload or share confidential information such as PINs and OTP codes.",
      "landing.footer.syarat.body": "Check results are an initial indication, not a guarantee of safety or a substitute for verification through official channels.",
      "landing.footer.copyright": "© 2026 AMANIN. All Rights Reserved.",

      "login.title": "Welcome.",
      "login.kicker": "YOUR SAFE DIGITAL SPACE",
      "login.desc": "Sign in or continue as a guest to start checking.",
      "login.username": "Username",
      "login.username.ph": "Your username",
      "login.email": "Email",
      "login.email.ph": "name@email.com",
      "login.submit": "Sign In to AMANIN",
      "login.or": "or",
      "login.guest": "Continue as guest",
      "login.back": "Back to landing page",
      "login.visual.title": "Check first, then trust.",
      "login.visual.desc": "One safe space to check chats, links, QR codes, and payments before you act.",
      "login.visual.point1": "Processed right on your device",
      "login.visual.point2": "Free, no ads",
      "login.visual.point3": "Trusted by thousands of users",

      "dashboard.title": "AMANIN — Home",
      "dashboard.brand.sub": "Home",
      "dashboard.welcome.sub": "Protect your transactions & digital interactions today.",
      "dashboard.safety.status": "Status: SAFE",
      "dashboard.safety.pill": "Shield Active",
      "dashboard.safety.updated": "Last updated: Just now",
      "dashboard.alert.kicker": "CYBER INSIGHTS",
      "dashboard.alert.tag": "Scam · Fraud · Privacy",
      "dashboard.alert.text": "Spot scam signs before clicking a link or scanning a QR",
      "dashboard.hero.ailabel": "AI Multi-Vector Defense v2.4",
      "dashboard.hero.title": "What do you want to check?",
      "dashboard.hero.desc": "Check before you trust, click, or pay. AMANIN's AI can analyze scam risk in 3 seconds.",
      "dashboard.hero.cta": "Quick Scan Now",
      "dashboard.category.title": "Detection Categories",
      "dashboard.category.sub": "6 Sensors Active",
      "dashboard.cat1.title": "Scan Chat",
      "dashboard.cat1.sub": "WhatsApp, SMS, Telegram",
      "dashboard.cat2.title": "Screenshot",
      "dashboard.cat2.sub": "Transfer proof, receipts, DMs",
      "dashboard.cat3.title": "Link / URL",
      "dashboard.cat3.sub": "Web phishing, fake bit.ly",
      "dashboard.cat4.title": "QR Code",
      "dashboard.cat4.sub": "Check fake QRIS stickers",
      "dashboard.cat5.title": "Phone / Account No.",
      "dashboard.cat5.sub": "Check patterns before transferring",
      "dashboard.cat6.title": "Payment",
      "dashboard.cat6.sub": "Virtual Account, e-Wallet",
      "dashboard.recent.title": "Recent Checks",
      "dashboard.recent.all": "See All",
      "dashboard.news.title": "Cyber News & Insights",
      "dashboard.news.all": "See all",
      "dashboard.news.featured.cat": "SCAM & PHISHING",
      "dashboard.news.featured.title": "Spot phishing messages before clicking a link",
      "dashboard.news.featured.desc": "Check the warning signs and how to protect your account.",
      "dashboard.news.chip1": "Payment fraud",
      "dashboard.news.chip2": "Privacy & account security",

      "profile.kicker": "AMANIN ACCOUNT",
      "profile.title": "Profile Management",
      "profile.close": "Close profile",
      "profile.desc.user": "Change your username and profile photo.",
      "profile.desc.guest": "Set a username and profile photo to personalize AMANIN.",
      "profile.avatar.title": "Profile photo",
      "profile.avatar.desc": "Change your photo or pick a new image.",
      "profile.avatar.upload": "Choose photo",
      "profile.avatar.reset": "Remove photo",
      "profile.username": "Username",
      "profile.username.ph": "Your username",
      "profile.username.hint": "2–32 characters: letters, numbers, dots, underscores, or hyphens.",
      "profile.email": "Email",
      "profile.email.ph": "Optional",
      "profile.submit": "Save Profile",
      "profile.signin": "Sign in with this profile",
      "profile.logout": "Sign Out to Landing Page",

      "scan.title": "Check Risk — AMANIN",
      "scan.brand.sub": "Check Risk",
      "scan.back": "Home",
      "scan.intro.kicker": "AMANIN PROTECTION",
      "scan.intro.title": "Check before you trust it.",
      "scan.intro.desc": "Scan a QR code or check a chat screenshot for signs of fraud.",
      "scan.tab.qr": "QR Code",
      "scan.tab.chat": "Chat & Image",
      "scan.qr.title": "Scan QR Code",
      "scan.qr.desc": "Make sure a QR's destination is safe before opening or paying.",
      "scan.qr.upload.title": "Upload a QR image",
      "scan.qr.upload.desc": "JPG, PNG or WebP · image is processed on your device",
      "scan.qr.upload.btn": "Choose Image",
      "scan.qr.remove": "Change image",
      "scan.qr.analyze": "Scan QR",
      "scan.qr.camera": "Open Camera",
      "scan.qr.cameraupload": "Take a photo of the QR / choose from gallery",
      "scan.qr.status.idle": "Point your camera at a QR code or upload an image.",

      "scan.ctx.chat.badge": "Scan Chat",
      "scan.ctx.chat.heading": "Enter the conversation text",
      "scan.ctx.chat.subtitle": "Paste a suspicious message to check for scam patterns.",
      "scan.ctx.chat.placeholder": "Paste the message here... Example: “Your account will be blocked. Verify now at https://bit.ly/...”",
      "scan.ctx.chat.action": "Analyze Conversation",
      "scan.ctx.chat.idle": "Enter or paste a message to start the analysis.",
      "scan.ctx.chat.sourcetitle": "Conversation excerpt",
      "scan.ctx.screenshot.badge": "Screenshot",
      "scan.ctx.link.badge": "Link / URL",
      "scan.ctx.link.heading": "Check a link you received",
      "scan.ctx.link.subtitle": "Paste the full link to check its domain, shorteners, and phishing patterns.",
      "scan.ctx.link.placeholder": "Paste the full link here... Example: https://promo-official-gift.com/claim",
      "scan.ctx.link.action": "Check Link",
      "scan.ctx.link.idle": "Paste a link to start the analysis.",
      "scan.ctx.link.sourcetitle": "Link checked",
      "scan.ctx.rekening.badge": "Phone / Account No.",
      "scan.ctx.rekening.heading": "Check a phone or account number",
      "scan.ctx.rekening.subtitle": "Enter the number, and add message context below if you have any.",
      "scan.ctx.rekening.placeholder": "Optional: paste the message or conversation related to this number...",
      "scan.ctx.rekening.action": "Check Number",
      "scan.ctx.rekening.idle": "Enter a phone or account number to start the analysis.",
      "scan.ctx.rekening.sourcetitle": "Number checked",
      "scan.ctx.pembayaran.badge": "Payment",
      "scan.ctx.pembayaran.heading": "Check payment details",
      "scan.ctx.pembayaran.subtitle": "Enter the amount and recipient, and add VA/QRIS details below if you have any.",
      "scan.ctx.pembayaran.placeholder": "Optional: paste Virtual Account/QRIS details or a related message...",
      "scan.ctx.pembayaran.action": "Check Payment",
      "scan.ctx.pembayaran.idle": "Enter the amount and recipient to start the analysis.",
      "scan.ctx.pembayaran.sourcetitle": "Payment checked",

      "scan.quick.rekening.label": "Phone or Account Number",
      "scan.quick.rekening.ph": "Example: 081234567890",
      "scan.quick.pay.amount.label": "Amount (Rp)",
      "scan.quick.pay.amount.ph": "Example: 150000",
      "scan.quick.pay.name.label": "Recipient / Merchant Name",
      "scan.quick.pay.name.ph": "Example: Toko Aman",

      "scan.charcount": "characters",
      "scan.processed": "Processed on your device",
      "scan.tool.paste": "Paste from Clipboard",
      "scan.tool.example": "Scam Example",
      "scan.ss.or": "or check from a screenshot",
      "scan.ss.title": "Check a chat screenshot",
      "scan.ss.desc": "OCR reads the text, then checks for links and suspicious message patterns.",
      "scan.ss.upload.title": "Upload a chat screenshot",
      "scan.ss.upload.desc": "WhatsApp, SMS, DM, transfer proof · JPG, PNG or WebP",
      "scan.ss.upload.btn": "Choose Screenshot",
      "scan.ss.camera": "Take a screenshot photo",
      "scan.ss.analyze": "Check Screenshot",
      "scan.ss.idle": "Choose a screenshot to start checking. Photos are not uploaded to a server.",

      "scan.privacy": "Your privacy is protected.",
      "scan.privacy.desc": "Images and text are processed directly in your browser and never sent to AMANIN's servers.",
      "scan.disclaimer": "Check results are an initial indication, not a guarantee of safety. Never enter your PIN, OTP, or password.",

      "scan.loading.kicker": "AMANIN CHECK",
      "scan.loading.title": "Checking carefully",
      "scan.loading.desc": "Analyzing risk patterns locally on your device.",
      "scan.loading.privacy": "Your data stays on your device",
      "scan.result.title": "Analysis Result",
      "scan.result.done": "Analysis complete",
      "scan.result.content": "Content checked",
      "scan.result.why": "Why this result?",
      "scan.result.indicators": "Check indicators",
      "scan.result.safety": "Safe next steps",
      "scan.result.disclaimer": "This analysis is an initial indication based on recognized patterns. Verify the sender, site, and recipient through official channels.",
      "scan.result.backbtn": "Back to check",
      "scan.result.scorestatus": "STATUS",
      "scan.result.scorelabel": "RISK SCORE",

      "berita.title": "Cyber News — AMANIN",
      "berita.brand.sub": "Cyber News",
      "berita.intro.kicker": "CYBER INTELLIGENCE",
      "berita.intro.title": "Scam & Cyber Radar",
      "berita.intro.desc": "Learn about digital scam tactics, understand the risks, and take safe steps before acting.",
      "berita.briefing.title": "Digital security insights",
      "berita.briefing.desc": "Common tactics and guides to protect yourself",
      "berita.tag1": "Phishing",
      "berita.tag2": "Fraud",
      "berita.tag3": "Privacy",
      "berita.feed.kicker": "STAY INFORMED",
      "berita.feed.title": "Tactics & Guides",
      "berita.feed.note": "AMANIN Picks",
      "berita.filter.all": "All",
      "berita.filter.scam": "Scam",
      "berita.filter.fraud": "Fraud",
      "berita.filter.security": "Security",
      "berita.empty": "No articles in this category yet.",
      "berita.sourcenote": "This content is general educational guidance, not a real-time statistical report. Follow official channels for the latest information and reporting.",

      "berita.a1.visual": "CHECK BEFORE YOU CLICK",
      "berita.a1.cat": "SCAM & PHISHING",
      "berita.a1.source": "AMANIN Guide",
      "berita.a1.title": "Urgent messages and unknown links: spotting phishing",
      "berita.a1.desc": "Scammers can pose as banks, couriers, or digital services. Watch out for messages pressuring you to log in, open a link, or give out an OTP and PIN immediately.",
      "berita.a1.take.title": "What you can do",
      "berita.a1.take.desc": "Open the official app or site on your own. Never use links from unverified messages.",
      "berita.a1.action": "Check the message",

      "berita.a2.cat": "PAYMENT FRAUD",
      "berita.a2.source": "AMANIN Guide",
      "berita.a2.title": "Paying via QR? Confirm the recipient's name before confirming",
      "berita.a2.desc": "After scanning a QR code, match the merchant name and amount shown in your payment app. Cancel the transaction if the info looks different or off.",
      "berita.a2.action": "Check the QR with AMANIN",

      "berita.a3.cat": "FILES & MALWARE",
      "berita.a3.source": "AMANIN Guide",
      "berita.a3.title": "Don't install APK files from chats without thinking",
      "berita.a3.desc": "App files sent via chat can disguise themselves as invitations, receipts, or documents. Avoid installing files from unknown sources and never grant sensitive access.",
      "berita.a3.take.title": "Remember",
      "berita.a3.take.desc": "Never enable accessibility permissions or share an OTP code just because a file sender tells you to.",

      "berita.a4.cat": "ACCOUNT SECURITY",
      "berita.a4.source": "AMANIN Guide",
      "berita.a4.title": "Protect your account with unique passwords and two-step verification",
      "berita.a4.desc": "Use a different password for each service, enable additional verification, and never share your recovery code with anyone.",
      "berita.a4.action": "Visit BSSN",

      "berita.a5.cat": "REPORTING",
      "berita.a5.source": "Official channel",
      "berita.a5.title": "If you've been scammed in a transaction, contact an official channel right away",
      "berita.a5.desc": "Save proof of the conversation and transaction. For financial transaction fraud, the Indonesia Anti-Scam Centre (IASC) offers a reporting channel for the public.",
      "berita.a5.action": "Open IASC OJK",

      "riwayat.title": "History — AMANIN",
      "riwayat.brand.sub": "History",
      "riwayat.heading": "Check History",
      "riwayat.clear": "Clear All",
      "riwayat.empty": "No checks yet. Start a scan to see your history here.",
      "riwayat.confirmclear": "Clear all check history? This action cannot be undone.",
      "riwayat.cleared": "History cleared",

      "history.type.qr": "QR Code",
      "history.type.chat": "Chat",
      "history.type.screenshot": "Screenshot",
      "history.type.link": "Link / URL",
      "history.type.rekening": "Phone / Account No.",
      "history.type.pembayaran": "Payment",
      "history.level.bahaya": "Danger",
      "history.level.waspada": "Caution",
      "history.level.aman": "Safe",

      "toast.darkon": "Dark mode enabled",
      "toast.darkoff": "Light mode enabled",
      "toast.avatarready": "Profile photo ready to use",
      "toast.avatarremove": "Profile photo will be removed once saved",
      "toast.profileupdated": "Profile updated successfully",

      "common.guest": "Guest",
      "common.greeting": "Hi",
      "common.justnow": "Just now",
      "common.minago": "{n} min ago",
      "common.hourago": "{n} hr ago",
      "common.dayago": "{n} d ago",
      "profile.alt.default": "Profile photo",
      "profile.alt.named": "{name}'s profile photo",
      "profile.alt.preview": "Profile photo preview",

      "auth.err.storageread": "Your browser doesn't allow local storage access. Check your browser's privacy settings.",
      "auth.err.storagewrite": "Data could not be saved in this browser. Check your browser's storage settings.",
      "auth.err.avatartype": "Choose an image file for your profile photo.",
      "auth.err.avatarsize": "Maximum photo size is 8 MB.",
      "auth.err.avatarcanvas": "This photo can't be processed in this browser.",
      "auth.err.avatarencode": "Failed to process the photo.",
      "auth.err.avatardecode": "This photo can't be opened. Choose another image.",
      "auth.err.loginrequired": "Fill in your username and email correctly to continue.",
      "auth.err.usernameempty": "Username can't be empty.",
      "auth.err.usernameformat": "Username must be 2–32 characters: letters, numbers, dots, underscores, or hyphens.",
      "auth.err.emailformat": "That email format isn't valid yet.",
      "auth.err.sessionclear": "Couldn't clear the session. Check your browser's storage settings.",

      "scan.rule.otp": "The message asks for confidential data like an OTP, PIN, or password.",
      "scan.rule.apk": "The message mentions an APK file or installing an app from outside an official store.",
      "scan.rule.accountblock": "There's pressure to restore or verify an account.",
      "scan.rule.prize": "There's a prize, voucher, or free offer being dangled.",
      "scan.rule.urgency": "The message uses time pressure or urgent language.",
      "scan.rule.payment": "The message directs you to make a payment or transfer.",

      "scan.url.invalid": "Unrecognized link format; don't open it before verifying the address.",
      "scan.url.nohttps": "The link doesn't use HTTPS.",
      "scan.url.ipaddress": "The destination is an IP address, not a regular site name.",
      "scan.url.shortener": "The link uses a shortening service, hiding its final destination.",
      "scan.url.idn": "The domain name uses international characters that need careful checking.",
      "scan.url.keyword": "The domain name contains words often used to disguise an account or promo page.",
      "scan.url.subdomain": "The destination subdomain is quite long and should be verified.",

      "scan.msg.nospecific": "No specific indicator was found from the patterns checked.",
      "scan.msg.nopattern": "No recognized trigger words or suspicious links were found.",
      "scan.msg.statusunscored": "Content not yet readable",
      "scan.msg.statusdanger": "High risk · be careful",
      "scan.msg.statuscaution": "Needs checking",
      "scan.msg.statussafe": "Low risk detected",
      "scan.msg.resultmsgunscored": "This content couldn't be scored. Try checking with a clearer image or text.",
      "scan.msg.resultmsgdanger": "Several strong signals were found that you should handle carefully.",
      "scan.msg.resultmsgcaution": "There are patterns worth verifying before you act.",
      "scan.msg.resultmsgsafe": "No common risk patterns were found in this check.",
      "scan.msg.findingstitle": "{count} check indicators",
      "scan.msg.findingstagdanger": "Needs caution",
      "scan.msg.findingstagcaution": "Double-check",
      "scan.msg.findingstagsafe": "Common pattern",
      "scan.msg.advicetitledanger": "Don't proceed yet",
      "scan.msg.advicetitledefault": "Safe next steps",
      "scan.msg.advicedanger": "Don't click links, send money, or share an OTP/PIN. Contact the relevant party through an official app or number.",
      "scan.msg.advicecaution": "Verify the sender's and recipient's identity separately through an official channel before paying or sharing data.",
      "scan.msg.advicesafe": "Still check the site address and sender's identity. No pattern detected doesn't mean the message is definitely safe.",
      "scan.msg.gaugelabel": "Risk indication score {score} out of 100",
      "scan.msg.foundlink": "Link found: {url}",

      "scan.msg.ready": "Ready to analyze on your device.",
      "scan.msg.incomplete": "Complete the data above to start the analysis.",
      "scan.msg.analyzing": "Analyzing patterns on your device…",
      "scan.msg.startanalysis": "Reading the data and checking for signs of fraud.",
      "scan.msg.donelocal": "Analysis complete. Data never left your device.",
      "scan.msg.fillfirst": "Complete the data above first.",

      "scan.msg.titledanger": "Found signs of high risk",
      "scan.msg.titlecaution": "Needs further checking",
      "scan.msg.titlesafe": "No common patterns detected",
      "scan.msg.subtitlepattern": "Local pattern check · not a verification of the sender's identity",
      "scan.msg.bodydanger": "Found several patterns commonly seen in scams. Don't click links or share codes and confidential data.",
      "scan.msg.bodycaution": "There are patterns worth watching out for. Verify the sender and destination through an official channel before acting.",
      "scan.msg.bodysafe": "No common suspicious patterns were found. This isn't a guarantee that this data is safe.",

      "scan.quick.composerekening": "Phone/Account number checked: {number}.",
      "scan.quick.composepay": "Payment to {name} for {amount}.",
      "scan.quick.payamountempty": "amount not entered",
      "scan.quick.paynameempty": "recipient not entered",
      "scan.quick.rekeningshort": "The number is too short for a typical Indonesian phone/account number format.",
      "scan.quick.rekeningrepeated": "The number consists of a continuously repeating digit; this pattern is common for fake numbers.",
      "scan.quick.paylarge": "The payment amount is quite large; make sure you really recognize the recipient before paying.",

      "scan.err.format": "Unsupported format. Choose a JPG, PNG, WebP, GIF, or BMP image.",
      "scan.err.size": "Maximum image size is 12 MB. Compress the image and try again.",
      "scan.err.imageopenfail": "This image can't be opened. Try choosing another image file.",
      "scan.err.imageloadfail": "The image failed to load. Try choosing another image file.",

      "scan.qr.msgready": "Image ready to scan.",
      "scan.qr.msgphotoready": "Photo ready to scan.",
      "scan.qr.toastuploaded": "QR code uploaded successfully",
      "scan.qr.toastphotoloaded": "QR photo loaded successfully",
      "scan.qr.msgreading": "Reading the image and looking for a QR code…",
      "scan.qr.notfoundtitle": "QR code not found",
      "scan.qr.notfoundsubtitle": "The image was processed on your device",
      "scan.qr.notfoundbody": "Make sure the QR code is clear, not cropped, and not blurry. If the image is a chat screenshot, use the Chat & Image tab instead.",
      "scan.qr.notfoundstatus": "No QR code was found in the image.",
      "scan.qr.notfoundanalysis": "The image was checked, but no QR pattern could be read. Make sure the code is intact, in focus, and well lit.",
      "scan.qr.notfoundfinding": "Try uploading a clearer image or taking a photo from closer up.",
      "scan.qr.linktitledanger": "This QR link needs caution",
      "scan.qr.linktitlecaution": "Check this QR's destination",
      "scan.qr.linktitlesafe": "QR contains a link",
      "scan.qr.linksubtitle": "Format and address analysis — not a verification of site reputation",
      "scan.qr.linkbodyfindings": "Found a few things worth checking before opening the link.",
      "scan.qr.linkbodynofindings": "No common suspicious patterns were found on this address. This isn't a guarantee the site is safe.",
      "scan.qr.linkfallbackfinding": "Still make sure the site name and recipient are correct before entering data or making a payment.",
      "scan.qr.linkstatus": "QR read successfully. Don't open it automatically; check the address below.",
      "scan.qr.linkanalysisfindings": "Found patterns worth checking before opening the link.",
      "scan.qr.sourcetitlelink": "Link read from the QR code",
      "scan.qr.contenttitle": "QR read successfully",
      "scan.qr.contentsubtitle": "QR content is not a web link",
      "scan.qr.paymentbody": "This QR appears to contain payment info. Confirm the merchant name, amount, and recipient in your payment app before approving.",
      "scan.qr.nonlinkbody": "Check this QR's content and destination before acting. A non-link QR isn't automatically safe.",
      "scan.qr.contentfinding": "This scan doesn't validate the recipient's identity or payment status.",
      "scan.qr.contentstatus": "QR read successfully on your device.",
      "scan.qr.sourcetitlecontent": "QR content",
      "scan.qr.errgeneric": "This QR image couldn't be processed.",
      "scan.qr.errdetectfail": "The QR scanner failed to process the image: {reason}",
      "scan.qr.errdetectfailreason": "unsupported QR format.",
      "scan.qr.errnotavailable": "The QR scanner isn't available yet. Check your internet connection, then reload the page.",

      "scan.ocr.errincompatible": "The text reader engine isn't compatible. Reload the page and try again.",
      "scan.ocr.msgscanning": "Scanning text in the image… {percent}%",
      "scan.ocr.msgreadingstatus": "Reading screenshot text… {percent}%",
      "scan.ocr.msgpreparing": "Preparing the text reader for the image.",
      "scan.ocr.msgpreparingstatus": "Preparing the Indonesian and English text reader…",
      "scan.ocr.errnoresponse": "The text reader engine isn't responding. Reload the page and try again.",
      "scan.ocr.errloadfail": "The text reader engine failed to load. Check your internet connection and try again.",
      "scan.ocr.msgstart": "Reading the text in the screenshot and checking its risk patterns.",
      "scan.ocr.msgpreparingchecker": "Preparing the text checker on your device…",
      "scan.ocr.notfoundtitle": "Text not readable yet",
      "scan.ocr.notfoundsubtitle": "The screenshot was processed on your device",
      "scan.ocr.notfoundbody": "Try an image with larger, brighter, uncropped text. You can upload a clearer image and try again.",
      "scan.ocr.notfoundstatus": "No text could be analyzed yet.",
      "scan.ocr.notfoundanalysis": "The screenshot was processed on your device, but the text wasn't clear enough to analyze.",
      "scan.ocr.notfoundfinding": "Use an image with brighter, larger, uncropped text.",
      "scan.ocr.bodydanger": "The screenshot contains several signs commonly found in scam messages. Don't click links or share confidential data.",
      "scan.ocr.bodycaution": "There are patterns you should watch out for. Verify the sender and payment destination through an official channel.",
      "scan.ocr.bodysafe": "No common suspicious patterns were found in the text read. This doesn't guarantee the message is safe.",
      "scan.ocr.sourcetitle": "Text read from the screenshot",
      "scan.ocr.viewtext": "View the text that was read",
      "scan.ocr.toastuploaded": "Chat screenshot uploaded successfully",
      "scan.ocr.msgready": "Screenshot ready to check.",
      "scan.ocr.donestatus": "Check complete. The screenshot text never left your device.",
      "scan.ocr.failstatus": "Check failed: {error}",
      "scan.ocr.errdefault": "the OCR engine couldn't run.",

      "scan.cam.errnohttps": "Live camera needs HTTPS or localhost. Use the Camera/Gallery button on your phone to photograph the QR code instead.",
      "scan.cam.errnodetector": "The QR scanner isn't available yet. Check your internet connection, then upload a QR image instead.",
      "scan.cam.msgactive": "Camera active. Point it at a QR code; results aren't opened automatically.",
      "scan.cam.errdenied": "Camera permission denied. Enable camera access in your browser or upload a QR image instead.",
      "scan.cam.errnotfound": "No camera found. Upload a QR image to continue.",
      "scan.cam.errgeneric": "Couldn't open the camera: {reason}",
      "scan.cam.errgenericreason": "check your permissions or secure connection.",
      "scan.cam.msgstart": "Reading the QR code and checking its destination content.",
      "scan.cam.linkbodyfindings": "Don't open it before checking the findings below.",
      "scan.cam.linkbodynofindings": "No common suspicious patterns were found on this address. Still confirm the site's destination before continuing.",
      "scan.cam.linkfinding": "Never enter your password, PIN, or OTP from an unsolicited link.",
      "scan.cam.paymentbody": "This QR appears to contain payment info. Confirm the merchant name and amount before approving.",
      "scan.cam.nonlinkbody": "Review this QR's content before continuing. A non-link QR isn't necessarily safe.",
      "scan.cam.msgscanfail": "Camera scan failed: {error}",
      "scan.cam.msgscansuccess": "QR scanned successfully. No link was opened automatically.",
      "scan.cam.msgclosed": "Camera closed. Upload an image or open the camera again.",

      "scan.msg.clipboardunavailable": "Clipboard access isn't available in this browser.",
      "scan.msg.clipboardempty": "Clipboard is empty. Copy a message first.",
      "scan.msg.clipboardtoolong": "The text was too long and was trimmed to 2,000 characters.",
      "scan.msg.clipboardfailsuffix": "Paste directly into the text field instead.",
      "scan.msg.clipboardfaildefault": "Clipboard isn't accessible.",

      "lang.id": "Indonesia",
      "lang.en": "English",
    },
  };

  function getLang() {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === "id" || stored === "en") return stored;
    } catch (error) {
      console.error("Preferensi bahasa tidak dapat dibaca:", error);
    }
    return "id";
  }

  function setLang(lang) {
    const next = lang === "en" ? "en" : "id";
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch (error) {
      console.error("Preferensi bahasa gagal disimpan:", error);
    }
    document.documentElement.lang = next;
    apply(next);
    syncSwitchers(next);
    document.dispatchEvent(new CustomEvent("amanin:langchange", { detail: { lang: next } }));
  }

  function t(key, lang) {
    const activeLang = lang || getLang();
    return dict[activeLang]?.[key] ?? dict.id[key] ?? key;
  }

  function tf(key, vars) {
    let value = t(key);
    if (vars) {
      for (const [name, val] of Object.entries(vars)) {
        value = value.replaceAll(`{${name}}`, val);
      }
    }
    return value;
  }

  function apply(lang) {
    const activeLang = lang || getLang();
    for (const element of document.querySelectorAll("[data-i18n]")) {
      element.textContent = t(element.getAttribute("data-i18n"), activeLang);
    }
    for (const element of document.querySelectorAll("[data-i18n-html]")) {
      element.innerHTML = t(element.getAttribute("data-i18n-html"), activeLang);
    }
    for (const element of document.querySelectorAll("[data-i18n-attr]")) {
      const spec = element.getAttribute("data-i18n-attr");
      for (const pair of spec.split(",")) {
        const [attr, key] = pair.split(":").map((part) => part.trim());
        if (attr && key) element.setAttribute(attr, t(key, activeLang));
      }
    }
  }

  function syncSwitchers(lang) {
    for (const el of document.querySelectorAll("[data-lang-current]")) {
      el.textContent = lang.toUpperCase();
    }
    for (const button of document.querySelectorAll("[data-lang]")) {
      button.classList.toggle("is-active", button.getAttribute("data-lang") === lang);
      button.setAttribute("aria-selected", String(button.getAttribute("data-lang") === lang));
    }
  }

  function closeAllMenus(except) {
    for (const menu of document.querySelectorAll(".lang-switch-menu")) {
      if (menu === except) continue;
      menu.classList.add("is-hidden");
      menu.style.removeProperty("top");
      menu.style.removeProperty("left");
      menu.style.removeProperty("right");
      menu.style.removeProperty("min-width");
      const root = menu.closest(".lang-switch");
      root?.classList.remove("is-open");
      root?.querySelector(".lang-switch-button")?.setAttribute("aria-expanded", "false");
    }
  }

  function positionMenu(button, menu) {
    const rect = button.getBoundingClientRect();
    const alignRight = rect.left + 140 > window.innerWidth;
    menu.style.top = `${Math.round(rect.bottom)}px`;
    menu.style.minWidth = `${Math.max(118, Math.round(rect.width))}px`;
    if (alignRight) {
      menu.style.right = `${Math.round(window.innerWidth - rect.right)}px`;
      menu.style.left = "auto";
    } else {
      menu.style.left = `${Math.round(rect.left)}px`;
      menu.style.right = "auto";
    }
  }

  function wireSwitchers() {
    for (const root of document.querySelectorAll(".lang-switch")) {
      const button = root.querySelector(".lang-switch-button");
      const menu = root.querySelector(".lang-switch-menu");
      if (!button || !menu || button.dataset.wired) continue;
      button.dataset.wired = "true";
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const willOpen = menu.classList.contains("is-hidden");
        closeAllMenus();
        if (willOpen) positionMenu(button, menu);
        menu.classList.toggle("is-hidden", !willOpen);
        root.classList.toggle("is-open", willOpen);
        button.setAttribute("aria-expanded", String(willOpen));
      });
      for (const option of menu.querySelectorAll("[data-lang]")) {
        option.addEventListener("click", () => {
          setLang(option.getAttribute("data-lang"));
          closeAllMenus();
        });
      }
    }
    document.addEventListener("click", () => closeAllMenus());
    window.addEventListener("scroll", () => closeAllMenus(), { passive: true });
    window.addEventListener("resize", () => closeAllMenus());
  }

  function init() {
    const lang = getLang();
    document.documentElement.lang = lang;
    wireSwitchers();
    apply(lang);
    syncSwitchers(lang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return Object.freeze({ t, tf, apply, getLang, setLang });
})();
