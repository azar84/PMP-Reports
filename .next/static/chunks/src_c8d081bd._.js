(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/lib/utils.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "applyCTAEvents": ()=>applyCTAEvents,
    "cn": ()=>cn,
    "copyToClipboard": ()=>copyToClipboard,
    "debounce": ()=>debounce,
    "easing": ()=>easing,
    "executeCTAEvent": ()=>executeCTAEvent,
    "executeCTAEventFromConfig": ()=>executeCTAEventFromConfig,
    "fadeInLeft": ()=>fadeInLeft,
    "fadeInRight": ()=>fadeInRight,
    "fadeInUp": ()=>fadeInUp,
    "formatDate": ()=>formatDate,
    "formatNumber": ()=>formatNumber,
    "generateId": ()=>generateId,
    "generateMetaTags": ()=>generateMetaTags,
    "getAppropriateLogoUrl": ()=>getAppropriateLogoUrl,
    "getBaseUrl": ()=>getBaseUrl,
    "getCTAStyles": ()=>getCTAStyles,
    "getContrastRatio": ()=>getContrastRatio,
    "hasCTAEvents": ()=>hasCTAEvents,
    "isColorDark": ()=>isColorDark,
    "isInViewport": ()=>isInViewport,
    "isValidEmail": ()=>isValidEmail,
    "scaleIn": ()=>scaleIn,
    "scrollToElement": ()=>scrollToElement,
    "siteConfig": ()=>siteConfig,
    "staggerContainer": ()=>staggerContainer,
    "throttle": ()=>throttle
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}
function debounce(func, wait) {
    let timeout;
    return function() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        clearTimeout(timeout);
        timeout = setTimeout(()=>func(...args), wait);
    };
}
function throttle(func, limit) {
    let inThrottle;
    return function() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(()=>inThrottle = false, limit);
        }
    };
}
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}
function scrollToElement(elementId) {
    let offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
}
function getContrastRatio(color1, color2) {
    // This is a simplified version - in production, you'd want a more robust implementation
    return 4.5; // Placeholder
}
const easing = {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};
const fadeInUp = {
    initial: {
        opacity: 0,
        y: 60
    },
    animate: {
        opacity: 1,
        y: 0
    },
    transition: {
        duration: 0.6,
        ease: easing.easeOut
    }
};
const fadeInLeft = {
    initial: {
        opacity: 0,
        x: -60
    },
    animate: {
        opacity: 1,
        x: 0
    },
    transition: {
        duration: 0.6,
        ease: easing.easeOut
    }
};
const fadeInRight = {
    initial: {
        opacity: 0,
        x: 60
    },
    animate: {
        opacity: 1,
        x: 0
    },
    transition: {
        duration: 0.6,
        ease: easing.easeOut
    }
};
const scaleIn = {
    initial: {
        opacity: 0,
        scale: 0.8
    },
    animate: {
        opacity: 1,
        scale: 1
    },
    transition: {
        duration: 0.5,
        ease: easing.easeOut
    }
};
const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};
function generateMetaTags(param) {
    let { title, description, image, url, type = 'website' } = param;
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type,
            url,
            images: image ? [
                {
                    url: image
                }
            ] : [],
            siteName: 'PMP Reports'
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: image ? [
                image
            ] : [],
            creator: '@pmp-reports'
        }
    };
}
const siteConfig = {
    siteName: 'PMP Reports',
    description: 'Project Management Reporting System',
    url: 'https://example.com',
    ogImage: 'https://example.com/og.jpg',
    creator: '@pmp-reports',
    keywords: [
        'pmp',
        'reports',
        'project-management',
        'reporting'
    ]
};
function isColorDark(color) {
    // Remove # if present
    const hex = color.replace('#', '');
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Calculate luminance using the relative luminance formula
    // https://www.w3.org/WAI/GL/wiki/Relative_luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // If luminance is less than 0.5, consider it dark
    return luminance < 0.5;
}
function getAppropriateLogoUrl(siteSettings) {
    let backgroundColor = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : '#FFFFFF';
    // If background is dark, use light logo
    if (isColorDark(backgroundColor)) {
        if (siteSettings.logoLightUrl) {
            return siteSettings.logoLightUrl;
        }
    } else {
        // If background is light, use dark logo
        if (siteSettings.logoDarkUrl) {
            return siteSettings.logoDarkUrl;
        }
    }
    // Fallback to legacy logo if specific logo not available
    if (siteSettings.logoUrl) {
        return siteSettings.logoUrl;
    }
    // No logo available
    return null;
}
function getBaseUrl() {
    // In production (Vercel), use VERCEL_URL
    if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.VERCEL_URL) {
        return "https://".concat(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.VERCEL_URL);
    }
    // Use BASE_URL environment variable if set
    if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.BASE_URL) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.BASE_URL;
    }
    // Fallback for local development
    return 'http://localhost:3000';
}
const applyCTAEvents = (cta)=>{
    const events = {};
    // Use events array
    if (cta.events && Array.isArray(cta.events) && cta.events.length > 0) {
        console.log('Using events array:', cta.events);
        cta.events.forEach((event)=>{
            switch(event.eventType){
                case 'onClick':
                    events.onClick = event.functionName;
                    break;
                case 'onHover':
                    events.onMouseOver = event.functionName;
                    break;
                case 'onMouseOut':
                    events.onMouseOut = event.functionName;
                    break;
                case 'onFocus':
                    events.onFocus = event.functionName;
                    break;
                case 'onBlur':
                    events.onBlur = event.functionName;
                    break;
                case 'onKeyDown':
                    events.onKeyDown = event.functionName;
                    break;
                case 'onKeyUp':
                    events.onKeyUp = event.functionName;
                    break;
                case 'onTouchStart':
                    events.onTouchStart = event.functionName;
                    break;
                case 'onTouchEnd':
                    events.onTouchEnd = event.functionName;
                    break;
            }
        });
    }
    console.log('Final events object:', events);
    return events;
};
const hasCTAEvents = (cta)=>{
    // Check events array
    return !!(cta.events && Array.isArray(cta.events) && cta.events.length > 0);
};
const executeCTAEvent = (eventCode, event, element)=>{
    try {
        // Check if the event code calls any global functions that might not be loaded yet
        const globalFunctionCalls = eventCode.match(/(\w+)\(/g);
        if (globalFunctionCalls) {
            const functionNames = globalFunctionCalls.map((call)=>call.replace('(', ''));
            // Check if any of these functions are not defined
            const undefinedFunctions = functionNames.filter((funcName)=>typeof window[funcName] !== 'function');
            if (undefinedFunctions.length > 0) {
                // Wait for scripts to load and retry
                setTimeout(()=>{
                    try {
                        executeEventCode(eventCode, event, element);
                    } catch (retryError) {
                        console.error('CTA event execution error after retry:', retryError);
                        console.error('Functions not found:', undefinedFunctions);
                    }
                }, 500); // Wait 500ms for scripts to load
                return;
            }
        }
        executeEventCode(eventCode, event, element);
    } catch (error) {
        console.error('CTA event execution error:', error);
    }
};
// Helper function to execute event code
const executeEventCode = (eventCode, event, element)=>{
    // Create a context object with element properties
    const context = {
        style: element.style,
        textContent: element.textContent,
        id: element.id,
        className: element.className,
        innerHTML: element.innerHTML,
        outerHTML: element.outerHTML,
        tagName: element.tagName
    };
    // Execute the event code with the context
    const executeWithContext = new Function('context', 'event', "\n    const { style, textContent, id, className, innerHTML, outerHTML, tagName } = context;\n    ".concat(eventCode, "\n  "));
    executeWithContext(context, event.nativeEvent);
};
const executeCTAEventFromConfig = (events, eventType, event, element)=>{
    try {
        console.log('executeCTAEventFromConfig called with:', {
            events,
            eventType,
            element
        });
        if (!events || !Array.isArray(events)) {
            console.log('executeCTAEventFromConfig - No events or not array:', events);
            return;
        }
        // Find events that match the current event type
        const matchingEvents = events.filter((eventConfig)=>eventConfig.eventType === eventType);
        console.log('executeCTAEventFromConfig - Matching events:', matchingEvents);
        matchingEvents.forEach((eventConfig)=>{
            if (eventConfig.functionName) {
                // Use the same approach as executeCTAEvent - execute the code directly
                console.log('executeCTAEventFromConfig - Executing function:', eventConfig.functionName);
                executeEventCode(eventConfig.functionName, event, element);
            }
        });
    } catch (error) {
        console.error('Error executing CTA events from config:', error);
    }
};
const getCTAStyles = function(style, designSystem) {
    let isDarkBackground = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
    const baseClasses = 'group px-8 py-4 text-base font-semibold transition-all duration-300 relative overflow-hidden rounded-xl';
    // Get colors from design system or use defaults
    const getColor = (colorType, fallback)=>{
        if (!designSystem) return fallback;
        switch(colorType){
            case 'primary':
                return designSystem.primaryColor || fallback;
            case 'primaryLight':
                return designSystem.primaryLightColor || fallback;
            case 'secondary':
                return designSystem.secondaryColor || fallback;
            case 'accent':
                return designSystem.accentColor || fallback;
            case 'success':
                return designSystem.successColor || fallback;
            case 'error':
                return designSystem.errorColor || fallback;
            case 'warning':
                return designSystem.warningColor || fallback;
            case 'info':
                return designSystem.infoColor || fallback;
            case 'textPrimary':
                return designSystem.textPrimary || fallback;
            case 'textSecondary':
                return designSystem.textSecondary || fallback;
            case 'textMuted':
                return designSystem.textMuted || fallback;
            default:
                return fallback;
        }
    };
    // Map CTA manager styles to design system colors
    switch(style){
        case 'primary':
            const primaryColor = getColor('primary', '#3B82F6');
            const primaryLightColor = getColor('primaryLight', '#60A5FA');
            const textPrimaryColor = getColor('textPrimary', '#1F2937');
            return {
                className: isDarkBackground ? "".concat(baseClasses, " bg-white/95 hover:bg-white border border-white/20 shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20") : "".concat(baseClasses, " hover:bg-opacity-80 shadow-lg hover:shadow-xl"),
                style: isDarkBackground ? {
                    color: textPrimaryColor
                } : {
                    backgroundColor: primaryColor,
                    color: '#FFFFFF',
                    '--tw-shadow-color': primaryColor + '40'
                }
            };
        case 'secondary':
            const secondaryColor = getColor('secondary', '#6B7280');
            const textSecondaryColor = getColor('textSecondary', '#6B7280');
            return {
                className: isDarkBackground ? "".concat(baseClasses, " bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-white/10") : "".concat(baseClasses, " bg-gray-100 border hover:bg-gray-200 shadow-sm hover:shadow-lg"),
                style: isDarkBackground ? {
                    color: '#FFFFFF'
                } : {
                    color: textSecondaryColor,
                    borderColor: secondaryColor
                }
            };
        case 'accent':
            const accentColor = getColor('accent', '#8B5CF6');
            return {
                className: isDarkBackground ? "".concat(baseClasses, " hover:bg-opacity-100 border backdrop-blur-sm") : "".concat(baseClasses, " hover:bg-opacity-80 shadow-lg hover:shadow-xl"),
                style: isDarkBackground ? {
                    backgroundColor: accentColor + 'E6',
                    borderColor: accentColor + '4D',
                    color: '#FFFFFF'
                } : {
                    backgroundColor: accentColor,
                    color: '#FFFFFF',
                    '--tw-shadow-color': accentColor + '40'
                }
            };
        case 'ghost':
            const textPrimaryColorGhost = getColor('textPrimary', '#1F2937');
            return {
                className: isDarkBackground ? "".concat(baseClasses, " hover:bg-white/10 border border-transparent hover:border-white/20 backdrop-blur-sm") : "".concat(baseClasses, " hover:bg-gray-100 border border-transparent hover:border-gray-300"),
                style: isDarkBackground ? {
                    color: '#FFFFFF'
                } : {
                    color: textPrimaryColorGhost
                }
            };
        case 'destructive':
            const errorColor = getColor('error', '#DC2626');
            return {
                className: isDarkBackground ? "".concat(baseClasses, " hover:bg-opacity-100 border backdrop-blur-sm") : "".concat(baseClasses, " hover:bg-opacity-80 shadow-lg"),
                style: isDarkBackground ? {
                    backgroundColor: errorColor + 'E6',
                    borderColor: errorColor + '4D',
                    color: '#FFFFFF'
                } : {
                    backgroundColor: errorColor,
                    color: '#FFFFFF',
                    '--tw-shadow-color': errorColor + '40'
                }
            };
        case 'success':
            const successColor = getColor('success', '#059669');
            return {
                className: isDarkBackground ? "".concat(baseClasses, " hover:bg-opacity-100 border backdrop-blur-sm") : "".concat(baseClasses, " hover:bg-opacity-80 shadow-lg"),
                style: isDarkBackground ? {
                    backgroundColor: successColor + 'E6',
                    borderColor: successColor + '4D',
                    color: '#FFFFFF'
                } : {
                    backgroundColor: successColor,
                    color: '#FFFFFF',
                    '--tw-shadow-color': successColor + '40'
                }
            };
        case 'info':
            const infoColor = getColor('info', '#3B82F6');
            return {
                className: isDarkBackground ? "".concat(baseClasses, " hover:bg-opacity-100 border backdrop-blur-sm") : "".concat(baseClasses, " hover:bg-opacity-80 shadow-lg"),
                style: isDarkBackground ? {
                    backgroundColor: infoColor + 'E6',
                    borderColor: infoColor + '4D',
                    color: '#FFFFFF'
                } : {
                    backgroundColor: infoColor,
                    color: '#FFFFFF',
                    '--tw-shadow-color': infoColor + '40'
                }
            };
        case 'outline':
            const outlineColor = getColor('primary', '#3B82F6');
            return {
                className: isDarkBackground ? "".concat(baseClasses, " min-w-[200px] border-2 border-white/30 hover:bg-white/10 hover:border-white/50 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-white/10") : "".concat(baseClasses, " min-w-[200px] border-2 hover:bg-opacity-10 backdrop-blur-sm shadow-sm hover:shadow-lg"),
                style: isDarkBackground ? {
                    color: '#FFFFFF'
                } : {
                    borderColor: outlineColor + '4D',
                    color: outlineColor
                }
            };
        case 'muted':
            const textMutedColor = getColor('textMuted', '#9CA3AF');
            return {
                className: "".concat(baseClasses, " bg-gray-100 border border-gray-300 cursor-not-allowed opacity-50"),
                style: {
                    color: textMutedColor
                }
            };
        default:
            const defaultColor = getColor('primary', '#3B82F6');
            return {
                className: "".concat(baseClasses, " hover:bg-opacity-80 shadow-lg hover:shadow-xl"),
                style: {
                    backgroundColor: defaultColor,
                    color: '#FFFFFF',
                    '--tw-shadow-color': defaultColor + '40'
                }
            };
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/Button.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Button": ()=>Button,
    "buttonVariants": ()=>buttonVariants
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
;
// Custom styles for dynamic hover effects using CSS variables
const dynamicButtonStyles = "\n  .btn-primary {\n    background-color: var(--color-primary);\n    color: white;\n    border: none;\n  }\n  .btn-primary:hover:not(:disabled) {\n    background-color: var(--color-primary-light);\n    transform: scale(1.02);\n  }\n  .btn-primary:active:not(:disabled) {\n    background-color: var(--color-primary-dark);\n    transform: scale(0.98);\n  }\n\n  .btn-secondary {\n    background-color: var(--color-secondary);\n    color: white;\n    border: 1px solid var(--color-secondary);\n  }\n  .btn-secondary:hover:not(:disabled) {\n    background-color: var(--color-secondary-dark);\n    transform: scale(1.02);\n  }\n\n  .btn-accent {\n    background-color: var(--color-accent);\n    color: white;\n    border: none;\n  }\n  .btn-accent:hover:not(:disabled) {\n    background-color: var(--color-accent-dark);\n    transform: scale(1.02);\n  }\n\n  .btn-ghost {\n    background-color: transparent;\n    color: var(--color-text-primary);\n    border: 1px solid transparent;\n  }\n  .btn-ghost:hover:not(:disabled) {\n    background-color: var(--color-primary-light);\n    opacity: 0.1;\n    transform: scale(1.02);\n  }\n\n  .btn-destructive {\n    background-color: var(--color-error);\n    color: white;\n    border: none;\n  }\n  .btn-destructive:hover:not(:disabled) {\n    background-color: var(--color-error-dark);\n    transform: scale(1.02);\n  }\n\n  .btn-success {\n    background-color: var(--color-success);\n    color: white;\n    border: none;\n  }\n  .btn-success:hover:not(:disabled) {\n    background-color: var(--color-success-dark);\n    transform: scale(1.02);\n  }\n\n  .btn-info {\n    background-color: var(--color-info);\n    color: white;\n    border: none;\n  }\n  .btn-info:hover:not(:disabled) {\n    background-color: var(--color-info-dark);\n    transform: scale(1.02);\n  }\n\n  .btn-outline {\n    background-color: transparent;\n    color: var(--color-primary);\n    border: 2px solid var(--color-primary);\n  }\n  .btn-outline:hover:not(:disabled) {\n    background-color: var(--color-primary-light);\n    transform: scale(1.02);\n  }\n\n  .btn-muted {\n    background-color: var(--color-bg-secondary);\n    color: var(--color-text-muted);\n    border: 1px solid var(--color-border-medium);\n    cursor: not-allowed;\n    opacity: 0.5;\n  }\n";
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])('inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none select-none relative overflow-hidden', {
    variants: {
        variant: {
            primary: [
                'btn-primary focus-visible:ring-blue-500',
                'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100'
            ],
            secondary: [
                'btn-secondary focus-visible:ring-blue-500'
            ],
            accent: [
                'btn-accent focus-visible:ring-purple-500',
                'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100'
            ],
            ghost: [
                'btn-ghost focus-visible:ring-blue-500'
            ],
            destructive: [
                'btn-destructive focus-visible:ring-red-500'
            ],
            success: [
                'btn-success focus-visible:ring-green-500'
            ],
            info: [
                'btn-info focus-visible:ring-blue-400'
            ],
            outline: [
                'btn-outline focus-visible:ring-blue-500'
            ],
            muted: [
                'btn-muted'
            ]
        },
        size: {
            sm: 'h-8 px-3',
            md: 'h-10 px-4',
            lg: 'h-12 px-6',
            xl: 'h-14 px-8'
        },
        fullWidth: {
            true: 'w-full'
        }
    },
    defaultVariants: {
        variant: 'primary',
        size: 'md'
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c = (param, ref)=>{
    let { className, variant = 'primary', size = 'md', fullWidth, isLoading = false, disabled, leftIcon, rightIcon, children, ...props } = param;
    const isDisabled = disabled || isLoading || variant === 'muted';
    // Get typography styles from design system
    const getTypographyStyles = ()=>{
        return {
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-sans)'
        };
    };
    // Get size styles
    const getSizeStyles = ()=>{
        const baseSize = 16; // Assuming 16px base
        switch(size){
            case 'sm':
                return {
                    fontSize: "".concat(baseSize * 0.875, "px")
                };
            case 'md':
                return {
                    fontSize: 'var(--font-size-base)'
                };
            case 'lg':
                return {
                    fontSize: "".concat(baseSize * 1.125, "px")
                };
            case 'xl':
                return {
                    fontSize: "".concat(baseSize * 1.25, "px")
                };
            default:
                return {
                    fontSize: 'var(--font-size-base)'
                };
        }
    };
    const combinedStyles = {
        ...getTypographyStyles(),
        ...getSizeStyles(),
        ...props.style
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                dangerouslySetInnerHTML: {
                    __html: dynamicButtonStyles
                }
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Button.tsx",
                lineNumber: 216,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
                    variant,
                    size,
                    fullWidth,
                    className
                })),
                ref: ref,
                disabled: isDisabled,
                style: combinedStyles,
                "aria-disabled": isDisabled,
                ...props,
                children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "h-4 w-4 animate-spin"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/Button.tsx",
                            lineNumber: 228,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "ml-2",
                            children: "Loading..."
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/Button.tsx",
                            lineNumber: 229,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        leftIcon && leftIcon,
                        children,
                        rightIcon && rightIcon
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Button.tsx",
                lineNumber: 218,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
});
_c1 = Button;
Button.displayName = 'Button';
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/hooks/useDesignSystem.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "getAdminPanelColors": ()=>getAdminPanelColors,
    "getAdminPanelColorsWithDesignSystem": ()=>getAdminPanelColorsWithDesignSystem,
    "getThemeDefaults": ()=>getThemeDefaults,
    "useDesignSystem": ()=>useDesignSystem
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
const useDesignSystem = ()=>{
    _s();
    const [designSystem, setDesignSystem] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDesignSystem.useEffect": ()=>{
            const fetchDesignSystem = {
                "useDesignSystem.useEffect.fetchDesignSystem": async ()=>{
                    try {
                        setLoading(true);
                        const response = await fetch('/api/admin/design-system');
                        const result = await response.json();
                        if (result.success) {
                            setDesignSystem(result.data);
                            setError(null);
                        } else {
                            setError(result.message || 'Failed to load design system');
                        }
                    } catch (err) {
                        console.error('Failed to fetch design system:', err);
                        setError('Failed to load design system');
                    } finally{
                        setLoading(false);
                    }
                }
            }["useDesignSystem.useEffect.fetchDesignSystem"];
            fetchDesignSystem();
        }
    }["useDesignSystem.useEffect"], []);
    const refetch = async ()=>{
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/admin/design-system');
            const result = await response.json();
            if (result.success) {
                setDesignSystem(result.data);
                setError(null);
            } else {
                setError(result.message || 'Failed to load design system');
            }
        } catch (err) {
            console.error('Failed to fetch design system:', err);
            setError('Failed to load design system');
        } finally{
            setLoading(false);
        }
    };
    return {
        designSystem,
        loading,
        error,
        refetch
    };
};
_s(useDesignSystem, "2+Fd93V8htijevI/osBFOqP97/k=");
const getThemeDefaults = (designSystem)=>{
    if (!designSystem) {
        // Fallback defaults if design system isn't loaded yet (dark theme)
        return {
            primaryColor: '#3B82F6',
            secondaryColor: '#8B5CF6',
            backgroundPrimary: '#1A1A1A',
            backgroundSecondary: '#2A2A2A',
            backgroundDark: '#0A0A0A',
            textPrimary: '#FFFFFF',
            textSecondary: '#A0A0A0',
            textMuted: '#707070',
            grayMedium: '#2C2C2C',
            grayDark: '#1F2937'
        };
    }
    return {
        primaryColor: designSystem.primaryColor,
        secondaryColor: designSystem.secondaryColor,
        backgroundPrimary: designSystem.backgroundPrimary,
        backgroundSecondary: designSystem.backgroundSecondary,
        textPrimary: designSystem.textPrimary,
        textSecondary: designSystem.textSecondary,
        textMuted: designSystem.textMuted
    };
};
const getAdminPanelColors = (designSystem)=>{
    if (designSystem) {
        return {
            textPrimary: designSystem.textPrimary,
            textSecondary: designSystem.textSecondary,
            textMuted: designSystem.textMuted,
            background: designSystem.backgroundPrimary,
            backgroundSecondary: designSystem.backgroundSecondary,
            border: designSystem.grayLight || '#E5E7EB'
        };
    }
    // Fallback to design system defaults (dark theme)
    return {
        textPrimary: '#FFFFFF',
        textSecondary: '#A0A0A0',
        textMuted: '#707070',
        background: '#1A1A1A',
        backgroundSecondary: '#2A2A2A',
        backgroundDark: '#0A0A0A',
        border: '#1F2937',
        primary: '#3B82F6',
        grayMedium: '#2C2C2C',
        grayDark: '#1F2937'
    };
};
const getAdminPanelColorsWithDesignSystem = (designSystem)=>{
    return {
        // Text Colors
        textPrimary: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textPrimary) || '#1F2937',
        textSecondary: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textSecondary) || '#6B7280',
        textMuted: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || '#9CA3AF',
        // Background Colors
        backgroundPrimary: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || '#FFFFFF',
        backgroundSecondary: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundSecondary) || '#F9FAFB',
        backgroundDark: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundDark) || '#1F2937',
        // Brand Colors
        primary: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.primaryColor) || '#5243E9',
        secondary: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.secondaryColor) || '#7C3AED',
        accent: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.accentColor) || '#06B6D4',
        // Semantic Colors
        success: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.successColor) || '#10B981',
        warning: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.warningColor) || '#F59E0B',
        error: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.errorColor) || '#EF4444',
        info: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.infoColor) || '#3B82F6',
        // Neutral Colors
        grayLight: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.grayLight) || '#E5E7EB',
        grayMedium: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.grayMedium) || '#9CA3AF',
        grayDark: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.grayDark) || '#374151',
        // Border Colors
        border: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.grayLight) || '#E5E7EB'
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/Card.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Card": ()=>Card,
    "CardContent": ()=>CardContent,
    "CardDescription": ()=>CardDescription,
    "CardFooter": ()=>CardFooter,
    "CardHeader": ()=>CardHeader,
    "CardTitle": ()=>CardTitle
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useDesignSystem.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const cardVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])('rounded-xl transition-all duration-300 ease-out group', {
    variants: {
        variant: {
            default: 'shadow-sm',
            outlined: 'bg-transparent border-2',
            elevated: 'shadow-lg shadow-black/5 border border-opacity-50',
            glass: 'glass backdrop-blur-xl bg-white/80 border border-white/20'
        },
        padding: {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
            xl: 'p-10'
        },
        hover: {
            true: 'hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 hover:border-[#5243E9]/20 cursor-pointer',
            false: ''
        }
    },
    defaultVariants: {
        variant: 'default',
        padding: 'md',
        hover: false
    }
});
const Card = /*#__PURE__*/ _s(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c = _s((param, ref)=>{
    let { className, variant, padding, hover, children, ...props } = param;
    _s();
    const { designSystem } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesignSystem"])();
    const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAdminPanelColorsWithDesignSystem"])(designSystem);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(cardVariants({
            variant,
            padding,
            hover,
            className
        })),
        style: {
            backgroundColor: variant === 'outlined' ? 'transparent' : colors.backgroundSecondary,
            borderColor: colors.grayLight,
            color: colors.textPrimary
        },
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Card.tsx",
        lineNumber: 49,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
}, "i396vkLqts6lgd8DkBetpdAbTiE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesignSystem"]
    ];
})), "i396vkLqts6lgd8DkBetpdAbTiE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesignSystem"]
    ];
});
_c1 = Card;
Card.displayName = 'Card';
// Card sub-components for better composition
const CardHeader = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c2 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col space-y-1.5', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Card.tsx",
        lineNumber: 72,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c3 = CardHeader;
