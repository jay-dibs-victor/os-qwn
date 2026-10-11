import { Request, Response, NextFunction } from 'express';

// In-memory token tracking (reset on restart for PoC)
const budgetMap = new Map<string, number>();
const MAX_TOKENS_PER_SESSION = 50000; // PoC Limit

export function budgeterMiddleware(req: Request, res: Response, next: NextFunction) {
    const sessionId = req.body.sessionId || req.query.sessionId;
    
    if (!sessionId) return next();

    const currentUsage = budgetMap.get(sessionId) || 0;

    if (currentUsage > MAX_TOKENS_PER_SESSION) {
        return res.status(429).json({
            status: 429,
            error: 'AI_OS_BUDGET_EXCEEDED',
            message: 'You have exceeded your AI computation budget for this session.'
        });
    }

    // Attach tracker to request object for later update
    (req as any).tokenTracker = {
        updateUsage: (tokens: number) => {
            budgetMap.set(sessionId, currentUsage + tokens);
        }
    };

    next();
}
