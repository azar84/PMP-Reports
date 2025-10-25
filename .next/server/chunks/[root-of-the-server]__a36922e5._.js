module.exports = [
"[project]/.next-internal/server/app/api/admin/projects/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/src/app/api/admin/projects/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
;
;
// Default checklist template
const defaultChecklistTemplate = [
    {
        phase: 'Project LOA (Letter of Award)',
        isSubItem: false
    },
    {
        phase: 'Commencement Date',
        isSubItem: false
    },
    {
        phase: 'Budget Kick-Off Between Project Manager and Tendering Revenue, Budget, Gross',
        isSubItem: false
    },
    {
        phase: 'Contract Signing Between Kabri and Client',
        isSubItem: false
    },
    {
        phase: 'Project Facilities Approval from the Bank',
        isSubItem: false
    },
    {
        phase: 'Submission of Project Bonds and Insurances',
        isSubItem: false
    },
    {
        phase: 'Performance Bond',
        isSubItem: true,
        parentPhase: 'Submission of Project Bonds and Insurances'
    },
    {
        phase: 'Advance Bond',
        isSubItem: true,
        parentPhase: 'Submission of Project Bonds and Insurances'
    },
    {
        phase: 'Insurances',
        isSubItem: true,
        parentPhase: 'Submission of Project Bonds and Insurances'
    },
    {
        phase: 'Project Program of Work with Client',
        isSubItem: false
    },
    {
        phase: 'Project Program of Work with Internal Target',
        isSubItem: false
    },
    {
        phase: 'Project Organizational Chart',
        isSubItem: false
    },
    {
        phase: 'Project Resources Sheet',
        isSubItem: false
    },
    {
        phase: 'Design Tracker',
        isSubItem: false
    },
    {
        phase: 'Authority NOCs Tracker (No Objection Certificates)',
        isSubItem: false
    },
    {
        phase: 'Project Detailed Budget',
        isSubItem: false
    },
    {
        phase: 'Project Cash Flow',
        isSubItem: false
    },
    {
        phase: 'Project Code and ERP Matrix',
        isSubItem: false
    },
    {
        phase: 'Engineering Phase Submissions (E1 Log Sheet)',
        isSubItem: false
    },
    {
        phase: 'Procurement Phase Long Lead Items (E2 Log Sheet)',
        isSubItem: false
    },
    {
        phase: 'Project Quality',
        isSubItem: false
    },
    {
        phase: 'Project Risk Matrix',
        isSubItem: false
    },
    {
        phase: 'Project Close-Out',
        isSubItem: false
    }
];
// Get checklist template (from database or fallback to default)
async function getChecklistTemplate() {
    try {
        const activeTemplate = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].checklistTemplate.findFirst({
            where: {
                isActive: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        if (activeTemplate && activeTemplate.items) {
            return activeTemplate.items;
        }
    } catch (error) {
        console.error('Error fetching checklist template:', error);
    }
    return defaultChecklistTemplate;
}
const projectSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    projectCode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Project code is required'),
    projectName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Project name is required'),
    projectDescription: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().or(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('')),
    clientId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional(),
    projectManagementConsultantId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional(),
    designConsultantId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional(),
    supervisionConsultantId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional(),
    costConsultantId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional(),
    projectDirectorId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional(),
    projectManagerId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional(),
    startDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().or(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].null()),
    endDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().or(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].null()),
    duration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().or(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('')),
    eot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().or(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('')),
    projectValue: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive().optional().or(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].null()),
    contacts: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        contactId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        isPrimary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().default(false),
        consultantType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    })).optional().default([])
});
async function GET() {
    try {
        const projects = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findMany({
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
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to fetch projects'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const validatedData = projectSchema.parse(body);
        // Extract contacts and staff fields from validated data
        const { contacts, projectDirectorId, projectManagerId, ...projectData } = validatedData;
        // Convert date strings to DateTime objects if provided
        const projectDataWithDates = {
            ...projectData,
            startDate: projectData.startDate ? new Date(projectData.startDate) : null,
            endDate: projectData.endDate ? new Date(projectData.endDate) : null
        };
        // Use transaction to create project and contacts atomically
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            // Create the project first
            const project = await tx.project.create({
                data: projectDataWithDates,
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
                    }
                }
            });
            // Create project contacts if any are provided
            if (contacts && contacts.length > 0) {
                // Use upsert to handle potential duplicates
                for (const contact of contacts){
                    await tx.projectContact.upsert({
                        where: {
                            projectId_contactId_consultantType: {
                                projectId: project.id,
                                contactId: contact.contactId,
                                consultantType: contact.consultantType || 'pmc'
                            }
                        },
                        update: {
                            isPrimary: contact.isPrimary,
                            consultantType: contact.consultantType || undefined
                        },
                        create: {
                            projectId: project.id,
                            contactId: contact.contactId,
                            isPrimary: contact.isPrimary,
                            consultantType: contact.consultantType || undefined
                        }
                    });
                }
            }
            // Auto-initialize checklist for the new project
            const checklistTemplate = await getChecklistTemplate();
            const createdItems = {}; // Store created item IDs by phase name
            // Create items in template order to maintain proper hierarchy
            let orderCounter = 0;
            for (const template of checklistTemplate){
                if (!template.isSubItem) {
                    // Create parent item
                    const item = await tx.projectChecklistItem.create({
                        data: {
                            projectId: project.id,
                            itemNumber: '',
                            phase: template.phase,
                            status: 'Pending',
                            isSubItem: false,
                            parentItemId: null,
                            order: orderCounter++
                        }
                    });
                    createdItems[template.phase] = item.id;
                } else if (template.isSubItem && template.parentPhase) {
                    // Create sub-item immediately after its parent
                    const parentId = createdItems[template.parentPhase];
                    if (parentId) {
                        await tx.projectChecklistItem.create({
                            data: {
                                projectId: project.id,
                                itemNumber: '',
                                phase: template.phase,
                                status: 'Pending',
                                isSubItem: true,
                                parentItemId: parentId,
                                order: orderCounter++
                            }
                        });
                    }
                }
            }
            // Create ProjectPosition entries for director and manager if provided
            if (projectDirectorId) {
                const directorPosition = await tx.projectPosition.create({
                    data: {
                        projectId: project.id,
                        designation: 'Project Director',
                        requiredUtilization: 100
                    }
                });
                await tx.projectStaff.create({
                    data: {
                        projectId: project.id,
                        positionId: directorPosition.id,
                        staffId: projectDirectorId,
                        utilization: 100,
                        status: 'Active',
                        startDate: projectDataWithDates.startDate,
                        endDate: projectDataWithDates.endDate
                    }
                });
            }
            if (projectManagerId) {
                const managerPosition = await tx.projectPosition.create({
                    data: {
                        projectId: project.id,
                        designation: 'Project Manager',
                        requiredUtilization: 100
                    }
                });
                await tx.projectStaff.create({
                    data: {
                        projectId: project.id,
                        positionId: managerPosition.id,
                        staffId: projectManagerId,
                        utilization: 100,
                        status: 'Active',
                        startDate: projectDataWithDates.startDate,
                        endDate: projectDataWithDates.endDate
                    }
                });
            }
            // Create default positions for the project from positions pool
            const activePositions = await tx.position.findMany({
                where: {
                    isActive: true
                },
                orderBy: {
                    name: 'asc'
                }
            });
            // Create default positions (without staff assigned)
            for (const position of activePositions){
                // Skip if this position is already created as director or manager
                if (position.name === 'Project Director' && projectDirectorId || position.name === 'Project Manager' && projectManagerId) {
                    continue;
                }
                await tx.projectPosition.create({
                    data: {
                        projectId: project.id,
                        designation: position.name,
                        requiredUtilization: 100
                    }
                });
            }
            return project;
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error creating project:', error);
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodError) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Validation error',
                details: error.errors
            }, {
                status: 400
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to create project'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a36922e5._.js.map