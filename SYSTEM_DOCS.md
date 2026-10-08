# Documentación del Sistema

Este documento explica la arquitectura actual y cómo se conectan las distintas partes del sistema de gestión del lavadero.

## Arquitectura General

El sistema está dividido en dos partes principales:
1. Backend: Construido en Django REST Framework se encarga de la base de datos, la lógica de negocio y proveer las API.
2. Frontend: Construido con React usando Vite, TypeScript y Tailwind CSS, es la interfaz con la que interactúan los usuarios

Ambas partes se comunican a través de peticiones HTTP, usando JSON

---

## 1. Backend (Django)
Corre por defecto en `http://localhost:8000/`.

El sistema cuenta con las siguientes entidades principales:
* Employee (Empleado): Relacionado uno-a-uno con el modelo `User` de Django. Representa a los trabajadores del lavadero.
* Service (Servicio): Define los tipos de lavado (ej. Lavado Completo, Lavado Básico) y sus precios según el tipo de vehículo que lavemos (Auto, Camioneta, Moto).
  * WashRecord: Es el registro de cada lavado realizado en donde se guarda:
  * Vehículo, Patente y Tipo* El servicio realizado
  * Los empleados que participaron
  * Fecha y el costo.
  * La lógica interna: Al guardarse, calcula automáticamente el precio y la comisión a repartir entre los empleados (40% del total).

### API y Endpoints
COnstruido con APIs REST. Las principales son:
* `GET /api/washrecords/`: Lista los lavados. Recientemente le agregamos un filtro para buscar por fecha.
* `POST /api/washrecords/`: Para crear un lavado.
* `GET, PATCH, DELETE /api/washrecords/<id>/`: Ver, editar o eliminar un lavado específico.
* `GET /api/services/` y `GET /api/employees/`: Para obtener los listados de servicios y empleados al momento de crear un lavado.

## 2. Frontend (React)
Corre por defecto en `http://localhost:5173/`.

### Estructura y Navegación (App.tsx)
Utiliza`react-router-dom para manejar las pantallas:
* `/login`: Pantalla de inicio de sesión (`Login.tsx`).
* `/`: Pantalla principal (`DailyList.tsx`), que muestra la lista de lavados filtrada por día mediante un calendario.
* `/lavado/nuevo`: Formulario para registrar un lavado (`WashRecordCreate.tsx`).
* `/lavado/:id`: Pantalla para ver el detalle de un lavado, editarlo o eliminarlo (`WashRecordDetail.tsx`).

### Conexión con el Backend (`api/washRecords.api.js`)
Toda la comunicación con la API de Django está centralizada aquí usando la librería de Axios.
* Se configuró un interceptor que automáticamente toma el token de seguridad (`access_token`) guardado en el navegador y lo inyecta en cada petición HTTP en el header. 


## El flujo de Trabajo
1. El usuario entra a `/lavado/nuevo` en React.
2. El componente `WashRecordCreate.tsx` al montarse hace dos peticiones (GET) para cargar los servicios (`/api/services/`) y los empleados (`/api/employees/`).
3. El usuario completa el formulario y presiona Guardar.
4. React llama a `createWashRecord(formData)`, lo que hace un `POST /api/washrecords/` enviando los datos al backend.
5. Django recibe los datos, valida permisos, guarda en la base de datos (calculando precios/comisiones en el modelo `WashRecord`)
6. React redirecciona al usuario a la pantalla principal donde se vuelve a pedir la lista actualizada del día.
