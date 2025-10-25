(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/admin-panel/components/MediaLibraryManager.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useDesignSystem.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grid-3x3.js [app-client] (ecmascript) <export default as Grid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list.js [app-client] (ecmascript) <export default as List>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Link$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/link.js [app-client] (ecmascript) <export default as Link>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/video.js [app-client] (ecmascript) <export default as Video>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/music.js [app-client] (ecmascript) <export default as Music>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file.js [app-client] (ecmascript) <export default as File>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudUpload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud-upload.js [app-client] (ecmascript) <export default as CloudUpload>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const MediaLibraryManager = (param)=>{
    let { isSelectionMode = false, allowMultiple = false, acceptedTypes = [], onSelect, onClose, selectedMedia = allowMultiple ? [] : null, designSystem } = param;
    var _selectedItems_, _selectedItems_1;
    _s();
    const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAdminPanelColorsWithDesignSystem"])(designSystem);
    const [media, setMedia] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [uploadProgress, setUploadProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [viewMode, setViewMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('list');
    const [fileTypeFilter, setFileTypeFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [selectedItems, setSelectedItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(Array.isArray(selectedMedia) ? selectedMedia : selectedMedia ? [
        selectedMedia
    ] : []);
    const [dragActive, setDragActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showUrlImport, setShowUrlImport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const dropZoneRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MediaLibraryManager.useEffect": ()=>{
            fetchMedia();
        }
    }["MediaLibraryManager.useEffect"], [
        searchTerm,
        fileTypeFilter
    ]);
    const fetchMedia = async ()=>{
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: '1',
                limit: '50',
                ...searchTerm && {
                    search: searchTerm
                },
                ...fileTypeFilter !== 'all' && {
                    fileType: fileTypeFilter
                }
            });
            const response = await fetch("/api/admin/media-library?".concat(params));
            const result = await response.json();
            if (result.success) {
                setMedia(result.data.items || []);
            }
        } catch (error) {
            console.error('Failed to fetch media:', error);
            setMedia([]);
        } finally{
            setLoading(false);
        }
    };
    const handleDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MediaLibraryManager.useCallback[handleDrop]": (e)=>{
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                handleFileUpload(files);
            }
        }
    }["MediaLibraryManager.useCallback[handleDrop]"], []);
    const handleDragOver = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MediaLibraryManager.useCallback[handleDragOver]": (e)=>{
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
        }
    }["MediaLibraryManager.useCallback[handleDragOver]"], []);
    const handleDragLeave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MediaLibraryManager.useCallback[handleDragLeave]": (e)=>{
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
        }
    }["MediaLibraryManager.useCallback[handleDragLeave]"], []);
    const handleFileUpload = async (files)=>{
        if (!files.length) return;
        setUploading(true);
        const newUploadProgress = {};
        // Initialize progress tracking
        files.forEach((file, index)=>{
            const fileId = "".concat(file.name, "-").concat(Date.now(), "-").concat(index);
            newUploadProgress[fileId] = {
                file,
                progress: 0,
                status: 'uploading'
            };
        });
        setUploadProgress(newUploadProgress);
        try {
            // Upload files one by one
            for(let i = 0; i < files.length; i++){
                const file = files[i];
                const fileId = "".concat(file.name, "-").concat(Date.now(), "-").concat(i);
                const formData = new FormData();
                formData.append('file', file);
                // Update progress
                setUploadProgress((prev)=>({
                        ...prev,
                        [fileId]: {
                            ...prev[fileId],
                            progress: 25
                        }
                    }));
                const response = await fetch('/api/admin/media-library', {
                    method: 'POST',
                    body: formData
                });
                setUploadProgress((prev)=>({
                        ...prev,
                        [fileId]: {
                            ...prev[fileId],
                            progress: 75
                        }
                    }));
                const result = await response.json();
                if (result.success) {
                    setUploadProgress((prev)=>({
                            ...prev,
                            [fileId]: {
                                ...prev[fileId],
                                progress: 100,
                                status: 'success'
                            }
                        }));
                } else {
                    setUploadProgress((prev)=>({
                            ...prev,
                            [fileId]: {
                                ...prev[fileId],
                                status: 'error',
                                error: result.message || 'Upload failed'
                            }
                        }));
                }
            }
            // Refresh media list and clear progress after a delay
            await fetchMedia();
            setTimeout(()=>{
                setUploadProgress({});
            }, 2000);
        } catch (error) {
            console.error('Upload failed:', error);
            Object.keys(newUploadProgress).forEach((fileId)=>{
                setUploadProgress((prev)=>({
                        ...prev,
                        [fileId]: {
                            ...prev[fileId],
                            status: 'error',
                            error: 'Upload failed'
                        }
                    }));
            });
        } finally{
            setUploading(false);
        }
    };
    const handleItemSelect = (item)=>{
        if (!isSelectionMode) return;
        if (allowMultiple) {
            const isSelected = selectedItems.some((selected)=>selected.id === item.id);
            if (isSelected) {
                setSelectedItems(selectedItems.filter((selected)=>selected.id !== item.id));
            } else {
                setSelectedItems([
                    ...selectedItems,
                    item
                ]);
            }
        } else {
            // For single selection, just mark as selected but don't auto-select
            setSelectedItems([
                item
            ]);
        }
    };
    const handleConfirmSelection = ()=>{
        if (onSelect) {
            onSelect(allowMultiple ? selectedItems : selectedItems[0]);
        }
    };
    const handleDelete = async (mediaId)=>{
        if (!confirm('Are you sure you want to delete this media file?')) return;
        try {
            const response = await fetch("/api/admin/media-library?id=".concat(mediaId), {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                setMedia(media.filter((item)=>item.id !== mediaId));
            } else {
                alert(result.message || 'Failed to delete media');
            }
        } catch (error) {
            console.error('Failed to delete media:', error);
            alert('Failed to delete media');
        }
    };
    const getFileTypeIcon = (fileType)=>{
        switch(fileType){
            case 'image':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
                    className: "w-8 h-8"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                    lineNumber: 275,
                    columnNumber: 28
                }, ("TURBOPACK compile-time value", void 0));
            case 'video':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$video$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Video$3e$__["Video"], {
                    className: "w-8 h-8"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                    lineNumber: 276,
                    columnNumber: 28
                }, ("TURBOPACK compile-time value", void 0));
            case 'audio':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                    className: "w-8 h-8"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                    lineNumber: 277,
                    columnNumber: 28
                }, ("TURBOPACK compile-time value", void 0));
            case 'document':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                    className: "w-8 h-8"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                    lineNumber: 278,
                    columnNumber: 31
                }, ("TURBOPACK compile-time value", void 0));
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"], {
                    className: "w-8 h-8"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                    lineNumber: 279,
                    columnNumber: 23
                }, ("TURBOPACK compile-time value", void 0));
        }
    };
    const formatFileSize = (bytes)=>{
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = [
            'Bytes',
            'KB',
            'MB',
            'GB'
        ];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatDate = (dateString)=>{
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
        onClick: (e)=>e.stopPropagation(),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden",
            style: {
                backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundSecondary) || colors.backgroundSecondary
            },
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6",
                    style: {
                        background: "linear-gradient(135deg, ".concat((designSystem === null || designSystem === void 0 ? void 0 : designSystem.primaryColorLight) || colors.primary, " 0%, ").concat(colors.primary, " 100%)"),
                        color: colors.backgroundPrimary
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-bold mb-1",
                                        style: {
                                            color: colors.textPrimary
                                        },
                                        children: isSelectionMode ? 'Select Media' : 'Media Library'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                        lineNumber: 318,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm",
                                        style: {
                                            color: colors.textSecondary
                                        },
                                        children: [
                                            media.length,
                                            " ",
                                            media.length === 1 ? 'item' : 'items',
                                            " available"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                        lineNumber: 321,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                lineNumber: 317,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    isSelectionMode && selectedItems.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleConfirmSelection,
                                        className: "px-6 py-2.5 rounded-lg transition-colors font-medium shadow-sm",
                                        style: {
                                            backgroundColor: colors.backgroundPrimary,
                                            color: colors.primary
                                        },
                                        onMouseEnter: (e)=>{
                                            e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                                        },
                                        onMouseLeave: (e)=>{
                                            e.currentTarget.style.backgroundColor = colors.backgroundPrimary;
                                        },
                                        children: [
                                            "Select ",
                                            allowMultiple && selectedItems.length > 1 ? "".concat(selectedItems.length, " items") : ((_selectedItems_ = selectedItems[0]) === null || _selectedItems_ === void 0 ? void 0 : _selectedItems_.title) || ((_selectedItems_1 = selectedItems[0]) === null || _selectedItems_1 === void 0 ? void 0 : _selectedItems_1.filename) || 'item'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                        lineNumber: 330,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: onClose || (()=>console.log('No close handler provided')),
                                        className: "p-2.5 rounded-lg transition-colors",
                                        style: {
                                            color: colors.backgroundPrimary,
                                            backgroundColor: 'transparent'
                                        },
                                        onMouseEnter: (e)=>{
                                            e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                                        },
                                        onMouseLeave: (e)=>{
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        },
                                        title: "Close Media Library",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                            lineNumber: 366,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                        lineNumber: 350,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                lineNumber: 328,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                        lineNumber: 316,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                    lineNumber: 309,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-full",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-80 border-r p-4",
                            style: {
                                borderColor: colors.borderLight,
                                backgroundColor: colors.backgroundSecondary
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold mb-3",
                                            style: {
                                                color: colors.textPrimary
                                            },
                                            children: "Upload Files"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                            lineNumber: 383,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>{
                                                        var _fileInputRef_current;
                                                        return (_fileInputRef_current = fileInputRef.current) === null || _fileInputRef_current === void 0 ? void 0 : _fileInputRef_current.click();
                                                    },
                                                    disabled: uploading,
                                                    className: "w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium disabled:opacity-50",
                                                    style: {
                                                        backgroundColor: uploading ? colors.textMuted : colors.primary,
                                                        color: colors.backgroundPrimary
                                                    },
                                                    onMouseEnter: (e)=>{
                                                        if (!uploading) {
                                                            e.currentTarget.style.backgroundColor = colors.primary;
                                                        }
                                                    },
                                                    onMouseLeave: (e)=>{
                                                        if (!uploading) {
                                                            e.currentTarget.style.backgroundColor = colors.primary;
                                                        }
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                            lineNumber: 410,
                                                            columnNumber: 19
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        "Choose Files"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                    lineNumber: 390,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setShowUrlImport(true),
                                                    className: "w-full flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors font-medium",
                                                    style: {
                                                        borderColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted,
                                                        color: colors.textSecondary,
                                                        backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary
                                                    },
                                                    onMouseEnter: (e)=>{
                                                        e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                                                    },
                                                    onMouseLeave: (e)=>{
                                                        e.currentTarget.style.backgroundColor = (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary;
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Link$3e$__["Link"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                            lineNumber: 429,
                                                            columnNumber: 19
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        "Import from URL"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                    lineNumber: 413,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                            lineNumber: 389,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 382,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold mb-3",
                                            style: {
                                                color: colors.textPrimary
                                            },
                                            children: "Filters"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                            lineNumber: 437,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-sm font-medium mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "File Type"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 445,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        value: fileTypeFilter,
                                                        onChange: (e)=>setFileTypeFilter(e.target.value),
                                                        className: "w-full px-3 py-2 border border-gray-200/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm",
                                                        style: {
                                                            borderColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted,
                                                            color: colors.textPrimary,
                                                            backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "all",
                                                                children: "All Types"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                lineNumber: 461,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "image",
                                                                children: "Images"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                lineNumber: 462,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "video",
                                                                children: "Videos"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                lineNumber: 463,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "audio",
                                                                children: "Audio"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                lineNumber: 464,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "document",
                                                                children: "Documents"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                lineNumber: 465,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 451,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                lineNumber: 444,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                            lineNumber: 443,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 436,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                            lineNumber: 374,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 flex flex-col",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 border-b",
                                    style: {
                                        borderColor: colors.borderLight,
                                        backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundSecondary) || colors.backgroundSecondary
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                        className: "absolute left-3 top-1/2 transform -translate-y-1/4 w-4 h-4",
                                                        style: {
                                                            color: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 484,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        placeholder: "Search media files...",
                                                        value: searchTerm,
                                                        onChange: (e)=>setSearchTerm(e.target.value),
                                                        className: "w-full pl-10 pr-4 py-2 border border-gray-200/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                        style: {
                                                            color: colors.textPrimary,
                                                            backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 488,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                lineNumber: 483,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>setViewMode('grid'),
                                                        className: "p-2 rounded-lg transition-colors ".concat(viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'),
                                                        style: {
                                                            backgroundColor: viewMode === 'grid' ? (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundSecondary) || colors.backgroundSecondary : 'transparent',
                                                            color: viewMode === 'grid' ? colors.primary : (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted
                                                        },
                                                        onMouseEnter: (e)=>{
                                                            if (viewMode !== 'grid') {
                                                                e.currentTarget.style.color = colors.textSecondary;
                                                            }
                                                        },
                                                        onMouseLeave: (e)=>{
                                                            if (viewMode !== 'grid') {
                                                                e.currentTarget.style.color = (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted;
                                                            }
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid$3e$__["Grid"], {
                                                            className: "w-5 h-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                            lineNumber: 522,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 501,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>setViewMode('list'),
                                                        className: "p-2 rounded-lg transition-colors ".concat(viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'),
                                                        style: {
                                                            backgroundColor: viewMode === 'list' ? (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundSecondary) || colors.backgroundSecondary : 'transparent',
                                                            color: viewMode === 'list' ? colors.primary : (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted
                                                        },
                                                        onMouseEnter: (e)=>{
                                                            if (viewMode !== 'list') {
                                                                e.currentTarget.style.color = colors.textSecondary;
                                                            }
                                                        },
                                                        onMouseLeave: (e)=>{
                                                            if (viewMode !== 'list') {
                                                                e.currentTarget.style.color = (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted;
                                                            }
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__["List"], {
                                                            className: "w-5 h-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                            lineNumber: 545,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 524,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                lineNumber: 500,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                        lineNumber: 482,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 475,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                Object.keys(uploadProgress).length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 border-b",
                                    style: {
                                        backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundSecondary) || colors.backgroundSecondary,
                                        borderColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-sm font-medium mb-3",
                                            style: {
                                                color: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textPrimary) || colors.textPrimary
                                            },
                                            children: "Uploading Files"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                            lineNumber: 560,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2 max-h-32 overflow-y-auto",
                                            children: Object.entries(uploadProgress).filter((param)=>{
                                                let [key, upload] = param;
                                                return upload && upload.file && upload.file.name;
                                            }).map((param)=>{
                                                let [key, upload] = param;
                                                var _upload_file;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-3 rounded-lg border",
                                                    style: {
                                                        backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary,
                                                        borderColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-between mb-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-sm font-medium",
                                                                    style: {
                                                                        color: colors.textPrimary
                                                                    },
                                                                    children: ((_upload_file = upload.file) === null || _upload_file === void 0 ? void 0 : _upload_file.name) || 'Unknown file'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                    lineNumber: 577,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-xs",
                                                                            style: {
                                                                                color: colors.textSecondary
                                                                            },
                                                                            children: upload.status === 'success' ? 'Complete' : upload.status === 'error' ? 'Failed' : "".concat(Math.round(upload.progress), "%")
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                            lineNumber: 584,
                                                                            columnNumber: 27
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        upload.status === 'success' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                            className: "w-4 h-4",
                                                                            style: {
                                                                                color: colors.success
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                            lineNumber: 592,
                                                                            columnNumber: 59
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        upload.status === 'error' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                                            className: "w-4 h-4",
                                                                            style: {
                                                                                color: colors.error
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                            lineNumber: 593,
                                                                            columnNumber: 57
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                    lineNumber: 583,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                            lineNumber: 576,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-full rounded-full h-2",
                                                            style: {
                                                                backgroundColor: colors.borderLight
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "h-2 rounded-full transition-all duration-300 ".concat(upload.status === 'success' ? 'bg-green-500' : upload.status === 'error' ? 'bg-red-500' : 'bg-blue-500'),
                                                                style: {
                                                                    width: "".concat(upload.progress, "%")
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                lineNumber: 600,
                                                                columnNumber: 25
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                            lineNumber: 596,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        upload.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs mt-1",
                                                            style: {
                                                                color: colors.error
                                                            },
                                                            children: upload.error
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                            lineNumber: 609,
                                                            columnNumber: 25
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, key, true, {
                                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                    lineNumber: 568,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0));
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                            lineNumber: 566,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 553,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    ref: dropZoneRef,
                                    className: "flex-1 overflow-y-auto p-4 relative",
                                    style: {
                                        backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundSecondary) || colors.backgroundSecondary
                                    },
                                    onDrop: handleDrop,
                                    onDragOver: handleDragOver,
                                    onDragLeave: handleDragLeave,
                                    children: [
                                        dragActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 flex items-center justify-center z-10",
                                            style: {
                                                backgroundColor: colors.primary + '33'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-xl p-8 shadow-xl border-2 border-dashed",
                                                style: {
                                                    backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary,
                                                    borderColor: colors.primary
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudUpload$3e$__["CloudUpload"], {
                                                        className: "w-12 h-12 mx-auto mb-4",
                                                        style: {
                                                            color: colors.primary
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 636,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-lg font-semibold text-center",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "Drop files here to upload"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 637,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-center mt-1",
                                                        style: {
                                                            color: colors.textSecondary
                                                        },
                                                        children: "Release to start uploading"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 643,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                lineNumber: 629,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                            lineNumber: 628,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-center h-full",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                        className: "w-8 h-8 animate-spin mx-auto mb-3",
                                                        style: {
                                                            color: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 656,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            color: colors.textSecondary
                                                        },
                                                        children: "Loading media..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 660,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                lineNumber: 655,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                            lineNumber: 654,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)) : media.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-center h-full",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center max-w-md",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4",
                                                        style: {
                                                            backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundSecondary) || colors.backgroundSecondary
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
                                                            className: "w-12 h-12",
                                                            style: {
                                                                color: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                            lineNumber: 672,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 668,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-lg font-semibold mb-2",
                                                        style: {
                                                            color: colors.textPrimary
                                                        },
                                                        children: "No media files yet"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 677,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mb-6",
                                                        style: {
                                                            color: colors.textSecondary
                                                        },
                                                        children: "Upload your first files to get started. You can drag and drop files here or click the upload button."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 683,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>{
                                                            var _fileInputRef_current;
                                                            return (_fileInputRef_current = fileInputRef.current) === null || _fileInputRef_current === void 0 ? void 0 : _fileInputRef_current.click();
                                                        },
                                                        className: "px-6 py-3 rounded-lg transition-colors font-medium",
                                                        style: {
                                                            backgroundColor: colors.primary,
                                                            color: colors.backgroundPrimary
                                                        },
                                                        onMouseEnter: (e)=>{
                                                            e.currentTarget.style.backgroundColor = colors.primary;
                                                        },
                                                        onMouseLeave: (e)=>{
                                                            e.currentTarget.style.backgroundColor = colors.primary;
                                                        },
                                                        children: "Upload Files"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 689,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                lineNumber: 667,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                            lineNumber: 666,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: viewMode === 'grid' ? 'grid grid-cols-5 gap-4' : 'space-y-2',
                                            children: media.filter((item)=>item && item.id && item.filename).map((item)=>{
                                                const isSelected = selectedItems.some((selected)=>selected && selected.id === item.id);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group ".concat(isSelected ? 'ring-2 ring-blue-500' : ''),
                                                    style: {
                                                        borderColor: isSelected ? colors.primary : colors.borderLight,
                                                        backgroundColor: isSelected ? (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundSecondary) || colors.backgroundSecondary : (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary
                                                    },
                                                    onMouseEnter: (e)=>{
                                                        if (!isSelected) {
                                                            e.currentTarget.style.borderColor = (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textSecondary) || colors.textSecondary;
                                                            e.currentTarget.style.boxShadow = "0 10px 15px -3px ".concat(colors.borderStrong, "33");
                                                        }
                                                    },
                                                    onMouseLeave: (e)=>{
                                                        if (!isSelected) {
                                                            e.currentTarget.style.borderColor = colors.borderLight;
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }
                                                    },
                                                    onClick: ()=>isSelectionMode && handleItemSelect(item),
                                                    children: viewMode === 'grid' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "aspect-square flex items-center justify-center relative overflow-hidden",
                                                                style: {
                                                                    backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundSecondary) || colors.backgroundSecondary
                                                                },
                                                                children: [
                                                                    item.fileType === 'image' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                        src: item.publicUrl,
                                                                        alt: item.alt || item.filename || 'Media file',
                                                                        className: "w-full h-full object-cover",
                                                                        loading: "lazy",
                                                                        onError: (e)=>{
                                                                            const target = e.target;
                                                                            target.style.display = 'none';
                                                                            const parent = target.parentElement;
                                                                            if (parent && !parent.querySelector('.fallback-icon')) {
                                                                                const fallback = document.createElement('div');
                                                                                fallback.className = 'fallback-icon flex items-center justify-center w-full h-full';
                                                                                fallback.style.color = (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted;
                                                                                fallback.innerHTML = '\n                                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>\n                                        </svg>\n                                      ';
                                                                                parent.appendChild(fallback);
                                                                            }
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                        lineNumber: 746,
                                                                        columnNumber: 33
                                                                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            color: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted
                                                                        },
                                                                        children: getFileTypeIcon(item.fileType)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                        lineNumber: 769,
                                                                        columnNumber: 33
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    type: "button",
                                                                                    onClick: (e)=>{
                                                                                        e.stopPropagation();
                                                                                        window.open(item.publicUrl, '_blank');
                                                                                    },
                                                                                    className: "p-2 rounded-full shadow-lg transition-colors",
                                                                                    style: {
                                                                                        backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary
                                                                                    },
                                                                                    onMouseEnter: (e)=>{
                                                                                        e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                                                                                    },
                                                                                    onMouseLeave: (e)=>{
                                                                                        e.currentTarget.style.backgroundColor = (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary;
                                                                                    },
                                                                                    title: "View",
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                                        className: "w-4 h-4"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                                        lineNumber: 795,
                                                                                        columnNumber: 37
                                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                                    lineNumber: 777,
                                                                                    columnNumber: 35
                                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                                !isSelectionMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    type: "button",
                                                                                    onClick: (e)=>{
                                                                                        e.stopPropagation();
                                                                                        handleDelete(item.id);
                                                                                    },
                                                                                    className: "p-2 rounded-full shadow-lg transition-colors",
                                                                                    style: {
                                                                                        backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary,
                                                                                        color: colors.error
                                                                                    },
                                                                                    onMouseEnter: (e)=>{
                                                                                        e.currentTarget.style.backgroundColor = colors.error;
                                                                                    },
                                                                                    onMouseLeave: (e)=>{
                                                                                        e.currentTarget.style.backgroundColor = (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary;
                                                                                    },
                                                                                    title: "Delete",
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                                        className: "w-4 h-4"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                                        lineNumber: 817,
                                                                                        columnNumber: 39
                                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                                    lineNumber: 798,
                                                                                    columnNumber: 37
                                                                                }, ("TURBOPACK compile-time value", void 0))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                            lineNumber: 776,
                                                                            columnNumber: 33
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                        lineNumber: 775,
                                                                        columnNumber: 31
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                lineNumber: 741,
                                                                columnNumber: 29
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "p-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-sm font-medium truncate mb-1",
                                                                        style: {
                                                                            color: colors.textPrimary
                                                                        },
                                                                        children: item.title || item.filename
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                        lineNumber: 825,
                                                                        columnNumber: 31
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-xs flex items-center justify-between",
                                                                        style: {
                                                                            color: colors.textSecondary
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                children: item.fileType.toUpperCase()
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                                lineNumber: 835,
                                                                                columnNumber: 33
                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                children: formatFileSize(item.fileSize)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                                lineNumber: 836,
                                                                                columnNumber: 33
                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                        lineNumber: 831,
                                                                        columnNumber: 31
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                lineNumber: 824,
                                                                columnNumber: 29
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            isSelectionMode && isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "absolute top-2 right-2 rounded-full p-1.5",
                                                                style: {
                                                                    backgroundColor: colors.primary,
                                                                    color: colors.backgroundPrimary
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                    className: "w-3 h-3"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                    lineNumber: 848,
                                                                    columnNumber: 33
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                lineNumber: 841,
                                                                columnNumber: 31
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true) : // List View
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-4 p-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                                                                style: {
                                                                    backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundSecondary) || colors.backgroundSecondary
                                                                },
                                                                children: item.fileType === 'image' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: item.publicUrl,
                                                                    alt: item.alt || item.filename || 'Media file',
                                                                    className: "w-full h-full object-cover rounded-lg",
                                                                    loading: "lazy",
                                                                    onError: (e)=>{
                                                                        const target = e.target;
                                                                        target.style.display = 'none';
                                                                        const parent = target.parentElement;
                                                                        if (parent && !parent.querySelector('.fallback-icon')) {
                                                                            const fallback = document.createElement('div');
                                                                            fallback.className = 'fallback-icon flex items-center justify-center w-full h-full';
                                                                            fallback.style.color = (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted;
                                                                            fallback.innerHTML = '\n                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>\n                                        </svg>\n                                      ';
                                                                            parent.appendChild(fallback);
                                                                        }
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                    lineNumber: 860,
                                                                    columnNumber: 33
                                                                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        color: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted
                                                                    },
                                                                    children: getFileTypeIcon(item.fileType)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                    lineNumber: 883,
                                                                    columnNumber: 33
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                lineNumber: 855,
                                                                columnNumber: 29
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex-1 min-w-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "font-medium truncate",
                                                                        style: {
                                                                            color: colors.textPrimary
                                                                        },
                                                                        children: item.title || item.filename
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                        lineNumber: 890,
                                                                        columnNumber: 31
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-sm flex items-center gap-4",
                                                                        style: {
                                                                            color: colors.textSecondary
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                children: item.fileType.toUpperCase()
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                                lineNumber: 900,
                                                                                columnNumber: 33
                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                children: formatFileSize(item.fileSize)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                                lineNumber: 901,
                                                                                columnNumber: 33
                                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                children: formatDate(item.createdAt)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                                lineNumber: 902,
                                                                                columnNumber: 33
                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                        lineNumber: 896,
                                                                        columnNumber: 31
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                lineNumber: 889,
                                                                columnNumber: 29
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: (e)=>{
                                                                            e.stopPropagation();
                                                                            window.open(item.publicUrl, '_blank');
                                                                        },
                                                                        className: "p-2 rounded-lg transition-colors",
                                                                        style: {
                                                                            color: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted,
                                                                            backgroundColor: 'transparent'
                                                                        },
                                                                        onMouseEnter: (e)=>{
                                                                            e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                                                                        },
                                                                        onMouseLeave: (e)=>{
                                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                                        },
                                                                        title: "View",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                            lineNumber: 926,
                                                                            columnNumber: 33
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                        lineNumber: 907,
                                                                        columnNumber: 31
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    !isSelectionMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: (e)=>{
                                                                            e.stopPropagation();
                                                                            handleDelete(item.id);
                                                                        },
                                                                        className: "p-2 rounded-lg transition-colors",
                                                                        style: {
                                                                            color: colors.error,
                                                                            backgroundColor: 'transparent'
                                                                        },
                                                                        onMouseEnter: (e)=>{
                                                                            e.currentTarget.style.backgroundColor = colors.error;
                                                                        },
                                                                        onMouseLeave: (e)=>{
                                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                                        },
                                                                        title: "Delete",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                            lineNumber: 948,
                                                                            columnNumber: 35
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                        lineNumber: 929,
                                                                        columnNumber: 33
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                                lineNumber: 906,
                                                                columnNumber: 29
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                        lineNumber: 854,
                                                        columnNumber: 27
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, item.id, false, {
                                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                                    lineNumber: 714,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0));
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                            lineNumber: 709,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 618,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                            lineNumber: 473,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                    lineNumber: 372,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    ref: fileInputRef,
                    type: "file",
                    multiple: true,
                    onChange: (e)=>e.target.files && handleFileUpload(Array.from(e.target.files)),
                    className: "hidden",
                    accept: "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                    lineNumber: 964,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                showUrlImport && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UrlImportModal, {
                    onImport: async (data)=>{
                        try {
                            setUploading(true);
                            const response = await fetch('/api/admin/media-library', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(data)
                            });
                            const result = await response.json();
                            if (result.success) {
                                await fetchMedia();
                                setShowUrlImport(false);
                            } else {
                                alert(result.message || 'Import failed');
                            }
                        } catch (error) {
                            console.error('Import failed:', error);
                            alert('Import failed');
                        } finally{
                            setUploading(false);
                        }
                    },
                    onClose: ()=>setShowUrlImport(false),
                    uploading: uploading,
                    designSystem: designSystem
                }, void 0, false, {
                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                    lineNumber: 975,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
            lineNumber: 303,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
        lineNumber: 299,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(MediaLibraryManager, "Z9jIQFSyoZLDtSLGR2Zzz1pLtEw=");
_c = MediaLibraryManager;
// URL Import Modal Component
const UrlImportModal = (param)=>{
    let { onImport, onClose, uploading, designSystem } = param;
    _s1();
    const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useDesignSystem$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAdminPanelColorsWithDesignSystem"])(designSystem);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        url: '',
        title: '',
        alt: '',
        description: ''
    });
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (!formData.url.trim()) {
            alert('Please enter a URL');
            return;
        }
        onImport(formData);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4",
        onClick: (e)=>e.stopPropagation(),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-xl shadow-2xl w-full max-w-md",
            style: {
                backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary
            },
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6 border-b",
                    style: {
                        borderColor: colors.borderLight
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold",
                                style: {
                                    color: colors.textPrimary
                                },
                                children: "Import from URL"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                lineNumber: 1055,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: onClose,
                                className: "p-1 rounded-lg transition-colors",
                                style: {
                                    color: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted,
                                    backgroundColor: 'transparent'
                                },
                                onMouseEnter: (e)=>{
                                    e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                                },
                                onMouseLeave: (e)=>{
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 1076,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                lineNumber: 1061,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                        lineNumber: 1054,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                    lineNumber: 1050,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "p-6 space-y-4",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium mb-2",
                                    style: {
                                        color: colors.textPrimary
                                    },
                                    children: "File URL *"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 1083,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "url",
                                    value: formData.url,
                                    onChange: (e)=>setFormData({
                                            ...formData,
                                            url: e.target.value
                                        }),
                                    className: "w-full px-3 py-2 border border-gray-200/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                                    style: {
                                        borderColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted,
                                        color: colors.textPrimary,
                                        backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary
                                    },
                                    placeholder: "https://example.com/image.jpg",
                                    required: true
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 1089,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                            lineNumber: 1082,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium mb-2",
                                    style: {
                                        color: colors.textPrimary
                                    },
                                    children: "Title"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 1105,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: formData.title,
                                    onChange: (e)=>setFormData({
                                            ...formData,
                                            title: e.target.value
                                        }),
                                    className: "w-full px-3 py-2 border border-gray-200/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                                    style: {
                                        borderColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted,
                                        color: colors.textPrimary,
                                        backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary
                                    },
                                    placeholder: "Optional title"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 1111,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                            lineNumber: 1104,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium mb-2",
                                    style: {
                                        color: colors.textPrimary
                                    },
                                    children: "Alt Text"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 1126,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: formData.alt,
                                    onChange: (e)=>setFormData({
                                            ...formData,
                                            alt: e.target.value
                                        }),
                                    className: "w-full px-3 py-2 border border-gray-200/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                                    style: {
                                        borderColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted,
                                        color: colors.textPrimary,
                                        backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary
                                    },
                                    placeholder: "Alternative text for accessibility"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 1132,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                            lineNumber: 1125,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dynamic([
                                [
                                    "1b9bba2b8ce988c",
                                    [
                                        colors.textMuted,
                                        colors.textMuted,
                                        colors.textMuted,
                                        colors.textMuted,
                                        colors.textMuted
                                    ]
                                ]
                            ]),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: {
                                        color: colors.textPrimary
                                    },
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dynamic([
                                        [
                                            "1b9bba2b8ce988c",
                                            [
                                                colors.textMuted,
                                                colors.textMuted,
                                                colors.textMuted,
                                                colors.textMuted,
                                                colors.textMuted
                                            ]
                                        ]
                                    ]) + " " + "block text-sm font-medium mb-2",
                                    children: "Description"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 1147,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: formData.description,
                                    onChange: (e)=>setFormData({
                                            ...formData,
                                            description: e.target.value
                                        }),
                                    style: {
                                        borderColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted,
                                        color: colors.textPrimary,
                                        backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary
                                    },
                                    rows: 3,
                                    placeholder: "Optional description",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dynamic([
                                        [
                                            "1b9bba2b8ce988c",
                                            [
                                                colors.textMuted,
                                                colors.textMuted,
                                                colors.textMuted,
                                                colors.textMuted,
                                                colors.textMuted
                                            ]
                                        ]
                                    ]) + " " + "w-full px-3 py-2 border border-gray-200/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 1153,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    id: "1b9bba2b8ce988c",
                                    dynamic: [
                                        colors.textMuted,
                                        colors.textMuted,
                                        colors.textMuted,
                                        colors.textMuted,
                                        colors.textMuted
                                    ],
                                    children: "textarea.__jsx-style-dynamic-selector::placeholder{opacity:1;color:".concat(colors.textMuted, "!important}textarea.__jsx-style-dynamic-selector::-webkit-input-placeholder{opacity:1;color:").concat(colors.textMuted, "!important}textarea.__jsx-style-dynamic-selector::-moz-placeholder{opacity:1;color:").concat(colors.textMuted, "!important}textarea.__jsx-style-dynamic-selector:-ms-placeholder-shown{opacity:1;color:").concat(colors.textMuted, "!important}textarea.__jsx-style-dynamic-selector:-moz-placeholder-shown{opacity:1;color:").concat(colors.textMuted, "!important}")
                                }, void 0, false, void 0, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                            lineNumber: 1146,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-3 pt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onClose,
                                    className: "flex-1 px-4 py-2 border border-gray-200/10 rounded-lg transition-colors",
                                    style: {
                                        borderColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.textMuted) || colors.textMuted,
                                        color: colors.textSecondary,
                                        backgroundColor: (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary
                                    },
                                    onMouseEnter: (e)=>{
                                        e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                                    },
                                    onMouseLeave: (e)=>{
                                        e.currentTarget.style.backgroundColor = (designSystem === null || designSystem === void 0 ? void 0 : designSystem.backgroundPrimary) || colors.backgroundPrimary;
                                    },
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 1190,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: uploading,
                                    className: "flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50",
                                    style: {
                                        backgroundColor: uploading ? colors.textMuted : colors.primary,
                                        color: colors.backgroundPrimary
                                    },
                                    onMouseEnter: (e)=>{
                                        if (!uploading) {
                                            e.currentTarget.style.backgroundColor = colors.primary;
                                        }
                                    },
                                    onMouseLeave: (e)=>{
                                        if (!uploading) {
                                            e.currentTarget.style.backgroundColor = colors.primary;
                                        }
                                    },
                                    children: uploading ? 'Importing...' : 'Import'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                                    lineNumber: 1208,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                            lineNumber: 1189,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
                    lineNumber: 1081,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
            lineNumber: 1045,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/app/admin-panel/components/MediaLibraryManager.tsx",
        lineNumber: 1041,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(UrlImportModal, "dcCW/MDOKnU5AseHQjoLXd/J4fU=");
_c1 = UrlImportModal;
const __TURBOPACK__default__export__ = MediaLibraryManager;
var _c, _c1;
__turbopack_context__.k.register(_c, "MediaLibraryManager");
__turbopack_context__.k.register(_c1, "UrlImportModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_admin-panel_components_MediaLibraryManager_tsx_c076edb7._.js.map