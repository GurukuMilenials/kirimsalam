// Kita gunakan 'defer' di HTML, jadi kita bisa pastikan dokumen sudah siap
// Kita cek ada di halaman mana kita sekarang

// ===== LOGIKA UNTUK index.html (HALAMAN PEMBUAT) =====
const tombolBuat = document.getElementById('tombolBuat');

if (tombolBuat) {
    // Jika tombolBuat ada, berarti kita di index.html
    tombolBuat.addEventListener('click', function() {
        // 1. Ambil semua data dari form
        const penerima = document.getElementById('namaPenerima').value;
        const pesan = document.getElementById('isiPesan').value;
        const pengirim = document.getElementById('namaPengirim').value;

        // Validasi sederhana
        if (!penerima || !pesan || !pengirim) {
            alert('Semua field harus diisi ya!');
            return;
        }

        // 2. Kumpulkan data jadi satu objek
        const dataSalam = {
            untuk: penerima,
            pesan: pesan,
            dari: pengirim
        };

        // 3. Ubah objek jadi teks JSON, lalu enkripsi ke Base64 (ini 'sihir'-nya)
        const jsonString = JSON.stringify(dataSalam);
        const encodedData = btoa(jsonString); // btoa = Binary to ASCII

        // 4. Buat URL final
        // location.origin akan mengambil "http://alamat-web-kamu.com"
        // location.pathname.replace(...) akan memastikan kita di folder yang benar
        const baseUrl = window.location.href.replace('index.html', '');
        const finalUrl = `${baseUrl}salam.html?data=${encodedData}`;

        // 5. Tampilkan hasilnya
        document.getElementById('linkFinal').value = finalUrl;
        document.getElementById('hasilLink').style.display = 'block';
    });
}


// ===== LOGIKA UNTUK salam.html (HALAMAN PENERIMA) =====
const targetPenerima = document.getElementById('targetPenerima');

if (targetPenerima) {
    // Jika targetPenerima ada, berarti kita di salam.html
    
    // Fungsi untuk membaca data dari URL
    function tampilkanSalam() {
        // 1. Ambil parameter 'data' dari URL
        const params = new URLSearchParams(window.location.search);
        const data = params.get('data');

        if (!data) {
            // Jika tidak ada data, tampilkan error
            targetPenerima.textContent = "Oops!";
            document.getElementById('targetPesan').textContent = "Link salam ini sepertinya rusak atau tidak lengkap.";
            document.getElementById('targetPengirim').textContent = "Coba minta link yang baru.";
            return;
        }

        try {
            // 2. Decode data Base64 kembali jadi JSON string
            const decodedString = atob(data); // atob = ASCII to Binary
            
            // 3. Ubah JSON string kembali jadi objek
            const dataSalam = JSON.parse(decodedString);

            // 4. Masukkan data ke dalam halaman!
            targetPenerima.textContent = dataSalam.untuk;
            document.getElementById('targetPesan').textContent = `"${dataSalam.pesan}"`;
            document.getElementById('targetPengirim').textContent = dataSalam.dari;

            // Di sinilah Anda bisa memicu animasi!
            // (Kita sudah memicunya dengan CSS, tapi bisa juga dengan JS)
            console.log('Salam berhasil ditampilkan!');

        } catch (error) {
            // Jika data-nya rusak (bukan Base64 atau JSON yang valid)
            console.error('Gagal parse data:', error);
            targetPenerima.textContent = "Oops!";
            document.getElementById('targetPesan').textContent = "Data salam ini sepertinya korup.";
            document.getElementById('targetPengirim').textContent = "Tidak bisa membaca pesan.";
        }
    }

    // Langsung jalankan fungsinya saat halaman dimuat
    tampilkanSalam();
}