CardHeader.displayName = 'CardHeader';
const CardTitle = /*#__PURE__*/ _s1(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c4 = _s1((param, ref)=>{
    let { className, children, ...props } = param;
    _s1();
    const { designSystem } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesignSystem"])();
    const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAdminPanelColorsWithDesignSystem"])(designSystem);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('font-semibold text-lg leading-none tracking-tight', className),
        style: {
            color: colors.textPrimary
        },
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Card.tsx",
        lineNumber: 87,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
}, "i396vkLqts6lgd8DkBetpdAbTiE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesignSystem"]
    ];
})), "i396vkLqts6lgd8DkBetpdAbTiE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesignSystem"]
    ];
});
_c5 = CardTitle;
CardTitle.displayName = 'CardTitle';
const CardDescription = /*#__PURE__*/ _s2(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c6 = _s2((param, ref)=>{
    let { className, ...props } = param;
    _s2();
    const { designSystem } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesignSystem"])();
    const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAdminPanelColorsWithDesignSystem"])(designSystem);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-sm', className),
        style: {
            color: colors.textSecondary
        },
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Card.tsx",
        lineNumber: 106,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
}, "i396vkLqts6lgd8DkBetpdAbTiE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesignSystem"]
    ];
})), "i396vkLqts6lgd8DkBetpdAbTiE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDesignSystem"]
    ];
});
_c7 = CardDescription;
CardDescription.displayName = 'CardDescription';
const CardContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c8 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('pt-0', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Card.tsx",
        lineNumber: 120,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c9 = CardContent;
CardContent.displayName = 'CardContent';
const CardFooter = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c10 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center pt-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Card.tsx",
        lineNumber: 132,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c11 = CardFooter;
CardFooter.displayName = 'CardFooter';
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
__turbopack_context__.k.register(_c, "Card$React.forwardRef");
__turbopack_context__.k.register(_c1, "Card");
__turbopack_context__.k.register(_c2, "CardHeader$React.forwardRef");
__turbopack_context__.k.register(_c3, "CardHeader");
__turbopack_context__.k.register(_c4, "CardTitle$React.forwardRef");
__turbopack_context__.k.register(_c5, "CardTitle");
__turbopack_context__.k.register(_c6, "CardDescription$React.forwardRef");
__turbopack_context__.k.register(_c7, "CardDescription");
__turbopack_context__.k.register(_c8, "CardContent$React.forwardRef");
__turbopack_context__.k.register(_c9, "CardContent");
__turbopack_context__.k.register(_c10, "CardFooter$React.forwardRef");
__turbopack_context__.k.register(_c11, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/ErrorBoundary.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__,
    "useErrorHandler": ()=>useErrorHandler,
    "withErrorBoundary": ()=>withErrorBoundary
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-client] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Card.tsx [app-client] (ecmascript)");
'use client';
;
;
;
;
;
;
class ErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"] {
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, errorInfo) {
        // Log the error to console in development
        if ("TURBOPACK compile-time truthy", 1) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
    // Here you could also log the error to an error reporting service
    // Example: Sentry, LogRocket, etc.
    }
    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default error UI
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-screen bg-gray-50 flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                    className: "max-w-md w-full p-8 text-center bg-white border border-gray-200 shadow-xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-center mb-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                    className: "w-8 h-8 text-red-600"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                                    lineNumber: 64,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                                lineNumber: 63,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                            lineNumber: 62,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-2xl font-bold text-gray-900 mb-4",
                            children: "Oops! Something went wrong"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                            lineNumber: 68,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600 mb-6 leading-relaxed",
                            children: "We encountered an unexpected error. Don't worry, our team has been notified and is working on a fix."
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                            lineNumber: 72,
                            columnNumber: 13
                        }, this),
                        ("TURBOPACK compile-time value", "development") === 'development' && this.state.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                            className: "mb-6 text-left",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                    className: "cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900",
                                    children: "Error Details (Development)"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                                    lineNumber: 78,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-3 p-3 bg-gray-100 rounded-lg text-xs font-mono text-gray-800 overflow-auto max-h-32",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "font-semibold text-red-600 mb-2",
                                            children: [
                                                this.state.error.name,
                                                ": ",
                                                this.state.error.message
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                                            lineNumber: 82,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                            className: "whitespace-pre-wrap",
                                            children: this.state.error.stack
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                                            lineNumber: 85,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                                    lineNumber: 81,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                            lineNumber: 77,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col sm:flex-row gap-3 justify-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: this.handleTryAgain,
                                    className: "bg-blue-600 hover:bg-blue-700 text-white",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "w-4 h-4 mr-2"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                                            lineNumber: 97,
                                            columnNumber: 17
                                        }, this),
                                        "Try Again"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                                    lineNumber: 93,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "outline",
                                    onClick: this.handleGoHome,
                                    className: "border-gray-300 text-gray-700 hover:bg-gray-50",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"], {
                                            className: "w-4 h-4 mr-2"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                                            lineNumber: 106,
                                            columnNumber: 17
                                        }, this),
                                        "Go Home"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                                    lineNumber: 101,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "ghost",
                                    onClick: this.handleReload,
                                    className: "text-gray-600 hover:text-gray-800",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "w-4 h-4 mr-2"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                                            lineNumber: 115,
                                            columnNumber: 17
                                        }, this),
                                        "Reload Page"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                                    lineNumber: 110,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                            lineNumber: 92,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                    lineNumber: 61,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, this);
        }
        return this.props.children;
    }
    constructor(...args){
        super(...args), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "state", {
            hasError: false,
            error: null
        }), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "handleReload", ()=>{
            window.location.reload();
        }), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "handleGoHome", ()=>{
            window.location.href = '/';
        }), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "handleTryAgain", ()=>{
            this.setState({
                hasError: false,
                error: null
            });
        });
    }
}
const __TURBOPACK__default__export__ = ErrorBoundary;
function withErrorBoundary(Component, fallback) {
    const WrappedComponent = (props)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorBoundary, {
            fallback: fallback,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Component, {
                ...props
            }, void 0, false, {
                fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
                lineNumber: 137,
                columnNumber: 7
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/ui/ErrorBoundary.tsx",
            lineNumber: 136,
            columnNumber: 5
        }, this);
    WrappedComponent.displayName = "withErrorBoundary(".concat(Component.displayName || Component.name, ")");
    return WrappedComponent;
}
function useErrorHandler() {
    return (error)=>{
        throw error;
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/layout/DesignSystemProvider.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
const applyDesignSystemToRoot = (ds)=>{
    const root = document.documentElement;
    // Override the existing CSS variables from globals.css with database values
    // Brand Colors (override --color-primary variants)
    root.style.setProperty('--color-primary', ds.primaryColor);
    root.style.setProperty('--color-primary-light', ds.primaryColorLight);
    root.style.setProperty('--color-primary-dark', ds.primaryColor);
    root.style.setProperty('--color-secondary', ds.secondaryColor);
    root.style.setProperty('--color-accent', ds.accentColor);
    // Semantic Colors (override existing --color-success, etc.)
    root.style.setProperty('--color-success', ds.successColor);
    root.style.setProperty('--color-warning', ds.warningColor);
    root.style.setProperty('--color-error', ds.errorColor);
    root.style.setProperty('--color-info', ds.infoColor);
    // Darker variants for hover states (auto-generate if not provided)
    root.style.setProperty('--color-secondary-dark', ds.secondaryColor);
    root.style.setProperty('--color-accent-dark', ds.accentColor);
    root.style.setProperty('--color-success-dark', ds.successColor);
    root.style.setProperty('--color-error-dark', ds.errorColor);
    root.style.setProperty('--color-info-dark', ds.infoColor);
    // Create darker variants for better hover effects
    const darkenColor = function(color) {
        let amount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0.2;
        // Simple darkening function - you might want to use a proper color library
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.floor(255 * amount));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.floor(255 * amount));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.floor(255 * amount));
        return "#".concat(r.toString(16).padStart(2, '0')).concat(g.toString(16).padStart(2, '0')).concat(b.toString(16).padStart(2, '0'));
    };
    root.style.setProperty('--color-secondary-dark', darkenColor(ds.secondaryColor));
    root.style.setProperty('--color-accent-dark', darkenColor(ds.accentColor));
    root.style.setProperty('--color-success-dark', darkenColor(ds.successColor));
    root.style.setProperty('--color-error-dark', darkenColor(ds.errorColor));
    root.style.setProperty('--color-info-dark', darkenColor(ds.infoColor));
    // Typography (override existing font families and add weights)
    root.style.setProperty('--font-family-sans', ds.fontFamily);
    root.style.setProperty('--font-family-mono', ds.fontFamilyMono);
    root.style.setProperty('--font-size-base', ds.fontSizeBase);
    root.style.setProperty('--line-height-base', ds.lineHeightBase);
    root.style.setProperty('--font-weight-normal', ds.fontWeightNormal);
    root.style.setProperty('--font-weight-medium', ds.fontWeightMedium);
    root.style.setProperty('--font-weight-bold', ds.fontWeightBold);
    // Text colors
    root.style.setProperty('--color-text-primary', ds.textPrimary);
    root.style.setProperty('--color-text-secondary', ds.textSecondary);
    root.style.setProperty('--color-text-muted', ds.textMuted);
    // Background colors
    root.style.setProperty('--color-bg-primary', ds.backgroundPrimary);
    root.style.setProperty('--color-bg-secondary', ds.backgroundSecondary);
    root.style.setProperty('--color-bg-dark', ds.backgroundDark || '#1F2937');
    // Neutral colors
    root.style.setProperty('--color-gray-light', ds.grayLight);
    root.style.setProperty('--color-gray-medium', ds.grayMedium);
    root.style.setProperty('--color-gray-dark', ds.grayMedium);
    root.style.setProperty('--color-border-medium', ds.grayMedium);
    // Update gradients to use new colors
    root.style.setProperty('--gradient-hero', "linear-gradient(135deg, ".concat(ds.primaryColor, " 0%, ").concat(ds.secondaryColor, " 100%)"));
    root.style.setProperty('--gradient-card', "linear-gradient(145deg, ".concat(ds.primaryColor, "1A 0%, ").concat(ds.secondaryColor, "0D 100%)"));
    root.style.setProperty('--gradient-mesh', "radial-gradient(ellipse at top, ".concat(ds.primaryColor, "4D, transparent 50%)"));
    // Update selection and focus colors
    const style = document.createElement('style');
    style.textContent = "\n    ::selection {\n      background: ".concat(ds.primaryColor, " !important;\n      color: #FFFFFF !important;\n    }\n    \n    :focus-visible {\n      outline: 2px solid ").concat(ds.primaryColor, " !important;\n      outline-offset: 2px !important;\n    }\n    \n    ::-webkit-scrollbar-thumb {\n      background: ").concat(ds.textMuted, " !important;\n    }\n    \n    ::-webkit-scrollbar-thumb:hover {\n      background: ").concat(ds.textSecondary, " !important;\n    }\n    \n    .gradient-text {\n      background: linear-gradient(135deg, ").concat(ds.primaryColor, " 0%, ").concat(ds.secondaryColor, " 100%) !important;\n      -webkit-background-clip: text !important;\n      -webkit-text-fill-color: transparent !important;\n      background-clip: text !important;\n    }\n  ");
    // Remove existing dynamic styles and add new ones
    const existingStyle = document.getElementById('dynamic-design-system');
    if (existingStyle) {
        existingStyle.remove();
    }
    style.id = 'dynamic-design-system';
    document.head.appendChild(style);
    // Apply custom variables if they exist
    if (ds.customVariables) {
        try {
            const customVars = JSON.parse(ds.customVariables);
            Object.entries(customVars).forEach((param)=>{
                let [key, value] = param;
                root.style.setProperty("--".concat(key), value);
            });
        } catch (error) {
            console.warn('Failed to parse custom variables:', error);
        }
    }
    // Apply theme mode class
    root.setAttribute('data-theme', 'light'); // Default to light theme
};
const DesignSystemProvider = (param)=>{
    let { children } = param;
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DesignSystemProvider.useEffect": ()=>{
            const loadDesignSystem = {
                "DesignSystemProvider.useEffect.loadDesignSystem": async ()=>{
                    try {
                        const response = await fetch('/api/admin/design-system');
                        const result = await response.json();
                        if (result.success) {
                            applyDesignSystemToRoot(result.data);
                        } else {
                            console.warn('Failed to load design system:', result.message);
                        }
                    } catch (error) {
                        console.error('Failed to fetch design system:', error);
                    }
                }
            }["DesignSystemProvider.useEffect.loadDesignSystem"];
            loadDesignSystem();
        }
    }["DesignSystemProvider.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
};
_s(DesignSystemProvider, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = DesignSystemProvider;
const __TURBOPACK__default__export__ = DesignSystemProvider;
var _c;
__turbopack_context__.k.register(_c, "DesignSystemProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/layout/DynamicFavicon.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>DynamicFavicon
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function DynamicFavicon(param) {
    let { faviconUrl } = param;
    _s();
    const [dynamicFaviconUrl, setDynamicFaviconUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(faviconUrl || null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DynamicFavicon.useEffect": ()=>{
            // If faviconUrl is provided as prop, use it
            if (faviconUrl) {
                setDynamicFaviconUrl(faviconUrl);
                return;
            }
            // Otherwise fetch favicon data from API
            const fetchFavicon = {
                "DynamicFavicon.useEffect.fetchFavicon": async ()=>{
                    try {
                        const response = await fetch('/api/admin/site-settings');
                        if (response.ok) {
                            const data = await response.json();
                            if (data.success && data.data) {
                                const settings = data.data;
                                // Try to get the most appropriate favicon
                                const favicon = settings.faviconDarkUrl || settings.faviconLightUrl || settings.faviconUrl || '/favicon.svg';
                                setDynamicFaviconUrl(favicon);
                            } else {
                                // If no data structure, try to use the response directly
                                const settings = data;
                                const favicon = settings.faviconDarkUrl || settings.faviconLightUrl || settings.faviconUrl || '/favicon.svg';
                                setDynamicFaviconUrl(favicon);
                            }
                        } else {
                            console.warn('Failed to fetch site settings, using default favicon');
                            setDynamicFaviconUrl('/favicon.svg');
                        }
                    } catch (error) {
                        console.error('Failed to fetch favicon:', error);
                        setDynamicFaviconUrl('/favicon.svg');
                    }
                }
            }["DynamicFavicon.useEffect.fetchFavicon"];
            fetchFavicon();
        }
    }["DynamicFavicon.useEffect"], [
        faviconUrl
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DynamicFavicon.useEffect": ()=>{
            if ("object" === 'undefined' || !dynamicFaviconUrl) return;
            // Remove existing favicon links
            const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
            existingFavicons.forEach({
                "DynamicFavicon.useEffect": (link)=>link.remove()
            }["DynamicFavicon.useEffect"]);
            // Add new favicon links
            const favicon = dynamicFaviconUrl;
            // Main favicon
            const link1 = document.createElement('link');
            link1.rel = 'icon';
            link1.href = favicon;
            link1.type = favicon.endsWith('.svg') ? 'image/svg+xml' : 'image/x-icon';
            document.head.appendChild(link1);
            // Shortcut icon for older browsers
            const link2 = document.createElement('link');
            link2.rel = 'shortcut icon';
            link2.href = favicon;
            document.head.appendChild(link2);
            // Apple touch icon
            const link3 = document.createElement('link');
            link3.rel = 'apple-touch-icon';
            link3.href = favicon;
            document.head.appendChild(link3);
            console.log('Dynamic favicon injected:', favicon);
        }
    }["DynamicFavicon.useEffect"], [
        dynamicFaviconUrl
    ]);
    return null; // This component doesn't render anything
}
_s(DynamicFavicon, "K5aZwnrZvaOBf0QmxJ3BYC5hqIY=");
_c = DynamicFavicon;
var _c;
__turbopack_context__.k.register(_c, "DynamicFavicon");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/layout/GoogleAnalytics.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>GoogleAnalytics
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function GoogleAnalytics(param) {
    let { gaMeasurementId } = param;
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GoogleAnalytics.useEffect": ()=>{
            if (!gaMeasurementId || !window.gtag) return;
            // Track page view on route change
            window.gtag('config', gaMeasurementId, {
                page_path: pathname
            });
        }
    }["GoogleAnalytics.useEffect"], [
        pathname,
        gaMeasurementId
    ]);
    // Don't render anything if no GA ID
    if (!gaMeasurementId) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                async: true,
                src: "https://www.googletagmanager.com/gtag/js?id=".concat(gaMeasurementId)
            }, void 0, false, {
                fileName: "[project]/src/components/layout/GoogleAnalytics.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                dangerouslySetInnerHTML: {
                    __html: "\n            window.dataLayer = window.dataLayer || [];\n            function gtag(){dataLayer.push(arguments);}\n            gtag('js', new Date());\n            gtag('config', '".concat(gaMeasurementId, "', {\n              page_path: window.location.pathname,\n              send_page_view: false\n            });\n          ")
                }
            }, void 0, false, {
                fileName: "[project]/src/components/layout/GoogleAnalytics.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(GoogleAnalytics, "V/ldUoOTYUs0Cb2F6bbxKSn7KxI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = GoogleAnalytics;
var _c;
__turbopack_context__.k.register(_c, "GoogleAnalytics");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/layout/GoogleTagManager.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "GoogleTagManagerNoScript": ()=>GoogleTagManagerNoScript,
    "default": ()=>GoogleTagManager
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
'use client';
;
function GoogleTagManager(param) {
    let { gtmContainerId, gtmEnabled } = param;
    // Don't render anything if GTM is not enabled or no container ID
    if (!gtmEnabled || !gtmContainerId) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
            dangerouslySetInnerHTML: {
                __html: "\n            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n            })(window,document,'script','dataLayer','".concat(gtmContainerId, "');\n          ")
            }
        }, void 0, false, {
            fileName: "[project]/src/components/layout/GoogleTagManager.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this)
    }, void 0, false);
}
_c = GoogleTagManager;
function GoogleTagManagerNoScript(param) {
    let { gtmContainerId, gtmEnabled } = param;
    // Don't render anything if GTM is not enabled or no container ID
    if (!gtmEnabled || !gtmContainerId) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("noscript", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                src: "https://www.googletagmanager.com/ns.html?id=".concat(gtmContainerId),
                height: "0",
                width: "0",
                style: {
                    display: 'none',
                    visibility: 'hidden'
                }
            }, void 0, false, {
                fileName: "[project]/src/components/layout/GoogleTagManager.tsx",
                lineNumber: 46,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/layout/GoogleTagManager.tsx",
            lineNumber: 45,
            columnNumber: 7
        }, this)
    }, void 0, false);
}
_c1 = GoogleTagManagerNoScript;
var _c, _c1;
__turbopack_context__.k.register(_c, "GoogleTagManager");
__turbopack_context__.k.register(_c1, "GoogleTagManagerNoScript");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/layout/AnalyticsProvider.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>AnalyticsProvider
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$GoogleAnalytics$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/GoogleAnalytics.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$GoogleTagManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/GoogleTagManager.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function AnalyticsProvider() {
    _s();
    const [settings, setSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [loaded, setLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AnalyticsProvider.useEffect": ()=>{
            const fetchAnalyticsSettings = {
                "AnalyticsProvider.useEffect.fetchAnalyticsSettings": async ()=>{
                    try {
                        const response = await fetch('/api/admin/site-settings');
                        if (response.ok) {
                            const result = await response.json();
                            const data = result.success ? result.data : result;
                            setSettings({
                                gaMeasurementId: (data === null || data === void 0 ? void 0 : data.gaMeasurementId) || undefined,
                                gtmContainerId: (data === null || data === void 0 ? void 0 : data.gtmContainerId) || undefined,
                                gtmEnabled: (data === null || data === void 0 ? void 0 : data.gtmEnabled) || false
                            });
                        }
                    } catch (error) {
                        console.error('Failed to fetch analytics settings:', error);
                    // Fail silently - analytics is not critical for site functionality
                    } finally{
                        setLoaded(true);
                    }
                }
            }["AnalyticsProvider.useEffect.fetchAnalyticsSettings"];
            fetchAnalyticsSettings();
        }
    }["AnalyticsProvider.useEffect"], []);
    // Don't render anything until we've attempted to load settings
    if (!loaded) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            settings.gtmContainerId && settings.gtmEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$GoogleTagManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                gtmContainerId: settings.gtmContainerId,
                gtmEnabled: settings.gtmEnabled
            }, void 0, false, {
                fileName: "[project]/src/components/layout/AnalyticsProvider.tsx",
                lineNumber: 49,
                columnNumber: 9
            }, this),
            settings.gtmContainerId && settings.gtmEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$GoogleTagManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleTagManagerNoScript"], {
                gtmContainerId: settings.gtmContainerId,
                gtmEnabled: settings.gtmEnabled
            }, void 0, false, {
                fileName: "[project]/src/components/layout/AnalyticsProvider.tsx",
                lineNumber: 57,
                columnNumber: 9
            }, this),
            settings.gaMeasurementId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$GoogleAnalytics$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                gaMeasurementId: settings.gaMeasurementId
            }, void 0, false, {
                fileName: "[project]/src/components/layout/AnalyticsProvider.tsx",
                lineNumber: 65,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(AnalyticsProvider, "g7EXNdnSWe9VIjDuxJz3mzVJdeQ=");
_c = AnalyticsProvider;
var _c;
__turbopack_context__.k.register(_c, "AnalyticsProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_c8d081bd._.js.map