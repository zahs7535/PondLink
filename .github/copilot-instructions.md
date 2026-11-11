# PondLink Johor PWA
Student prototype for Innates PLT: Johor fish farmers see APPROVED information
about nearby ponds. Stack: React + Vite + vite-plugin-pwa, Leaflet map.
Rules:
- Use only fictional sample data (src/data/seed.js). Never real farm data.
- Roles: admin (Innates staff) and farmer. Farmers see only fields an admin
  marked shared. Hidden fields must never reach the UI, list, search or map.
- All data access goes through src/data/api.js (to be swapped for Supabase).
- Mobile-first, simple UI, English. Add a visible "Sample data" banner.
Stories: US01 admin sets sharing; US02 farmer sign-in + own pond (pH, DO,
alert, last reading); US03 searchable community list; US04 neighbour pond page;
US05 Johor map. Write Vitest tests for each acceptance rule.
Commit messages start with the story ID, e.g. "US03: community list".