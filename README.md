<img width="1331" height="1181" alt="file_000000000828720e9120664288988018" src="https://github.com/user-attachments/assets/6c8132a2-f980-40ba-8cbb-d2ceec13d235" />

# 🧾 ¨Facturador" — Sistema de Facturación Web

[![Demo en vivo](https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge)](https://coderhouse2025-droid.github.io/Facturador/)
[![Sin backend](https://img.shields.io/badge/Backend-Ninguno-lightgrey?style=for-the-badge)](#)
[![PWA Ready](https://img.shields.io/badge/Corre_en-El_navegador-blue?style=for-the-badge)](#)

> Sistema web de facturación con escáner de códigos de barras ISBN, importación de inventario por CSV, generación de facturas PDF y historial de ventas. Sin backend, sin instalación, corre 100% en el navegador.

🔗 **Demo:** https://coderhouse2025-droid.github.io/Facturador/

📱 **Relacionado:** https://coderhouse2025-droid.github.io/Tableros-Interactivos/Librer%C3%ADa/dashboard.html

---

## 📋 Índice

- [Descripción](#-descripción)
- [Caso de negocio](#-caso-de-negocio)
- [Decisiones técnicas y su justificación](#-decisiones-técnicas-y-su-justificación)
- [Arquitectura del sistema](#-arquitectura-del-sistema)
- [Pipeline de datos: del CSV sucio al inventario operativo](#-pipeline-de-datos-del-csv-sucio-al-inventario-operativo)
- [¿Por qué este camino y no otro?](#-por-qué-este-camino-y-no-otro)
- [Funcionalidades](#-funcionalidades)
- [Cómo usar](#-cómo-usar)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Limitaciones conocidas y roadmap](#-limitaciones-conocidas-y-roadmap)

---

## 📋 Descripción

**¨Facturador"** es una aplicación web de página única (SPA) que permite gestionar ventas y emitir facturas en PDF sin servidores, sin base de datos y sin instalación. El comerciante abre el sitio en el navegador, importa su catálogo desde un CSV, escanea los ISBN con la cámara o los ingresa manualmente, y genera una factura profesional lista para imprimir o enviar.

---

## 💼 Caso de negocio

### El problema que resuelve

Una librería pequeña o mediana en Argentina enfrenta un problema muy concreto de herramientas: los sistemas de facturación profesionales (Tango, Colppy, Bejerman) tienen costos mensuales de suscripción, requieren instalación en una computadora específica, y su curva de aprendizaje es innecesariamente alta para un negocio que básicamente necesita **registrar una venta y emprimir un comprobante**.

En el otro extremo, hacer facturas en Word o Excel es caótico: no hay historial, los cálculos de IVA son manuales y propensos a error, y no hay forma de rastrear qué se vendió.

Este sistema resuelve exactamente ese espacio en el medio: **más estructurado que una planilla, más simple y barato que un ERP**.

### El usuario del sistema

El perfil objetivo es el dueño o empleado de una librería pequeña que:

- Tiene un catálogo de libros existente (habitualmente como planilla Excel o CSV exportado de algún sistema previo)
- Necesita emitir comprobantes de venta con IVA discriminado
- Trabaja desde una computadora o tablet con cámara
- No tiene soporte técnico interno ni presupuesto para software en la nube

### Por qué corre 100% en el navegador

La decisión de no tener backend no es una limitación técnica — es la propuesta de valor central del sistema. Un comercio pequeño no debería pagar hosting, no debería preocuparse por actualizaciones de servidor, y no debería depender de que "el sistema esté caído" para poder facturar. El navegador es la infraestructura más universal y confiable que existe: funciona en cualquier sistema operativo, no requiere instalación, y está disponible en cualquier dispositivo que ya tiene el comerciante.

---

## 🧠 Decisiones técnicas y su justificación

### 1. HTML + JavaScript Vanilla en un único archivo — no React, no Vue

**¿Por qué un único `index.html`?**

El sistema tiene un flujo lineal: importar inventario → escanear o buscar ISBN → armar carrito → generar factura. No hay routing, no hay vistas múltiples con estado compartido complejo. Un único archivo HTML con JavaScript vanilla resuelve esto de forma directa.

La ventaja operativa es concreta: el comerciante puede guardar el archivo `index.html` en su computadora y abrirlo directamente sin conexión a internet. No hay CDN que pueda fallar, no hay servidor que mantener. Esta portabilidad total es posible *porque* el proyecto es un archivo único.

Introducir React hubiera añadido: un paso de build, dependencias de Node.js, y la imposibilidad de "guardar y usar sin conexión" como archivo local. Ninguna de esas complejidades agrega valor para este usuario.

---

### 2. QuaggaJS — escáner ISBN con la cámara del navegador

**¿Por qué QuaggaJS y no ZXing o una API nativa?**

El escáner de código de barras en el navegador requiere acceso a la cámara y capacidad de decodificar imágenes en tiempo real. Las opciones evaluadas:

| Librería | Pros | Contras para este caso |
|----------|------|----------------------|
| **QuaggaJS** | Liviana, sin dependencias, soporta Code128 e ISBN-13 | Mantenimiento limitado desde 2020 |
| ZXing (port JS) | Muy completa, mantenida activamente | Bundle de ~500KB, más compleja de integrar |
| BarcodeDetector API (nativa) | Sin librería, nativa del browser | Solo disponible en Chrome/Edge, no en Safari ni Firefox |

QuaggaJS pesa ~80KB, soporta los formatos de código de barras usados en ISBN (EAN-13 / Code128), y tiene una API simple de integrar. Para un sistema que prioriza que funcione en cualquier dispositivo del comerciante — incluyendo tablets con Safari — es la elección correcta.

**Fallback manual obligatorio:** el escáner requiere HTTPS o localhost para acceder a la cámara. En contextos donde el sitio se abre como archivo local (`file://`), la cámara no está disponible. Por eso el sistema siempre tiene el campo de ingreso manual de ISBN como alternativa — no es un feature secundario, es una ruta de uso igual de válida.

---

### 3. PapaParse — lectura del CSV de inventario

**¿Por qué PapaParse y no `split(',')` o FileReader nativo?**

El CSV del inventario no es un dato limpio. Los catálogos de librerías en Argentina suelen exportarse desde planillas Excel con:

- Comas dentro de los títulos entre comillas (`"García Márquez, Gabriel"`)
- Punto y coma como separador en lugar de coma (convención europea/latinoamericana en Excel)
- Codificación Windows-1252 en lugar de UTF-8 (caracteres con tilde mal codificados)
- Filas vacías, líneas de encabezado en distintas posiciones
- Números de precio con formato `$1.234,56` (punto de miles, coma decimal)

Un `split(',')` naïve rompe ante cualquiera de estos casos. PapaParse maneja automáticamente: detección del delimitador (`,` vs `;`), strings entre comillas, codificaciones, y filas vacías. Es la librería estándar de facto para parsing de CSV en JavaScript — robusta, liviana (~45KB) y sin dependencias.

---

### 4. jsPDF + AutoTable — generación del PDF de factura en el cliente

**¿Por qué generar el PDF en el browser y no en un servidor?**

La alternativa sería: el browser envía los datos de la venta a un servidor, el servidor genera el PDF con una librería como WeasyPrint o Puppeteer, y lo devuelve para descargar. Eso requiere infraestructura, introduce latencia, y crea una dependencia de conectividad en el momento de cierre de venta — exactamente lo que este sistema quiere evitar.

jsPDF ejecuta la generación 100% en el browser. El PDF resultante incluye:
- Encabezado con logo y datos del comercio
- Tabla de productos con cantidad, precio unitario y subtotal
- Cálculo de IVA discriminado (10,5% libros / 21% resto)
- Total con y sin IVA
- Número de factura secuencial generado localmente

**¿Por qué AutoTable como plugin?**

jsPDF nativo no tiene soporte para tablas — hay que dibujar cada celda manualmente calculando posiciones en puntos. AutoTable es el plugin estándar para tablas en jsPDF: maneja automáticamente el wrapping de texto largo en celdas, las líneas divisorias, el salto de página cuando la tabla excede el largo de la hoja, y el alineado de columnas numéricas a la derecha.

---

### 5. LocalStorage — historial de ventas sin base de datos

**¿Por qué LocalStorage y no IndexedDB?**

El historial de ventas es una lista de objetos JSON — cada venta tiene fecha, items, totales e IVA. LocalStorage soporta hasta ~5MB por origen, suficiente para años de historial de una librería pequeña (cada venta pesa ~500 bytes; 5MB = ~10.000 ventas).

IndexedDB hubiera sido la elección si el sistema necesitara: queries complejas (filtrar por fecha, por producto, por monto), grandes volúmenes de datos, o datos binarios. Para persistir y recuperar un array JSON de ventas, LocalStorage es la solución directa sin overhead de abstracción.

**Riesgo documentado:** LocalStorage puede borrarse si el usuario limpia el caché del navegador. Se informa al usuario de este riesgo y se provee la funcionalidad de exportar el historial como CSV antes de limpiar el navegador. Ver [Limitaciones conocidas](#-limitaciones-conocidas-y-roadmap).

---

### 6. TailwindCSS via CDN — no CSS propio, no Bootstrap

**¿Por qué Tailwind?**

El objetivo de la UI es funcionalidad, no identidad visual. Un sistema de facturación para uso interno de un comercio necesita ser claro, legible y rápido de operar — no necesita una estética diferenciada. Tailwind via CDN permite construir una interfaz funcional y consistente directamente en el markup sin escribir ni mantener CSS propio.

Comparado con Bootstrap: Tailwind no impone un "look Bootstrap" reconocible, y las clases utilitarias son más precisas para ajustar layouts específicos como el grid del carrito o la tabla de factura.

**Trade-off aceptado:** Tailwind via CDN descarga el CSS completo (~3MB sin purgar) en cada carga. Para un sistema de uso interno en red local o con buena conectividad, esto no es un problema operativo.

---

## 🏗️ Arquitectura del sistema

```
Comerciante (browser)
      │
      ├── Importar CSV de inventario
      │       └── PapaParse → limpieza y normalización → objeto inventario en memoria
      │
      ├── Escanear ISBN (cámara)
      │       └── QuaggaJS → ISBN decodificado → búsqueda en inventario → add al carrito
      │
      ├── Buscar ISBN (manual)
      │       └── Input → búsqueda en inventario → add al carrito
      │
      ├── Carrito de venta
      │       └── Array en memoria → cálculo de subtotales + IVA → total
      │
      ├── Generar factura PDF
      │       └── jsPDF + AutoTable → PDF descargable en el browser
      │
      └── Historial de ventas
              └── LocalStorage → lista de ventas persistida entre sesiones
                      └── Export CSV → descarga del historial completo
```

**Principio de diseño:** cero llamadas de red durante la operación normal. Una vez cargado el sitio y el CSV de inventario, el sistema funciona completamente offline.

---

## 🔄 Pipeline de datos: del CSV sucio al inventario operativo

El CSV de inventario es la entrada de datos más crítica del sistema y la más propensa a problemas de calidad. Se documenta cada transformación aplicada.

### El dataset fuente: catálogos de librerías en estado real

Los catálogos de librerías pequeñas tienen una historia: empezaron como planillas Excel hace años, se fueron modificando sin criterio, y eventualmente se exportaron como CSV. El resultado típico tiene varios problemas de calidad que el sistema debe resolver antes de poder operar.

---

#### Problema 1: Separador de columnas inconsistente

Excel en configuración latinoamericana exporta CSV con punto y coma (`;`) como separador, no coma (`,`). Un sistema que asume comas falla silenciosamente — lee todo como una única columna.

**Transformación aplicada:**

PapaParse tiene detección automática de separador (`delimiter: "auto"`). Al cargar el CSV, analiza las primeras líneas y determina si el separador es `,`, `;`, `\t` u otro. El resultado es un array de objetos independiente del separador original.

---

#### Problema 2: Codificación de caracteres — tildes y ñ rotas

Los archivos exportados desde Excel en Windows usan codificación Windows-1252. En esa codificación, la `á` se almacena como `\xe1`, que en UTF-8 se muestra como `Ã¡`. Un título como "Crónica de una muerte anunciada" aparece como "CrÃ³nica de una muerte anunciada".

**Transformación aplicada:**

```javascript
// Al leer el archivo con FileReader, especificar la codificación
reader.readAsText(file, 'ISO-8859-1'); // Windows-1252 ≈ ISO-8859-1

// PapaParse recibe el string ya decodificado correctamente
Papa.parse(contenidoDecodificado, { ... });
```

La detección de codificación se hace heurísticamente: si el string decodificado como UTF-8 contiene secuencias `Ã` seguidas de caracteres en rango 128-191, se reintenta con ISO-8859-1.

---

#### Problema 3: Precios con formato de moneda no parseable

Los precios en el CSV pueden venir como:
- `$1.234,56` (formato AR con símbolo de moneda)
- `1.234,56` (punto de miles, coma decimal)
- `1234.56` (punto decimal, formato internacional)
- `1234` (entero sin decimales)

`parseFloat("$1.234,56")` devuelve `NaN`. `parseFloat("1.234,56")` devuelve `1.234` (solo los primeros dígitos antes del punto).

**Transformación aplicada:**

```javascript
function parsearPrecio(valor) {
  if (!valor) return 0;
  return parseFloat(
    valor.toString()
      .replace(/[^0-9,\.]/g, '')  // eliminar $ y espacios
      .replace(/\.(?=\d{3})/g, '') // eliminar puntos de miles (si hay 3 dígitos después)
      .replace(',', '.')            // coma decimal → punto decimal
  ) || 0;
}
```

El regex del punto de miles es el más delicado: debe distinguir entre `1.234` (punto de miles, valor = 1234) y `1.23` (punto decimal, valor = 1.23). La regla es: si después del punto hay exactamente 3 dígitos, es separador de miles.

---

#### Problema 4: Columnas con nombres inconsistentes entre catálogos

No todos los CSV tienen las mismas columnas ni los mismos nombres. Un catálogo puede tener `isbn`, otro `ISBN`, otro `Código ISBN`, otro `codigo`. Un catálogo puede tener `precio`, otro `Precio de venta`, otro `PVP`.

**Transformación aplicada — mapeo flexible de columnas:**

```javascript
const COLUMN_ALIASES = {
  isbn:     ['isbn', 'ISBN', 'codigo isbn', 'código isbn', 'cod isbn', 'ean'],
  titulo:   ['titulo', 'título', 'nombre', 'descripcion', 'descripción', 'libro'],
  autor:    ['autor', 'autores', 'author'],
  precio:   ['precio', 'precio de venta', 'pvp', 'precio venta', 'importe'],
  stock:    ['stock', 'cantidad', 'existencias', 'qty'],
  editorial:['editorial', 'sello', 'publisher']
};

function mapearColumna(headers, campo) {
  const aliases = COLUMN_ALIASES[campo];
  return headers.find(h =>
    aliases.includes(h.toLowerCase().trim())
  );
}
```

Antes de procesar las filas, el sistema analiza los headers del CSV y construye un mapa de qué columna del archivo corresponde a cada campo del sistema. Si un campo obligatorio (ISBN, título, precio) no puede mapearse, se muestra un error específico al usuario indicando qué columna falta.

---

#### Problema 5: ISBN inválidos o con formato incorrecto

El ISBN-13 tiene un dígito verificador calculado mediante un algoritmo de suma ponderada. Un ISBN mal escrito (dígito faltante, typo) produce búsquedas sin resultado y confusión operativa.

**Transformación aplicada — validación de ISBN al cargar:**

```javascript
function validarISBN13(isbn) {
  const digits = isbn.replace(/[^0-9]/g, '');
  if (digits.length !== 13) return false;

  const suma = digits.slice(0, 12).split('').reduce((acc, d, i) => {
    return acc + parseInt(d) * (i % 2 === 0 ? 1 : 3);
  }, 0);

  const verificador = (10 - (suma % 10)) % 10;
  return verificador === parseInt(digits[12]);
}
```

Los ISBN inválidos en el CSV se cargan igual (para no bloquear la importación completa), pero se marcan visualmente en la tabla de inventario para que el comerciante los corrija. La búsqueda por escáner siempre produce ISBNs válidos; el problema surge principalmente en el CSV de origen.

---

#### Problema 6: Cálculo de IVA diferenciado para libros

En el ejemplo del “Facturador” se aplica el criterio de que en Argentina los libros tienen una alícuota de IVA reducida del 10,5%, mientras que los artículos de librería (útiles y papelería) tributan el 21% estándar, por lo que el sistema debe discriminar correctamente entre ambas categorías. Sin embargo, en términos reales, los libros se encuentran exentos de IVA (0%), por lo que la conclusión para el sistema es que debe contemplar esta exención de forma precisa, asegurando una correcta clasificación de productos para aplicar el tratamiento impositivo correspondiente y evitar errores en la facturación.

**Transformación aplicada:**

La categorización se hace por campo `categoria` del CSV (si existe) o por una heurística basada en el ISBN: los ISBN que empiezan con `978` o `979` son libros por definición del estándar internacional, y se les aplica 10,5%. El resto tributa 21%.

```javascript
function alicuotaIVA(item) {
  const isbn = item.isbn?.toString().replace(/[^0-9]/g, '') || '';
  if (isbn.startsWith('978') || isbn.startsWith('979')) return 0.105;
  if (item.categoria?.toLowerCase().includes('libro')) return 0.105;
  return 0.21;
}
```

Esta lógica es relevante para la factura final: una factura con IVA incorrecto puede generar problemas ante la AFIP si el negocio está inscripto en el IVA.

---

## 🤔 ¿Por qué este camino y no otro?

### Alternativa descartada: sistema con backend + base de datos

Un sistema con Node.js/Express + PostgreSQL hubiera dado: historial de ventas centralizado, acceso desde múltiples dispositivos, backup automático, y reportes más potentes. El costo: servidor a mantener, costos de hosting, configuración de seguridad, y dependencia de conectividad para facturar.

Para el usuario objetivo — una librería pequeña sin soporte técnico — el riesgo de "no puedo facturar porque el servidor está caído" es inaceptable. La decisión de correr 100% en el browser elimina ese riesgo por completo.

### Alternativa descartada: integración con API de AFIP / facturación electrónica

La facturación electrónica real (Factura A, B, C con CAE de AFIP) requiere integración con los webservices de AFIP, certificados digitales, y cumplimiento de requisitos técnicos estrictos. Es un proyecto de mayor envergadura y queda fuera del scope de este sistema, que genera comprobantes internos de venta.

Esta limitación está documentada explícitamente en la sección de limitaciones conocidas. El sistema es válido como comprobante interno; para emisión fiscal real se necesita integración con AFIP o un sistema homologado.

### Alternativa descartada: app móvil nativa para el escáner

Una app nativa tendría mejor acceso a la cámara y al hardware de escaneo. El trade-off: desarrollo separado para Android e iOS, proceso de publicación en tiendas, y la necesidad de que el comerciante instale y actualice la app. La solución web con QuaggaJS funciona en cualquier dispositivo con cámara y browser moderno, sin instalación.

---

## ✨ Funcionalidades

- 📷 **Escáner ISBN** vía cámara del dispositivo (requiere HTTPS o localhost)
- 🔍 **Búsqueda manual** por ISBN como alternativa al escáner
- 📦 **Importación de inventario** desde CSV con normalización automática
- 🛒 **Carrito de venta** con cantidades editables y eliminación de items
- 💰 **Cálculo automático de IVA** diferenciado (10,5% libros / 21% resto)
- 🧾 **Generación de factura PDF** con logo, datos del negocio y tabla de items
- 📊 **Historial de ventas** persistido en LocalStorage
- 📥 **Export del historial** a CSV para backup o análisis externo
- 📱 **Responsive** — funciona en tablet y desktop
- ✈️ **Funciona offline** una vez cargado el sitio y el CSV

---

## 🚀 Cómo usar

### 1. Preparar el CSV de inventario

El CSV debe tener al menos estas columnas (los nombres pueden variar, el sistema los detecta automáticamente):

```
isbn,titulo,autor,precio,stock,editorial
9789500420679,Cien años de soledad,Gabriel García Márquez,3500,12,Sudamericana
9789877383041,El túnel,Ernesto Sabato,2800,8,Booket
```

### 2. Importar el inventario

Hacer clic en "Importar CSV", seleccionar el archivo, y verificar que las columnas se mapearon correctamente en la previsualización.

### 3. Registrar una venta

- Escanear el código de barras del libro con la cámara, **o**
- Ingresar el ISBN manualmente en el campo de búsqueda
- Ajustar la cantidad en el carrito si corresponde
- Hacer clic en "Generar Factura"

### 4. Descargar la factura

El PDF se genera y descarga automáticamente. El nombre del archivo incluye la fecha y el número de factura secuencial.

---

## 📁 Estructura del proyecto

```
/
├── index.html     # Aplicación completa: markup + estilos (Tailwind) + lógica JS
│                  # Incluye inline: QuaggaJS, PapaParse, jsPDF, AutoTable
└── README.md
```

**¿Por qué todo en un único archivo?**

La decisión de tener un único `index.html` está directamente relacionada con el caso de uso: el comerciante puede guardar este archivo en el escritorio de su computadora y abrirlo directamente con doble clic, sin servidor local, sin instalar Node.js, sin ningún paso adicional. Esa portabilidad total requiere que todas las dependencias estén inline o cargadas desde CDN dentro del mismo archivo.

Para un sistema usado por un equipo técnico con herramientas de desarrollo disponibles, la separación en múltiples archivos con bundler sería la elección correcta. Para este usuario y este contexto, no.

---

## ⚠️ Limitaciones conocidas y roadmap

| Limitación | Impacto | Solución futura |
|------------|---------|----------------|
| **LocalStorage borrable** | Pérdida del historial si se limpia el caché | Export CSV antes de limpiar; futura sincronización a Drive |
| **Sin facturación electrónica AFIP** | No válido como comprobante fiscal oficial | Integración con webservices AFIP (scope aparte) |
| **Inventario en memoria** | Al cerrar el tab, hay que reimportar el CSV | Persistir inventario en LocalStorage / IndexedDB |
| **Sin multi-usuario** | No hay login, cualquiera con acceso puede ver el historial | Autenticación básica si se despliega en red local |
| **Escáner requiere HTTPS** | No funciona en `file://` ni HTTP plano | Usar búsqueda manual como fallback (ya implementado) |
| **Sin reportes de ventas** | No hay análisis de qué vendió más | Export CSV + análisis externo en Excel o Google Sheets |

---

## 👨‍💻 Autor

**Juan Manuel Orellana**

---

## 📄 Licencia

MIT License — libre para uso, adaptación y distribución.
