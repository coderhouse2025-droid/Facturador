# 📚 Librería "El Sabio" — Sistema de Facturación

> Sistema web de facturación con escáner de códigos de barras, generación de PDF y gestión de historial de ventas. Diseñado para funcionar directamente desde el navegador, sin backend ni instalación.

---

## 🗂️ Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Cómo usar](#-cómo-usar)
- [Inventario / CSV](#-inventario--importar-csv)
- [Generación de Facturas](#-generación-de-facturas)
- [Historial de Ventas](#-historial-de-ventas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Limitaciones Conocidas](#-limitaciones-conocidas)
- [Capturas de Pantalla](#-capturas-de-pantalla)

---

## 📋 Descripción

**Librería "El Sabio"** es una aplicación web de una sola página (SPA) que permite gestionar ventas y generar facturas en formato PDF sin necesidad de servidores, bases de datos ni instalaciones. Todo corre en el navegador del usuario.

Ideal para pequeños comercios que necesiten una solución rápida, portable y sin costos de infraestructura.

---

## ✨ Características

- 📷 **Escáner de código de barras** — Usa la cámara del dispositivo para leer ISBN (requiere HTTPS o localhost)
- 🔍 **Búsqueda manual por ISBN** — Ingreso directo sin necesidad de cámara
- 📦 **Inventario por CSV** — Importación rápida de catálogo de libros
- 🧾 **Generación de facturas PDF** — Con logo, datos del negocio, IVA (21%) y métodos de pago
- 📊 **Historial de ventas** — Registro local de facturas generadas
- 📤 **Exportación de historial** — Reporte de movimientos en PDF
- 💾 **Persistencia local** — Carrito y historial guardados en `localStorage`
- 📱 **Diseño responsive** — Adaptado para móviles y escritorio

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 / CSS3 / JavaScript | Base de la aplicación |
| [Tailwind CSS](https://tailwindcss.com/) | Estilos y diseño responsive |
| [Font Awesome 6](https://fontawesome.com/) | Iconografía |
| [jsPDF](https://github.com/parallax/jsPDF) | Generación de facturas en PDF |
| [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Tablas en PDF |
| [html5-qrcode](https://github.com/mebjas/html5-qrcode) | Escáner de códigos de barras |

---

## 🚀 Cómo Usar

### Opción 1 — GitHub Pages (recomendada)

Accedé directamente desde el navegador a través de GitHub Pages. No requiere instalación.

```
https://coderhouse2025-droid.github.io/Facturador/
```

### Opción 2 — Local

```bash
# Clonar el repositorio
git clone https://github.com/<tu-usuario>/<nombre-del-repo>.git

# Abrir el archivo en un servidor local (necesario para la cámara)
cd <nombre-del-repo>
npx serve .
# o con Python:
python -m http.server 8080
```

> ⚠️ **Nota:** El escáner de cámara requiere conexión **HTTPS** o **localhost**. Abrir el archivo directamente (`file://`) no activará la cámara, aunque el resto de las funciones sí funcionan.

---

## 📂 Inventario / Importar CSV

Podés cargar tu catálogo de libros desde un archivo CSV con el siguiente formato:

```csv
Código,Nombre,Marca/Autor,Precio
9788437604947,Cien años de soledad,Gabriel García Márquez,15.99
9788408045391,El Alquimista,Paulo Coelho,12.50
```

**Columnas requeridas:** `Código`, `Nombre`, `Marca/Autor`, `Precio`

El inventario importado reemplaza la base de datos interna para esa sesión.

---

## 🧾 Generación de Facturas

Al finalizar una venta, el sistema genera automáticamente un PDF con:

- Logo e información del negocio
- Número de factura auto-generado (`FAC-XXXX`)
- Fecha, hora y fecha de vencimiento
- Tabla de ítems con descripción, cantidad y precio unitario
- Subtotal, IVA (21%) y total a pagar
- Métodos de pago disponibles

El archivo se descarga con el nombre `factura_FAC-XXXX.pdf`.

---

## 📊 Historial de Ventas

- Se guardan automáticamente las últimas **20 facturas** en el almacenamiento local del navegador.
- Podés exportar un resumen de todos los movimientos en PDF desde el botón **"Exportar Movimientos (PDF)"**.
- El historial se mantiene entre sesiones mientras no se limpie el caché del navegador.

---

## 📁 Estructura del Proyecto

```
📦 libreria-el-sabio/
├── 📄 index.html        # Aplicación completa (SPA)
└── 📄 README.md         # Documentación
```

---

## ⚠️ Limitaciones Conocidas

- El inventario **no persiste entre sesiones** si fue cargado por CSV (se pierde al recargar la página).
- El escáner de cámara **no funciona** en conexiones `http://` ni abriendo el archivo directamente.
- El historial de facturas **está limitado a 20 entradas** para evitar errores de almacenamiento local.
- No hay autenticación ni gestión de usuarios.

---

## 📸 Capturas de Pantalla

> <img width="461" height="638" alt="image" src="https://github.com/user-attachments/assets/44c60059-c26e-4d33-8a98-fd9041eb8194" />
><img width="467" height="380" alt="image" src="https://github.com/user-attachments/assets/d8fff872-d8e9-4f43-aa55-4f04edf23a03" />
><img width="726" height="430" alt="image" src="https://github.com/user-attachments/assets/c4841ab0-7411-4d0c-9e3e-c8ee49828a37" />




---

## 📄 Licencia

Este proyecto es de uso libre. Podés modificarlo y adaptarlo a tus necesidades.

---

<p align="center">
  📚 Desarrollado con ❤️ para <strong>Librería "El Sabio"</strong> — Buenos Aires
</p>
