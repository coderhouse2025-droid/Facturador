// ============================================
// SISTEMA DE FACTURACIÓN - LIBRERÍA "EL SABIO"
// Inventario basado en archivo CSV 2026-05-02
// ============================================

// Mock Database de libros (extraído del archivo CSV)
const mockDatabase = {
    books: [
        {
            isbn: "9788437604947",
            title: "Cien años de soledad",
            author: "Gabriel García Márquez",
            price: 15.99,
            stock: 5
        },
        {
            isbn: "9788408045391",
            title: "El Alquimista",
            author: "Paulo Coelho",
            price: 12.50,
            stock: 3
        },
        {
            isbn: "9789878220062",
            title: "Hábitos Atómicas",
            author: "James Clear",
            price: 18.69,
            stock: 1
        },
        {
            isbn: "9789876053310",
            title: "Oratoria Dinámica DMG",
            author: "Daniel Mongelli",
            price: 9.99,
            stock: 1
        },
        {
            isbn: "9789501531916",
            title: "Las Causalidades No Existen",
            author: "Borrar Vilaseca",
            price: 20.05,
            stock: 1
        },
        {
            isbn: "9789504923817",
            title: "Confianza Total",
            author: "Verónica De Andres",
            price: 18.60,
            stock: 1
        },
        {
            isbn: "9789877479904",
            title: "Inteligencia Asertiva",
            author: "Javiera De La Plaza",
            price: 8.99,
            stock: 1
        },
        {
            isbn: "9789872659929",
            title: "La Paradoja",
            author: "James C. Hunter",
            price: 7.99,
            stock: 1
        }
    ]
};

// Variables globales (sin cambios)
let cart = [];
let html5QrCode;
let isScannerActive = false;

// Configuración de impuestos
const TAX_RATE = 21; // IVA 21%

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadCartFromLocalStorage();
});

function initializeApp() {
    // Event Listeners
    document.getElementById('toggleScanner').addEventListener('click', toggleScanner);
    document.getElementById('searchManual').addEventListener('click', searchManualISBN);
    document.getElementById('generateInvoice').addEventListener('click', generateInvoice);
    
    // Búsqueda manual con Enter
    document.getElementById('isbnInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchManualISBN();
        }
    });

    // Inicializar el escáner
    html5QrCode = new Html5Qrcode("reader");
    
    // Ocultar totales inicialmente
    updateTotalsVisibility();
}

// ============================================
// FUNCIONES DEL ESCÁNER
// ============================================

function toggleScanner() {
    const scannerBtn = document.getElementById('toggleScanner');
    const readerElement = document.getElementById('reader');
    
    if (isScannerActive) {
        // Detener el escáner
        stopScanner();
        scannerBtn.innerHTML = '<i class="fas fa-camera mr-2"></i>Activar Escáner';
        scannerBtn.classList.remove('active');
        readerElement.classList.add('hidden');
    } else {
        // Iniciar el escáner
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
            aspectRatio: 1.777777778
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
        showNotification('No se pudo acceder a la cámara. Verifica los permisos.', 'error');
        document.getElementById('toggleScanner').click(); // Resetear el botón
    }
}

async function stopScanner() {
    try {
        if (html5QrCode && isScannerActive) {
            await html5QrCode.stop();
            isScannerActive = false;
        }
    } catch (error) {
        console.error('Error al detener el escáner:', error);
    }
}

function onScanSuccess(decodedText) {
    // Detener el escáner después de un escaneo exitoso
    stopScanner();
    
    // Procesar el ISBN escaneado
    processISBN(decodedText);
    
    // Resetear el botón del escáner
    const scannerBtn = document.getElementById('toggleScanner');
    scannerBtn.innerHTML = '<i class="fas fa-camera mr-2"></i>Activar Escáner';
    scannerBtn.classList.remove('active');
    document.getElementById('reader').classList.add('hidden');
    isScannerActive = false;
}

function onScanError(error) {
    // No mostrar errores de escaneo continuos al usuario
    console.warn('Error de escaneo:', error);
}

// ============================================
// FUNCIONES DE BÚSQUEDA
// ============================================

function searchManualISBN() {
    const isbn = document.getElementById('isbnInput').value.trim();
    if (!isbn) {
        showNotification('Por favor, ingresa un ISBN válido.', 'warning');
        return;
    }
    
    processISBN(isbn);
    document.getElementById('isbnInput').value = ''; // Limpiar input
}

