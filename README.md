# 🛡️ VortexSentinel

**VortexSentinel** es una solución de seguridad empresarial de alto rendimiento diseñada para la protección en tiempo real de sistemas operativos de escritorio. Combina un motor de análisis "Zero-Lag", capacidades avanzadas de aislamiento de red a distancia y análisis forense con **Gemini 3.6 Flash**.

---

## ✨ Características Principales

* 📊 **Panel de Control & Inteligencia de Amenazas:** Visualización en tiempo real del estado global del sistema, gráficos de distribución de ataques y logs detallados.
* 🤖 **Análisis Forense con IA:** Integración con **Gemini 3.6 Flash** para la inspección dinámica en *sandbox*, puntuación de riesgo (0-100) y generación de Indicadores de Compromiso (IoC).
* ⚡ **Motor Antivirus "Zero-Lag":** Protección continua sin afectar la productividad, manteniendo el consumo de CPU por debajo del 0.8%.
* 🚨 **Aislamiento Remoto (Network Kill-Switch):** Capacidad para bloquear instantáneamente las interfaces de red (Wi-Fi y Ethernet) de equipos comprometidos.
* 🧱 **Cortafuegos & Bloqueo IP Proactivo:** Filtro dinámico de direcciones IP externos y subredes CIDR maliciosas.
* 🔐 **Bóveda de Logs Cifrada & SIEM:** Registros cifrados en **AES-256** con firmas de integridad **SHA-256** y exportación en formatos **Syslog (RFC 5424)** y **CEF**.
* 📧 **Alertas Multi-canal:** Generación e integración de notificaciones *in-app* y reportes automáticos en HTML vía correo electrónico.
* 👥 **Control de Acceso (RBAC):** Gestión granular de permisos para roles de *Superadministrador*, *Analista SOC* y *Auditor*.

---

## 🚀 Tecnologías Utilizadas

* **Frontend:** React, TypeScript, Tailwind CSS, Recharts, Lucide Icons
* **Backend / API:** Node.js, Express, Nodemailer
* **IA & Forense:** Google Gemini API (Gemini 3.6 Flash)
* **Seguridad:** Cifrado AES-256, Checksum SHA-256
