module.exports = [
"[project]/.next-internal/server/app/api/admin/projects/[id]/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/app/api/admin/projects/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
;
async function GET(request, { params }) {
    try {
        const { id } = await params;
        const projectId = parseInt(id);
        if (isNaN(projectId)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid project ID'
            }, {
                status: 400
            });
        }
        const project = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
            where: {
                id: projectId
            },
            include: {
                client: true,
                projectManagementConsultant: true,
                designConsultant: true,
                supervisionConsultant: true,
                costConsultant: true,
                projectPositions: {
                    include: {
                        staffAssignments: {
                            include: {
                                staff: true
                            }
                        }
                    }
                },
                projectContacts: true,
                projectChecklistItems: true
            }
        });
        if (!project) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Project not found'
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to fetch project'
        }, {
            status: 500
        });
    }
}
async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const projectId = parseInt(id);
        if (isNaN(projectId)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid project ID'
            }, {
                status: 400
            });
        }
        const body = await request.json();
        // Extract staff fields that need special handling
        const { projectDirectorId, projectManagerId, ...validBody } = body;
        // Convert date strings to DateTime objects if provided
        const projectData = {
            ...validBody,
            startDate: validBody.startDate ? new Date(validBody.startDate) : null,
            endDate: validBody.endDate ? new Date(validBody.endDate) : null
        };
        // Use transaction to update project and handle staff assignments atomically
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            // Update the project
            const project = await tx.project.update({
                where: {
                    id: projectId
                },
                data: projectData,
                include: {
                    client: true,
                    projectManagementConsultant: true,
                    designConsultant: true,
                    supervisionConsultant: true,
                    costConsultant: true,
                    projectPositions: {
                        include: {
                            staffAssignments: {
                                include: {
                                    staff: true
                                }
                            }
                        }
                    },
                    projectContacts: true,
                    projectChecklistItems: true
                }
            });
            // Handle Project Director assignment
            if (projectDirectorId !== undefined) {
                // Find or create the Project Director position
                let directorPosition = await tx.projectPosition.findFirst({
                    where: {
                        projectId: projectId,
                        designation: 'Project Director'
                    }
                });
                if (!directorPosition) {
                    directorPosition = await tx.projectPosition.create({
                        data: {
                            projectId: projectId,
                            designation: 'Project Director',
                            requiredUtilization: 100
                        }
                    });
                }
                // Remove any existing staff assignments for this position
                await tx.projectStaff.deleteMany({
                    where: {
                        projectId: projectId,
                        positionId: directorPosition.id
                    }
                });
                // If a new director is provided, create the assignment
                if (projectDirectorId) {
                    await tx.projectStaff.create({
                        data: {
                            projectId: projectId,
                            positionId: directorPosition.id,
                            staffId: projectDirectorId,
                            utilization: 100,
                            status: 'Active',
                            startDate: projectData.startDate,
                            endDate: projectData.endDate
                        }
                    });
                }
            }
            // Handle Project Manager assignment
            if (projectManagerId !== undefined) {
                // Find or create the Project Manager position
                let managerPosition = await tx.projectPosition.findFirst({
                    where: {
                        projectId: projectId,
                        designation: 'Project Manager'
                    }
                });
                if (!managerPosition) {
                    managerPosition = await tx.projectPosition.create({
                        data: {
                            projectId: projectId,
                            designation: 'Project Manager',
                            requiredUtilization: 100
                        }
                    });
                }
                // Remove any existing staff assignments for this position
                await tx.projectStaff.deleteMany({
                    where: {
                        projectId: projectId,
                        positionId: managerPosition.id
                    }
                });
                // If a new manager is provided, create the assignment
                if (projectManagerId) {
                    await tx.projectStaff.create({
                        data: {
                            projectId: projectId,
                            positionId: managerPosition.id,
                            staffId: projectManagerId,
                            utilization: 100,
                            status: 'Active',
                            startDate: projectData.startDate,
                            endDate: projectData.endDate
                        }
                    });
                }
            }
            // Return updated project with fresh staff data
            return await tx.project.findUnique({
                where: {
                    id: projectId
                },
                include: {
                    client: true,
                    projectManagementConsultant: true,
                    designConsultant: true,
                    supervisionConsultant: true,
                    costConsultant: true,
                    projectPositions: {
                        include: {
                            staffAssignments: {
                                include: {
                                    staff: true
                                }
                            }
                        }
                    },
                    projectContacts: true,
                    projectChecklistItems: true
                }
            });
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error updating project:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to update project'
        }, {
            status: 500
        });
    }
}
async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const projectId = parseInt(id);
        if (isNaN(projectId)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid project ID'
            }, {
                status: 400
            });
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.delete({
            where: {
                id: projectId
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to delete project'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bd942d9d._.js.map