function processISBN(isbn) {
    // Limpiar el ISBN de caracteres no numéricos
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    
    // Buscar en la base de datos
    const book = mockDatabase.books.find(b => b.isbn === cleanISBN);
    
    if (book) {
        addToCart(book);
        showNotification(`"${book.title}" añadido al carrito.`, 'success');
    } else {
        showNotification('Producto no encontrado en la base de datos.', 'error');
    }
}

// ============================================
// FUNCIONES DEL CARRITO
// ============================================

function addToCart(book) {
    // Verificar si el libro ya está en el carrito
    const existingItem = cart.find(item => item.isbn === book.isbn);
    
    if (existingItem) {
        showNotification('Este libro ya está en el carrito.', 'warning');
        return;
    }
    
    // Añadir al carrito (sin modificar el stock por ahora)
    cart.push({
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        price: book.price,
        quantity: 1
    });
    
    updateCart();
    saveCartToLocalStorage();
}

function removeFromCart(isbn) {
    if (confirm('¿Estás seguro de eliminar este libro del carrito?')) {
        cart = cart.filter(item => item.isbn !== isbn);
        updateCart();
        saveCartToLocalStorage();
        showNotification('Libro eliminado del carrito.', 'success');
    }
}

function updateCart() {
    const cartBody = document.getElementById('cartBody');
    const emptyCart = document.getElementById('emptyCart');
    
    // Limpiar tabla
    cartBody.innerHTML = '';
    
    if (cart.length === 0) {
        emptyCart.classList.remove('hidden');
        updateTotalsVisibility();
        return;
    }
    
    // Mostrar items en la tabla
    emptyCart.classList.add('hidden');
    
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-700">${item.isbn}</td>
            <td class="px-4 py-3 text-sm font-medium">${item.title}</td>
            <td class="px-4 py-3 text-sm text-gray-600">${item.author}</td>
            <td class="px-4 py-3 text-sm text-right font-semibold">$${item.price.toFixed(2)}</td>
            <td class="px-4 py-3 text-center">
                <button onclick="removeFromCart('${item.isbn}')" 
                        class="remove-item text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        cartBody.appendChild(row);
    });
    
    updateTotals();
    updateTotalsVisibility();
}

// ============================================
// FUNCIONES DE CÁLCULO
// ============================================

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * (TAX_RATE / 100);
    const total = subtotal + tax;
    
    return {
        subtotal: subtotal,
        tax: tax,
        total: total,
        taxRate: TAX_RATE
    };
}

