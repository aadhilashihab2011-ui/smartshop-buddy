# SmartShop Buddy

**Plan smarter. Shop better. Waste less.**

SmartShop Buddy is a full-stack family shopping companion that bridges a physical kit (Foldable Reusable Cloth Bag, 3 Colorful Kids' Choice Tokens, and Food Organizer Labels) with a digital planning and home inventory application.

---

## Core Journey

**Plan → Choose → Shop → Organize → Waste Less**

1. **Before Shopping (My Kitchen)**: Track what your family already has at home by category, quantity, and shelf notes.
2. **Plan (Smart Shopping List)**: Create a shopping list with automatic kitchen-inventory checking. If you enter an item already in your kitchen (e.g., *Milk*), SmartShop Buddy alerts you (`"You already have Milk at home. Your kitchen currently has 2 packets."`) with options to **Don't Add** or **Add Anyway**.
3. **Prepare (Kids' Choice Tokens & Reusable Bag)**: Set the number of Kids' Choice Tokens for the trip (e.g., 3 tokens) and confirm your foldable reusable cloth bag.
4. **Shop (In-Store Shopping Mode)**: Check off items as you shop (`3 / 7 items completed`), confirm your reusable bag, and let children spend tokens mindfully (`3 → 2 → 1 → 0`, never negative).
5. **After Shopping (Summary, Inventory Update & History)**: Review the trip summary, add bought quantities directly to your kitchen inventory (`Milk: 1 packet + 2 packets = 3 packets`), and keep a per-account history of completed trips.

---

## Technology Architecture

- **Frontend (`src/`)**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
  - `src/components/AuthView.tsx`: Welcome screen, Sign Up, Log In, and Physical + Digital Kit overview.
  - `src/components/KitchenSetupView.tsx`: Mandatory first-time setup wizard (`"Let's set up your kitchen"`).
  - `src/components/DashboardView.tsx`: Personalized greeting, 4 live status cards, and quick navigation.
  - `src/components/KitchenInventoryView.tsx`: Full CRUD kitchen inventory + Home Organization section connected to physical Food Organizer Labels.
  - `src/components/ShoppingListView.tsx`: Smart shopping list with real-time duplicate detection against My Kitchen.
  - `src/components/KidsTokensView.tsx`: Positive Kids' Choice Token counter and parent reset controls.
  - `src/components/ShoppingModeView.tsx`: In-store checklist, reusable bag reminder, token counter, and post-shopping summary + 1-click kitchen inventory update.
  - `src/components/HistoryView.tsx`: Per-user archive of completed shopping trips.
  - `src/components/ProfileView.tsx`: Account settings, logout, kit guide, and documentation.
- **Backend (`server.ts`)**: Node.js + Express REST API (`/api/auth/*`, `/api/kitchen/*`, `/api/shopping-list/*`, `/api/tokens/*`, `/api/shopping-session/*`, `/api/shopping-trips/*`).
- **Database / Persistence (`server/db.ts`)**: Persistent JSON file database (`data/smartshop_db.json`) with scrypt password hashing, Bearer token authentication, and strict `userId` data isolation so different users can never see or modify each other's data.

---

## Installation & Local Development

### Prerequisites
- Node.js 18+ and npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Full-Stack Development Server
```bash
npm run dev
```
The application runs on `http://localhost:3000` (serving both the Express `/api/*` backend and Vite React frontend).

---

## Production Build & Deployment

### 1. Build the Frontend Assets
```bash
npm run build
```
This compiles the React + TypeScript application into the `dist/` directory.

### 2. Run in Production Mode
```bash
NODE_ENV=production npm start
```
In production mode, `server.ts` serves the compiled static bundle from `dist/` alongside the `/api/*` REST routes on port `3000`.

### Deploying to Cloud Run / Render / Railway / Fly.io
- **Build Command**: `npm install && npm run build`
- **Start Command**: `NODE_ENV=production npm start`
- **Port**: `3000`
- **Persistent Volume (Optional)**: Mount a persistent volume at `/app/data` to preserve `data/smartshop_db.json` across container redeployments.

---

## 3–5 Minute Hackathon Demo Script

1. **Create Account / Log In**: Click **Create Account** on the Welcome screen (or click **Try Demo Account (Aadhila)**).
2. **First-Time Kitchen Setup**: Add existing kitchen items (or click **Quick-Fill Example Kitchen** to add *Milk — 2 packets, Rice — 5 kg, Eggs — 10, Bread — 1 packet, Apples — 6, Cereal — 1 box*), then click **Kitchen Setup Complete**.
3. **Dashboard**: View your personalized dashboard (`"Hi, Aadhila! Ready to shop smarter?"`).
4. **Duplicate Warning in Smart Shopping List**: Open **Shopping List**, enter `Milk`, and click **Add Item** to demonstrate the alert: *"You already have Milk at home. Your kitchen currently has 2 packets."* Choose **Don't Add** (or **Add Anyway**).
5. **Add Genuinely Needed Item**: Enter `Vegetables` (`1 bag`, *Fruits & Vegetables*) and add it to the list.
6. **Set Kids' Choice Tokens**: Open **Kids' Tokens** and verify today's allowance is set to `3 tokens`.
7. **Enter Shopping Mode**: Open **Shopping Mode**, confirm the **♻️ Reusable Bag** reminder (**Yes, I'm ready**), mark items as bought, and click **Use 1 Token**.
8. **Finish Shopping & Update Kitchen**: Click **Finish Shopping** to view the **Shopping Complete!** summary, then click **Update Kitchen Inventory** to add bought quantities directly to **My Kitchen** and view the saved trip in **History**.
