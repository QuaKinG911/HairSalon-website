# Luxe Barber - Agent Guidelines

## Build/Lint/Test Commands
- **Dev Full Stack**: `npm run dev:full` (frontend port 3000, backend 3001)
- **Frontend Only**: `npm run dev`
- **Backend Only**: `npm run server`
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Testing**: No automated tests; manual UI/API testing via curl/Postman. No single test command available.

## Code Style Guidelines
- **TypeScript/React**: Use `React.FC`, define interfaces in `types.ts`, union types for enums, ES modules.
- **Imports**: Group React/Router first, then externals, then locals. Relative imports with `../`.
- **File Structure**: `components/`, `pages/` (role subdirs), `context/`, `services/`, `utils/`, `server/routes/`.
- **Naming**: Components/Interfaces: PascalCase; Functions/Files: camelCase; Constants: UPPER_CASE; API: RESTful.
- **Styling**: Tailwind utility-first, amber palette, responsive (`sm:`, `md:`, `lg:`), serif headings, sans body.
- **State**: React Context for global, `useState` local, custom hooks, API for server state.
- **Error Handling**: Try-catch for APIs, user-friendly messages, graceful degradation, structured backend responses.
- **Auth/Security**: JWT + bcrypt, role-based `ProtectedRoute`, token validation. Demo password: "password".

## Project Architecture
- **Frontend**: React + TS + Vite + Tailwind
- **Backend**: Node.js + Express + JWT + bcrypt
- **Database**: JSON file (`database.json`)
- **Workflow**: Auth → Role Dashboard → Booking Flow → AI Features
- **Demo Accounts**: Admin: admin@hairsalon.com, Barber: barber@hairsalon.com, Customer: customer@example.com (all password: "password")