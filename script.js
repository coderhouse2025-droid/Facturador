// ============================================
// SISTEMA DE FACTURACIÓN - LIBRERÍA "EL SABIO"
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
    // Asegurarse de que la sección de totales esté oculta al inicio
    updateTotalsVisibility();
});

function initializeApp() {
    document.getElementById('toggleScanner').addEventListener('click', toggleScanner);
    document.getElementById('searchManual').addEventListener('click', searchManualISBN);
    document.getElementById('generateInvoice').addEventListener('click', generateInvoice);
    document.getElementById('isbnInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchManualISBN();
    });
    html5QrCode = new Html5Qrcode("reader");
}

// ========== ESCÁNER ==========
function toggleScanner() {
    const scannerBtn = document.getElementById('toggleScanner');
    const readerElement = document.getElementById('reader');

    if (isScannerActive) {
        stopScanner();
        scannerBtn.innerHTML = '<i class="fas fa-camera mr-2"></i>Activar Escáner';
        scannerBtn.classList.remove('active');
        readerElement.classList.add('hidden');
    } else {
        // Verificar contexto seguro
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            showNotification('🚫 La cámara requiere conexión segura. Abrí esta app desde "http://localhost" o GitHub Pages.', 'error');
            return;
        }
        startScanner();
        scannerBtn.innerHTML = '<i class="fas fa-stop mr-2"></i>Detener Escáner';
        scannerBtn.classList.add('active');
        readerElement.classList.remove('hidden');
    }
}

async function startScanner() {
    try {
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.777,
            // Solo códigos de barras EAN
            formatsToSupport: [ Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8 ]
        };
        await html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, onScanError);
        isScannerActive = true;
        showNotification('📷 Escáner activo. Apuntá al código de barras.', 'success');
    } catch (error) {
        console.error(error);
        showNotification('❌ No se pudo acceder a la cámara. ¿Diste permiso? ¿Estás en un contexto seguro?', 'error');
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
    processISBN(decodedText.trim());
    document.getElementById('toggleScanner').click(); // volver botón a estado inicial
}

function onScanError(error) {
    // No molestar al usuario con errores continuos de enfoque
    // console.warn('Escaneo en progreso...', error);
}

// ========== BÚSQUEDA MANUAL ==========
function searchManualISBN() {
    const input = document.getElementById('isbnInput');
    const isbn = input.value.trim();
    if (!isbn) {
        showNotification('⚠️ Escribí un ISBN antes de buscar.', 'warning');
        return;
    }
    processISBN(isbn);
    input.value = ''; // limpiar
}

function processISBN(rawIsbn) {
    // Limpiar guiones y espacios
    const cleanISBN = rawIsbn.replace(/[-\s]/g, '');
    console.log('Buscando ISBN:', cleanISBN);
    const book = mockDatabase.books.find(b => b.isbn === cleanISBN);

    if (book) {
        addToCart(book);
        showNotification(`✅ "${book.title}" añadido al carrito.`, 'success');
    } else {
        showNotification('❌ Producto no encontrado en la base de datos.', 'error');
    }
}

// ========== CARRITO ==========
function addToCart(book) {
    const alreadyInCart = cart.find(item => item.isbn === book.isbn);
    if (alreadyInCart) {
        showNotification('⚠️ Ese libro ya está en el carrito.', 'warning');
        return;
    }
    cart.push({ ...book, quantity: 1 });
    updateCart();
    saveCartToLocalStorage();
}

function removeFromCart(isbn) {
    cart = cart.filter(item => item.isbn !== isbn);
    updateCart();
    saveCartToLocalStorage();
    showNotification('🗑️ Libro eliminado.', 'success');
}

function updateCart() {
    const cartBody = document.getElementById('cartBody');
    const emptyCart = document.getElementById('emptyCart');
    cartBody.innerHTML = '';

    if (cart.length === 0) {
        emptyCart.classList.remove('hidden');
        updateTotalsVisibility();
        return;
    }

    emptyCart.classList.add('hidden');
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-3 text-sm">${item.isbn}</td>
            <td class="px-4 py-3 text-sm font-medium">${item.title}</td>
            <td class="px-4 py-3 text-sm text-gray-600">${item.author}</td>
            <td class="px-4 py-3 text-sm text-right font-semibold">$${item.price.toFixed(2)}</td>
            <td class="px-4 py-3 text-center">
                <button onclick="removeFromCart('${item.isbn}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        cartBody.appendChild(row);
    });

    updateTotals();
    updateTotalsVisibility();
}

