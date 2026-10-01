import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import { type UserProfile } from './src/types.ts';

interface AuthenticatedRequest extends Request {
  user?: UserProfile;
  authToken?: string;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // Authentication Middleware
  const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please log in.' });
      return;
    }
    const token = authHeader.slice(7).trim();
    const user = db.getUserByToken(token);
    if (!user) {
      res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
      return;
    }
    req.user = user;
    req.authToken = token;
    next();
  };

  // --- AUTHENTICATION ROUTES ---
  app.post('/api/auth/signup', (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const result = db.signUp(name || '', email || '', password || '');
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Could not create account.' });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = db.logIn(email || '', password || '');
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Invalid credentials.' });
    }
  });

  app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    if (req.authToken) {
      db.logOut(req.authToken);
    }
    res.json({ success: true });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const account = db.getUserAccountData(req.user!.id);
    if (!account) {
      res.status(404).json({ error: 'Account not found.' });
      return;
    }
    res.json({ account });
  });

  app.put('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name } = req.body;
      const account = db.updateProfile(req.user!.id, name || '');
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/auth/complete-setup', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const account = db.completeKitchenSetup(req.user!.id);
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- KITCHEN INVENTORY ROUTES ---
  app.post('/api/kitchen', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, category, quantity, unit, notes } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ error: 'Item name is required.' });
        return;
      }
      const account = db.addKitchenItem(req.user!.id, {
        name,
        category: category || 'Other',
        quantity: Number(quantity) || 1,
        unit: unit || '',
        notes,
      });
      res.status(201).json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/kitchen/starter-preset', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const account = db.addStarterKitchenPreset(req.user!.id);
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/kitchen/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const itemId = String(req.params.id);
      const account = db.updateKitchenItem(req.user!.id, itemId, req.body);
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/kitchen/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const itemId = String(req.params.id);
      const account = db.deleteKitchenItem(req.user!.id, itemId);
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- SMART SHOPPING LIST ROUTES ---
  app.post('/api/shopping-list', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, category, quantity, unit, note, addedAnyway, fromKidsToken, addedInStore } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ error: 'Item name is required.' });
        return;
      }
      const account = db.addShoppingItem(req.user!.id, {
        name,
        category: category || 'Other',
        quantity: Number(quantity) || 1,
        unit: unit || '',
        note,
        addedAnyway: Boolean(addedAnyway),
        fromKidsToken: Boolean(fromKidsToken),
        addedInStore: Boolean(addedInStore),
      });
      res.status(201).json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/shopping-list/avoided', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { itemName } = req.body;
      const account = db.recordDuplicateAvoided(req.user!.id, itemName || '');
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/shopping-list/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const itemId = String(req.params.id);
      const account = db.updateShoppingItem(req.user!.id, itemId, req.body);
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/shopping-list/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const itemId = String(req.params.id);
      const account = db.deleteShoppingItem(req.user!.id, itemId);
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- KIDS' CHOICE TOKENS ROUTES ---
  app.put('/api/tokens/allowance', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { totalTokens } = req.body;
      const account = db.setTokenAllowance(req.user!.id, Number(totalTokens));
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/tokens/use', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { label } = req.body;
      const account = db.useOneToken(req.user!.id, label);
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/tokens/choices/:choiceId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const choiceId = String(req.params.choiceId);
      const { label } = req.body;
      const account = db.updateTokenChoice(req.user!.id, choiceId, label || '');
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/tokens/choices/:choiceId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const choiceId = String(req.params.choiceId);
      const account = db.removeTokenChoice(req.user!.id, choiceId);
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/tokens/reset', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { totalTokens } = req.body;
      const account = db.resetTokens(
        req.user!.id,
        totalTokens !== undefined ? Number(totalTokens) : 3
      );
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- REUSABLE BAG & SHOPPING TRIP ROUTES ---
  app.put('/api/shopping-session/bag', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { confirmed, response } = req.body;
      const account = db.setReusableBagConfirmed(
        req.user!.id,
        Boolean(confirmed),
        response
      );
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/shopping-trips/start-new', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { clearBoughtItems = false } = req.body;
      const account = db.startNewShoppingTrip(req.user!.id, Boolean(clearBoughtItems));
      res.json({ account });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/shopping-trips/complete', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { autoUpdateKitchen } = req.body;
      const result = db.completeShoppingTrip(req.user!.id, Boolean(autoUpdateKitchen));
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/shopping-trips/:id/update-kitchen', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const tripId = String(req.params.id);
      const { clearBoughtFromList = true } = req.body;
      const result = db.applyTripKitchenUpdates(req.user!.id, tripId, Boolean(clearBoughtFromList));
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/shopping-trips/:id/defer-kitchen', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const tripId = String(req.params.id);
      const result = db.deferTripKitchenUpdates(req.user!.id, tripId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- VITE MIDDLEWARE OR STATIC PROD ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartShop Buddy server running on http://localhost:${PORT}`);
  });
}

startServer();
