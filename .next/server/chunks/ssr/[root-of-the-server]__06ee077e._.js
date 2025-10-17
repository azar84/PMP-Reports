module.exports = {

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
"[project]/src/lib/cloudinary.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "configureCloudinary": ()=>configureCloudinary,
    "deleteFromCloudinary": ()=>deleteFromCloudinary,
    "getCloudinaryConfig": ()=>getCloudinaryConfig,
    "getCloudinaryUrl": ()=>getCloudinaryUrl,
    "uploadToCloudinary": ()=>uploadToCloudinary
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cloudinary/cloudinary.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
;
;
async function getCloudinaryConfig() {
    try {
        console.log('Getting Cloudinary configuration from database...');
        // Test database connection first
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$connect();
            console.log('Database connection successful');
        } catch (dbError) {
            console.error('Database connection failed:', dbError);
            throw new Error('Database connection failed - cannot retrieve Cloudinary configuration');
        }
        // Get settings from database
        const settings = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].siteSettings.findFirst();
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
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v2"].config(config);
        // Test the configuration by making a simple API call
        try {
            // This is a lightweight test to verify credentials
            await new Promise((resolve, reject)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v2"].api.ping((error, result)=>{
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
            const uploadStream = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v2"].uploader.upload_stream({
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
        await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v2"].uploader.destroy(public_id);
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
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["v2"].url(public_id, {
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

};

//# sourceMappingURL=%5Broot-of-the-server%5D__06ee077e._.js.map