function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * (TAX_RATE / 100);
    const total = subtotal + tax;
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function updateTotalsVisibility() {
    const totalsSection = document.getElementById('totalsSection');
    if (cart.length > 0) {
        totalsSection.classList.remove('hidden');
    } else {
        totalsSection.classList.add('hidden');
    }
}

// ========== FACTURA PDF ==========
function generateInvoice() {
    if (cart.length === 0) {
        showNotification('⚠️ El carrito está vacío.', 'warning');
        return;
    }
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const totals = {
            subtotal: cart.reduce((s, i) => s + i.price * i.quantity, 0),
            tax: cart.reduce((s, i) => s + i.price * i.quantity, 0) * (TAX_RATE/100),
            total: cart.reduce((s, i) => s + i.price * i.quantity, 0) * (1 + TAX_RATE/100)
        };
        const invoiceNumber = 'FAC-' + Math.floor(Math.random()*10000).toString().padStart(4,'0');
        const invoiceDate = new Date().toLocaleDateString('es-AR');

        doc.setFillColor(37,99,235);
        doc.rect(0,0,210,40,'F');
        doc.setTextColor(255,255,255);
        doc.setFontSize(22);
        doc.text('Librería El Sabio', 14, 25);
        doc.setFontSize(8);
        doc.text('Calle del Conocimiento 123, Buenos Aires', 14, 33);

        doc.setTextColor(0,0,0);
        doc.setFontSize(10);
        doc.text('FACTURA', 170, 50, { align:'right' });
        doc.text(`Nº ${invoiceNumber}`, 170, 57, { align:'right' });
        doc.text(`Fecha: ${invoiceDate}`, 170, 64, { align:'right' });
        doc.text('Cliente: Consumidor Final', 14, 62);

        const body = cart.map(item => [
            item.isbn,
            item.title,
            item.author,
            `$${item.price.toFixed(2)}`,
            `$${(item.price*item.quantity).toFixed(2)}`
        ]);

        doc.autoTable({
            startY: 80,
            head: [['ISBN','Descripción','Autor','Precio','Importe']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [37,99,235], textColor: 255 },
            columnStyles: {
                0: { cellWidth: 35 },
                1: { cellWidth: 50 },
                2: { cellWidth: 35 },
                3: { cellWidth: 25, halign:'right' },
                4: { cellWidth: 25, halign:'right' }
            }
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.line(120, finalY, 190, finalY);
        doc.text('Subtotal:', 120, finalY+8);
        doc.text(`$${totals.subtotal.toFixed(2)}`, 190, finalY+8, { align:'right' });
        doc.text(`IVA (21%):`, 120, finalY+16);
        doc.text(`$${totals.tax.toFixed(2)}`, 190, finalY+16, { align:'right' });
        doc.setFontSize(12);
        doc.setFont('helvetica','bold');
        doc.text('TOTAL:', 120, finalY+26);
        doc.setFillColor(37,99,235);
        doc.rect(150, finalY+19, 40, 10, 'F');
        doc.setTextColor(255,255,255);
        doc.text(`$${totals.total.toFixed(2)}`, 190, finalY+26, { align:'right' });

        doc.save(`factura_${invoiceNumber}_${invoiceDate.replace(/\//g,'-')}.pdf`);
        showNotification('📄 Factura generada. Limpiando carrito...', 'success');
        setTimeout(() => {
            cart = [];
            updateCart();
            saveCartToLocalStorage();
        }, 2000);
    } catch (e) {
        console.error(e);
        showNotification('❌ Error al generar la factura.', 'error');
    }
}

// ========== PERSISTENCIA ==========
function saveCartToLocalStorage() {
    localStorage.setItem('libraryCart', JSON.stringify(cart));
}
function loadCartFromLocalStorage() {
    try {
        const data = localStorage.getItem('libraryCart');
        if (data) cart = JSON.parse(data);
        else cart = [];
        updateCart();
    } catch (e) {
        cart = [];
        updateCart();
    }
}

// ========== NOTIFICACIONES ==========
function showNotification(msg, type) {
    const notif = document.getElementById('notification');
    notif.className = `notification ${type}`;
    notif.textContent = msg;
    notif.classList.remove('hidden');
    setTimeout(() => notif.classList.add('hidden'), 3500);
}
