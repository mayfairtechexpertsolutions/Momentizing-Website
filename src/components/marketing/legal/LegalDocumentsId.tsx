import { withBase } from "@/lib/base-path";
import { MOMENTIZING_WHATSAPP_DISPLAY } from "@/lib/whatsapp-constants";
import { LEGAL_EMAIL, List, Section, linkClass } from "./LegalDocuments";

/**
 * Bahasa Indonesia translation of LegalDocuments.tsx — keep the two in step, section by section. Pending legal review:
 * the legal page shows a notice that the English version governs (Terms §17) until a lawyer signs this off.
 */
export const LEGAL_EFFECTIVE_DATE_ID = "22 Oktober 2026";

function Contact() {
  return (
    <>
      <a href={`mailto:${LEGAL_EMAIL}`} className={linkClass}>
        {LEGAL_EMAIL}
      </a>{" "}
      atau WhatsApp di {MOMENTIZING_WHATSAPP_DISPLAY}
    </>
  );
}

export function TermsDocumentId() {
  return (
    <div className="space-y-8 text-base leading-relaxed text-momentizing-muted">
      <p className="text-xs font-bold tracking-widest uppercase">Berlaku sejak {LEGAL_EFFECTIVE_DATE_ID}</p>

      <p>
        Ketentuan ini berlaku saat Anda menggunakan situs web Momentizing, memesan sesi, meminta bantuan kami, atau
        melamar untuk bergabung. Jika Anda membuat akun di aplikasi Momentizing, ketentuan ini juga berlaku di sana. Mohon
        baca bersama{" "}
        <a href="#privacy" className={linkClass}>
          Kebijakan Privasi
        </a>{" "}
        kami. Dengan mencentang kotak saat memesan atau mengirim permintaan, atau dengan menggunakan layanan, Anda
        menyetujuinya.
      </p>

      <Section title="1. Siapa kami">
        <p>
          Momentizing Holistic Center (&quot;Momentizing&quot;, &quot;kami&quot;) menyediakan konsultasi kesehatan
          mental, konseling, dan coaching bagi orang-orang yang hidup di antara berbagai budaya: komunitas diaspora,
          ekspatriat, pelajar internasional, dan pasangan lintas budaya. Kami menjalankan platform yang menghubungkan Anda
          dengan spesialis independen, dan kami mengurus pemesanan, penjadwalan, pembayaran, serta dukungan seputar sesi
          Anda.
        </p>
      </Section>

      <Section title="2. Apa yang kami lakukan, dan yang tidak">
        <List
          items={[
            <>
              Spesialis kami adalah psikolog, terapis dan konselor, psikiater, serta coach. Mereka adalah profesional
              independen yang bergabung dengan Momentizing setelah kami meninjau kredensial dan izin praktik yang mereka
              berikan. Mereka tetap bertanggung jawab atas saran profesional yang mereka berikan kepada Anda.
            </>,
            <>
              Sesi adalah bentuk pendampingan, konsultasi, dan konseling. Tidak ada isi situs web ini yang merupakan
              diagnosis, pendapat medis, atau rencana perawatan, dan situs web, aplikasi, serta artikel kami bukan
              pengganti layanan profesional.
            </>,
            <>Kami tidak dapat menjanjikan hasil tertentu. Kemajuan bergantung pada banyak hal, termasuk diri Anda.</>,
            <>
              Kami dapat menyarankan jenis layanan lain (misalnya psikiater, dokter, atau layanan tatap muka) jika kami
              atau spesialis Anda menilai itu lebih sesuai untuk Anda.
            </>,
          ]}
        />
      </Section>

      <Section title="3. Bukan layanan darurat">
        <p>
          <strong className="text-momentizing-slate">
            Momentizing tidak dilengkapi untuk keadaan darurat atau intervensi krisis segera.
          </strong>{" "}
          Jika Anda atau orang di dekat Anda dalam bahaya, atau Anda berpikir untuk menyakiti diri sendiri, segera hubungi
          nomor darurat setempat atau gunakan layanan bantuan di{" "}
          <a href={withBase("/help/")} className={linkClass}>
            halaman Sumber Bantuan Krisis
          </a>{" "}
          kami, yang dapat diakses kapan saja tanpa akun. Pesan yang dikirim kepada kami lewat WhatsApp, email, atau
          aplikasi mungkin tidak langsung terbaca dan tidak boleh diandalkan dalam keadaan darurat.
        </p>
      </Section>

      <Section title="4. Siapa yang dapat menggunakan Momentizing">
        <List
          items={[
            "Anda harus berusia 18 tahun atau lebih. Formulir pemesanan meminta Anda mengonfirmasi hal ini, dan kami tidak dengan sengaja memberikan layanan kepada siapa pun yang berusia di bawah 18 tahun.",
            "Anda harus memberikan data yang benar, termasuk nomor WhatsApp milik Anda yang dapat Anda gunakan.",
            "Anda dapat memesan untuk diri sendiri, atau untuk diri sendiri bersama pasangan dalam sesi pasangan. Mohon jangan memesan atas nama orang dewasa lain tanpa sepengetahuannya.",
            "Anda bertanggung jawab menjaga kerahasiaan kata sandi akun serta kode pemesanan atau verifikasi Anda.",
          ]}
        />
      </Section>

      <Section title="5. Memesan sesi">
        <List
          items={[
            "Anda dapat memesan tanpa akun. Anda memilih hari, menjawab beberapa pertanyaan singkat, memilih spesialis dan waktu yang tersedia, lalu kami menahan waktu tersebut untuk Anda selama 30 menit.",
            <>
              <strong className="text-momentizing-slate">Pemesanan baru dikonfirmasi setelah Anda membuktikan bahwa nomor WhatsApp tersebut milik Anda</strong>
              : Anda mengirim kode yang tampil di layar, dari nomor tersebut, ke nomor WhatsApp bisnis kami (
              {MOMENTIZING_WHATSAPP_DISPLAY}). Jika kode tidak kami terima tepat waktu, penahanan berakhir dan waktunya dibuka kembali. Tim kami juga dapat mengonfirmasi pemesanan secara manual.
            </>,
            "Waktu ditampilkan sesuai jam Anda, beserta nama zona waktunya. Mohon periksa zona waktu sebelum mengonfirmasi.",
            "Detail pemesanan, pengingat, dan perubahan dikirim kepada Anda lewat WhatsApp, serta lewat email atau notifikasi aplikasi jika Anda memiliki akun. Dengan memesan, Anda setuju dihubungi dengan cara ini terkait pemesanan tersebut. Pesan promosi, seperti kabar acara, hanya kami kirim jika Anda menyetujuinya secara terpisah, dan Anda dapat berhenti kapan saja dengan membalas STOP atau menghubungi kami.",
            "Jika kami tidak dapat menemukan waktu yang cocok, Anda dapat meminta bantuan. Tim kami akan menghubungi Anda lewat WhatsApp, biasanya dalam satu hari kerja.",
            "Sesi berulang diatur bersama tim kami setelah sesi pertama Anda. Kami akan mengonfirmasi setiap tanggalnya dengan Anda.",
          ]}
        />
      </Section>

      <Section title="6. Biaya dan pembayaran">
        <List
          items={[
            "Biaya ditampilkan dalam rupiah (IDR) sebelum Anda berkomitmen. Spesialis dapat menawarkan sesi pertama gratis, pembayaran sesuai kemampuan, atau paket sesi; ketentuan penawaran tersebut ditampilkan pada saat itu.",
            "Untuk pemesanan di situs web tanpa akun, pembayaran diatur bersama tim kami lewat WhatsApp. Pemesanan Anda tidak ditagih secara daring.",
            "Pemilik akun membayar menggunakan poin prabayar di dompet Momentizing mereka. Poin dibeli melalui penyedia pembayaran kami dan dipotong saat sesi dipesan. Harga sesi dalam poin ditampilkan sebelum Anda memesan.",
            "Kami akan mengirimkan faktur atau kuitansi atas permintaan, dan untuk sesi yang telah selesai bila berlaku. Sesi yang ditagih berdasarkan durasi sebenarnya dapat disesuaikan jika berlangsung lebih dari 15 menit lebih lama atau lebih singkat dari waktu yang dipesan.",
            "Harga, paket, dan nilai poin dapat berubah. Perubahan tidak pernah memengaruhi sesi yang sudah dikonfirmasi.",
            "Pajak hanya termasuk jika kami menyatakannya.",
          ]}
        />
      </Section>

      <Section title="7. Perubahan, pembatalan, dan sesi yang terlewat">
        <List
          items={[
            "Untuk mengubah atau membatalkan pemesanan dari situs web, kirim pesan WhatsApp kepada kami. Pemilik akun juga dapat melakukannya di aplikasi. Mohon beri tahu sedini mungkin agar waktunya dapat ditawarkan kepada orang lain.",
            "Jika Anda membatalkan sesi yang dibayar dengan poin, poin akan dikembalikan ke dompet Anda, kecuali berlaku biaya perubahan mendadak.",
            "Memindahkan sesi dalam 24 jam sebelum waktu mulainya dianggap sebagai penjadwalan ulang darurat. Biaya perubahan mendadak dapat berlaku (standar kami 5% dari biaya sesi, dan sebagian spesialis menetapkan sendiri). Biaya ini ditinjau oleh spesialis Anda atau tim kami, yang dapat membebaskannya, dan tidak pernah diambil tanpa diterapkan dan ditunjukkan kepada Anda.",
            "Jika spesialis harus membatalkan atau memindahkan sesi, Anda tidak akan dikenai biaya, dan kami akan membantu mencari waktu baru atau mengembalikan poin Anda.",
            "Jika Anda tidak hadir dalam sesi tanpa pemberitahuan, sesi dapat dianggap selesai dan ditagih seperti biasa. Kami dapat memberi kelonggaran jika ada alasan yang kuat.",
            "Sesi yang sudah dimulai tidak dapat dibatalkan. Jika ada masalah dalam sesi, beri tahu kami dan kami akan meninjaunya secara adil.",
          ]}
        />
      </Section>

      <Section title="8. Kerahasiaan dan batasannya">
        <p>
          Apa yang Anda sampaikan kepada spesialis bersifat rahasia. Spesialis dan Momentizing hanya akan membagikan
          informasi tentang Anda:
        </p>
        <List
          items={[
            "dengan persetujuan Anda yang jelas (misalnya, kategori informasi yang Anda pilih untuk dibagikan kepada spesialis di aplikasi, yang dapat Anda ubah kapan saja);",
            "jika diwajibkan oleh hukum atau diperintahkan pengadilan; atau",
            "jika ada risiko bahaya yang serius dan segera bagi Anda atau orang lain, dan berbagi informasi diperlukan untuk menjaga keselamatan.",
          ]}
        />
        <p>
          Staf penjadwalan dan asisten kami dapat melihat apa yang mereka perlukan untuk mengatur sesi Anda (seperti nama,
          kontak, dan waktu) tetapi tidak dapat melihat informasi klinis Anda. Lihat Kebijakan Privasi untuk rinciannya.
          Sesi tidak boleh direkam oleh pihak mana pun tanpa persetujuan tertulis dari pihak lainnya.
        </p>
      </Section>

      <Section title="9. Menggunakan platform secara wajar">
        <p>Anda setuju untuk tidak:</p>
        <List
          items={[
            "memberikan data palsu, menggunakan nomor atau identitas orang lain, atau membuat pemesanan yang tidak akan Anda hadiri;",
            "melecehkan, mengganggu, atau mengancam spesialis, asisten, staf, atau pengguna lain;",
            "menggunakan bot atau alat otomatis, menguji atau mengganggu layanan, atau mencoba mengakali pemeriksaan keamanan dan anti-penyalahgunaan kami (termasuk verifikasi, batas permintaan, dan daftar blokir);",
            "menyalin, menjual kembali, atau menerbitkan ulang konten, profil spesialis, atau perangkat lunak kami tanpa izin; atau",
            "menggunakan platform untuk hal yang melanggar hukum.",
          ]}
        />
        <p>
          Kami dapat menolak atau membatalkan pemesanan, memblokir nomor telepon atau alamat jaringan, atau menangguhkan
          akun jika kami secara wajar meyakini ketentuan ini dilanggar atau layanan disalahgunakan. Jika aman dan sah
          secara hukum, kami akan memberi tahu alasannya dan cara menghubungi kami jika Anda merasa kami keliru.
        </p>
      </Section>

      <Section title="10. Akun">
        <p>
          Akun gratis dan bersifat opsional. Akun tidak diperlukan untuk memesan. Anda dapat meminta kami menutup akun Anda
          kapan saja (lihat Kebijakan Privasi tentang apa yang terjadi pada data Anda). Kami dapat menonaktifkan akun yang
          disalahgunakan, atau yang lama tidak aktif, setelah memberi pemberitahuan bila memungkinkan.
        </p>
      </Section>

      <Section title="11. Spesialis dan pelamar">
        <p>
          Spesialis menggunakan Momentizing berdasarkan perjanjian terpisah dengan kami. Melamar melalui halaman Karier
          tidak menciptakan hubungan kerja atau jaminan pekerjaan apa pun, dan spesialis bukan karyawan kami kecuali
          dinyatakan dalam kontrak tertulis. Cara kami menangani data lamaran dijelaskan dalam Kebijakan Privasi.
        </p>
      </Section>

      <Section title="12. Konten kami">
        <p>
          Nama, logo, teks, grafis, artikel, dan perangkat lunak Momentizing adalah milik kami atau digunakan dengan izin.
          Anda boleh membaca dan menggunakannya untuk keperluan pribadi dan nonkomersial. Catatan jurnal dan materi lain
          yang Anda tulis tetap milik Anda, dan Anda hanya memberi kami izin yang diperlukan untuk menyimpan dan
          menampilkannya bagi Anda.
        </p>
      </Section>

      <Section title="13. Layanan dan tautan pihak ketiga">
        <p>
          Kami mengandalkan penyedia lain untuk menjalankan layanan, termasuk WhatsApp (untuk mengonfirmasi dan mengelola
          pemesanan), penyedia pembayaran kami, dan hosting cloud. Ketentuan mereka sendiri berlaku untuk layanan mereka,
          dan kami tidak bertanggung jawab atas gangguan atau kejadian di luar kendali wajar kami. Tautan ke situs lain
          disediakan demi kemudahan, dan kami tidak mengendalikan atau mendukungnya.
        </p>
      </Section>

      <Section title="14. Ketersediaan">
        <p>
          Kami berupaya menjaga situs web dan aplikasi tetap tersedia, tetapi keduanya disediakan &quot;sebagaimana
          adanya&quot; dan sesekali dapat tidak tersedia karena pemeliharaan atau alasan di luar kendali kami. Sumber
          bantuan krisis tetap dijaga agar dapat diakses, tetapi selalu gunakan nomor darurat setempat dalam keadaan
          darurat.
        </p>
      </Section>

      <Section title="15. Tanggung jawab kami">
        <p>
          Kami akan menjalankan layanan dengan kehati-hatian dan keahlian yang wajar. Sejauh diizinkan oleh hukum, kami
          tidak bertanggung jawab atas kerugian tidak langsung atau konsekuensial, atas saran atau pendapat profesional
          spesialis independen, atau atas kejadian di luar kendali kami. Total tanggung jawab kami kepada Anda atas klaim
          apa pun terkait layanan terbatas pada biaya yang Anda bayarkan untuk sesi yang menjadi pokok klaim. Tidak ada
          bagian dari ketentuan ini yang membatasi tanggung jawab yang menurut hukum tidak dapat dibatasi, atau hak Anda
          sebagai konsumen berdasarkan hukum yang berlaku bagi Anda.
        </p>
      </Section>

      <Section title="16. Perubahan ketentuan ini">
        <p>
          Kami dapat memperbarui ketentuan ini. Tanggal berlaku di bagian atas menunjukkan versi terkini. Jika ada
          perubahan yang penting bagi Anda, kami akan memberitahukannya lebih dahulu di situs web, lewat WhatsApp, atau
          email. Jika Anda tetap menggunakan Momentizing setelah perubahan berlaku, Anda dianggap menerimanya. Pemesanan
          yang sudah dikonfirmasi tetap mengikuti ketentuan yang Anda setujui, kecuali hukum menentukan lain.
        </p>
      </Section>

      <Section title="17. Hukum dan sengketa">
        <p>
          Ketentuan ini diatur oleh hukum Republik Indonesia. Jika Anda memiliki keluhan, mohon hubungi kami terlebih
          dahulu. Kami akan berupaya dengan iktikad baik menyelesaikannya secara langsung dan cepat. Jika tidak berhasil,
          pengadilan di Jakarta, Indonesia, berwenang mengadilinya, tetapi hal ini tidak menghapus hak Anda untuk mengajukan
          klaim di tempat yang diberikan oleh hukum. Ketentuan ini ditulis dalam bahasa Inggris. Jika tersedia terjemahan,
          versi bahasa Inggris yang berlaku apabila terdapat perbedaan.
        </p>
      </Section>

      <Section title="18. Kontak">
        <p>
          Ada pertanyaan tentang ketentuan ini? Hubungi kami di <Contact />.
        </p>
      </Section>
    </div>
  );
}

