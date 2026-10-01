# SmartShop Buddy

**Plan smarter. Shop better. Waste less.**

**Live App:** https://smartshop-buddy.ai.studio/

SmartShop Buddy is a full-stack family shopping companion that connects a digital shopping and home-inventory application with a simple physical kit: a foldable reusable cloth bag, 3 Kids' Choice Tokens, and food organizer labels.

It helps families plan shopping before leaving home, check what they already have, reduce unnecessary purchases and repeat trips, encourage reusable bags, and make children's shopping choices more limited and thoughtful.

---

## The Problem

Shopping can become stressful and wasteful when it is not properly planned.

People may forget items they need and make additional trips to the shop. They may also buy things they already have at home, leading to unnecessary purchases and, especially with food, items being forgotten or wasted.

Single-use plastic bags also contribute to plastic waste.

Shopping with children can create another challenge, as children may repeatedly ask for different things while shopping.

SmartShop Buddy brings these problems together into one simple system.

---

## Our Solution

SmartShop Buddy connects **home inventory → shopping planning → shopping → home organization** into one journey.

### Core Journey

**Plan → Choose → Shop → Organize → Waste Less**

1. **My Kitchen**
   Track what your family already has at home by item, quantity, category, and notes.

2. **Smart Shopping List**
   Create a shopping list and compare items with the current kitchen inventory. The app can identify items that are already available or partially available.

3. **Kids' Choice Tokens**
   Children get a limited number of choices during a shopping trip. The physical kit contains 3 tokens, which are also tracked digitally in the app.

4. **Shopping Mode**
   Use the shopping list while inside the store, mark items as purchased, add forgotten items, and track Kids' Choice Tokens.

5. **Reusable Bag Reminder**
   Reminds users to bring the foldable reusable cloth bag before shopping.

6. **Shopping Summary & Kitchen Update**
   Review what was purchased and add purchased quantities to the home inventory.

7. **Shopping History**
   Completed shopping trips are saved so users can review previous trips.

---

## Key Features

* 👨‍👩‍👧 Family-focused shopping planning
* 🏠 Home kitchen inventory
* 🛒 Smart shopping list
* 🔎 Duplicate and quantity-aware checking
* 🎟️ 3 Kids' Choice Tokens
* ♻️ Reusable bag reminder
* ✅ In-store Shopping Mode
* 📦 Kitchen inventory updates after shopping
* 📊 Shopping summaries
* 🕘 Shopping history
* 🔐 User accounts and separate user data
* 📱 Responsive design for desktop and mobile

---

## How It Works

**My Kitchen**

Users first add the items they already have at home.

↓

**Smart Shopping List**

When users add something they want to buy, SmartShop Buddy checks the kitchen inventory.

For example:

> Milk at home: 1 packet
> Shopping list: 3 packets
> SmartShop Buddy: You may still need to buy 2 packets.

↓

**Kids' Choice Tokens**

The parent starts the shopping trip with 3 available choices.

A child can use a token for an optional item.

**3 → 2 → 1 → 0**

↓

**Shopping Mode**

Users check off items as they shop and can add something they remembered during the trip.

↓

**Shopping Summary**

The app summarizes the completed shopping trip.

↓

**Update My Kitchen**

Purchased quantities can be added to the existing kitchen inventory.

Example:

**Milk: 1 packet + 2 purchased = 3 packets**

↓

**Shopping History**

The completed trip is saved for future reference.

---

## Physical Kit

The digital application is designed to work together with a simple physical kit containing:

* **Foldable Reusable Cloth Bag** — encourages reusable shopping instead of relying on single-use plastic bags.
* **3 Kids' Choice Tokens** — gives children a limited number of choices during a shopping trip.
* **Food Organizer Labels** — helps organize food and household items at home.

The physical kit and digital app are designed to support the same shopping journey.

---

## Technology Architecture

### Frontend

* React 19
* TypeScript
* Tailwind CSS v4
* Lucide Icons

### Backend

* Node.js
* Express
* REST API

### Persistence

* JSON-based persistent database
* Scrypt password hashing
* Bearer token authentication
* User-specific data isolation

### Main Application Components

* `AuthView.tsx` — Sign Up, Log In, and kit overview
* `KitchenSetupView.tsx` — First-time kitchen setup
* `DashboardView.tsx` — Main dashboard
* `KitchenInventoryView.tsx` — Kitchen inventory and organization
* `ShoppingListView.tsx` — Smart shopping list
* `KidsTokensView.tsx` — Kids' Choice Tokens
* `ShoppingModeView.tsx` — In-store shopping experience
* `HistoryView.tsx` — Shopping history
* `ProfileView.tsx` — Account settings and kit guide

---

## Installation & Local Development

### Prerequisites

* Node.js 18+
* npm

### Install Dependencies

```bash
npm install
```

### Start the Development Server

```bash
npm run dev
```

The application runs on:

```text
http://localhost:3000
```

The Express backend and Vite frontend are served together.

---

## Production Build

### Build

```bash
npm run build
```

### Start

```bash
NODE_ENV=production npm start
```

The production server serves the compiled frontend together with the REST API.

---

## Hackathon Demo Flow

A suggested demonstration flow:

1. Create an account or use the available demo account.
2. Complete the first-time **My Kitchen** setup.
3. Add a few items that are already available at home.
4. Open **Shopping List**.
5. Add an item that already exists in the kitchen to demonstrate the inventory check.
6. Add an item that is genuinely needed.
7. Start a shopping trip.
8. Confirm the **Reusable Bag** reminder.
9. Use the **Kids' Choice Tokens**.
10. Open **Shopping Mode** and mark items as purchased.
11. Finish the shopping trip.
12. Show the **Shopping Summary**.
13. Update **My Kitchen** with the purchased quantities.
14. Open **Shopping History** to show the completed trip.

---

## AI Assistance Disclosure

AI tools were used during the development of SmartShop Buddy to assist with application development, feature implementation, debugging, refinement, and documentation.

The project concept, problem definition, feature requirements, product flow, physical-kit concept, and final project direction were defined and reviewed by the project creator.

---

## Project Goal

SmartShop Buddy aims to make everyday shopping more organized and thoughtful by helping families:

* Plan before shopping
* Remember what they actually need
* Check what they already have
* Reduce unnecessary purchases
* Reduce repeat shopping trips
* Encourage reusable shopping bags
* Give children limited choices
* Organize items at home

**Plan smarter. Shop better. Waste less.**

