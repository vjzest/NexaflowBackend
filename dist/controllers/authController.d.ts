import { Request, Response } from 'express';
export declare const registerUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const loginUser: (req: Request, res: Response) => Promise<void>;
export declare const logoutUser: (req: Request, res: Response) => void;
export declare const getMe: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map