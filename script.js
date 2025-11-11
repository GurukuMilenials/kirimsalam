document.addEventListener('DOMContentLoaded', function() {
    
    // Feather icons akan jalan di semua halaman
    feather.replace();

    const spanTahun = document.getElementById('tahun');
    if (spanTahun) {
        spanTahun.textContent = new Date().getFullYear();
    }

    // --- LOGIKA UNTUK index.html ---
    const tombolBuat = document.getElementById('tombolBuat');
    if (tombolBuat) {
        tombolBuat.addEventListener('click', buatLinkSalam);
    }

    const tombolCopy = document.getElementById('tombolCopy');
    if (tombolCopy) {
        tombolCopy.addEventListener('click', salinKeClipboard);
    }

    const tombolEmoji = document.getElementById('tombolEmoji');
    const isiPesanTextarea = document.getElementById('isiPesan');
    const emojiTray = document.getElementById('emojiTray');
    
    if (tombolEmoji && isiPesanTextarea && emojiTray) {
        const API_KEY = "837e03e18940e8ba6d769ebeb8a3b97a31eb6d47";
        
        tombolEmoji.addEventListener('click', () => {
            const isVisible = emojiTray.style.display === 'flex';
            emojiTray.style.display = isVisible ? 'none' : 'flex';
        });

        async function loadEmojis() {
            try {
                const response = await fetch(`https://emoji-api.com/emojis?category=smileys-emotion&access_key=${API_KEY}`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const emojis = await response.json();
                emojiTray.innerHTML = '';
                emojis.slice(0, 24).forEach(emoji => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'emoji-tray-button';
                    btn.textContent = emoji.character;
                    btn.title = emoji.unicodeName;
                    btn.addEventListener('click', () => insertEmoji(emoji.character));
                    emojiTray.appendChild(btn);
                });
            } catch (error) {
                console.error("Error fetching emojis:", error);
                emojiTray.innerHTML = `<small>Gagal memuat emoji. Error: ${error.message}</small>`;
                emojiTray.style.display = 'flex';
            }
        }
        
        loadEmojis();

        function insertEmoji(emoji) {
            const start = isiPesanTextarea.selectionStart;
            const end = isiPesanTextarea.selectionEnd;
            const text = isiPesanTextarea.value;
            isiPesanTextarea.value = text.substring(0, start) + emoji + text.substring(end);
            isiPesanTextarea.selectionStart = isiPesanTextarea.selectionEnd = start + emoji.length;
            isiPesanTextarea.focus();
        }
    }

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

    // --- LOGIKA UNTUK salam.html ---
    if (document.body.contains(document.getElementById('targetPenerima'))) {
        
        // 1. Tampilkan data (fungsi lama, tapi penting)
        tampilkanSalam();

        // 2. ▼▼▼ LOGIKA BARU UNTUK TILT ▼▼▼
        // Kita inisialisasi pada elemen .kartu-salam
        if (window.VanillaTilt) {
            VanillaTilt.init(document.querySelector(".kartu-salam"), {
                max: 15,
                speed: 400,
                perspective: 1000,
            });
        }

        // 3. ▼▼▼ LOGIKA BARU UNTUK CONFETTI ▼▼▼
        // Kita delay 3.5 detik (3500ms) agar confetti muncul setelah animasi kartu selesai
        setTimeout(() => {
            const confettiCanvas = document.createElement('canvas');
            confettiCanvas.style.position = 'fixed';
            confettiCanvas.style.top = '0';
            confettiCanvas.style.left = '0';
            confettiCanvas.style.width = '100%';
            confettiCanvas.style.height = '100%';
            confettiCanvas.style.zIndex = '100';
            confettiCanvas.style.pointerEvents = 'none';
            document.body.appendChild(confettiCanvas);

            const confettiSettings = { target: confettiCanvas, max: 150 };
            const confetti = new ConfettiGenerator(confettiSettings);
            confetti.render();

            // Hentikan confetti setelah 5 detik
            setTimeout(() => {
                confetti.clear();
                document.body.removeChild(confettiCanvas);
            }, 5000);

        }, 3500); // 3.5 detik delay, sesuaikan dengan delay CSS 'flipIn' Anda

        // 4. ▼▼▼ LOGIKA BARU UNTUK TOMBOL SUKA ▼▼▼
        const tombolSuka = document.getElementById('tombolSuka');
        if (tombolSuka) {
            tombolSuka.addEventListener('click', function() {
                // Toggle class 'liked'
                tombolSuka.classList.toggle('liked');
                
                // Ganti ikonnya (opsional, tapi keren)
                const icon = tombolSuka.querySelector('i');
                if (tombolSuka.classList.contains('liked')) {
                    icon.innerHTML = feather.icons['heart'].toSvg({ fill: '#ff6b6b' });
                } else {
                    icon.innerHTML = feather.icons['heart'].toSvg();
                }
            });
        }
    }

});

// --- FUNGSI GLOBAL (Tidak Berubah) ---

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
    
    let encodedData;
    try {
        encodedData = encodeURIComponent(jsonString);
    } catch (error) {
        console.error("Gagal encode:", error);
        alert("Gagal membuat link, karakter tidak didukung.");
        return;
    }

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
        const decodedString = decodeURIComponent(dataHash);
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
