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

    // === ▼▼▼ LOGIKA EMOJI BARU (EMOJI-BUTTON) ▼▼▼ ===
    const tombolEmoji = document.getElementById('tombolEmoji');
    const isiPesanTextarea = document.getElementById('isiPesan');

    if (tombolEmoji && isiPesanTextarea && window.EmojiButton) {
        
        const picker = new EmojiButton({
            position: 'bottom-end',
            autoHide: false // Biar tidak langsung hilang
        });

        // 1. Saat tombol emoji diklik, tampilkan picker
        tombolEmoji.addEventListener('click', () => {
            picker.togglePicker(tombolEmoji);
        });

        // 2. Saat emoji dipilih
        picker.on('emoji', selection => {
            const emoji = selection.emoji;
            const start = isiPesanTextarea.selectionStart;
            const end = isiPesanTextarea.selectionEnd;
            const text = isiPesanTextarea.value;
            
            isiPesanTextarea.value = text.substring(0, start) + emoji + text.substring(end);
            
            isiPesanTextarea.selectionStart = isiPesanTextarea.selectionEnd = start + emoji.length;
            isiPesanTextarea.focus();
        });

        // Sembunyikan picker jika klik di luar textarea/tombol
        document.addEventListener('click', (e) => {
            if (e.target !== tombolEmoji && !isiPesanTextarea.contains(e.target)) {
                picker.hidePicker();
            }
        });

    } else if (tombolEmoji) {
        tombolEmoji.style.display = 'none'; // Sembunyikan jika library gagal load
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

// Fungsi helper btoa/atob (sumber masalah) sudah DIHAPUS.

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
    
    // === ▼▼▼ PERBAIKAN ENKRIPSI (JAUH LEBIH SEDERHANA & AMAN EMOJI) ▼▼▼ ===
    // Tidak perlu Base64. Cukup encode untuk URL.
    const encodedData = encodeURIComponent(jsonString);
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
        // === ▼▼▼ PERBAIKAN DEKRIPSI (JAUH LEBIH SEDERHANA & AMAN EMOJI) ▼▼▼ ===
        const decodedString = decodeURIComponent(dataHash);
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
