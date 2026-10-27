-- =====================================================================
-- BASE DE DATOS: LAVADERO DE VEHÍCULOS (PostgreSQL)
-- Generado para entorno de Producción / Staging
-- Fecha: 2026-10-27 18:23:37
-- Compatible con Supabase, Neon, Render, Railway, AWS RDS, pgAdmin
-- =====================================================================

DROP TABLE IF EXISTS core_washrecord_employees CASCADE;
DROP TABLE IF EXISTS core_washrecord CASCADE;
DROP TABLE IF EXISTS core_employee CASCADE;
DROP TABLE IF EXISTS core_service CASCADE;
DROP TABLE IF EXISTS django_admin_log CASCADE;
DROP TABLE IF EXISTS auth_user_user_permissions CASCADE;
DROP TABLE IF EXISTS auth_user_groups CASCADE;
DROP TABLE IF EXISTS auth_group_permissions CASCADE;
DROP TABLE IF EXISTS auth_user CASCADE;
DROP TABLE IF EXISTS auth_group CASCADE;
DROP TABLE IF EXISTS auth_permission CASCADE;
DROP TABLE IF EXISTS django_content_type CASCADE;
DROP TABLE IF EXISTS django_session CASCADE;
DROP TABLE IF EXISTS django_migrations CASCADE;

-- 1. Migraciones de Django
CREATE TABLE django_migrations (
  id BIGSERIAL PRIMARY KEY,
  app VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  applied TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 2. Tipos de Contenido
CREATE TABLE django_content_type (
  id SERIAL PRIMARY KEY,
  app_label VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model)
);

-- 3. Permisos
CREATE TABLE auth_permission (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  content_type_id INTEGER NOT NULL REFERENCES django_content_type(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  codename VARCHAR(100) NOT NULL,
  CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename)
);
CREATE INDEX auth_permission_content_type_id_2f476e4b ON auth_permission (content_type_id);

-- 4. Grupos
CREATE TABLE auth_group (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE
);

-- 5. Permisos de Grupos
CREATE TABLE auth_group_permissions (
  id BIGSERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id)
);
CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON auth_group_permissions (group_id);
CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON auth_group_permissions (permission_id);

