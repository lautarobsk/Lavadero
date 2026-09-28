# Sistema de Gestión para Lavadero

## Acerca del Proyecto
Este proyecto es un sistema de gestión desarrollado en Django, pensado específicamente para administrar un Lavadero de vehículos. Permite llevar un registro detallado de los trabajos realizados, los empleados que participaron y calcular de forma automática los pagos y comisiones.

### Características Principales:
- **Gestión de Servicios:** Soporte para múltiples tipos de servicios (ej. Lavado Básico, Lavado Completo) con listas de precios diferenciadas según el tamaño o tipo de vehículo (Auto, Camioneta/SUV, Moto).
- **Registro Diario de Lavados:** Control de vehículos lavados por patente, tipo de vehículo y servicio seleccionado. Permite añadir "cobros extras" a demanda.
- **Sistema de Comisiones:** Permite asignar múltiples empleados a un mismo lavado. El sistema calcula automáticamente la comisión total (ej. 40% del precio final) y la divide equitativamente entre los empleados involucrados en ese trabajo.
- **Panel de Administración (Django Admin):** Interfaz lista para usar que permite a los operadores administrar registros, modificar precios y visualizar las estadísticas de forma rápida.

## Proyecto de Prueba con Antigravity 🚀
Más allá de su utilidad práctica, este repositorio sirve como demostración y entorno de pruebas para el uso de **Antigravity**, el asistente avanzado de programación basado en Inteligencia Artificial.

A través del uso de la IA, se logró:
- Prototipar y modelar rápidamente las entidades de base de datos.
- Iterar sobre las reglas de negocio en tiempo real (por ejemplo, transicionar de un precio fijo a un modelo de precios dinámicos por tipo de vehículo).
- Ejecutar migraciones y refactorizar código sin salir del editor.
- Experimentar el impacto de la colaboración "Pair Programming" con agentes inteligentes de Google DeepMind para acelerar el desarrollo backend.

## Tecnologías Utilizadas
- **Python**
- **Django** (Backend y Panel de Administración)
- **SQLite** (Base de datos por defecto para desarrollo local)
- **Django REST Framework** (Preparado para la futura exposición de endpoints y APIs)


