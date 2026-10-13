"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = exports.checkOnlyAdmin = void 0;
const Errors_1 = require("../Errors");
const auth_1 = require("../utils/auth");
const schema_1 = require("../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const checkOnlyAdmin = () => {
    return async (req, res, next) => {
        try {
            let userId = req.user?.id;
            // إذا لم يكن req.user مضبوطاً مسبقاً، نستخرج الـ Token ونفك تشفيره
            if (!userId) {
                const authHeader = req.headers.authorization;
                let token;
                if (authHeader && authHeader.startsWith("Bearer ")) {
                    token = authHeader.split(" ")[1];
                }
                else if (req.cookies?.token) {
                    token = req.cookies.token;
                }
                if (!token) {
                    throw new Errors_1.UnauthorizedError("Authentication token is required");
                }
                const decoded = (0, auth_1.verifyToken)(token);
                userId = decoded.id;
            }
            if (!req.db) {
                throw new Errors_1.UnauthorizedError("Tenant database connection not initialized");
            }
            // التحقق الصارم من وجود المستخدم في جدول admin فقط وأن حالته status = true
            const adminRows = await req.db
                .select({
                id: schema_1.admins.id,
                name: schema_1.admins.name,
                email: schema_1.admins.email,
                phone: schema_1.admins.phone,
                role_id: schema_1.admins.role_id,
                status: schema_1.admins.status,
            })
                .from(schema_1.admins)
                .where((0, drizzle_orm_1.eq)(schema_1.admins.id, userId))
                .limit(1);
            if (!adminRows[0]) {
                throw new Errors_1.UnauthorizedError("Access denied: User does not exist in admin table");
            }
            if (!adminRows[0].status) {
                throw new Errors_1.UnauthorizedError("Access denied: Admin account is inactive (status = false)");
            }
            // تثبيت بيانات الـ Admin في req.user
            req.user = {
                id: adminRows[0].id,
                name: adminRows[0].name,
                email: adminRows[0].email,
                phone: adminRows[0].phone,
                role: "admin",
            };
            return next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.checkOnlyAdmin = checkOnlyAdmin;
exports.checkPermission = exports.checkOnlyAdmin;
