// ============================================
// SISTEMA DE FACTURACIÓN - LIBRERÍA "EL SABIO"
// Inventario basado en CSV 2026-05-02
// ============================================

const mockDatabase = {
    books: [
        { isbn: "9788437604947", title: "Cien años de soledad", author: "Gabriel García Márquez", price: 15.99, stock: 5 },
        { isbn: "9788408045391", title: "El Alquimista", author: "Paulo Coelho", price: 12.50, stock: 3 },
        { isbn: "9789878220062", title: "Hábitos Atómicas", author: "James Clear", price: 18.69, stock: 1 },
        { isbn: "9789876053310", title: "Oratoria Dinámica DMG", author: "Daniel Mongelli", price: 9.99, stock: 1 },
        { isbn: "9789501531916", title: "Las Causalidades No Existen", author: "Borrar Vilaseca", price: 20.05, stock: 1 },
        { isbn: "9789504923817", title: "Confianza Total", author: "Verónica De Andres", price: 18.60, stock: 1 },
        { isbn: "9789877479904", title: "Inteligencia Asertiva", author: "Javiera De La Plaza", price: 8.99, stock: 1 },
        { isbn: "9789872659929", title: "La Paradoja", author: "James C. Hunter", price: 7.99, stock: 1 }
    ]
};

let cart = [];
let html5QrCode;
let isScannerActive = false;
const TAX_RATE = 21;

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadCartFromLocalStorage();
});

function initializeApp() {
    document.getElementById('toggleScanner').addEventListener('click', toggleScanner);
    document.getElementById('searchManual').addEventListener('click', searchManualISBN);
    document.getElementById('generateInvoice').addEventListener('click', generateInvoice);
    document.getElementById('isbnInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchManualISBN();
    });

    html5QrCode = new Html5Qrcode("reader");
    updateTotalsVisibility();
}

function toggleScanner() {
    const scannerBtn = document.getElementById('toggleScanner');
    const readerElement = document.getElementById('reader');

    if (isScannerActive) {
        stopScanner();
        scannerBtn.innerHTML = '<i class="fas fa-camera mr-2"></i>Activar Escáner';
        scannerBtn.classList.remove('active');
        readerElement.classList.add('hidden');
    } else {
        startScanner();
        scannerBtn.innerHTML = '<i class="fas fa-stop mr-2"></i>Detener Escáner';
        scannerBtn.classList.add('active');
        readerElement.classList.remove('hidden');
    }
}

async function startScanner() {
    // Verificar contexto seguro (cámara requiere HTTPS o localhost)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        showNotification('La cámara solo funciona en un servidor seguro (https://) o en localhost. Usá un servidor local.', 'error');
        document.getElementById('toggleScanner').click();
        return;
    }

    try {
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.777777778,
            // Especificar formatos de código de barras permitidos
            formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8
            ]
        };

        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanError
        );
        isScannerActive = true;
        showNotification('Escáner activado. Apunta al código de barras.', 'success');
    } catch (error) {
        console.error('Error al iniciar el escáner:', error);
        showNotification('No se pudo acceder a la cámara. Revisá los permisos y que estés en un contexto seguro.', 'error');
        document.getElementById('toggleScanner').click();
    }
}

async function stopScanner() {
    try {
        if (html5QrCode && isScannerActive) {
            await html5QrCode.stop();
            isScannerActive = false;
        }
    } catch (error) {
        console.error('Error al detener escáner:', error);
    }
}

function onScanSuccess(decodedText) {
    stopScanner();
    processISBN(decodedText);
    document.getElementById('toggleScanner').click();
}

function onScanError(error) {
    console.warn('Error de escaneo (no te preocupes):', error);
}

// ... (el resto de funciones se mantienen exactamente igual que en la versión anterior) ...
// Dejo aquí las funciones clave sin repetir las que ya estaban completas.