-- 6. Usuarios
CREATE TABLE auth_user (
  id SERIAL PRIMARY KEY,
  password VARCHAR(128) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE NULL,
  is_superuser BOOLEAN NOT NULL,
  username VARCHAR(150) NOT NULL UNIQUE,
  first_name VARCHAR(150) NOT NULL,
  last_name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL,
  is_staff BOOLEAN NOT NULL,
  is_active BOOLEAN NOT NULL,
  date_joined TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 7. Grupos de Usuarios
CREATE TABLE auth_user_groups (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT auth_user_groups_user_id_group_id_94350c0c_uniq UNIQUE (user_id, group_id)
);
CREATE INDEX auth_user_groups_user_id_6a12ed8b ON auth_user_groups (user_id);
CREATE INDEX auth_user_groups_group_id_97559544 ON auth_user_groups (group_id);

-- 8. Permisos de Usuarios
CREATE TABLE auth_user_user_permissions (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT auth_user_user_permissions_user_id_permission_id_14a6b632_uniq UNIQUE (user_id, permission_id)
);
CREATE INDEX auth_user_user_permissions_user_id_a95ead1b ON auth_user_user_permissions (user_id);
CREATE INDEX auth_user_user_permissions_permission_id_1fbb5f2c ON auth_user_user_permissions (permission_id);

-- 9. Log de Administrador
CREATE TABLE django_admin_log (
  id SERIAL PRIMARY KEY,
  action_time TIMESTAMP WITH TIME ZONE NOT NULL,
  object_id TEXT NULL,
  object_repr VARCHAR(200) NOT NULL,
  action_flag SMALLINT NOT NULL CHECK (action_flag >= 0),
  change_message TEXT NOT NULL,
  content_type_id INTEGER NULL REFERENCES django_content_type(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
  user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON django_admin_log (content_type_id);
CREATE INDEX django_admin_log_user_id_c564eba6 ON django_admin_log (user_id);

-- 10. Sesiones
CREATE TABLE django_session (
  session_key VARCHAR(40) PRIMARY KEY,
  session_data TEXT NOT NULL,
  expire_date TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX django_session_expire_date_a5c62663 ON django_session (expire_date);

-- 11. Servicios del Lavadero
CREATE TABLE core_service (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price_auto NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  price_camioneta NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  price_moto NUMERIC(10,2) NOT NULL DEFAULT 0.00
);

-- 12. Empleados del Lavadero
CREATE TABLE core_employee (
  id BIGSERIAL PRIMARY KEY,
  phone VARCHAR(20) NULL,
  user_id INTEGER NOT NULL UNIQUE REFERENCES auth_user(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

-- 13. Registro de Lavados (Inicia vacía para producción)
CREATE TABLE core_washrecord (
  id BIGSERIAL PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  vehicle VARCHAR(20) NOT NULL,
  vehicle_plate VARCHAR(20) NOT NULL,
  vehicle_type VARCHAR(20) NOT NULL DEFAULT 'AUTO',
  extra_charge NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  price_charged NUMERIC(10,2) NULL,
  total_commission NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  service_id BIGINT NOT NULL REFERENCES core_service(id) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX core_washrecord_service_id_c4d8051b ON core_washrecord (service_id);

-- 14. Relación Muchos a Muchos: Lavados <-> Empleados
CREATE TABLE core_washrecord_employees (
  id BIGSERIAL PRIMARY KEY,
  washrecord_id BIGINT NOT NULL REFERENCES core_washrecord(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  employee_id BIGINT NOT NULL REFERENCES core_employee(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT core_washrecord_employees_washrecord_id_employee_id_a887e668_uniq UNIQUE (washrecord_id, employee_id)
);
CREATE INDEX core_washrecord_employees_washrecord_id_c45bdde3 ON core_washrecord_employees (washrecord_id);
CREATE INDEX core_washrecord_employees_employee_id_b301c0bc ON core_washrecord_employees (employee_id);

-- =====================================================================
-- DATOS INICIALES (SEEDS / CONFIGURACIÓN LIMPIA)
-- =====================================================================

-- Registrar migraciones de Django
INSERT INTO django_migrations (id, app, name, applied) VALUES (1, 'contenttypes', '0001_initial', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (2, 'auth', '0001_initial', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (3, 'admin', '0001_initial', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (4, 'admin', '0002_logentry_remove_auto_add', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (5, 'admin', '0003_logentry_add_action_flag_choices', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (6, 'contenttypes', '0002_remove_content_type_name', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (7, 'auth', '0002_alter_permission_name_max_length', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (8, 'auth', '0003_alter_user_email_max_length', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (9, 'auth', '0004_alter_user_username_opts', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (10, 'auth', '0005_alter_user_last_login_null', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (11, 'auth', '0006_require_contenttypes_0002', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (12, 'auth', '0007_alter_validators_add_error_messages', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (13, 'auth', '0008_alter_user_username_max_length', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (14, 'auth', '0009_alter_user_last_name_max_length', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (15, 'auth', '0010_alter_group_name_max_length', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (16, 'auth', '0011_update_proxy_permissions', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (17, 'auth', '0012_alter_user_first_name_max_length', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (18, 'core', '0001_initial', NOW());
INSERT INTO django_migrations (id, app, name, applied) VALUES (19, 'sessions', '0001_initial', NOW());

-- Registrar ContentTypes
INSERT INTO django_content_type (id, app_label, model) VALUES (1, 'admin', 'logentry');
INSERT INTO django_content_type (id, app_label, model) VALUES (2, 'auth', 'permission');
INSERT INTO django_content_type (id, app_label, model) VALUES (3, 'auth', 'group');
INSERT INTO django_content_type (id, app_label, model) VALUES (4, 'auth', 'user');
INSERT INTO django_content_type (id, app_label, model) VALUES (5, 'contenttypes', 'contenttype');
INSERT INTO django_content_type (id, app_label, model) VALUES (6, 'sessions', 'session');
INSERT INTO django_content_type (id, app_label, model) VALUES (7, 'core', 'service');
INSERT INTO django_content_type (id, app_label, model) VALUES (8, 'core', 'employee');
INSERT INTO django_content_type (id, app_label, model) VALUES (9, 'core', 'washrecord');

-- Registrar Permisos
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (1, 'Can add log entry', 1, 'add_logentry');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (2, 'Can change log entry', 1, 'change_logentry');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (3, 'Can delete log entry', 1, 'delete_logentry');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (4, 'Can view log entry', 1, 'view_logentry');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (5, 'Can add permission', 2, 'add_permission');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (6, 'Can change permission', 2, 'change_permission');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (7, 'Can delete permission', 2, 'delete_permission');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (8, 'Can view permission', 2, 'view_permission');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (9, 'Can add group', 3, 'add_group');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (10, 'Can change group', 3, 'change_group');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (11, 'Can delete group', 3, 'delete_group');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (12, 'Can view group', 3, 'view_group');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (13, 'Can add user', 4, 'add_user');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (14, 'Can change user', 4, 'change_user');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (15, 'Can delete user', 4, 'delete_user');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (16, 'Can view user', 4, 'view_user');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (17, 'Can add content type', 5, 'add_contenttype');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (18, 'Can change content type', 5, 'change_contenttype');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (19, 'Can delete content type', 5, 'delete_contenttype');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (20, 'Can view content type', 5, 'view_contenttype');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (21, 'Can add session', 6, 'add_session');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (22, 'Can change session', 6, 'change_session');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (23, 'Can delete session', 6, 'delete_session');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (24, 'Can view session', 6, 'view_session');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (25, 'Can add service', 7, 'add_service');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (26, 'Can change service', 7, 'change_service');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (27, 'Can delete service', 7, 'delete_service');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (28, 'Can view service', 7, 'view_service');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (29, 'Can add employee', 8, 'add_employee');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (30, 'Can change employee', 8, 'change_employee');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (31, 'Can delete employee', 8, 'delete_employee');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (32, 'Can view employee', 8, 'view_employee');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (33, 'Can add wash record', 9, 'add_washrecord');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (34, 'Can change wash record', 9, 'change_washrecord');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (35, 'Can delete wash record', 9, 'delete_washrecord');
INSERT INTO auth_permission (id, name, content_type_id, codename) VALUES (36, 'Can view wash record', 9, 'view_washrecord');

-- Crear Usuario Administrador Inicial:
-- Usuario: admin
-- Contraseña: admin123
INSERT INTO auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) VALUES (1, 'pbkdf2_sha256$1000000$TNt0Va9rn4uqtXdXyxDzFH$gFpKGGNF3R3+4nYmVTOozPSDyrtwwRcOt5nKXYUvnkA=', NULL, true, 'admin', 'Admin', 'Lavadero', 'admin@lavadero.com', true, true, NOW());

-- Servicios iniciales del Lavadero
INSERT INTO core_service (id, name, price_auto, price_camioneta, price_moto) VALUES
  (1, 'Lavado Básico', 20000.00, 25000.00, 10000.00),
  (2, 'Lavado Completo', 30000.00, 38000.00, 15000.00),
  (3, 'Lavado de Motor y Chasis', 15000.00, 20000.00, 8000.00);

-- Ajustar secuencias de PostgreSQL para evitar colisiones de IDs
SELECT setval('django_migrations_id_seq', (SELECT MAX(id) FROM django_migrations));
SELECT setval('django_content_type_id_seq', (SELECT MAX(id) FROM django_content_type));
SELECT setval('auth_permission_id_seq', (SELECT MAX(id) FROM auth_permission));
SELECT setval('auth_user_id_seq', (SELECT MAX(id) FROM auth_user));
SELECT setval('core_service_id_seq', (SELECT MAX(id) FROM core_service));

-- Fin del script PostgreSQL