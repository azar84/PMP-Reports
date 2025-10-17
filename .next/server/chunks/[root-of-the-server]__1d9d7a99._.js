module.exports = {

"[project]/.next-internal/server/app/api/admin/media-library/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}}),
"[project]/src/lib/db.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "prisma": ()=>prisma
});
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/lib/validations.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "ApiResponseSchema": ()=>ApiResponseSchema,
    "CreateMediaFolderSchema": ()=>CreateMediaFolderSchema,
    "CreateMediaLibrarySchema": ()=>CreateMediaLibrarySchema,
    "CreateMediaUsageSchema": ()=>CreateMediaUsageSchema,
    "IdSchema": ()=>IdSchema,
    "MediaSearchSchema": ()=>MediaSearchSchema,
    "MediaUploadSchema": ()=>MediaUploadSchema,
    "MediaUrlImportSchema": ()=>MediaUrlImportSchema,
    "SiteSettingsSchema": ()=>SiteSettingsSchema,
    "SiteSettingsUpdateSchema": ()=>SiteSettingsUpdateSchema,
    "SlugSchema": ()=>SlugSchema,
    "UpdateMediaFolderSchema": ()=>UpdateMediaFolderSchema,
    "UpdateMediaLibrarySchema": ()=>UpdateMediaLibrarySchema,
    "UrlSchema": ()=>UrlSchema,
    "validateAndTransform": ()=>validateAndTransform
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const IdSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive();
const SlugSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(100).regex(/^[a-zA-Z0-9-_]+$/, 'Invalid slug format');
const UrlSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url('Invalid URL format');
// Helper for optional string fields that can be empty
const optionalString = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().nullable().transform((val)=>val === '' ? null : val);
const optionalUrl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().nullable().transform((val)=>val === '' ? null : val).refine((val)=>{
    if (val === null || val === undefined) return true;
    // Allow data URIs for base64 encoded images
    if (val.startsWith('data:')) return true;
    // Allow relative paths (starting with /)
    if (val.startsWith('/')) return true;
    // Allow regular URLs
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().safeParse(val).success;
}, {
    message: "Invalid URL format"
});
const optionalEmail = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().nullable().transform((val)=>val === '' ? null : val).refine((val)=>{
    if (val === null || val === undefined) return true;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email().safeParse(val).success;
}, {
    message: "Invalid email format"
});
const SiteSettingsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    logoUrl: optionalUrl,
    logoLightUrl: optionalUrl,
    logoDarkUrl: optionalUrl,
    faviconUrl: optionalUrl,
    faviconLightUrl: optionalUrl,
    faviconDarkUrl: optionalUrl,
    // Email Configuration
    smtpEnabled: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    smtpHost: optionalString,
    smtpPort: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(1).max(65535).optional().nullable(),
    smtpSecure: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    smtpUsername: optionalString,
    smtpPassword: optionalString,
    smtpFromEmail: optionalEmail,
    smtpFromName: optionalString,
    smtpReplyTo: optionalEmail,
    // Email Templates Configuration
    emailSignature: optionalString,
    emailFooterText: optionalString,
    emailBrandingEnabled: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    // Email Notification Settings
    adminNotificationEmail: optionalEmail,
    emailLoggingEnabled: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    emailRateLimitPerHour: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(1).max(1000).optional().nullable(),
    // Social Media Links
    socialFacebook: optionalUrl,
    socialTwitter: optionalUrl,
    socialLinkedin: optionalUrl,
    socialInstagram: optionalUrl,
    socialYoutube: optionalUrl,
    // Contact Information
    companyPhone: optionalString,
    companyEmail: optionalEmail,
    companyAddress: optionalString,
    // Footer Settings
    footerCompanyName: optionalString,
    footerCompanyDescription: optionalString,
    footerNewsletterFormId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional().nullable(),
    footerCopyrightMessage: optionalString,
    footerMenuIds: optionalString,
    footerShowContactInfo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    footerShowSocialLinks: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    footerBackgroundColor: optionalString,
    footerTextColor: optionalString,
    // SEO & Analytics
    baseUrl: optionalUrl,
    gaMeasurementId: optionalString,
    gtmContainerId: optionalString,
    gtmEnabled: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    // Cloudinary Configuration
    cloudinaryCloudName: optionalString,
    cloudinaryApiKey: optionalString,
    cloudinaryApiSecret: optionalString,
    cloudinaryUploadPreset: optionalString,
    cloudinaryEnabled: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    // Sidebar Configuration
    sidebarBackgroundColor: optionalString,
    sidebarTextColor: optionalString,
    sidebarSelectedColor: optionalString,
    sidebarHoverColor: optionalString
});
const SiteSettingsUpdateSchema = SiteSettingsSchema.partial();
const ApiResponseSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    success: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    data: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown().optional(),
    message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    error: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
