# Sistema de Gestión para Lavadero

## Acerca del Proyecto
Este proyecto es un sistema web de gestión full-stack, pensado específicamente para administrar un Lavadero de vehículos. Permite llevar un registro detallado de los trabajos diarios, gestionar los empleados involucrados y calcular de forma automática los ingresos y comisiones.

### Características Principales:
- **Frontend Interactivo:** Construido con React, Vite y TailwindCSS para visualizar de forma ágil y moderna la lista de lavados registrados en el día.
- **Gestión de Servicios y Vehículos:** Soporte para registrar múltiples tipos de vehículos (Auto, Camioneta/SUV, Moto) con precios dinámicos según el servicio prestado, con posibilidad de añadir "cobros extras".
- **Sistema de Comisiones:** Asignación de múltiples empleados a un mismo lavado, calculando automáticamente la comisión correspondiente (ej. 40%) repartida de manera equitativa entre los empleados.
- **Panel de Administración Backend:** Administrador listo para usar provisto por Django para gestionar rápidamente todos los registros, altas de empleados y estadísticas.

## Arquitectura y Tecnologías
El proyecto se compone de dos partes integradas mediante API REST y políticas CORS:

**Backend:**
- **Python & Django** (Lógica de negocio y Panel de Admin)
- **Django REST Framework (DRF)** (Construcción de la API)
- **SQLite** (Base de datos de desarrollo)
- **django-cors-headers** (Gestión de peticiones Cross-Origin)

**Frontend:**
- **React 18** (Librería de UI)
- **Vite** (Empaquetador y entorno de desarrollo ultra rápido)
- **Tailwind CSS** (Estilos rápidos y modernos)
- **Axios** (Peticiones asíncronas a la API)

## Proyecto de Prueba con Antigravity
Más allá de su utilidad práctica, este repositorio sirve como demostración del uso de Antigravity, el asistente avanzado de programación basado en Inteligencia Artificial de Google DeepMind. Gracias a esta herramienta se logró iterar sobre reglas de negocio, refactorizar componentes React y otras cositas más
