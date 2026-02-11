import { Response, NextFunction } from 'express';
export declare const protect: (req: any, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const adminOnly: (req: any, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map