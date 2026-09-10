# Mi Feria 🪙📱

> **Punto de Venta (POS) Escolar y Control de Caja 100% Offline en Formato PWA.**  
> Diseñado para ferias empresariales, bazares estudiantiles y stands de emprendimiento escolar. Asegura las cuentas exactas de tu equipo, calcula tu rentabilidad en vivo y genera el acta de cierre oficial para sustentar tu nota.

---

## 🌟 Características Principales

- ⚡ **Punto de Venta Ultrarrápido:** Registra ventas en menos de 1 segundo mediante botones táctiles grandes, diseñados para evitar filas en el stand.
- 📶 **100% Offline (PWA):** Funciona sin internet ni gastar datos móviles. Todo el motor contable se ejecuta localmente en el navegador.
- 📈 **Balance Financiero y ROI en Vivo:** Conoce en tiempo real los ingresos brutos, el costo de mercancía vendida (COGS), el punto de equilibrio y la ganancia neta a repartir entre los socios.
- 🛡️ **Blindaje Contable y Deshacer Venta:** Si te equivocas al presionar un producto o el cliente cambia de parecer, puedes revertir la última transacción con un solo toque sin alterar el balance.
- 💵 **Calculadora de Vuelto Inteligente (Plan Premium):** Botones con denominaciones oficiales de billetes y monedas colombianas ($1.000 a $100.000 COP) para entregar el cambio exacto sin margen de error mental.
- 📄 **Acta Oficial de Cierre para Sustentación:** Genera un balance ejecutivo estructurado en formato PDF o impresión física, con desglose por producto, porcentaje de rentabilidad, producto estrella y firmas del equipo y docente evaluador.
- 💸 **Caja de Gastos Extras e Imprevistos:** Registra salidas de dinero menores durante la jornada (servilletas, hielo, pitillos, cinta, etc.) para mantener la caja cuadrada al centavo.
- 💾 **Persistencia a Prueba de Apagones:** Guarda de forma síncrona en el almacenamiento local del dispositivo (`localStorage`). Si el celular se descarga o la página se recarga, tus ventas siguen intactas.

---

## 💳 Planes y Licencias

| Funcionalidad | Plan Estándar ($10.000 COP) | Plan Premium ($18.000 COP) |
| :--- | :---: | :---: |
| Funcionamiento 100% Offline (PWA) | ✅ | ✅ |
| Registro táctil de ventas ilimitadas | ✅ | ✅ |
| Balance en vivo y cálculo de ROI | ✅ | ✅ |
| Botón Deshacer Venta | ✅ | ✅ |
| Reporte de cierre en archivo `.TXT` | ✅ | ✅ |
| **Acta Oficial de Cierre (PDF / Impresión)** | ❌ | **✅ Exclusivo** |
| **Calculadora de Vuelto con Billetes COP** | ❌ | **✅ Exclusivo** |
| **Caja de Gastos Extras e Imprevistos** | ❌ | **✅ Exclusivo** |
| **Registro de Integrantes en el Acta** | ❌ | **✅ Exclusivo** |
| **Soporte prioritario el día del evento** | ❌ | **✅ Exclusivo** |

---

## 🚀 Métodos de Pago y Activación

### 1. Pago Digital Seguro (Nequi, Bancolombia, Tarjeta, PSE)
- Procesado a través de los links directos oficiales de **Wompi Bancolombia**.
- Al finalizar el pago, la aplicación detecta el retorno y genera tu código de activación.

### 2. Pago en Efectivo en el Colegio (Darwin)
- Acércate a **Darwin** en el colegio o contáctalo al WhatsApp **+57 321 832 2388**.
- Entrega el dinero en mano ($10.000 Estándar o $18.000 Premium).
- Entrega el nombre de tu stand y recibe tu **Código de Activación de 6 dígitos**.
- Presiona **«Activar con mi Código»** en la app, ingresa tu clave y desbloquea el sistema.

---

## 📲 Instalación como PWA en Celulares

### En Android (Google Chrome):
1. Abre el enlace del sistema en Google Chrome.
2. Toca el menú de los 3 puntos en la esquina superior derecha.
3. Presiona **«Instalar aplicación»** o **«Añadir a la pantalla principal»**.

### En iPhone / iPad (Safari):
1. Abre el enlace del sistema en Safari.
2. Presiona el botón **Compartir** (icono de cuadrado con flecha hacia arriba).
3. Desliza hacia abajo y selecciona **«Añadir a pantalla de inicio»**.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + TypeScript
- **Bundler y Dev Server:** Vite 6
- **Estilos y Diseño:** Tailwind CSS v4
- **Iconografía:** Lucide React
- **Animaciones:** Motion (`motion/react`)
- **Efectos Visuales:** Canvas Confetti
- **Almacenamiento:** Browser LocalStorage API con validación tipada
- **PWA Ready:** Manifest PWA con service worker y soporte standalone

---

## 💻 Desarrollo y Ejecución Local

### Prerrequisitos
- Node.js 18+ instalado.
- npm o yarn.

### Instalación de dependencias:
```bash
npm install
```

### Iniciar entorno de desarrollo:
```bash
npm run dev
```
La aplicación quedará disponible en `http://localhost:3000`.

### Construcción para producción:
```bash
npm run build
```

### Verificación de tipos y linting:
```bash
npm run lint
```

---

## 📞 Soporte Técnico

- **Contacto Directo:** Darwin Alzate
- **WhatsApp:** [+57 321 832 2388](https://wa.me/573218322388)
- **Propósito:** Asistencia técnica durante el evento, coordinación de efectivo y entrega de claves de activación.

---

## ⚖️ Derechos de Autor y Propiedad Intelectual

**Copyright © 2026 Darwin Alzate. Todos los derechos reservados.**

Este software, su código fuente, arquitectura técnica, diseño visual, interfaz de usuario (UI), algoritmo de activación de licencias y documentación asociada son propiedad intelectual exclusiva de **Darwin Alzate**.

- Queda estrictamente prohibida la copia, reproducción total o parcial, distribución, ingeniería inversa, descompilación, modificación o comercialización no autorizada de este sistema o cualquiera de sus componentes sin el consentimiento previo y por escrito del titular de los derechos de autor.
- Las licencias de uso adquiridas (*Estándar* y *Premium*) otorgan únicamente un derecho de explotación individual, personal e intransferible para el stand escolar debidamente registrado.

