# AGENTS.md — Padel Club Manager

Monorepo: Spring Boot API (`padel-api/`) + Angular UI (`padel-ui/`). Full-stack padel club management app.

## Quick start

1. Start DB: `docker compose up -d` (PostgreSQL on `:5432`, pgAdmin on `:5050`)
2. Run API: `cd padel-api && ./mvnw spring-boot:run` (Windows: `mvnw.cmd`)
3. Run UI: `cd padel-ui && npm start` (dev server on `:4200`)

## Architecture

- `padel-api/` — Spring Boot 4.0.3 (Java 21). Maven. Entry: `PadelApiApplication.java`.
- `padel-ui/` — Angular 21, **standalone components** (no `NgModule`). Entry: `src/main.ts` → `bootstrapApplication(AppComponent, appConfig)`. Package manager pinned: `npm@11.8.0`.
- DB: PostgreSQL 15. Credentials: `padel_admin` / `padel_password`, database `padel_club_db`.
- JPA `ddl-auto=update`, so schema changes auto-migrate on startup.

## Developer commands

### API (padel-api)
- `./mvnw spring-boot:run` — start dev server
- `./mvnw test` — run tests
- `./mvnw clean package` — build JAR
- Uses **Lombok**. Ensure IDE annotation processing is enabled.

### UI (padel-ui)
- `npm start` / `ng serve` — dev server (`http://localhost:4200`)
- `ng build` — production build (output to `dist/`)
- `ng test` — **Vitest** (not Karma/Jasmine). Configured via `@angular/build:unit-test` builder.
- `ng generate component <name>` — scaffolds standalone component with SCSS

## Testing quirks

- UI tests use **Vitest** + `jsdom`. No Karma/Jasmine infrastructure.
- Backend tests are standard JUnit 5 + Spring Boot Test.

## Security

- Spring Security + JWT (jjwt 0.11.5).
- JWT secret is hardcoded in `application.properties`. Do not commit a changed secret.

## Gotchas

- UI uses `bootstrap@5.3.8` and `ng2-charts@10.0.0`.
- API uses `spring-boot-starter-webmvc` (not WebFlux).
- `DataLoader.java` seeds initial data — review before assuming a clean DB state.
- No CI workflows or pre-commit hooks are configured yet.
