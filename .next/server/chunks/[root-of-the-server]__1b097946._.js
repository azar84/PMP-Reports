module.exports = {

"[project]/.next-internal/server/app/api/admin/site-settings/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

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
(()=>{
    const e = new Error("Cannot find module 'zod'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
const IdSchema = z.number().int().positive();
const SlugSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9-_]+$/, 'Invalid slug format');
const UrlSchema = z.string().url('Invalid URL format');
// Helper for optional string fields that can be empty
const optionalString = z.string().optional().nullable().transform((val)=>val === '' ? null : val);
const optionalUrl = z.string().optional().nullable().transform((val)=>val === '' ? null : val).refine((val)=>{
    if (val === null || val === undefined) return true;
    // Allow data URIs for base64 encoded images
    if (val.startsWith('data:')) return true;
    // Allow relative paths (starting with /)
    if (val.startsWith('/')) return true;
    // Allow regular URLs
    return z.string().url().safeParse(val).success;
}, {
    message: "Invalid URL format"
});
const optionalEmail = z.string().optional().nullable().transform((val)=>val === '' ? null : val).refine((val)=>{
    if (val === null || val === undefined) return true;
    return z.string().email().safeParse(val).success;
}, {
    message: "Invalid email format"
});
const SiteSettingsSchema = z.object({
    logoUrl: optionalUrl,
    logoLightUrl: optionalUrl,
    logoDarkUrl: optionalUrl,
    faviconUrl: optionalUrl,
    faviconLightUrl: optionalUrl,
    faviconDarkUrl: optionalUrl,
    // Email Configuration
    smtpEnabled: z.boolean().optional(),
    smtpHost: optionalString,
    smtpPort: z.number().int().min(1).max(65535).optional().nullable(),
    smtpSecure: z.boolean().optional(),
    smtpUsername: optionalString,
    smtpPassword: optionalString,
    smtpFromEmail: optionalEmail,
    smtpFromName: optionalString,
    smtpReplyTo: optionalEmail,
    // Email Templates Configuration
    emailSignature: optionalString,
    emailFooterText: optionalString,
    emailBrandingEnabled: z.boolean().optional(),
    // Email Notification Settings
    adminNotificationEmail: optionalEmail,
    emailLoggingEnabled: z.boolean().optional(),
    emailRateLimitPerHour: z.number().int().min(1).max(1000).optional().nullable(),
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
    footerNewsletterFormId: z.number().int().positive().optional().nullable(),
    footerCopyrightMessage: optionalString,
    footerMenuIds: optionalString,
    footerShowContactInfo: z.boolean().optional(),
    footerShowSocialLinks: z.boolean().optional(),
    footerBackgroundColor: optionalString,
    footerTextColor: optionalString,
    // SEO & Analytics
    baseUrl: optionalUrl,
    gaMeasurementId: optionalString,
    gtmContainerId: optionalString,
    gtmEnabled: z.boolean().optional(),
    // Cloudinary Configuration
    cloudinaryCloudName: optionalString,
    cloudinaryApiKey: optionalString,
    cloudinaryApiSecret: optionalString,
    cloudinaryUploadPreset: optionalString,
    cloudinaryEnabled: z.boolean().optional(),
    // Sidebar Configuration
    sidebarBackgroundColor: optionalString,
    sidebarTextColor: optionalString,
    sidebarSelectedColor: optionalString,
    sidebarHoverColor: optionalString
});
const SiteSettingsUpdateSchema = SiteSettingsSchema.partial();
const ApiResponseSchema = z.object({
    success: z.boolean(),
    data: z.unknown().optional(),
    message: z.string().optional(),
    error: z.string().optional()
});
function validateAndTransform(schema, data) {
    return schema.parse(data);
}
const CreateMediaLibrarySchema = z.object({
    filename: z.string().min(1).max(255),
    title: optionalString,
    description: optionalString,
    alt: optionalString,
    fileType: z.enum([
        'image',
        'video',
        'audio',
        'document',
        'other'
    ]),
    mimeType: z.string().min(1).max(100),
    fileSize: z.number().int().positive(),
    width: z.number().int().positive().optional().nullable(),
    height: z.number().int().positive().optional().nullable(),
    duration: z.number().positive().optional().nullable(),
    originalUrl: z.string().url(),
    localPath: optionalString,
    publicUrl: z.string().url(),
    thumbnailUrl: optionalUrl,
    folderId: z.number().int().positive().optional().nullable(),
    tags: optionalString,
    uploadSource: z.enum([
        'upload',
        'url',
        'cloudinary'
    ]).optional(),
    uploadedBy: optionalString,
    isActive: z.boolean().optional(),
    isPublic: z.boolean().optional()
});
const UpdateMediaLibrarySchema = z.object({
    id: z.number().int().positive(),
    filename: z.string().min(1).max(255).optional(),
    title: optionalString,
    description: optionalString,
    alt: optionalString,
    fileType: z.enum([
        'image',
        'video',
        'audio',
        'document',
        'other'
    ]).optional(),
    mimeType: z.string().min(1).max(100).optional(),
    fileSize: z.number().int().positive().optional(),
    width: z.number().int().positive().optional().nullable(),
    height: z.number().int().positive().optional().nullable(),
    duration: z.number().positive().optional().nullable(),
    originalUrl: z.string().url().optional(),
    localPath: optionalString,
    publicUrl: z.string().url().optional(),
    thumbnailUrl: optionalUrl,
    folderId: z.number().int().positive().optional().nullable(),
    tags: optionalString,
    isActive: z.boolean().optional(),
    isPublic: z.boolean().optional()
});
const CreateMediaFolderSchema = z.object({
    name: z.string().min(1).max(100),
    description: optionalString,
    parentId: z.number().int().positive().optional().nullable(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional()
});
const UpdateMediaFolderSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(100).optional(),
    description: optionalString,
    parentId: z.number().int().positive().optional().nullable(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional()
});
const CreateMediaUsageSchema = z.object({
    mediaId: z.number().int().positive(),
    entityType: z.string().min(1).max(50),
    entityId: z.number().int().positive(),
    fieldName: z.string().min(1).max(100)
});
const MediaUploadSchema = z.object({
    file: z.instanceof(File),
    folderId: z.number().int().positive().optional().nullable(),
    title: optionalString,
    alt: optionalString,
    description: optionalString
});
const MediaUrlImportSchema = z.object({
    url: z.string().url(),
    folderId: z.number().int().positive().optional().nullable(),
    title: optionalString,
    alt: optionalString,
    description: optionalString,
    tags: z.array(z.string()).optional()
});
const MediaSearchSchema = z.object({
    query: z.string().optional(),
    fileType: z.enum([
        'image',
        'video',
        'audio',
        'document',
        'other'
    ]).optional(),
    folderId: z.number().int().positive().optional().nullable(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    sortBy: z.enum([
        'createdAt',
        'updatedAt',
        'filename',
        'fileSize'
    ]).optional(),
    sortOrder: z.enum([
        'asc',
        'desc'
    ]).optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional()
});
}),
"[project]/src/app/api/admin/site-settings/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "GET": ()=>GET,
    "POST": ()=>POST,
    "PUT": ()=>PUT
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module 'zod'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validations.ts [app-route] (ecmascript)");
;
;
;
;
async function GET() {
    try {
        let siteSettings = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].siteSettings.findFirst();
        // Create default settings if none exist
        if (!siteSettings) {
            siteSettings = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].siteSettings.create({
                data: {
                    smtpEnabled: false,
                    smtpPort: 587,
                    smtpSecure: true,
                    emailBrandingEnabled: true,
                    emailLoggingEnabled: true,
                    emailRateLimitPerHour: 100
                }
            });
        }
        // Remove sensitive data before sending to client
        const { smtpPassword, ...safeSiteSettings } = siteSettings;
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: safeSiteSettings
        });
        // Add cache-busting headers
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to fetch site settings'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { logoUrl, faviconUrl, faviconLightUrl, faviconDarkUrl, baseUrl, cloudinaryEnabled, cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret, sidebarBackgroundColor, sidebarTextColor, sidebarSelectedColor, sidebarHoverColor } = body;
        // Check if settings already exist
        const existingSettings = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].siteSettings.findFirst();
        let settings;
        if (existingSettings) {
            // Update existing settings
            settings = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].siteSettings.update({
                where: {
                    id: existingSettings.id
                },
                data: {
                    logoUrl: logoUrl || existingSettings.logoUrl,
                    faviconUrl: faviconUrl || existingSettings.faviconUrl,
                    faviconLightUrl: faviconLightUrl || existingSettings.faviconLightUrl,
                    faviconDarkUrl: faviconDarkUrl || existingSettings.faviconDarkUrl,
                    baseUrl: baseUrl !== undefined ? baseUrl : existingSettings.baseUrl,
                    cloudinaryEnabled: cloudinaryEnabled !== undefined ? cloudinaryEnabled : existingSettings.cloudinaryEnabled,
                    cloudinaryCloudName: cloudinaryCloudName !== undefined ? cloudinaryCloudName : existingSettings.cloudinaryCloudName,
                    cloudinaryApiKey: cloudinaryApiKey !== undefined ? cloudinaryApiKey : existingSettings.cloudinaryApiKey,
                    cloudinaryApiSecret: cloudinaryApiSecret !== undefined ? cloudinaryApiSecret : existingSettings.cloudinaryApiSecret,
                    sidebarBackgroundColor: sidebarBackgroundColor !== undefined ? sidebarBackgroundColor : existingSettings.sidebarBackgroundColor,
                    sidebarTextColor: sidebarTextColor !== undefined ? sidebarTextColor : existingSettings.sidebarTextColor,
                    sidebarSelectedColor: sidebarSelectedColor !== undefined ? sidebarSelectedColor : existingSettings.sidebarSelectedColor,
                    sidebarHoverColor: sidebarHoverColor !== undefined ? sidebarHoverColor : existingSettings.sidebarHoverColor
                }
            });
        } else {
            // Create new settings
            settings = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].siteSettings.create({
                data: {
                    logoUrl,
                    faviconUrl,
                    faviconLightUrl,
                    faviconDarkUrl,
                    baseUrl: baseUrl || '',
                    cloudinaryEnabled: cloudinaryEnabled || false,
                    cloudinaryCloudName: cloudinaryCloudName || null,
                    cloudinaryApiKey: cloudinaryApiKey || null,
                    cloudinaryApiSecret: cloudinaryApiSecret || null,
                    sidebarBackgroundColor: sidebarBackgroundColor || '#1F2937',
                    sidebarTextColor: sidebarTextColor || '#E5E7EB',
                    sidebarSelectedColor: sidebarSelectedColor || '#FFFFFF',
                    sidebarHoverColor: sidebarHoverColor || '#D1D5DB',
                    smtpEnabled: false,
                    smtpPort: 587,
                    smtpSecure: true,
                    emailBrandingEnabled: true,
                    emailLoggingEnabled: true,
                    emailRateLimitPerHour: 100
                }
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: settings,
            message: 'Site settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating site settings:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            message: 'Failed to update site settings'
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const body = await request.json();
        console.log('PUT /api/admin/site-settings - Request body:', body);
        // Validate the request body for partial updates
        const validatedData = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SiteSettingsUpdateSchema"].parse(body);
        console.log('PUT /api/admin/site-settings - Validated data:', validatedData);
        // Get existing settings or create if none exist
        let existingSettings = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].siteSettings.findFirst();
        if (!existingSettings) {
            // Create new settings
            const newSettings = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].siteSettings.create({
                data: {
                    ...validatedData,
                    smtpEnabled: validatedData.smtpEnabled ?? false,
                    smtpPort: validatedData.smtpPort ?? 587,
                    smtpSecure: validatedData.smtpSecure ?? true,
                    emailBrandingEnabled: validatedData.emailBrandingEnabled ?? true,
                    emailLoggingEnabled: validatedData.emailLoggingEnabled ?? true,
                    emailRateLimitPerHour: validatedData.emailRateLimitPerHour ?? 100
                }
            });
            const { smtpPassword, ...safeSiteSettings } = newSettings;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: safeSiteSettings,
                message: 'Site settings created successfully'
            });
        } else {
            // Update existing settings
            const updatedSettings = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].siteSettings.update({
                where: {
                    id: existingSettings.id
                },
                data: validatedData
            });
            const { smtpPassword, ...safeSiteSettings } = updatedSettings;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: safeSiteSettings,
                message: 'Site settings updated successfully'
            });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Validation error:', error.errors);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Validation failed',
                details: error.errors
            }, {
                status: 400
            });
        }
        console.error('Error updating site settings:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to update site settings'
        }, {
            status: 500
        });
    }
}
}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__1b097946._.js.map