export function PrivacyDocumentId() {
  return (
    <div className="space-y-8 text-base leading-relaxed text-momentizing-muted">
      <p className="text-xs font-bold tracking-widest uppercase">Berlaku sejak {LEGAL_EFFECTIVE_DATE_ID}</p>

      <p>
        Kesehatan mental adalah hal yang sangat pribadi, jadi kami berusaha mengumpulkan data sesedikit mungkin dan
        menjelaskan dengan jelas apa yang terjadi padanya. Kebijakan ini menjelaskan apa yang dikumpulkan Momentizing
        melalui situs web dan aplikasi kami, alasannya, siapa yang dapat melihatnya, berapa lama kami menyimpannya, dan
        pilihan yang Anda miliki. Kebijakan ini mengikuti Undang-Undang Pelindungan Data Pribadi Indonesia (UU No. 27
        Tahun 2022) dan, jika berlaku bagi Anda, peraturan serupa seperti GDPR Uni Eropa dan Inggris.
      </p>

      <Section title="1. Siapa yang bertanggung jawab atas data Anda">
        <p>
          Momentizing Holistic Center (&quot;Momentizing&quot;, &quot;kami&quot;) menentukan bagaimana dan untuk apa data
          pribadi Anda digunakan, sehingga kami adalah pengendali data. Anda dapat menghubungi kami untuk pertanyaan privasi
          apa pun di <Contact />.
        </p>
      </Section>

      <Section title="2. Apa yang kami kumpulkan, dan alasannya">
        <h4 className="font-bold text-momentizing-slate">Saat Anda memesan di situs web (tanpa akun)</h4>
        <List
          items={[
            "Nama dan nomor WhatsApp Anda, untuk menahan waktu Anda, membuktikan bahwa nomor itu milik Anda, dan menghubungi Anda terkait sesi.",
            "Jawaban Anda atas beberapa pertanyaan singkat: apakah ini pertama kalinya Anda menjalani terapi, apakah Anda lebih suka sesi daring, apakah ini sesi pasangan, bahwa Anda berusia 18 tahun atau lebih, dan apakah ada hal yang terasa mendesak atau tidak aman. Kami menggunakannya untuk menyarankan spesialis yang sesuai dan mengarahkan Anda ke bantuan krisis bila diperlukan.",
            "Topik opsional yang Anda pilih dan catatan yang Anda tulis. Mohon bagikan hanya yang membuat Anda nyaman.",
            "Spesialis, tanggal, waktu, dan status pemesanan, serta cara pembayaran yang diatur.",
          ]}
        />
        <h4 className="font-bold text-momentizing-slate">Saat Anda meminta bantuan atau mengirim pertanyaan</h4>
        <List items={["Data yang Anda isi (seperti nama, nomor WhatsApp atau email, dan pesan Anda) agar tim kami dapat membalas."]} />
        <h4 className="font-bold text-momentizing-slate">Saat Anda membuat akun di aplikasi</h4>
        <List
          items={[
            "Nama, email, dan kata sandi Anda, serta tanggal lahir untuk memastikan Anda sudah dewasa.",
            "Apa pun yang Anda pilih untuk ditambahkan: catatan jurnal, catatan suasana hati, tugas, brain dump, niat harian, dan penanda. Catatan jurnal dienkripsi saat disimpan.",
            "Pesan dengan spesialis dan tim kami, sesi, faktur, serta riwayat dompet dan isi ulang.",
            "Pengaturan dan persetujuan Anda, termasuk kategori informasi yang Anda bagikan kepada spesialis dan kapan Anda menyetujuinya.",
          ]}
        />
        <h4 className="font-bold text-momentizing-slate">Saat Anda melamar untuk bergabung</h4>
        <List
          items={[
            "Nama, email, nomor WhatsApp, profesi, nomor izin praktik (jika Anda berikan), lama pengalaman, bahasa, bio singkat, tautan situs web atau profil, dan CV Anda (PDF atau Word, maksimal 5 MB). Kami hanya menggunakannya untuk menilai lamaran Anda dan menghubungi Anda.",
          ]}
        />
        <h4 className="font-bold text-momentizing-slate">Informasi teknis dan keamanan</h4>
        <List
          items={[
            "Alamat jaringan (IP) dan detail dasar permintaan Anda, untuk menjaga keamanan layanan serta membatasi penyalahgunaan, bot, dan pemesanan palsu. Jika kami menyimpannya sebagai catatan, alamat tersebut disimpan dalam bentuk hash.",
            "Pesan di WhatsApp: saat Anda mengirimkan kode verifikasi, kami menerima nomor dan isi pesan Anda. Penggunaan WhatsApp oleh Anda juga tunduk pada ketentuan dan pemberitahuan privasi WhatsApp sendiri.",
          ]}
        />
        <p>
          Kami tidak menggunakan pelacak iklan atau analitik pihak ketiga di situs web ini, dan kami tidak menjual data
          pribadi Anda.
        </p>
      </Section>

      <Section title="3. Dasar hukum kami">
        <p>
          Kami menggunakan data Anda untuk menjalankan layanan yang Anda minta (pemesanan atau akun Anda), karena Anda telah
          memberikan persetujuan (misalnya, untuk informasi sensitif seperti jawaban terkait kesehatan, dan untuk berbagi
          dengan spesialis Anda), untuk memenuhi kewajiban hukum kami (seperti catatan pajak dan akuntansi, serta kewajiban
          keselamatan), dan untuk kepentingan sah kami dalam menjalankan layanan yang aman, andal, dan mencegah
          penyalahgunaan. Anda dapat menarik persetujuan kapan saja. Hal ini tidak memengaruhi apa yang telah kami lakukan
          sebelumnya, dan dapat berarti kami tidak dapat melanjutkan sebagian layanan.
        </p>
      </Section>

      <Section title="4. Apa yang tersimpan di browser Anda">
        <p>
          Kami tidak memasang cookie sendiri, dan tidak menggunakan cookie iklan atau analitik. Kami menggunakan
          penyimpanan bawaan browser Anda dengan dua cara:
        </p>
        <List
          items={[
            <>
              <strong className="text-momentizing-slate">Favorit yang disimpan</strong> (spesialis yang Anda tandai) hanya
              disimpan di perangkat Anda, sampai Anda menghapusnya.
            </>,
            <>
              <strong className="text-momentizing-slate">Pemesanan yang sedang berlangsung</strong> (draf jawaban Anda,
              termasuk nama dan nomor WhatsApp, serta pemesanan yang baru Anda buat) hanya disimpan untuk tab browser
              tersebut, sehingga tetap ada saat halaman dimuat ulang atau saat Anda bolak-balik ke WhatsApp. Kami menghapus
              draf Anda setelah pemesanan dibuat, dan menutup tab akan menghapus sisanya.
            </>,
          ]}
        />
        <p>Situs ini tetap berfungsi jika Anda memblokir penyimpanan ini.</p>
        <p>
          Beberapa fitur memuat konten dari perusahaan lain, yang kemudian menerima alamat jaringan (IP) dan detail
          browser Anda serta dapat menggunakan penyimpanan sendiri sesuai kebijakan mereka:
        </p>
        <List
          items={[
            "Cloudflare Turnstile, pada formulir pemesanan, untuk membedakan manusia dari bot.",
            "YouTube (mode privasi yang ditingkatkan) atau Vimeo, hanya pada halaman acara yang memiliki video promosi, dan hanya saat video ditampilkan.",
            "Google Maps, hanya jika Anda mengetuk tautan peta atau petunjuk arah.",
          ]}
        />
      </Section>

      <Section title="5. Siapa yang dapat melihat informasi Anda">
        <List
          items={[
            <>
              <strong className="text-momentizing-slate">Spesialis Anda</strong> melihat nama, kontak, dan detail
              pemesanan untuk sesi bersamanya. Di aplikasi, mereka hanya melihat informasi terkait kesehatan (seperti
              suasana hati atau catatan jurnal) untuk kategori yang Anda pilih untuk dibagikan. Setiap kategori memiliki
              tombolnya sendiri, dan Anda dapat mematikannya kapan saja. Akses mereka ke informasi Anda dicatat.
            </>,
            <>
              <strong className="text-momentizing-slate">Staf Momentizing</strong> (administrator dan asisten penjadwalan)
              melihat apa yang mereka perlukan untuk menjalankan pemesanan dan mendukung Anda: kontak, status pemesanan dan
              pembayaran, jawaban Anda atas pertanyaan singkat pemesanan, serta catatan tindak lanjut. Asisten tidak memiliki
              akses ke informasi klinis. Teks jurnal dienkripsi, dan staf tidak dapat membacanya.
            </>,
            <>
              <strong className="text-momentizing-slate">Penyedia layanan</strong> yang memproses data untuk kami
              berdasarkan perjanjian yang membatasi penggunaannya: pesan WhatsApp melalui Twilio; penyimpanan dan pengiriman
              cloud untuk dokumen seperti CV dan faktur (Amazon Web Services); penyedia pembayaran untuk isi ulang dompet dan
              pembayaran (Xendit); pengiriman email; notifikasi push (Google Firebase); perlindungan bot (Cloudflare
              Turnstile); serta hosting situs web dan aplikasi. Mereka hanya menerima apa yang diperlukan untuk tugasnya.
            </>,
            <>
              <strong className="text-momentizing-slate">Pihak berwenang atau pihak lain</strong> jika diwajibkan oleh
              hukum, atau jika ada risiko serius dan segera terhadap keselamatan seseorang. Kami hanya membagikan yang
              diperlukan.
            </>,
          ]}
        />
        <p>Kami tidak pernah menjual data pribadi Anda, dan tidak pernah menggunakannya untuk iklan.</p>
      </Section>

      <Section title="6. Di mana data Anda diproses">
        <p>
          Penyedia kami (termasuk Twilio, Amazon Web Services, Google Firebase, Cloudflare, dan Xendit) dapat memproses data di Indonesia dan di negara lain, termasuk Singapura, Amerika Serikat, dan Uni Eropa. Saat data Anda keluar dari negara Anda, kami
          mengambil langkah untuk memastikan data tetap terlindungi dengan standar yang setidaknya setara dengan kebijakan
          ini (misalnya, melalui perlindungan kontraktual).
        </p>
      </Section>

      <Section title="7. Berapa lama kami menyimpannya">
        <List
          items={[
            "Penahanan pemesanan yang tidak dikonfirmasi berakhir setelah 30 menit dan waktunya dibuka kembali. Catatan dasar atas percobaan tersebut dapat disimpan sebentar demi keamanan.",
            "Catatan pemesanan, sesi, faktur, dan pembayaran disimpan selama kami memerlukannya untuk memberikan layanan dan memenuhi kewajiban hukum, pajak, dan akuntansi.",
            "Lamaran kerja dan CV disimpan hingga 12 bulan, lalu dihapus. Jika Anda diterima, data Anda dipindahkan ke profil spesialis Anda.",
            "Saat akun dinonaktifkan atau Anda meminta penghapusan, kami menghapus permanen jurnal, catatan suasana hati, tugas, penanda, dan berkas unggahan Anda setelah 30 hari, dan menganonimkan catatan akun Anda. Sebagian catatan, seperti faktur dan log audit, disimpan selama diwajibkan oleh hukum.",
            "Log keamanan dan audit disimpan selama diperlukan untuk melindungi layanan dan memenuhi kewajiban hukum.",
          ]}
        />
      </Section>

      <Section title="8. Cara kami melindunginya">
        <p>
          Kami menggunakan enkripsi saat transit (HTTPS) dan mengenkripsi catatan jurnal saat disimpan. Kata sandi hanya
          disimpan dalam bentuk hash. Akses dibatasi berdasarkan peran, dan akses spesialis ke informasi klien dicatat.
          Pemesanan dilindungi dari bot dan peniruan identitas, termasuk dengan memverifikasi nomor WhatsApp Anda. Tidak ada
          sistem yang sepenuhnya aman. Jika terjadi kebocoran yang kemungkinan merugikan Anda, kami akan memberi tahu Anda,
          dan pihak berwenang bila diwajibkan, secara tertulis dan paling lambat 3 x 24 jam sejak kami mengetahuinya, sebagaimana diwajibkan hukum Indonesia.
        </p>
      </Section>

      <Section title="9. Hak Anda">
        <p>Sesuai hukum yang berlaku bagi Anda, Anda dapat meminta kami untuk:</p>
        <List
          items={[
            "memberi tahu data pribadi apa yang kami simpan tentang Anda dan memberikan salinannya (pemilik akun juga dapat mengekspor datanya di aplikasi);",
            "memperbaiki data yang salah atau sudah tidak berlaku;",
            "menghapus data Anda, atau membatasi cara kami menggunakannya;",
            "berhenti menggunakan data Anda jika kami mengandalkan persetujuan atau kepentingan sah kami, dan menarik persetujuan yang pernah Anda berikan;",
            "memindahkan data Anda ke layanan lain jika memungkinkan; dan",
            "menyampaikan keberatan atas cara proses otomatis, seperti pencocokan spesialis, memperlakukan Anda, dan meminta peninjauan oleh manusia.",
          ]}
        />
        <p>
          Untuk menggunakan hak-hak ini, hubungi <Contact />. Kami mungkin perlu memastikan bahwa itu benar-benar Anda
          (misalnya, dengan mengirim kode ke nomor WhatsApp Anda) dan akan menjawab dalam batas waktu yang ditetapkan hukum,
          biasanya dalam 30 hari. Jika Anda tidak puas, Anda dapat mengajukan keluhan kepada otoritas pelindungan data di
          negara Anda.
        </p>
      </Section>

      <Section title="10. Anak-anak">
        <p>
          Momentizing diperuntukkan bagi orang berusia 18 tahun ke atas. Jika Anda memberi tahu kami bahwa Anda berusia di
          bawah 18 tahun, kami tidak dapat memproses pemesanan Anda, dan jika kami mengetahui bahwa kami menyimpan data anak
          tanpa persetujuan orang tua atau wali, kami akan menghapusnya. Jika menurut Anda hal ini mungkin terjadi, mohon
          hubungi kami.
        </p>
      </Section>

      <Section title="11. Jika Anda sedang dalam kesulitan">
        <p>
          Jika jawaban pemesanan, pesan, atau catatan jurnal menunjukkan bahwa Anda mungkin tidak aman, kami menampilkan
          sumber bantuan krisis. Ini dilakukan secara otomatis, bukan penilaian klinis, dan tidak membagikan informasi Anda
          kepada siapa pun. Jika Anda membutuhkan bantuan sekarang, kunjungi{" "}
          <a href={withBase("/help/")} className={linkClass}>
            halaman Sumber Bantuan Krisis
          </a>{" "}
          kami atau hubungi nomor darurat setempat.
        </p>
      </Section>

      <Section title="12. Perubahan kebijakan ini">
        <p>
          Kami akan memperbarui kebijakan ini saat praktik kami berubah. Tanggal berlaku di bagian atas menunjukkan versi
          terkini, dan kami akan memberitahukan perubahan penting lebih dahulu di situs web, lewat WhatsApp, atau email.
        </p>
      </Section>

      <Section title="13. Kontak">
        <p>
          Ada pertanyaan, permintaan, atau keluhan tentang privasi Anda? Tulis kepada kami di <Contact />.
        </p>
      </Section>
    </div>
  );
}
