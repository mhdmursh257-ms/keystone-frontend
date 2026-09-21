# KEYSTONE --- Project Analysis & Technical Review

## 1. Project overview

KEYSTONE is a field-service/work-order management application with:

-   **Backend:** Spring Boot 2.7.18, Java 8, Spring Data JPA, Spring
    Security, JWT, MySQL.
-   **Frontend:** React 19 + Vite 8, React Router 7, Axios, Recharts,
    Tailwind CSS.
-   **Core domain:** users/roles, customers/sites, work orders,
    technicians, time logs, parts/inventory, status history, SLA
    monitoring, and invoice PDF generation.
-   **API documentation:** Springdoc/OpenAPI with JWT bearer
    documentation.

The supplied RAR contains **12,815 archive entries** under two
application folders:

  Folder                    Files   Approx. size
  ---------------------- -------- --------------
  `key_stone`                 173        0.45 MB
  `key_stone-frontend`     11,631      136.67 MB

The frontend count is dominated by the checked-in `node_modules`
directory (**11,608 files**). The first-party frontend source contains
14 files; backend source/test resources contain 50 files.

## 2. Architecture

``` text
React/Vite frontend
        |
        | Axios + JWT Bearer
        v
Spring Boot REST API (:5500)
        |
        +-- Spring Security + JWT
        +-- Controllers
        +-- Services
        +-- Spring Data JPA
        |
        v
MySQL: key_stone
```

### Backend layers

-   `Config/` --- security, CORS, OpenAPI, MVC.
-   `Controller/` --- authentication, work orders, inventory, time logs,
    dashboard, customer sites.
-   `Service/` --- work-order workflow, inventory, time logging,
    dashboard metrics, SLA scheduler, invoice PDF.
-   `Entity/` --- JPA domain model.
-   `Repository/` --- Spring Data repositories.
-   `Security/` --- JWT provider/filter, user details, role model.
-   `dto/` --- request/response DTOs.
-   `Exception/` --- global exception handling and stock exception.
-   `Enum/` --- roles, permissions, priorities and work-order states.

### Frontend pages/components

-   Login
-   Dashboard / work-order list
-   Create work order
-   Public order tracking
-   Protected routing
-   Navigation and theme switching
-   Invoice download
-   Audit-history display

## 3. Domain model

Main entities identified:

-   `UserAuth`
-   `WorkOrder`
-   `Site`
-   `Part`
-   `PartUsage`
-   `TimeLog`
-   `WorkOrderStatusHistory`

The work-order lifecycle implemented in `WorkOrderService` is:

`NEW -> ASSIGNED -> IN_PROGRESS -> ON_HOLD -> IN_PROGRESS -> COMPLETED -> CLOSED`

Cancellation is allowed from `NEW` and `ASSIGNED`. `CLOSED` and
`CANCELLED` are terminal states.

## 4. API surface

The backend exposes endpoints for:

-   Authentication: login, registration, bulk registration.
-   Work orders: create, list, get, update, delete, history, assignment,
    status transition, public tracking, invoice.
-   Inventory: list parts, create part, consume part against a work
    order, list usage.
-   Time logs: start, stop, list.
-   Dashboard: summary metrics.
-   Sites: create and list sites by customer.

The API uses method-level `@PreAuthorize` checks for most protected
operations.

## 5. Security review

### Immediate priorities

1.  Remove the database password from `application.properties` and
    rotate it.
2.  Disable unrestricted public registration or introduce a controlled
    onboarding/admin flow.
3.  Derive audit actor IDs from the authenticated principal, not request
    parameters.
4.  Add customer-to-resource authorization checks for CUSTOMER
    endpoints.
5.  Replace public full-entity tracking responses with a dedicated
    minimal DTO.
6.  Replace the embedded JWT fallback secret with an external mandatory
    secret.
7.  Restrict CORS to known origins.
8.  Fix `hasAnyrole` to `hasAnyRole`.
9.  Use request DTOs instead of binding JPA entities directly from JSON.
10. Align the frontend login response contract with the backend.

