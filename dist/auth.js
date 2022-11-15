"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLoggedIn = void 0;
function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated())
        return res.redirect('/');
    else
        next();
}
exports.isLoggedIn = isLoggedIn;
