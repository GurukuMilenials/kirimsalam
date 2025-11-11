document.addEventListener('DOMContentLoaded', function() {
    
    feather.replace();

    const spanTahun = document.getElementById('tahun');
    if (spanTahun) {
        spanTahun.textContent = new Date().getFullYear();
    }

    const tombolBuat = document.getElementById('tombolBuat');
    if (tombolBuat) {
        tombolBuat.addEventListener('click', buatLinkSalam);
    }

    const tombolCopy = document.getElementById('tombolCopy');
    if (tombolCopy) {
        tombolCopy.addEventListener('click', salinKeClipboard);
    }

    if (document.body.contains(document.getElementById('targetPenerima'))) {
        tampilkanSalam();
    }

    // === ▼▼▼ LOGIKA EMOJI BARU (DIGANTI TOTAL) ▼▼▼ ===
    const tombolEmoji = document.getElementById('tombolEmoji');
    const isiPesanTextarea = document.getElementById('isiPesan');

    if (tombolEmoji && isiPesanTextarea && typeof EmojiPicker === 'function') {
        const picker = new EmojiPicker({
            // Opsi untuk library vanilla-emoji-picker
            // Kita bisa tambahkan kustomisasi di sini jika perlu
        });

        // 1. Tampilkan picker saat tombol diklik
        tombolEmoji.addEventListener('click', () => {
            picker.togglePicker(tombolEmoji);
        });

        // 2. Saat emoji dipilih, masukkan ke textarea
        picker.on('emoji', emoji => {
            const start = isiPesanTextarea.selectionStart;
            const end = isiPesanTextarea.selectionEnd;
            const text = isiPesanTextarea.value;
            
            isiPesanTextarea.value = text.substring(0, start) + emoji + text.substring(end);
            
            isiPesanTextarea.selectionStart = isiPesanTextarea.selectionEnd = start + emoji.length;
            isiPesanTextarea.focus();
        });
        
    } else if (tombolEmoji) {
        // Sembunyikan tombol jika library gagal load
        tombolEmoji.style.display = 'none';
    }
    // === ▲▲▲ AKHIR LOGIKA EMOJI BARU ▲▲▲ ===


    const tombolShare = document.getElementById('tombolShare');
    
    if (tombolShare && navigator.share) {
        tombolShare.style.display = 'flex';
        
        tombolShare.addEventListener('click', async () => {
            const shareUrl = document.getElementById('linkFinal').value;
            if (!shareUrl) {
                alert('Buat link dulu baru bisa dibagikan!');
                return;
            }

            try {
                await navigator.share({
                    title: 'Kamu Dapat Salam!',
                    text: 'Cek salam yang dibuat khusus untukmu di sini:',
                    url: shareUrl
                });
            } catch (err) {
                console.warn('Gagal membagikan:', err.message);
            }
        });
    }

});

// === ▼▼▼ FUNGSI HELPER BARU (PENTING) ▼▼▼ ===
// Fungsi ini mengubah string UTF-8 (termasuk emoji) ke Base64
function encodeSafe(str) {
    try {
        return btoa(encodeURIComponent(str));
    } catch (e) {
        console.error('encodeSafe error:', e);
        return null;
    }
}

// Fungsi ini mengubah Base64 kembali ke string UTF-8
function decodeSafe(str) {
    try {
        return decodeURIComponent(atob(str));
    } catch (e) {
        console.error('decodeSafe error:', e);
        return null;
    }
}
// === ▲▲▲ AKHIR FUNGSI HELPER BARU ▲▲▲ ===


function buatLinkSalam() {
    const penerima = document.getElementById('namaPenerima').value;
    const pesan = document.getElementById('isiPesan').value;
    const pengirim = document.getElementById('namaPengirim').value;

    if (!penerima || !pesan || !pengirim) {
        alert('Semua field harus diisi ya!');
        return;
    }

    const dataSalam = {
        u: penerima,
        p: pesan,
        d: pengirim
    };

    const jsonString = JSON.stringify(dataSalam);
    
    // === ▼▼▼ PERBAIKAN ENKRIPSI (DIUPDATE) ▼▼▼ ===
    const encodedData = encodeSafe(jsonString);
    if (!encodedData) {
        alert('Terjadi kesalahan saat membuat link. Coba kurangi emoji atau karakter spesial.');
        return;
    }
    // === ▲▲▲ AKHIR PERBAIKAN ENKRIPSI ▲▲▲ ===

    const baseUrl = window.location.href.split('?')[0].replace('index.html', '');
    const finalUrl = `${baseUrl}salam.html#${encodedData}`;

    document.getElementById('linkFinal').value = finalUrl;
    document.getElementById('hasilLink').style.display = 'block';
}

function salinKeClipboard() {
    const linkInput = document.getElementById('linkFinal');
    const copyText = document.getElementById('copyText');

    if (!linkInput.value) return; 

    linkInput.select();
    linkInput.setSelectionRange(0, 99999);

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(linkInput.value).then(() => {
            copyText.textContent = 'Tersalin!';
            setTimeout(() => { copyText.textContent = 'Salin'; }, 2000);
        }).catch(err => {
            legacyCopy(linkInput, copyText);
        });
    } else {
        legacyCopy(linkInput, copyText);
    }
}

function legacyCopy(inputElement, textElement) {
    try {
        document.execCommand('copy');
        textElement.textContent = 'Tersalin!';
        setTimeout(() => { textElement.textContent = 'Salin'; }, 2000);
    } catch (err) {
        alert('Gagal menyalin link. Mohon salin secara manual.');
    }
}

function tampilkanSalam() {
    const dataHash = window.location.hash.substring(1);

    if (!dataHash) {
        tampilkanErrorSalam("Link salam ini sepertinya kosong.");
        return;
    }

    try {
        // === ▼▼▼ PERBAIKAN DEKRIPSI (DIUPDATE) ▼▼▼ ===
        const decodedString = decodeSafe(dataHash);
        if (!decodedString) throw new Error('Data korup');
        // === ▲▲▲ AKHIR PERBAIKAN DEKRIPSI ▲▲▲ ===

        const dataSalam = JSON.parse(decodedString);

        if (!dataSalam.u || !dataSalam.p || !dataSalam.d) {
            throw new Error('Data tidak lengkap');
        }

        document.getElementById('targetPenerima').textContent = dataSalam.u;
        document.getElementById('targetPesan').textContent = `"${dataSalam.p}"`;
        document.getElementById('targetPengirim').textContent = dataSalam.d;
        
    } catch (error) {
        console.error('Gagal parse data:', error.message);
        tampilkanErrorSalam("Link salam ini sepertinya rusak atau tidak valid.");
    }
}

function tampilkanErrorSalam(pesan) {
    document.getElementById('targetPenerima').textContent = "Oops! 😭";
    document.getElementById('targetPesan').textContent = pesan;
    document.getElementById('targetPengirim').textContent = "kirimsalamID";
}