### Credential/configuration observations

The supplied configuration contains:

-   MySQL host: `127.0.0.1:3306`
-   Database: `key_stone`
-   Username: `root`
-   A plaintext password in source
-   Server port: `5500`
-   Hibernate `ddl-auto=update`
-   Swagger/OpenAPI endpoints enabled

For production, secrets and environment-specific configuration should be
externalized.

## 6. Frontend issues found

-   `App.jsx` imports `./components/workOrderList`, while the file is
    `WorkOrderList.jsx`; this is case-sensitive on Linux.
-   `authService.js` expects `response.data.user`, but the backend
    response has `userId`, `email`, and `role` directly.
-   `WorkOrderList.jsx` calls `setSearchFilter`; the declared setter is
    `setStatusFilter`.
-   Role logic in the UI contains ADMIN fallbacks, which can mask
    authentication/authorization data problems.
-   API URLs are hard-coded to `http://localhost:5500`; use
    environment-based configuration.
-   The JWT is stored in `localStorage`.
-   The create-order form sends many server-owned fields that should be
    controlled by the backend.

## 7. Backend quality observations

Positive design elements:

-   Clear separation of controller/service/repository/security concerns.
-   BCrypt password hashing.
-   Stateless JWT authentication.
-   Explicit work-order state-transition rules.
-   Status-history/audit entity.
-   Inventory stock validation service and custom insufficient-stock
    exception.
-   Scheduled SLA breach checking.
-   Invoice PDF generation.
-   OpenAPI configuration.

Areas to improve:

-   Avoid direct repository access from controllers where business rules
    belong in services.
-   Avoid accepting JPA entities as API input.
-   Enforce ownership/tenant boundaries.
-   Add transaction and authorization tests.
-   Replace field injection with constructor injection consistently.
-   Use structured logging instead of `System.out.println`.
-   Add stronger validation for IDs, quantities, dates and enum/state
    transitions.

## 8. Build verification

### Frontend

A Vite build was attempted. It could not complete because the archived
`node_modules` is missing the Linux-native Rolldown binding. This is an
environment/dependency-package problem, so a successful build should be
re-tested after a clean dependency install.

### Backend

The Maven wrapper was invoked. It attempted to download Maven 3.9.16 but
the analysis environment has no external network access, so a full Maven
test/build could not be completed.

Therefore, the findings are based on source/configuration analysis plus
the available build attempts; they should be confirmed in the project's
normal development environment.

## 9. Recommended remediation order

### Phase 1 --- Security and correctness

-   Externalize and rotate DB/JWT secrets.
-   Lock down registration and role assignment.
-   Fix authorization ownership checks.
-   Fix CORS.
-   Fix `hasAnyrole`.
-   Derive actor identity from JWT.
-   Return DTOs instead of full entities for public/private API
    responses.

### Phase 2 --- Functional stability

-   Fix `WorkOrderList` import casing.
-   Fix `setSearchFilter`.
-   Fix login response/localStorage contract.
-   Move API base URL to `.env` configuration.
-   Add frontend error/loading handling consistently.

### Phase 3 --- Architecture and maintainability

-   Move all work-order business operations into services.
-   Introduce request/response DTOs.
-   Replace field injection with constructor injection.
-   Add centralized exception/API error format.
-   Add unit and integration tests.
-   Remove `node_modules`, `bin`, and `target` from source
    control/archive.

## 10. Suggested production structure

``` text
KEYSTONE/
├── key_stone/
│   ├── src/
│   ├── pom.xml
│   └── README.md
├── key_stone-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── package-lock.json
├── .env.example
└── README.md
```

Do not commit actual credentials, generated `target/`, IDE metadata, or
`node_modules/`.

## 11. Detailed report

See **`report.pdf`** for the full technical review, including inventory,
architecture, security findings, functional findings, build-verification
results, and a remediation plan.