function validateAndTransform(schema, data) {
    return schema.parse(data);
}
const CreateMediaLibrarySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    filename: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(255),
    title: optionalString,
    description: optionalString,
    alt: optionalString,
    fileType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'image',
        'video',
        'audio',
        'document',
        'other'
    ]),
    mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(100),
    fileSize: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    width: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional().nullable(),
    height: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional().nullable(),
    duration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive().optional().nullable(),
    originalUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url(),
    localPath: optionalString,
    publicUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url(),
    thumbnailUrl: optionalUrl,
    folderId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional().nullable(),
    tags: optionalString,
    uploadSource: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'upload',
        'url',
        'cloudinary'
    ]).optional(),
    uploadedBy: optionalString,
    isActive: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    isPublic: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
});
const UpdateMediaLibrarySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    filename: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(255).optional(),
    title: optionalString,
    description: optionalString,
    alt: optionalString,
    fileType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'image',
        'video',
        'audio',
        'document',
        'other'
    ]).optional(),
    mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(100).optional(),
    fileSize: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional(),
    width: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional().nullable(),
    height: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional().nullable(),
    duration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive().optional().nullable(),
    originalUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().optional(),
    localPath: optionalString,
    publicUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().optional(),
    thumbnailUrl: optionalUrl,
    folderId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional().nullable(),
    tags: optionalString,
    isActive: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    isPublic: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
});
const CreateMediaFolderSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(100),
    description: optionalString,
    parentId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional().nullable(),
    color: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    sortOrder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().optional(),
    isActive: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
});
const UpdateMediaFolderSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(100).optional(),
    description: optionalString,
    parentId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional().nullable(),
    color: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    sortOrder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().optional(),
    isActive: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
});
const CreateMediaUsageSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    mediaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    entityType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(50),
    entityId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    fieldName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(100)
});
const MediaUploadSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    file: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].instanceof(File),
    folderId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional().nullable(),
    title: optionalString,
    alt: optionalString,
    description: optionalString
});
const MediaUrlImportSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    url: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url(),
    folderId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional().nullable(),
    title: optionalString,
    alt: optionalString,
    description: optionalString,
    tags: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).optional()
});
const MediaSearchSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    query: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    fileType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'image',
        'video',
        'audio',
        'document',
        'other'
    ]).optional(),
    folderId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional().nullable(),
    tags: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).optional(),
    isActive: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    isPublic: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    sortBy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'createdAt',
        'updatedAt',
        'filename',
        'fileSize'
    ]).optional(),
    sortOrder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'asc',
        'desc'
    ]).optional(),
    page: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(1).optional(),
    limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(1).max(100).optional(),
    offset: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).optional()
});
}),
"[externals]/crypto [external] (crypto, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}}),
"[externals]/querystring [external] (querystring, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}}),
"[externals]/url [external] (url, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}}),
"[externals]/fs [external] (fs, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}}),
"[externals]/path [external] (path, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}}),
"[externals]/https [external] (https, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}}),
"[externals]/http [external] (http, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}}),
"[externals]/stream [external] (stream, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[project]/src/lib/cloudinary.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "configureCloudinary": ()=>configureCloudinary,
    "deleteFromCloudinary": ()=>deleteFromCloudinary,
    "getCloudinaryConfig": ()=>getCloudinaryConfig,
    "getCloudinaryUrl": ()=>getCloudinaryUrl,
    "uploadToCloudinary": ()=>uploadToCloudinary
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
;
async function getCloudinaryConfig() {
    try {
        console.log('Getting Cloudinary configuration from database...');
        // Test database connection first
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$connect();
            console.log('Database connection successful');
        } catch (dbError) {
            console.error('Database connection failed:', dbError);
            throw new Error('Database connection failed - cannot retrieve Cloudinary configuration');
        }
        // Get settings from database
        const settings = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].siteSettings.findFirst();
        console.log('Site settings loaded:', {
            hasSettings: !!settings,
            cloudinaryEnabled: settings?.cloudinaryEnabled,
            hasCloudName: !!settings?.cloudinaryCloudName,
            hasApiKey: !!settings?.cloudinaryApiKey,
            hasApiSecret: !!settings?.cloudinaryApiSecret
        });
        if (settings?.cloudinaryEnabled && settings.cloudinaryCloudName && settings.cloudinaryApiKey && settings.cloudinaryApiSecret) {
            console.log('Using database Cloudinary configuration');
            return {
                cloud_name: settings.cloudinaryCloudName,
                api_key: settings.cloudinaryApiKey,
                api_secret: settings.cloudinaryApiSecret
            };
        }
        console.log('No Cloudinary configuration found in database');
        console.log('Please configure Cloudinary in the admin panel under Site Settings');
        return null;
    } catch (error) {
        console.error('Error getting Cloudinary config from database:', error);
        throw new Error('Failed to retrieve Cloudinary configuration from database');
    }
}
async function configureCloudinary() {
    try {
        const config = await getCloudinaryConfig();
        if (!config) {
            console.warn('Cloudinary not configured - media uploads will be disabled');
            return false;
        }
        // Validate the configuration
        if (!config.cloud_name || !config.api_key || !config.api_secret) {
            console.error('Invalid Cloudinary configuration - missing required fields');
            return false;
        }
        // Configure Cloudinary
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["v2"].config(config);
        // Test the configuration by making a simple API call
        try {
            // This is a lightweight test to verify credentials
            await new Promise((resolve, reject)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["v2"].api.ping((error, result)=>{
                    if (error) {
                        console.error('Cloudinary ping failed:', error);
                        reject(error);
                    } else {
                        console.log('Cloudinary configuration verified successfully');
                        resolve(result);
                    }
                });
            });
        } catch (pingError) {
            console.error('Cloudinary configuration test failed:', pingError);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Failed to configure Cloudinary:', error);
        return false;
    }
}
const uploadToCloudinary = async (file, options = {})=>{
    try {
        console.log('Starting Cloudinary upload...');
        // Ensure Cloudinary is configured
        const isConfigured = await configureCloudinary();
        if (!isConfigured) {
            throw new Error('Cloudinary is not configured. Please configure Cloudinary in site settings or environment variables.');
        }
        // Convert File to buffer if needed
        let buffer;
        if (file && typeof file.arrayBuffer === 'function') {
            // This is a browser File object
            console.log('Converting File to buffer...');
            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            console.log(`File converted to buffer, size: ${buffer.length} bytes`);
        } else if (Buffer.isBuffer(file)) {
            // This is already a Buffer
            buffer = file;
            console.log(`Using provided buffer, size: ${buffer.length} bytes`);
        } else {
            throw new Error('Invalid file type provided');
        }
        // Validate buffer
        if (!buffer || buffer.length === 0) {
            throw new Error('Empty file buffer provided');
        }
        console.log('Uploading to Cloudinary with options:', {
            folder: options.folder || 'pmp-reports',
            resource_type: options.resource_type || 'auto',
            public_id: options.public_id
        });
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject)=>{
            const uploadStream = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["v2"].uploader.upload_stream({
                folder: options.folder || 'pmp-reports',
                public_id: options.public_id,
                resource_type: options.resource_type || 'auto',
                transformation: options.transformation
            }, (error, result)=>{
                if (error) {
                    console.error('Cloudinary upload stream error:', error);
                    reject(error);
                } else {
                    console.log('Cloudinary upload successful:', {
                        public_id: result?.public_id,
                        secure_url: result?.secure_url,
                        bytes: result?.bytes
                    });
                    resolve(result);
                }
            });
            uploadStream.end(buffer);
        });
        return result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('not configured')) {
                throw new Error('Cloudinary is not configured. Please configure Cloudinary in site settings or environment variables.');
            } else if (error.message.includes('Invalid API key')) {
                throw new Error('Invalid Cloudinary API key. Please check your credentials.');
            } else if (error.message.includes('Invalid signature')) {
                throw new Error('Invalid Cloudinary API secret. Please check your credentials.');
            } else if (error.message.includes('Cloud name')) {
                throw new Error('Invalid Cloudinary cloud name. Please check your configuration.');
            } else if (error.message.includes('Empty file buffer')) {
                throw new Error('The uploaded file is empty or corrupted.');
            } else {
                throw new Error(`Cloudinary upload failed: ${error.message}`);
            }
        }
        throw new Error('Failed to upload file to Cloudinary');
    }
};
const deleteFromCloudinary = async (public_id)=>{
    try {
        // Ensure Cloudinary is configured
        const isConfigured = await configureCloudinary();
        if (!isConfigured) {
            console.warn('Cloudinary is not configured - skipping delete operation');
            return;
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["v2"].uploader.destroy(public_id);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete file from Cloudinary');
    }
};
const getCloudinaryUrl = (public_id, options = {})=>{
    // This function doesn't need configuration check as it just generates URLs
    // But we should ensure Cloudinary is configured for consistency
    try {
        // Note: This is a synchronous operation, so we can't await configureCloudinary
        // The URL generation should work even without full configuration
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["v2"].url(public_id, {
            secure: true,
            ...options
        });
    } catch (error) {
        console.error('Error generating Cloudinary URL:', error);
        // Return a fallback URL or the original public_id
        return public_id;
    }
};
}),
"[project]/src/app/api/admin/media-library/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "DELETE": ()=>DELETE,
    "GET": ()=>GET,
    "POST": ()=>POST,
    "PUT": ()=>PUT
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validations.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cloudinary.ts [app-route] (ecmascript)");
;
;
;
;
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        // Parse search parameters
        const searchData = {
            query: searchParams.get('query') || undefined,
            fileType: searchParams.get('fileType') || undefined,
            folderId: searchParams.get('folderId') ? parseInt(searchParams.get('folderId')) : undefined,
            tags: searchParams.get('tags')?.split(',') || undefined,
            isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
            isPublic: searchParams.get('isPublic') ? searchParams.get('isPublic') === 'true' : undefined,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '20'),
            sortBy: searchParams.get('sortBy') || 'createdAt',
            sortOrder: searchParams.get('sortOrder') || 'desc'
        };
        // Validate search parameters
        const validatedSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateAndTransform"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MediaSearchSchema"], searchData);
        // Build where clause
        const where = {};
        if (validatedSearch.query) {
            where.OR = [
                {
                    filename: {
                        contains: validatedSearch.query,
                        mode: 'insensitive'
                    }
                },
                {
                    title: {
                        contains: validatedSearch.query,
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: validatedSearch.query,
                        mode: 'insensitive'
                    }
                },
                {
                    alt: {
                        contains: validatedSearch.query,
                        mode: 'insensitive'
                    }
                }
            ];
        }
        if (validatedSearch.fileType) {
            where.fileType = validatedSearch.fileType;
        }
        if (validatedSearch.folderId !== undefined) {
            where.folderId = validatedSearch.folderId;
        }
        if (validatedSearch.isActive !== undefined) {
            where.isActive = validatedSearch.isActive;
        }
        if (validatedSearch.isPublic !== undefined) {
            where.isPublic = validatedSearch.isPublic;
        }
        if (validatedSearch.tags && validatedSearch.tags.length > 0) {
            // Search in JSON tags field
            where.tags = {
                contains: JSON.stringify(validatedSearch.tags[0])
            };
        }
        // Calculate pagination
        const skip = ((validatedSearch.page || 1) - 1) * (validatedSearch.limit || 50);
        // Get total count
        const totalCount = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mediaLibrary.count({
            where
        });
        // Fetch media items
        const mediaItems = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mediaLibrary.findMany({
            where,
            include: {
                folder: {
                    select: {
                        id: true,
                        name: true,
                        color: true
                    }
                },
                usages: {
                    select: {
                        entityType: true,
                        entityId: true,
                        fieldName: true
                    }
                }
            },
            orderBy: {
                [validatedSearch.sortBy]: validatedSearch.sortOrder
            },
            skip,
            take: validatedSearch.limit || 50
        });
        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / (validatedSearch.limit || 50));
        const currentPage = validatedSearch.page || 1;
        const hasNextPage = currentPage < totalPages;
        const hasPrevPage = currentPage > 1;
        const response = {
            success: true,
            data: {
                items: mediaItems,
                pagination: {
                    page: currentPage,
                    limit: validatedSearch.limit || 50,
                    totalCount,
                    totalPages,
                    hasNextPage,
                    hasPrevPage
                }
            }
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
    } catch (error) {
        console.error('Failed to fetch media library:', error);
        const response = {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch media library'
        };
        const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
            status: statusCode
        });
    }
}
async function POST(request) {
    try {
        console.log('📤 Starting media library POST request...');
        const contentType = request.headers.get('content-type') || '';
        console.log('📋 Content-Type:', contentType);
        if (contentType.includes('multipart/form-data')) {
            // Handle file upload
            console.log('📁 Handling file upload...');
            return handleFileUpload(request);
        } else {
            // Handle URL import
            console.log('🔗 Handling URL import...');
            return handleUrlImport(request);
        }
    } catch (error) {
        console.error('❌ Failed to create media item:', error);
        // Provide more detailed error information
        let errorMessage = 'Failed to create media item';
        let statusCode = 500;
        if (error instanceof Error) {
            errorMessage = error.message;
            // Handle specific error types
            if (error.message.includes('Cloudinary is not configured')) {
                statusCode = 400;
                errorMessage = 'Cloudinary is not configured. Please configure Cloudinary in site settings or environment variables.';
            } else if (error.message.includes('Database connection failed')) {
                statusCode = 500;
                errorMessage = 'Database connection failed. Please check your database configuration.';
            } else if (error.message.includes('Validation failed')) {
                statusCode = 400;
            }
        }
        const response = {
            success: false,
            message: errorMessage
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
            status: statusCode
        });
    }
}
// Handle file upload
async function handleFileUpload(request) {
    try {
        console.log('📁 Starting file upload process...');
        const formData = await request.formData();
        const file = formData.get('file');
        console.log('📄 File received:', {
            name: file?.name,
            size: file?.size,
            type: file?.type,
            lastModified: file?.lastModified
        });
        if (!file) {
            console.error('❌ No file provided in request');
            const response = {
                success: false,
                message: 'No file provided'
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
                status: 400
            });
        }
        // Validate file
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            console.error('❌ File size exceeds limit:', file.size, 'bytes');
            const response = {
                success: false,
                message: 'File size exceeds 50MB limit'
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
                status: 400
            });
        }
        // Get file info
        const filename = file.name;
        const mimeType = file.type;
        const fileSize = file.size;
        console.log('📋 File details:', {
            filename,
            mimeType,
            fileSize,
            maxSize
        });
        // Determine file type
        let fileType = 'other';
        let resourceType = 'raw';
        if (mimeType.startsWith('image/')) {
            fileType = 'image';
            resourceType = 'image';
        } else if (mimeType.startsWith('video/')) {
            fileType = 'video';
            resourceType = 'video';
        } else if (mimeType.startsWith('audio/')) {
            fileType = 'audio';
            resourceType = 'raw';
        } else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
            fileType = 'document';
            resourceType = 'raw';
        }
        console.log('🏷️  File type determined:', {
            fileType,
            resourceType
        });
        try {
            console.log('☁️  Starting Cloudinary upload...');
            // Upload to Cloudinary
            const cloudinaryResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uploadToCloudinary"])(file, {
                folder: 'yourcompany/media',
                resource_type: resourceType
            });
            console.log('✅ Cloudinary upload successful:', {
                public_id: cloudinaryResult.public_id,
                secure_url: cloudinaryResult.secure_url,
                bytes: cloudinaryResult.bytes,
                width: cloudinaryResult.width,
                height: cloudinaryResult.height
            });
            // Get optional metadata from form
            const title = formData.get('title')?.toString();
            const description = formData.get('description')?.toString();
            const alt = formData.get('alt')?.toString();
            const folderId = formData.get('folderId') ? parseInt(formData.get('folderId').toString()) : null;
            const tagsString = formData.get('tags')?.toString();
            const tags = tagsString ? JSON.stringify(tagsString.split(',').map((tag)=>tag.trim())) : null;
            // Create media record
            const mediaData = {
                filename,
                title: title || filename,
                description,
                alt,
                fileType,
                mimeType,
                fileSize: cloudinaryResult.bytes,
                width: cloudinaryResult.width,
                height: cloudinaryResult.height,
                duration: undefined,
                originalUrl: cloudinaryResult.secure_url,
                localPath: cloudinaryResult.public_id,
                publicUrl: cloudinaryResult.secure_url,
                folderId,
                tags,
                uploadSource: 'upload',
                isActive: true,
                isPublic: true
            };
            console.log('💾 Creating database record...');
            const validatedData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateAndTransform"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CreateMediaLibrarySchema"], mediaData);
            console.log('✅ Data validation successful');
            const mediaItem = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mediaLibrary.create({
                data: validatedData,
                include: {
                    folder: {
                        select: {
                            id: true,
                            name: true,
                            color: true
                        }
                    }
                }
            });
            console.log('✅ Database record created:', {
                id: mediaItem.id,
                filename: mediaItem.filename,
                publicUrl: mediaItem.publicUrl
            });
            const response = {
                success: true,
                data: mediaItem,
                message: 'File uploaded successfully'
            };
            console.log('✅ File upload completed successfully');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
        } catch (error) {
            console.error('❌ Cloudinary upload error:', error);
            let errorMessage = 'Failed to upload file to Cloudinary';
            let statusCode = 500;
            if (error instanceof Error) {
                if (error.message.includes('not configured')) {
                    errorMessage = 'Cloudinary is not configured. Please configure Cloudinary in site settings.';
                    statusCode = 400;
                } else if (error.message.includes('Invalid API key')) {
                    errorMessage = 'Invalid Cloudinary API key. Please check your credentials in site settings.';
                    statusCode = 400;
                } else if (error.message.includes('Invalid signature')) {
                    errorMessage = 'Invalid Cloudinary API secret. Please check your credentials in site settings.';
                    statusCode = 400;
                } else if (error.message.includes('Cloud name')) {
                    errorMessage = 'Invalid Cloudinary cloud name. Please check your configuration in site settings.';
                    statusCode = 400;
                } else if (error.message.includes('Empty file buffer')) {
                    errorMessage = 'The uploaded file is empty or corrupted.';
                    statusCode = 400;
                } else {
                    errorMessage = `Upload failed: ${error.message}`;
                }
            }
            const response = {
                success: false,
                message: errorMessage
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
                status: statusCode
            });
        }
    } catch (outerError) {
        console.error('❌ File upload process error:', outerError);
        const response = {
            success: false,
            message: 'An unexpected error occurred during file upload'
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
            status: 500
        });
    }
}
// Handle URL import
async function handleUrlImport(request) {
    const body = await request.json();
    const validatedData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateAndTransform"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MediaUrlImportSchema"], body);
    try {
        // Download file from URL
        const response = await fetch(validatedData.url);
        if (!response.ok) {
            const apiResponse = {
                success: false,
                message: 'Failed to download file from URL'
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(apiResponse, {
                status: 400
            });
        }
        const contentType = response.headers.get('content-type') || '';
        const contentLength = parseInt(response.headers.get('content-length') || '0');
        // Validate file size
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (contentLength > maxSize) {
            const apiResponse = {
                success: false,
                message: 'File size exceeds 50MB limit'
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(apiResponse, {
                status: 400
            });
        }
        // Determine file type and resource type
        let fileType = 'other';
        let resourceType = 'raw';
        if (contentType.startsWith('image/')) {
            fileType = 'image';
            resourceType = 'image';
        } else if (contentType.startsWith('video/')) {
            fileType = 'video';
            resourceType = 'video';
        } else if (contentType.startsWith('audio/')) {
            fileType = 'audio';
            resourceType = 'raw';
        }
        // Get file buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Upload to Cloudinary
        const cloudinaryResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uploadToCloudinary"])(buffer, {
            folder: 'yourcompany/media',
            resource_type: resourceType
        });
        // Extract filename from URL
        const urlParts = validatedData.url.split('/');
        const originalFilename = urlParts[urlParts.length - 1] || 'imported-file';
        const tags = validatedData.tags ? JSON.stringify(validatedData.tags) : null;
        // Create media record
        const mediaData = {
            filename: originalFilename,
            title: validatedData.title || originalFilename,
            description: validatedData.description,
            alt: validatedData.alt,
            fileType,
            mimeType: contentType,
            fileSize: cloudinaryResult.bytes,
            width: cloudinaryResult.width,
            height: cloudinaryResult.height,
            duration: undefined,
            originalUrl: validatedData.url,
            localPath: cloudinaryResult.public_id,
            publicUrl: cloudinaryResult.secure_url,
            folderId: validatedData.folderId,
            tags,
            uploadSource: 'url_import',
            isActive: true,
            isPublic: true
        };
        const validatedMediaData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateAndTransform"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CreateMediaLibrarySchema"], mediaData);
        const mediaItem = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mediaLibrary.create({
            data: validatedMediaData,
            include: {
                folder: {
                    select: {
                        id: true,
                        name: true,
                        color: true
                    }
                }
            }
        });
        const apiResponse = {
            success: true,
            data: mediaItem,
            message: 'File imported from URL successfully'
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(apiResponse);
    } catch (error) {
        console.error('URL import error:', error);
        const apiResponse = {
            success: false,
            message: 'Failed to import file from URL'
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(apiResponse, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const body = await request.json();
        const validatedData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateAndTransform"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UpdateMediaLibrarySchema"], body);
        // Check if media item exists
        const existingItem = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mediaLibrary.findUnique({
            where: {
                id: validatedData.id
            }
        });
        if (!existingItem) {
            const response = {
                success: false,
                message: 'Media item not found'
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
                status: 404
            });
        }
        const { id, ...updateData } = validatedData;
        const mediaItem = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mediaLibrary.update({
            where: {
                id
            },
            data: updateData,
            include: {
                folder: {
                    select: {
                        id: true,
                        name: true,
                        color: true
                    }
                },
                usages: {
                    select: {
                        entityType: true,
                        entityId: true,
                        fieldName: true
                    }
                }
            }
        });
        const response = {
            success: true,
            data: mediaItem,
            message: 'Media item updated successfully'
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
    } catch (error) {
        console.error('Failed to update media item:', error);
        const response = {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update media item'
        };
        const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
            status: statusCode
        });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id || isNaN(parseInt(id))) {
            const response = {
                success: false,
                message: 'Valid media item ID is required'
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
                status: 400
            });
        }
        // Check if media item exists
        const existingItem = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mediaLibrary.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                usages: true
            }
        });
        if (!existingItem) {
            const response = {
                success: false,
                message: 'Media item not found'
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
                status: 404
            });
        }
        // Check if media is being used
        if (existingItem.usages.length > 0) {
            const response = {
                success: false,
                message: `Cannot delete media item. It is being used in ${existingItem.usages.length} place(s).`,
                data: {
                    usages: existingItem.usages
                }
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
                status: 400
            });
        }
        // Delete from Cloudinary if it's a Cloudinary upload
        if (existingItem.localPath && !existingItem.localPath.startsWith('/')) {
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteFromCloudinary"])(existingItem.localPath);
            } catch (cloudinaryError) {
                console.error('Failed to delete from Cloudinary:', cloudinaryError);
            // Continue with database deletion even if Cloudinary deletion fails
            }
        }
        // Delete the media item from database
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].mediaLibrary.delete({
            where: {
                id: parseInt(id)
            }
        });
        const response = {
            success: true,
            message: 'Media item deleted successfully'
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
    } catch (error) {
        console.error('Failed to delete media item:', error);
        const response = {
            success: false,
            message: 'Failed to delete media item'
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
            status: 500
        });
    }
}
}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__1d9d7a99._.js.map