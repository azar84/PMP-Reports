(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/admin-panel/components/DesignSystemManager.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useDesignSystem.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/palette.js [app-client] (ecmascript) <export default as Palette>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Type$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/type.js [app-client] (ecmascript) <export default as Type>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ruler.js [app-client] (ecmascript) <export default as Ruler>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor.js [app-client] (ecmascript) <export default as Monitor>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-client] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.js [app-client] (ecmascript) <export default as Moon>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const ColorPicker = (param)=>{
    let { label, value, onChange, description, colors } = param;
    _s();
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleCopy = async ()=>{
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(()=>setCopied(false), 2000);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-sm font-medium",
                style: {
                    color: colors.textPrimary
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-12 h-12 border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer relative overflow-hidden",
                        style: {
                            backgroundColor: value
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "color",
                            value: value,
                            onChange: (e)=>onChange(e.target.value),
                            className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                            lineNumber: 130,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 126,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                            type: "text",
                            value: value,
                            onChange: (e)=>onChange(e.target.value),
                            className: "font-mono text-sm",
                            placeholder: "#000000"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                            lineNumber: 138,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 137,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "outline",
                        size: "sm",
                        onClick: handleCopy,
                        className: "px-3",
                        children: copied ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                            lineNumber: 152,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                            lineNumber: 152,
                            columnNumber: 43
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                lineNumber: 125,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs",
                style: {
                    color: colors.textMuted
                },
                children: description
            }, void 0, false, {
                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                lineNumber: 156,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
        lineNumber: 121,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ColorPicker, "NE86rL3vg4NVcTTWDavsT0hUBJs=");
_c = ColorPicker;
const DesignSystemManager = ()=>{
    _s1();
    const [designSystem, setDesignSystem] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAdminPanelColorsWithDesignSystem"])(designSystem);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('colors');
    const [previewMode, setPreviewMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('light');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DesignSystemManager.useEffect": ()=>{
            fetchDesignSystem();
        }
    }["DesignSystemManager.useEffect"], []);
    // Apply design system whenever it changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DesignSystemManager.useEffect": ()=>{
            if (designSystem) {
                try {
                    applyDesignSystemToRoot(designSystem);
                } catch (error) {
                    console.error('Error applying design system in useEffect:', error);
                }
            }
        }
    }["DesignSystemManager.useEffect"], [
        designSystem
    ]);
    const fetchDesignSystem = async ()=>{
        try {
            setLoading(true);
            const response = await fetch('/api/admin/design-system');
            const result = await response.json();
            if (result.success) {
                setDesignSystem(result.data);
                // Apply design system to document root when loading
                try {
                    applyDesignSystemToRoot(result.data);
                } catch (error) {
                    console.error('Error applying design system to root on load:', error);
                }
            } else {
                setMessage({
                    type: 'error',
                    text: result.message || 'Failed to load design system'
                });
            }
        } catch (error) {
            console.error('Failed to fetch design system:', error);
            setMessage({
                type: 'error',
                text: 'Failed to load design system'
            });
        } finally{
            setLoading(false);
        }
    };
    const handleSave = async ()=>{
        if (!designSystem) return;
        try {
            setSaving(true);
            setMessage(null);
            console.log('Saving design system data:', designSystem);
            // Always use POST to create/update - let the API handle the logic
            const response = await fetch('/api/admin/design-system', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(designSystem)
            });
            const result = await response.json();
            if (result.success) {
                setDesignSystem(result.data);
                setMessage({
                    type: 'success',
                    text: 'Design system saved successfully!'
                });
                // Apply design system to document root for preview
                try {
                    applyDesignSystemToRoot(result.data);
                } catch (error) {
                    console.error('Error applying design system to root:', error);
                // Don't show error to user as the save was successful
                }
            } else {
                console.error('Design system save failed:', result);
                if (result.detailedErrors) {
                    console.error('Detailed validation errors:', result.detailedErrors);
                }
                let errorMessage = result.message || 'Failed to save design system';
                if (result.detailedErrors && result.detailedErrors.length > 0) {
                    errorMessage += '. Check console for details.';
                }
                setMessage({
                    type: 'error',
                    text: errorMessage
                });
            }
        } catch (error) {
            console.error('Failed to save design system:', error);
            setMessage({
                type: 'error',
                text: 'Failed to save design system'
            });
        } finally{
            setSaving(false);
        }
    };
    const handleReset = async ()=>{
        try {
            setSaving(true);
            setMessage(null);
            const response = await fetch('/api/admin/design-system', {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                setDesignSystem(result.data);
                setMessage({
                    type: 'success',
                    text: 'Design system reset to defaults!'
                });
                // Apply design system to document root
                applyDesignSystemToRoot(result.data);
            } else {
                setMessage({
                    type: 'error',
                    text: result.message || 'Failed to reset design system'
                });
            }
        } catch (error) {
            console.error('Failed to reset design system:', error);
            setMessage({
                type: 'error',
                text: 'Failed to reset design system'
            });
        } finally{
            setSaving(false);
        }
    };
    const applyDesignSystemToRoot = (ds)=>{
        if (!ds) {
            console.warn('Design system is null or undefined');
            return;
        }
        const root = document.documentElement;
        if (!root) {
            console.warn('Document root element not found');
            return;
        }
        try {
            // Apply CSS custom properties to the root element
            root.style.setProperty('--color-primary', ds.primaryColor);
            root.style.setProperty('--color-primary-light', ds.primaryColorLight);
            root.style.setProperty('--color-primary-dark', ds.primaryColorDark);
            root.style.setProperty('--color-secondary', ds.secondaryColor);
            root.style.setProperty('--color-accent', ds.accentColor);
            root.style.setProperty('--color-success', ds.successColor);
            root.style.setProperty('--color-warning', ds.warningColor);
            root.style.setProperty('--color-error', ds.errorColor);
            root.style.setProperty('--color-info', ds.infoColor);
            root.style.setProperty('--color-border-light', ds.borderLight);
            root.style.setProperty('--color-border-strong', ds.borderStrong);
            root.style.setProperty('--color-bg-primary', ds.backgroundPrimary);
            root.style.setProperty('--color-bg-secondary', ds.backgroundSecondary);
            root.style.setProperty('--color-bg-dark', ds.backgroundDark);
            // Header and sidebar background colors (with fallbacks)
            root.style.setProperty('--color-header-bg', ds.headerBackgroundColor || ds.primaryColor);
            root.style.setProperty('--color-sidebar-header-bg', ds.sidebarHeaderBackgroundColor || ds.primaryColor);
            root.style.setProperty('--color-sidebar-bg', ds.sidebarBackgroundColor || ds.backgroundSecondary);
            root.style.setProperty('--color-text-primary', ds.textPrimary);
            root.style.setProperty('--color-text-secondary', ds.textSecondary);
            root.style.setProperty('--color-text-muted', ds.textMuted);
            // Header and sidebar text colors (with fallbacks)
            root.style.setProperty('--color-header-text-color', ds.headerTextColor || ds.textPrimary);
            root.style.setProperty('--color-sidebar-text-color', ds.sidebarTextColor || ds.textPrimary);
            root.style.setProperty('--color-sidebar-header-color', ds.sidebarHeaderColor || ds.textPrimary);
            root.style.setProperty('--font-family-sans', ds.fontFamily);
            root.style.setProperty('--font-family-mono', ds.fontFamilyMono);
            root.style.setProperty('--font-size-base', ds.fontSizeBase);
            root.style.setProperty('--line-height-base', ds.lineHeightBase);
            root.style.setProperty('--font-weight-normal', ds.fontWeightNormal);
            root.style.setProperty('--font-weight-medium', ds.fontWeightMedium);
            root.style.setProperty('--font-weight-bold', ds.fontWeightBold);
            root.style.setProperty('--spacing-xs', ds.spacingXs);
            root.style.setProperty('--spacing-sm', ds.spacingSm);
            root.style.setProperty('--spacing-md', ds.spacingMd);
            root.style.setProperty('--spacing-lg', ds.spacingLg);
            root.style.setProperty('--spacing-xl', ds.spacingXl);
            root.style.setProperty('--spacing-2xl', ds.spacing2xl);
            root.style.setProperty('--border-radius-sm', ds.borderRadiusSm);
            root.style.setProperty('--border-radius-md', ds.borderRadiusMd);
            root.style.setProperty('--border-radius-lg', ds.borderRadiusLg);
            root.style.setProperty('--border-radius-xl', ds.borderRadiusXl);
            root.style.setProperty('--border-radius-full', ds.borderRadiusFull);
            root.style.setProperty('--shadow-sm', ds.shadowSm);
            root.style.setProperty('--shadow-md', ds.shadowMd);
            root.style.setProperty('--shadow-lg', ds.shadowLg);
            root.style.setProperty('--shadow-xl', ds.shadowXl);
            root.style.setProperty('--animation-fast', ds.animationFast);
            root.style.setProperty('--animation-normal', ds.animationNormal);
            root.style.setProperty('--animation-slow', ds.animationSlow);
        } catch (error) {
            console.error('Error setting CSS properties:', error);
            throw error; // Re-throw to be caught by calling functions
        }
    };
    const updateDesignSystem = (field, value)=>{
        if (!designSystem) return;
        setDesignSystem((prev)=>({
                ...prev,
                [field]: value
            }));
    };
    const exportDesignSystem = ()=>{
        if (!designSystem) return;
        const dataStr = JSON.stringify(designSystem, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'design-system.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };
    const importDesignSystem = (event)=>{
        var _event_target_files;
        const file = (_event_target_files = event.target.files) === null || _event_target_files === void 0 ? void 0 : _event_target_files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e)=>{
            try {
                var _e_target;
                const jsonData = JSON.parse((_e_target = e.target) === null || _e_target === void 0 ? void 0 : _e_target.result);
                // Validate the imported data structure
                if (validateDesignSystemData(jsonData)) {
                    // Apply fallbacks for missing properties
                    const designSystemWithFallbacks = {
                        ...jsonData,
                        headerBackgroundColor: jsonData.headerBackgroundColor || jsonData.primaryColor,
                        sidebarHeaderBackgroundColor: jsonData.sidebarHeaderBackgroundColor || jsonData.primaryColor,
                        sidebarBackgroundColor: jsonData.sidebarBackgroundColor || jsonData.backgroundSecondary,
                        headerTextColor: jsonData.headerTextColor || jsonData.textPrimary,
                        sidebarTextColor: jsonData.sidebarTextColor || jsonData.textPrimary,
                        sidebarHeaderColor: jsonData.sidebarHeaderColor || jsonData.textPrimary
                    };
                    setDesignSystem(designSystemWithFallbacks);
                    setMessage({
                        type: 'success',
                        text: 'Design system imported successfully!'
                    });
                    // Apply the imported design system
                    try {
                        applyDesignSystemToRoot(designSystemWithFallbacks);
                    } catch (error) {
                        console.error('Error applying imported design system:', error);
                    }
                } else {
                    setMessage({
                        type: 'error',
                        text: 'Invalid design system file format'
                    });
                }
            } catch (error) {
                console.error('Failed to parse JSON:', error);
                setMessage({
                    type: 'error',
                    text: 'Failed to parse JSON file'
                });
            }
        };
        reader.readAsText(file);
        // Reset the input value so the same file can be imported again
        event.target.value = '';
    };
    const validateDesignSystemData = (data)=>{
        // Check for required fields
        const requiredFields = [
            'primaryColor',
            'secondaryColor',
            'accentColor',
            'successColor',
            'warningColor',
            'errorColor',
            'infoColor',
            'borderLight',
            'borderStrong',
            'backgroundPrimary',
            'backgroundSecondary',
            'backgroundDark',
            'textPrimary',
            'textSecondary',
            'textMuted',
            'fontFamily',
            'fontSizeBase',
            'lineHeightBase',
            'themeMode'
        ];
        // Optional fields that have fallbacks
        const optionalFields = [
            'headerBackgroundColor',
            'sidebarHeaderBackgroundColor',
            'sidebarBackgroundColor',
            'headerTextColor',
            'sidebarTextColor',
            'sidebarHeaderColor'
        ];
        const hasRequiredFields = requiredFields.every((field)=>typeof data[field] === 'string' && data[field].trim() !== '');
        const hasValidOptionalFields = optionalFields.every((field)=>!data[field] || typeof data[field] === 'string' && data[field].trim() !== '');
        return hasRequiredFields && hasValidOptionalFields;
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-pulse",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-8 rounded w-1/3 mb-6",
                        style: {
                            backgroundColor: 'var(--color-border-light)'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 472,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-32 rounded",
                                style: {
                                    backgroundColor: 'var(--color-border-light)'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 474,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-32 rounded",
                                style: {
                                    backgroundColor: 'var(--color-border-light)'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 475,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-32 rounded",
                                style: {
                                    backgroundColor: 'var(--color-border-light)'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 476,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 473,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                lineNumber: 471,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
            lineNumber: 470,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    if (!designSystem) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold mb-4",
                        style: {
                            color: 'var(--color-text-primary)'
                        },
                        children: "Design System Not Found"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 487,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-6",
                        style: {
                            color: 'var(--color-text-secondary)'
                        },
                        children: "Unable to load the design system settings."
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 488,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        onClick: fetchDesignSystem,
                        children: "Retry"
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 489,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                lineNumber: 486,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
            lineNumber: 485,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    const tabs = [
        {
            id: 'colors',
            name: 'Colors',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__["Palette"]
        },
        {
            id: 'typography',
            name: 'Typography',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Type$3e$__["Type"]
        },
        {
            id: 'spacing',
            name: 'Spacing & Layout',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__["Ruler"]
        },
        {
            id: 'effects',
            name: 'Effects & Animations',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"]
        },
        {
            id: 'breakpoints',
            name: 'Breakpoints',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"]
        },
        {
            id: 'preview',
            name: 'Live Preview',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"]
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-8",
        style: {
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold",
                                style: {
                                    color: 'var(--color-text-primary)'
                                },
                                children: "Design System"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 517,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2",
                                style: {
                                    color: 'var(--color-text-secondary)'
                                },
                                children: "Manage your website's visual identity and design tokens"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 518,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 516,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center space-x-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "file",
                                accept: ".json",
                                onChange: importDesignSystem,
                                style: {
                                    display: 'none'
                                },
                                id: "import-design-system"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 521,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                onClick: ()=>{
                                    var _document_getElementById;
                                    return (_document_getElementById = document.getElementById('import-design-system')) === null || _document_getElementById === void 0 ? void 0 : _document_getElementById.click();
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 532,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Import"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 533,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 528,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                onClick: exportDesignSystem,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 539,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Export"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 540,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 535,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                onClick: handleReset,
                                disabled: saving,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 547,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Reset"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 548,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 542,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                onClick: handleSave,
                                disabled: saving,
                                style: {
                                    backgroundColor: colors.primary,
                                    color: '#FFFFFF'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 555,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: saving ? 'Saving...' : 'Save Changes'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 556,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 550,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 520,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                lineNumber: 515,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 rounded-lg",
                style: {
                    backgroundColor: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
                    color: 'var(--color-bg-primary)',
                    borderColor: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'
                },
                children: message.text
            }, void 0, false, {
                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                lineNumber: 563,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b",
                style: {
                    borderColor: 'var(--color-border-light)'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                    className: "-mb-px flex space-x-8",
                    children: tabs.map((tab)=>{
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setActiveTab(tab.id),
                            className: "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                            style: {
                                borderColor: isActive ? 'var(--color-primary)' : 'transparent',
                                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                    className: "w-4 h-4 mr-2",
                                    style: {
                                        color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                    lineNumber: 592,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                tab.name
                            ]
                        }, tab.id, true, {
                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                            lineNumber: 579,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0));
                    })
                }, void 0, false, {
                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                    lineNumber: 574,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                lineNumber: 573,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-8",
                children: [
                    activeTab === 'colors' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold mb-6 flex items-center",
                                        style: {
                                            color: colors.textPrimary
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__["Palette"], {
                                                className: "w-5 h-5 mr-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 611,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Brand Colors"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 610,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Primary Color",
                                                value: designSystem.primaryColor,
                                                onChange: (value)=>updateDesignSystem('primaryColor', value),
                                                description: "Main brand color used for primary actions",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 615,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Primary Light",
                                                value: designSystem.primaryColorLight,
                                                onChange: (value)=>updateDesignSystem('primaryColorLight', value),
                                                description: "Lighter variant for hover states",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 622,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Primary Dark",
                                                value: designSystem.primaryColorDark,
                                                onChange: (value)=>updateDesignSystem('primaryColorDark', value),
                                                description: "Darker variant for active states",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 629,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Secondary Color",
                                                value: designSystem.secondaryColor,
                                                onChange: (value)=>updateDesignSystem('secondaryColor', value),
                                                description: "Secondary brand color",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 636,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Accent Color",
                                                value: designSystem.accentColor,
                                                onChange: (value)=>updateDesignSystem('accentColor', value),
                                                description: "Accent color for highlights",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 643,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 614,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 609,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold mb-6",
                                        style: {
                                            color: colors.textPrimary
                                        },
                                        children: "Semantic Colors"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 655,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Success",
                                                value: designSystem.successColor,
                                                onChange: (value)=>updateDesignSystem('successColor', value),
                                                description: "Success states and positive actions",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 659,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Warning",
                                                value: designSystem.warningColor,
                                                onChange: (value)=>updateDesignSystem('warningColor', value),
                                                description: "Warning states and caution",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 666,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Error",
                                                value: designSystem.errorColor,
                                                onChange: (value)=>updateDesignSystem('errorColor', value),
                                                description: "Error states and destructive actions",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 673,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Info",
                                                value: designSystem.infoColor,
                                                onChange: (value)=>updateDesignSystem('infoColor', value),
                                                description: "Informational messages",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 680,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 658,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 654,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold mb-6",
                                        style: {
                                            color: colors.textPrimary
                                        },
                                        children: "Border Colors"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 692,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Border Light",
                                                value: designSystem.borderLight,
                                                onChange: (value)=>updateDesignSystem('borderLight', value),
                                                description: "Light border color for subtle elements",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 696,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Border Strong",
                                                value: designSystem.borderStrong,
                                                onChange: (value)=>updateDesignSystem('borderStrong', value),
                                                description: "Strong border color for emphasis",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 703,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 695,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 691,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold mb-6",
                                        style: {
                                            color: colors.textPrimary
                                        },
                                        children: "Background Colors"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 715,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Primary Background",
                                                value: designSystem.backgroundPrimary,
                                                onChange: (value)=>updateDesignSystem('backgroundPrimary', value),
                                                description: "Main page background",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 719,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Secondary Background",
                                                value: designSystem.backgroundSecondary,
                                                onChange: (value)=>updateDesignSystem('backgroundSecondary', value),
                                                description: "Card and section backgrounds",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 726,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Dark Background",
                                                value: designSystem.backgroundDark,
                                                onChange: (value)=>updateDesignSystem('backgroundDark', value),
                                                description: "Dark theme background",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 733,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Header Background",
                                                value: designSystem.headerBackgroundColor,
                                                onChange: (value)=>updateDesignSystem('headerBackgroundColor', value),
                                                description: "Background color for main headers",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 740,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Sidebar Header Background",
                                                value: designSystem.sidebarHeaderBackgroundColor,
                                                onChange: (value)=>updateDesignSystem('sidebarHeaderBackgroundColor', value),
                                                description: "Background color for sidebar header (logo area)",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 747,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Sidebar Background",
                                                value: designSystem.sidebarBackgroundColor,
                                                onChange: (value)=>updateDesignSystem('sidebarBackgroundColor', value),
                                                description: "Background color for sidebar navigation",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 754,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 718,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 714,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold mb-6",
                                        style: {
                                            color: colors.textPrimary
                                        },
                                        children: "Text Colors"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 766,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Primary Text",
                                                value: designSystem.textPrimary,
                                                onChange: (value)=>updateDesignSystem('textPrimary', value),
                                                description: "Main text color",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 770,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Secondary Text",
                                                value: designSystem.textSecondary,
                                                onChange: (value)=>updateDesignSystem('textSecondary', value),
                                                description: "Secondary text color",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 777,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Muted Text",
                                                value: designSystem.textMuted,
                                                onChange: (value)=>updateDesignSystem('textMuted', value),
                                                description: "Muted text for captions",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 784,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Header Text",
                                                value: designSystem.headerTextColor,
                                                onChange: (value)=>updateDesignSystem('headerTextColor', value),
                                                description: "Text color for headers and navigation",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 791,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Sidebar Text",
                                                value: designSystem.sidebarTextColor,
                                                onChange: (value)=>updateDesignSystem('sidebarTextColor', value),
                                                description: "Text color for sidebar menu items",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 798,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ColorPicker, {
                                                label: "Sidebar Header",
                                                value: designSystem.sidebarHeaderColor,
                                                onChange: (value)=>updateDesignSystem('sidebarHeaderColor', value),
                                                description: "Text color for sidebar header (logo area)",
                                                colors: colors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 805,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 769,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 765,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 607,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === 'typography' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold mb-6 flex items-center",
                                        style: {
                                            color: colors.textPrimary
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Type$3e$__["Type"], {
                                                className: "w-5 h-5 mr-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 822,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Font Families"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 821,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Primary Font Family"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 827,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.fontFamily,
                                                        onChange: (e)=>updateDesignSystem('fontFamily', e.target.value),
                                                        placeholder: "Manrope, Inter, system-ui",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 830,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs mt-1",
                                                        style: {
                                                            color: colors.textMuted
                                                        },
                                                        children: "Used for headings and body text"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 836,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 826,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Monospace Font Family"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 839,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.fontFamilyMono,
                                                        onChange: (e)=>updateDesignSystem('fontFamilyMono', e.target.value),
                                                        placeholder: "ui-monospace, SF Mono, Monaco",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 842,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs mt-1",
                                                        style: {
                                                            color: colors.textMuted
                                                        },
                                                        children: "Used for code and technical content"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 848,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 838,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 825,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 820,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold mb-6",
                                        style: {
                                            color: colors.textPrimary
                                        },
                                        children: "Font Sizes & Weights"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 855,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Base Font Size"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 860,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.fontSizeBase,
                                                        onChange: (e)=>updateDesignSystem('fontSizeBase', e.target.value),
                                                        placeholder: "16px",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 863,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs mt-1",
                                                        style: {
                                                            color: colors.textMuted
                                                        },
                                                        children: "Base font size for body text"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 869,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 859,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Base Line Height"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 872,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.lineHeightBase,
                                                        onChange: (e)=>updateDesignSystem('lineHeightBase', e.target.value),
                                                        placeholder: "1.5",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 875,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs mt-1",
                                                        style: {
                                                            color: colors.textMuted
                                                        },
                                                        children: "Line height ratio for readability"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 881,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 871,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Normal Weight"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 884,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.fontWeightNormal,
                                                        onChange: (e)=>updateDesignSystem('fontWeightNormal', e.target.value),
                                                        placeholder: "400",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 887,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs mt-1",
                                                        style: {
                                                            color: colors.textMuted
                                                        },
                                                        children: "Regular text weight"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 893,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 883,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Medium Weight"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 896,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.fontWeightMedium,
                                                        onChange: (e)=>updateDesignSystem('fontWeightMedium', e.target.value),
                                                        placeholder: "500",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 899,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs mt-1",
                                                        style: {
                                                            color: colors.textMuted
                                                        },
                                                        children: "Semi-bold text weight"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 905,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 895,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Bold Weight"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 908,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.fontWeightBold,
                                                        onChange: (e)=>updateDesignSystem('fontWeightBold', e.target.value),
                                                        placeholder: "700",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 911,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs mt-1",
                                                        style: {
                                                            color: colors.textMuted
                                                        },
                                                        children: "Bold text weight"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 917,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 907,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 858,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 854,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold mb-6",
                                        style: {
                                            color: colors.textPrimary
                                        },
                                        children: "Typography Preview"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 924,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        style: {
                                            fontFamily: designSystem.fontFamily
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                    className: "text-4xl font-bold",
                                                    style: {
                                                        color: designSystem.textPrimary
                                                    },
                                                    children: "Heading 1 - Large Title"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 929,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 928,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-3xl font-semibold",
                                                    style: {
                                                        color: designSystem.textPrimary
                                                    },
                                                    children: "Heading 2 - Section Title"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 934,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 933,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-2xl font-medium",
                                                    style: {
                                                        color: designSystem.textPrimary
                                                    },
                                                    children: "Heading 3 - Subsection"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 939,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 938,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-lg",
                                                    style: {
                                                        color: designSystem.textPrimary,
                                                        fontSize: designSystem.fontSizeBase,
                                                        lineHeight: designSystem.lineHeightBase
                                                    },
                                                    children: "Body text - This is how your regular paragraph text will appear on the website. It should be comfortable to read and have good contrast against the background."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 944,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 943,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm",
                                                    style: {
                                                        color: designSystem.textSecondary
                                                    },
                                                    children: "Secondary text - Used for captions, metadata, and supporting information."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 954,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 953,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm",
                                                    style: {
                                                        color: designSystem.textMuted
                                                    },
                                                    children: "Muted text - Used for less important information and subtle details."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 959,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 958,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                    className: "px-2 py-1 rounded text-sm",
                                                    style: {
                                                        fontFamily: designSystem.fontFamilyMono,
                                                        backgroundColor: colors.backgroundSecondary
                                                    },
                                                    children: "Monospace text - for code snippets"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 964,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 963,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 927,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 923,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 818,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === 'spacing' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold mb-6 flex items-center",
                                        style: {
                                            color: colors.textPrimary
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__["Ruler"], {
                                                className: "w-5 h-5 mr-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 984,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Spacing Scale"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 983,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Extra Small (XS)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 989,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.spacingXs,
                                                        onChange: (e)=>updateDesignSystem('spacingXs', e.target.value),
                                                        placeholder: "4px",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 992,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 h-2 rounded",
                                                        style: {
                                                            width: designSystem.spacingXs,
                                                            backgroundColor: 'var(--color-info-light, #DBEAFE)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 998,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 988,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Small (SM)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1001,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.spacingSm,
                                                        onChange: (e)=>updateDesignSystem('spacingSm', e.target.value),
                                                        placeholder: "8px",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1004,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 h-2 rounded",
                                                        style: {
                                                            width: designSystem.spacingSm,
                                                            backgroundColor: 'var(--color-info-light, #DBEAFE)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1010,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1000,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Medium (MD)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1013,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.spacingMd,
                                                        onChange: (e)=>updateDesignSystem('spacingMd', e.target.value),
                                                        placeholder: "16px",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1016,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 h-2 rounded",
                                                        style: {
                                                            width: designSystem.spacingMd,
                                                            backgroundColor: 'var(--color-info-light, #DBEAFE)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1022,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1012,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Large (LG)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1025,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.spacingLg,
                                                        onChange: (e)=>updateDesignSystem('spacingLg', e.target.value),
                                                        placeholder: "24px",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1028,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 h-2 rounded",
                                                        style: {
                                                            width: designSystem.spacingLg,
                                                            backgroundColor: 'var(--color-info-light, #DBEAFE)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1034,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1024,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Extra Large (XL)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1037,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.spacingXl,
                                                        onChange: (e)=>updateDesignSystem('spacingXl', e.target.value),
                                                        placeholder: "32px",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1040,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 h-2 rounded",
                                                        style: {
                                                            width: designSystem.spacingXl,
                                                            backgroundColor: 'var(--color-info-light, #DBEAFE)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1046,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1036,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "2X Large (2XL)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1049,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.spacing2xl,
                                                        onChange: (e)=>updateDesignSystem('spacing2xl', e.target.value),
                                                        placeholder: "48px",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1052,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 h-2 rounded",
                                                        style: {
                                                            width: designSystem.spacing2xl,
                                                            backgroundColor: 'var(--color-info-light, #DBEAFE)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1058,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1048,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 987,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 982,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold mb-6",
                                        style: {
                                            color: colors.textPrimary
                                        },
                                        children: "Border Radius"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 1065,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Small Radius"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1070,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.borderRadiusSm,
                                                        onChange: (e)=>updateDesignSystem('borderRadiusSm', e.target.value),
                                                        placeholder: "4px",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1073,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 w-16 h-16",
                                                        style: {
                                                            borderRadius: designSystem.borderRadiusSm,
                                                            backgroundColor: 'var(--color-info-light, #DBEAFE)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1079,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1069,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Medium Radius"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1088,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.borderRadiusMd,
                                                        onChange: (e)=>updateDesignSystem('borderRadiusMd', e.target.value),
                                                        placeholder: "8px",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1091,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 w-16 h-16",
                                                        style: {
                                                            borderRadius: designSystem.borderRadiusMd,
                                                            backgroundColor: 'var(--color-info-light, #DBEAFE)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1097,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1087,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Large Radius"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1106,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.borderRadiusLg,
                                                        onChange: (e)=>updateDesignSystem('borderRadiusLg', e.target.value),
                                                        placeholder: "12px",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1109,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 w-16 h-16",
                                                        style: {
                                                            borderRadius: designSystem.borderRadiusLg,
                                                            backgroundColor: 'var(--color-info-light, #DBEAFE)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1115,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1105,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Extra Large Radius"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1124,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.borderRadiusXl,
                                                        onChange: (e)=>updateDesignSystem('borderRadiusXl', e.target.value),
                                                        placeholder: "16px",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1127,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 w-16 h-16",
                                                        style: {
                                                            borderRadius: designSystem.borderRadiusXl,
                                                            backgroundColor: 'var(--color-info-light, #DBEAFE)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1133,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1123,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Full Radius (Pills)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1142,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.borderRadiusFull,
                                                        onChange: (e)=>updateDesignSystem('borderRadiusFull', e.target.value),
                                                        placeholder: "9999px",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1145,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 w-24 h-16",
                                                        style: {
                                                            borderRadius: designSystem.borderRadiusFull,
                                                            backgroundColor: 'var(--color-info-light, #DBEAFE)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1151,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1141,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 1068,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 1064,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 980,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === 'effects' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold mb-6 flex items-center",
                                        style: {
                                            color: colors.textPrimary
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                className: "w-5 h-5 mr-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1169,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Box Shadows"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 1168,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Small Shadow"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1174,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.shadowSm,
                                                        onChange: (e)=>updateDesignSystem('shadowSm', e.target.value),
                                                        placeholder: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                                                        className: "font-mono text-sm"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1177,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 w-24 h-16 rounded-lg",
                                                        style: {
                                                            boxShadow: designSystem.shadowSm,
                                                            backgroundColor: colors.backgroundSecondary
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1183,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1173,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Medium Shadow"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1192,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.shadowMd,
                                                        onChange: (e)=>updateDesignSystem('shadowMd', e.target.value),
                                                        placeholder: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                                        className: "font-mono text-sm"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1195,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 w-24 h-16 rounded-lg",
                                                        style: {
                                                            boxShadow: designSystem.shadowMd,
                                                            backgroundColor: colors.backgroundSecondary
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1201,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1191,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Large Shadow"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1210,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.shadowLg,
                                                        onChange: (e)=>updateDesignSystem('shadowLg', e.target.value),
                                                        placeholder: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                                        className: "font-mono text-sm"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1213,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 w-24 h-16 rounded-lg",
                                                        style: {
                                                            boxShadow: designSystem.shadowLg,
                                                            backgroundColor: colors.backgroundSecondary
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1219,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1209,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Extra Large Shadow"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1228,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.shadowXl,
                                                        onChange: (e)=>updateDesignSystem('shadowXl', e.target.value),
                                                        placeholder: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                                                        className: "font-mono text-sm"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1231,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2 w-24 h-16 rounded-lg",
                                                        style: {
                                                            boxShadow: designSystem.shadowXl,
                                                            backgroundColor: colors.backgroundSecondary
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1237,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1227,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 1172,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 1167,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold mb-6",
                                        style: {
                                            color: colors.textPrimary
                                        },
                                        children: "Animation Durations"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 1250,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Fast Animation"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1255,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.animationFast,
                                                        onChange: (e)=>updateDesignSystem('animationFast', e.target.value),
                                                        placeholder: "150ms",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1258,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs mt-1",
                                                        style: {
                                                            color: colors.textMuted
                                                        },
                                                        children: "Quick interactions and micro-animations"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1264,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1254,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Normal Animation"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1267,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.animationNormal,
                                                        onChange: (e)=>updateDesignSystem('animationNormal', e.target.value),
                                                        placeholder: "300ms",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1270,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs mt-1",
                                                        style: {
                                                            color: colors.textMuted
                                                        },
                                                        children: "Standard transitions and state changes"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1276,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1266,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Slow Animation"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1279,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: designSystem.animationSlow,
                                                        onChange: (e)=>updateDesignSystem('animationSlow', e.target.value),
                                                        placeholder: "500ms",
                                                        className: "font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1282,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs mt-1",
                                                        style: {
                                                            color: colors.textMuted
                                                        },
                                                        children: "Complex animations and page transitions"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1288,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1278,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 1253,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                lineNumber: 1249,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 1165,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === 'breakpoints' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xl font-semibold mb-6 flex items-center",
                                    style: {
                                        color: colors.textPrimary
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"], {
                                            className: "w-5 h-5 mr-2"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                            lineNumber: 1299,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        "Responsive Breakpoints"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                    lineNumber: 1298,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium mb-2",
                                                    style: {
                                                        color: colors.textPrimary
                                                    },
                                                    children: "Small (SM)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1304,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                    value: designSystem.breakpointSm,
                                                    onChange: (e)=>updateDesignSystem('breakpointSm', e.target.value),
                                                    placeholder: "640px",
                                                    className: "font-mono"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1307,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs mt-1",
                                                    style: {
                                                        color: colors.textMuted
                                                    },
                                                    children: "Mobile landscape and small tablets"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1313,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                            lineNumber: 1303,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium mb-2",
                                                    style: {
                                                        color: colors.textPrimary
                                                    },
                                                    children: "Medium (MD)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1316,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                    value: designSystem.breakpointMd,
                                                    onChange: (e)=>updateDesignSystem('breakpointMd', e.target.value),
                                                    placeholder: "768px",
                                                    className: "font-mono"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1319,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs mt-1",
                                                    style: {
                                                        color: colors.textMuted
                                                    },
                                                    children: "Tablets"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1325,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                            lineNumber: 1315,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium mb-2",
                                                    style: {
                                                        color: colors.textPrimary
                                                    },
                                                    children: "Large (LG)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1328,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                    value: designSystem.breakpointLg,
                                                    onChange: (e)=>updateDesignSystem('breakpointLg', e.target.value),
                                                    placeholder: "1024px",
                                                    className: "font-mono"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1331,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs mt-1",
                                                    style: {
                                                        color: colors.textMuted
                                                    },
                                                    children: "Small laptops"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1337,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                            lineNumber: 1327,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium mb-2",
                                                    style: {
                                                        color: colors.textPrimary
                                                    },
                                                    children: "Extra Large (XL)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1340,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                    value: designSystem.breakpointXl,
                                                    onChange: (e)=>updateDesignSystem('breakpointXl', e.target.value),
                                                    placeholder: "1280px",
                                                    className: "font-mono"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1343,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs mt-1",
                                                    style: {
                                                        color: colors.textMuted
                                                    },
                                                    children: "Laptops and desktops"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1349,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                            lineNumber: 1339,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium mb-2",
                                                    style: {
                                                        color: colors.textPrimary
                                                    },
                                                    children: "2X Large (2XL)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1352,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                    value: designSystem.breakpoint2xl,
                                                    onChange: (e)=>updateDesignSystem('breakpoint2xl', e.target.value),
                                                    placeholder: "1536px",
                                                    className: "font-mono"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1355,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs mt-1",
                                                    style: {
                                                        color: colors.textMuted
                                                    },
                                                    children: "Large desktops and monitors"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1361,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                            lineNumber: 1351,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                    lineNumber: 1302,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-lg font-medium mb-4",
                                            style: {
                                                color: colors.textPrimary
                                            },
                                            children: "Breakpoint Visualization"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                            lineNumber: 1367,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center space-x-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-16 text-sm",
                                                            style: {
                                                                color: colors.textSecondary
                                                            },
                                                            children: "Mobile"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1370,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 h-4 rounded",
                                                            style: {
                                                                maxWidth: '320px',
                                                                backgroundColor: 'var(--color-error-light, #FEE2E2)'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1371,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm",
                                                            style: {
                                                                color: colors.textSecondary
                                                            },
                                                            children: [
                                                                "0px - ",
                                                                designSystem.breakpointSm
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1372,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1369,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center space-x-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-16 text-sm",
                                                            style: {
                                                                color: colors.textSecondary
                                                            },
                                                            children: "SM"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1375,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 h-4 rounded",
                                                            style: {
                                                                maxWidth: '400px',
                                                                backgroundColor: 'var(--color-warning-light, #FEF3C7)'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1376,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm",
                                                            style: {
                                                                color: colors.textSecondary
                                                            },
                                                            children: [
                                                                designSystem.breakpointSm,
                                                                " - ",
                                                                designSystem.breakpointMd
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1377,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1374,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center space-x-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-16 text-sm",
                                                            style: {
                                                                color: colors.textSecondary
                                                            },
                                                            children: "MD"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1380,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 h-4 rounded",
                                                            style: {
                                                                maxWidth: '500px',
                                                                backgroundColor: 'var(--color-warning-light, #FEF3C7)'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1381,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm",
                                                            style: {
                                                                color: colors.textSecondary
                                                            },
                                                            children: [
                                                                designSystem.breakpointMd,
                                                                " - ",
                                                                designSystem.breakpointLg
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1382,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1379,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center space-x-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-16 text-sm",
                                                            style: {
                                                                color: colors.textSecondary
                                                            },
                                                            children: "LG"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1385,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 h-4 rounded",
                                                            style: {
                                                                maxWidth: '600px',
                                                                backgroundColor: 'var(--color-success-light, #D1FAE5)'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1386,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm",
                                                            style: {
                                                                color: colors.textSecondary
                                                            },
                                                            children: [
                                                                designSystem.breakpointLg,
                                                                " - ",
                                                                designSystem.breakpointXl
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1387,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1384,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center space-x-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-16 text-sm",
                                                            style: {
                                                                color: colors.textSecondary
                                                            },
                                                            children: "XL"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1390,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 h-4 rounded",
                                                            style: {
                                                                maxWidth: '700px',
                                                                backgroundColor: 'var(--color-info-light, #DBEAFE)'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1391,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm",
                                                            style: {
                                                                color: colors.textSecondary
                                                            },
                                                            children: [
                                                                designSystem.breakpointXl,
                                                                " - ",
                                                                designSystem.breakpoint2xl
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1392,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1389,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center space-x-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-16 text-sm",
                                                            style: {
                                                                color: colors.textSecondary
                                                            },
                                                            children: "2XL"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1395,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 h-4 rounded",
                                                            style: {
                                                                maxWidth: '800px',
                                                                backgroundColor: 'var(--color-primary-light, #E0E7FF)'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1396,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm",
                                                            style: {
                                                                color: colors.textSecondary
                                                            },
                                                            children: [
                                                                designSystem.breakpoint2xl,
                                                                "+"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1397,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1394,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                            lineNumber: 1368,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                    lineNumber: 1366,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                            lineNumber: 1297,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 1296,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === 'preview' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-xl font-semibold flex items-center",
                                            style: {
                                                color: colors.textPrimary
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                    className: "w-5 h-5 mr-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1410,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                "Live Preview"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                            lineNumber: 1409,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm",
                                                    style: {
                                                        color: colors.textSecondary
                                                    },
                                                    children: "Preview Mode:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1414,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setPreviewMode(previewMode === 'light' ? 'dark' : 'light'),
                                                    className: "flex items-center space-x-2 px-3 py-1 rounded-lg border border-gray-200/10",
                                                    style: {
                                                        borderColor: colors.grayLight,
                                                        backgroundColor: colors.backgroundSecondary
                                                    },
                                                    children: [
                                                        previewMode === 'light' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1423,
                                                            columnNumber: 48
                                                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1423,
                                                            columnNumber: 78
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "capitalize",
                                                            children: previewMode
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                            lineNumber: 1424,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                    lineNumber: 1415,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                            lineNumber: 1413,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                    lineNumber: 1408,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-8 rounded-lg border border-gray-200/10",
                                    style: {
                                        backgroundColor: previewMode === 'light' ? designSystem.backgroundPrimary : designSystem.backgroundDark,
                                        color: previewMode === 'light' ? designSystem.textPrimary : designSystem.backgroundPrimary,
                                        fontFamily: designSystem.fontFamily
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                        className: "text-3xl font-bold mb-2",
                                                        style: {
                                                            color: 'var(--color-primary)'
                                                        },
                                                        children: "Design System Preview"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1441,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-lg",
                                                        style: {
                                                            color: designSystem.textSecondary
                                                        },
                                                        children: "See how your design tokens look in practice"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1444,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1440,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center space-x-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg",
                                                        style: {
                                                            backgroundColor: 'var(--color-primary)',
                                                            color: '#FFFFFF',
                                                            borderRadius: designSystem.borderRadiusMd,
                                                            boxShadow: designSystem.shadowMd,
                                                            border: 'none'
                                                        },
                                                        onMouseEnter: (e)=>{
                                                            e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                                        },
                                                        onMouseLeave: (e)=>{
                                                            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        },
                                                        children: "Primary Button"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1451,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg",
                                                        style: {
                                                            backgroundColor: 'var(--color-secondary)',
                                                            color: '#FFFFFF',
                                                            borderRadius: designSystem.borderRadiusMd,
                                                            boxShadow: designSystem.shadowMd,
                                                            border: '1px solid var(--color-secondary)'
                                                        },
                                                        onMouseEnter: (e)=>{
                                                            e.currentTarget.style.backgroundColor = 'var(--color-secondary-dark)';
                                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                                        },
                                                        onMouseLeave: (e)=>{
                                                            e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        },
                                                        children: "Secondary Button"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1471,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1450,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-6 rounded-lg",
                                                        style: {
                                                            backgroundColor: previewMode === 'light' ? designSystem.backgroundSecondary : designSystem.borderStrong,
                                                            borderRadius: designSystem.borderRadiusLg,
                                                            boxShadow: designSystem.shadowSm
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-xl font-semibold mb-2",
                                                                children: "Card Title"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                lineNumber: 1503,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                style: {
                                                                    color: designSystem.textSecondary
                                                                },
                                                                children: "This is a sample card showing how your design system applies to content containers."
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                lineNumber: 1504,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-4 flex items-center space-x-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "px-3 py-1 text-sm rounded-full transition-all duration-300 hover:scale-105",
                                                                        style: {
                                                                            backgroundColor: 'var(--color-success)',
                                                                            color: '#FFFFFF',
                                                                            borderRadius: designSystem.borderRadiusFull
                                                                        },
                                                                        children: "Success"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                        lineNumber: 1508,
                                                                        columnNumber: 25
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "px-3 py-1 text-sm rounded-full transition-all duration-300 hover:scale-105",
                                                                        style: {
                                                                            backgroundColor: 'var(--color-warning)',
                                                                            color: '#FFFFFF',
                                                                            borderRadius: designSystem.borderRadiusFull
                                                                        },
                                                                        children: "Warning"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                        lineNumber: 1518,
                                                                        columnNumber: 25
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                lineNumber: 1507,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1495,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-6 rounded-lg",
                                                        style: {
                                                            backgroundColor: previewMode === 'light' ? designSystem.backgroundSecondary : designSystem.borderStrong,
                                                            borderRadius: designSystem.borderRadiusLg,
                                                            boxShadow: designSystem.shadowSm
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-xl font-semibold mb-2",
                                                                children: "Typography Scale"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                lineNumber: 1539,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-2xl font-bold",
                                                                        children: "Large heading"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                        lineNumber: 1541,
                                                                        columnNumber: 25
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-lg font-medium",
                                                                        children: "Medium heading"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                        lineNumber: 1542,
                                                                        columnNumber: 25
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        style: {
                                                                            fontSize: designSystem.fontSizeBase
                                                                        },
                                                                        children: "Body text"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                        lineNumber: 1543,
                                                                        columnNumber: 25
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-sm",
                                                                        style: {
                                                                            color: designSystem.textMuted
                                                                        },
                                                                        children: "Small text"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                        lineNumber: 1544,
                                                                        columnNumber: 25
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                lineNumber: 1540,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1531,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1494,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-xl font-semibold mb-4",
                                                        children: "Color Palette"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1553,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-4 md:grid-cols-8 gap-4",
                                                        children: [
                                                            {
                                                                name: 'Primary',
                                                                color: designSystem.primaryColor,
                                                                cssVar: 'var(--color-primary)'
                                                            },
                                                            {
                                                                name: 'Secondary',
                                                                color: designSystem.secondaryColor,
                                                                cssVar: 'var(--color-secondary)'
                                                            },
                                                            {
                                                                name: 'Accent',
                                                                color: designSystem.accentColor,
                                                                cssVar: 'var(--color-accent)'
                                                            },
                                                            {
                                                                name: 'Success',
                                                                color: designSystem.successColor,
                                                                cssVar: 'var(--color-success)'
                                                            },
                                                            {
                                                                name: 'Warning',
                                                                color: designSystem.warningColor,
                                                                cssVar: 'var(--color-warning)'
                                                            },
                                                            {
                                                                name: 'Error',
                                                                color: designSystem.errorColor,
                                                                cssVar: 'var(--color-error)'
                                                            },
                                                            {
                                                                name: 'Info',
                                                                color: designSystem.infoColor,
                                                                cssVar: 'var(--color-info)'
                                                            },
                                                            {
                                                                name: 'Border',
                                                                color: designSystem.borderStrong,
                                                                cssVar: designSystem.borderStrong
                                                            }
                                                        ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-center",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "w-full h-16 rounded-lg mb-2 transition-all duration-300 hover:scale-105 cursor-pointer",
                                                                        style: {
                                                                            backgroundColor: item.cssVar,
                                                                            borderRadius: designSystem.borderRadiusMd,
                                                                            boxShadow: designSystem.shadowSm
                                                                        },
                                                                        onClick: ()=>{
                                                                            var _navigator_clipboard;
                                                                            return (_navigator_clipboard = navigator.clipboard) === null || _navigator_clipboard === void 0 ? void 0 : _navigator_clipboard.writeText(item.color);
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                        lineNumber: 1566,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-sm font-medium",
                                                                        children: item.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                        lineNumber: 1575,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs font-mono",
                                                                        style: {
                                                                            color: designSystem.textMuted
                                                                        },
                                                                        children: item.color
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                        lineNumber: 1576,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, item.name, true, {
                                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                                lineNumber: 1565,
                                                                columnNumber: 25
                                                            }, ("TURBOPACK compile-time value", void 0)))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                        lineNumber: 1554,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                                lineNumber: 1552,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                        lineNumber: 1438,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                                    lineNumber: 1430,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                            lineNumber: 1407,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                        lineNumber: 1406,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
                lineNumber: 605,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/admin-panel/components/DesignSystemManager.tsx",
        lineNumber: 507,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(DesignSystemManager, "3HS7zhj+bRE0KVfoYu7lHe1tZJI=");
_c1 = DesignSystemManager;
const __TURBOPACK__default__export__ = DesignSystemManager;
var _c, _c1;
__turbopack_context__.k.register(_c, "ColorPicker");
__turbopack_context__.k.register(_c1, "DesignSystemManager");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_admin-panel_components_DesignSystemManager_tsx_abd802f1._.js.map