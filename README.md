# Herso CRM — Prueba Técnica Fullstack

## Instrucciones de ejecución

### Requisitos técnicos previos
- SQL Server con AdventureWorks2025 restaurada
- PHP 8.5 NTS con extensiones `pdo_sqlsrv` y `sqlsrv`
- Composer 2.x
- Node.js 22.x y Angular CLI 20.x
- Configurar php.ini


### 2. Backend
```bash
cd herso-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```
La API queda disponible en `http://127.0.0.1:8000/api`.

### 3. Frontend
```bash
cd herso-frontend
npm install
ng serve
```
La aplicación queda disponible en `http://localhost:4200`.

---

## Supuestos y decisiones técnicas

- **Clientes individuales únicamente:** la vista vw_ClientesCompras filtra solo clientes con PersonID (personas físicas). Los clientes empresa tienen PersonID = NULL en AdventureWorks y no cuentan con nombre de persona asociado.
- **Clasificación en backend:** calcula dinámicamente al responder la API, evitando duplicar lógica en la base de datos. Los umbrales son: Bronze < $5,000 · Silver $5,000–$50,000 · Gold > $50,000.
- **Soft delete:** el campo IsDeleted marca registros eliminados sin borrarlos físicamente, preservando trazabilidad.
- **Paginación configurable:** se agregó paginación para evitar cargar el total de ~19,000 clientes de AdventureWorks en una sola petición.

---

### ¿Qué mejoraría si esto fuera a producción?

- **1:** agregar JWT o similares para proteger todos los endpoints. Actualmente la API es pública.
- **2:** configurar certificado TLS y forzar conexiones seguras.
- **3:** sacar credenciales de .env hacia un gestor de secretos (AWS Secrets Manager, Azure Key Vault).
- **4:** implementar un Handler global en Laravel que devuelva siempre una estructura JSON con códigos de error descriptivos para mejor manejo en front.
- **5:** añadir workers para eficientar el flujo y UX del sistema en tareas de segundo plano y tiempo real.
- **6:** mejorar consultas sql para mayor escalabilidad con grandes volúmenes de datos.
- **7:** asegurarse que el sistema sea compatible con múltiples navegadores y sistemas operativos.

### Validaciones adicionales que agregaría

- Verificar que el CustomerID recibido en el POST de seguimientos exista realmente en Sales.Customer antes de insertar.
- Validar que PokemonId esté dentro del rango válido del API (1–1025) si se envía manualmente.
- Rate limiting en los endpoints de escritura para evitar abuso.
- Validación de formatos de fecha en los filtros.
- Feedback visual inmediato con estado de error por campo en los formularios reactivos.
- IndexedDB o gestor local de navegador para persistencia de datos ante caídas de internet.

### ¿Cómo escalaría la solución?

- **Base de datos:** agregar índices en Sales.SalesOrderHeader.CustomerID y Sales.SalesOrderHeader.OrderDate, que son las columnas más consultadas por los filtros. Considerar una vista indexada si el volumen de datos crece significativamente.
- **Backend:** desplegar un balanceador de carga con múltiples instancias para facilitar el escalado horizontal.
- **Caché:** guardar los resultados de vw_ClientesCompras con TTL corto (5–10 min) para reducir carga en SQL Server ante consultas repetidas.
- **PokeAPI:** cachear las respuestas en Redis para no depender de la disponibilidad de un servicio externo en cada petición.

### ¿Qué partes moverías a servicios, colas o jobs programados?

- Recálculo de clasificación (Bronze/Silver/Gold) con un job programado nocturno que actualice un campo Clasificacion en una tabla auxiliar, evitando calcularlo en cada request.
- Sincronización de datos de API con Job que pre-cargue y cachee los datos de Pokemon más comunes para eliminar dependencia del servicio externo en tiempo real.
- Envío de notificaciones o reportes usando queue con worker dedicado usando Laravel Queues o SQS.

## Mejoras futuras

- Búsqueda full-text en observaciones de seguimientos.
- Dashboard con métricas agregadas (total por clasificación, tendencia de compras mensual, etc).
- Exportación a Excel/XML de la lista de clientes filtrada.
- Historial de cambios visible en la UI para cada seguimiento comercial.
- Uso de AWS Services para optimización.
