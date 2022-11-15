import { Request, Response } from "express";

export function isLoggedIn(req: Request, res: Response, next: Function) {
    if (!req.isAuthenticated || !req.isAuthenticated())  return res.redirect('/');
    else next();
}