function updateTotals() {
    const totals = calculateTotals();
    
    document.getElementById('subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${totals.tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${totals.total.toFixed(2)}`;
}

function updateTotalsVisibility() {
    const totalsSection = document.getElementById('totalsSection');
    cart.length > 0 ? totalsSection.classList.remove('hidden') : totalsSection.classList.add('hidden');
}

// ============================================
// GENERACIÓN DE FACTURA PDF
// ============================================

function generateInvoice() {
    if (cart.length === 0) {
        showNotification('El carrito está vacío. Añade productos para generar una factura.', 'warning');
        return;
    }
    
    try {
        // Inicializar jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const totals = calculateTotals();
        const invoiceDate = new Date().toLocaleDateString('es-AR');
        const invoiceNumber = `FAC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        // Configurar fuentes
        doc.setFont("helvetica");
        
        // ===== ENCABEZADO =====
        doc.setFillColor(37, 99, 235); // Color azul
        doc.rect(0, 0, 210, 40, 'F');
        
        // Logo y nombre de la librería
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Librería El Sabio", 14, 25);
        
        // Información de la empresa
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Calle del Conocimiento 123 | Buenos Aires, Argentina", 14, 33);
        doc.text("Tel: (011) 4567-8901 | Email: info@libreriaelsabio.com", 14, 38);
        
        // ===== INFORMACIÓN DE LA FACTURA =====
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        
        // Datos de la factura
        doc.text("FACTURA", 170, 50, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.text(`Nº: ${invoiceNumber}`, 170, 57, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.text(`Fecha: ${invoiceDate}`, 170, 64, { align: "right" });
        
        // Datos del cliente (placeholder)
        doc.text("Cliente:", 14, 55);
        doc.setFont("helvetica", "bold");
        doc.text("Consumidor Final", 14, 62);
        doc.setFont("helvetica", "normal");
        doc.text("CUIT: 00-00000000-0", 14, 69);
        
        // ===== TABLA DE PRODUCTOS =====
        const tableColumn = ["ISBN", "Descripción", "Autor", "Precio", "Importe"];
        const tableRows = [];
        
        cart.forEach(item => {
            const itemData = [
                item.isbn,
                item.title,
                item.author,
                `$${item.price.toFixed(2)}`,
                `$${(item.price * item.quantity).toFixed(2)}`
            ];
            tableRows.push(itemData);
        });
        
        // Generar tabla
        doc.autoTable({
            startY: 80,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: {
                fillColor: [37, 99, 235],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [50, 50, 50]
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },
            columnStyles: {
                0: { cellWidth: 35 },
                1: { cellWidth: 50 },
                2: { cellWidth: 35 },
                3: { cellWidth: 25, halign: 'right' },
                4: { cellWidth: 25, halign: 'right' }
            },
            margin: { top: 10 }
        });
        
        // ===== TOTALES =====
        const finalY = doc.lastAutoTable.finalY + 10;
        
        // Línea separadora
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.5);
        doc.line(120, finalY, 190, finalY);
        
        // Subtotales y totales
        doc.setFontSize(10);
        doc.text("Subtotal:", 120, finalY + 8);
        doc.text(`$${totals.subtotal.toFixed(2)}`, 190, finalY + 8, { align: 'right' });
        
        doc.text(`IVA (${TAX_RATE}%):`, 120, finalY + 16);
        doc.text(`$${totals.tax.toFixed(2)}`, 190, finalY + 16, { align: 'right' });
        
        // Total con estilo destacado
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL:", 120, finalY + 26);
        
        // Rectángulo de fondo para el total
        doc.setFillColor(37, 99, 235);
        doc.rect(150, finalY + 19, 40, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`$${totals.total.toFixed(2)}`, 190, finalY + 26, { align: 'right' });
        
        // ===== PIE DE PÁGINA =====
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        const pageHeight = doc.internal.pageSize.height;
        doc.text("Gracias por su compra en Librería El Sabio", 105, pageHeight - 20, { align: 'center' });
        doc.text("Conserve esta factura como comprobante de su compra", 105, pageHeight - 15, { align: 'center' });
        
        // Descargar PDF
        doc.save(`factura_${invoiceNumber}_${invoiceDate.replace(/\//g, '-')}.pdf`);
        
        // Mostrar mensaje de éxito y limpiar carrito
        showNotification('Factura generada exitosamente. Gracias por su compra.', 'success');
        
        // Limpiar carrito después de 2 segundos
        setTimeout(() => {
            cart = [];
            updateCart();
            saveCartToLocalStorage();
        }, 2000);
        
    } catch (error) {
        console.error('Error al generar la factura:', error);
        showNotification('Error al generar la factura. Por favor, intente nuevamente.', 'error');
    }
}

// ============================================
// FUNCIONES DE PERSISTENCIA
// ============================================

function saveCartToLocalStorage() {
    try {
        localStorage.setItem('libraryCart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error al guardar el carrito:', error);
    }
}

function loadCartFromLocalStorage() {
    try {
        const savedCart = localStorage.getItem('libraryCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCart();
        }
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
        cart = [];
    }
}

// ============================================
// FUNCIONES DE NOTIFICACIÓN
// ============================================

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    
    // Limpiar clases anteriores
    notification.className = 'notification';
    notification.classList.add(type);
    notification.textContent = message;
    notification.classList.remove('hidden');
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
    
    // También mostrar en consola para debugging
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// ============================================
// MANEJO DE ERRORES GLOBALES
// ============================================

// Manejar errores no capturados
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Error global:', { message, source, lineno, colno, error });
    showNotification('Ha ocurrido un error inesperado. Por favor, recargue la página.', 'error');
    return true;
};

// Manejar promesas rechazadas no capturadas
window.onunhandledrejection = function(event) {
    console.error('Promesa rechazada no manejada:', event.reason);
    showNotification('Error de sincronización. Verifique su conexión.', 'error');
};
