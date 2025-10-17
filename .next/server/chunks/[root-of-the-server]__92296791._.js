module.exports = {

"[project]/.next-internal/server/app/api/admin/scheduler/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

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
"[project]/src/lib/scheduler.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
class AppScheduler {
    tasks = new Map();
    interval = null;
    isInitialized = false;
    constructor(){
        // Initialize default tasks
        this.initializeDefaultTasks();
    }
    initializeDefaultTasks() {
    // Add your custom scheduled tasks here
    // Example:
    // this.addTask({
    //   id: 'example-task',
    //   name: 'Example Task',
    //   cronExpression: '0 * * * *', // Every hour
    //   task: async () => {
    //     console.log('Running example task...');
    //   },
    //   enabled: true
    // });
    }
    /**
   * Add a new scheduled task
   */ addTask(task) {
        const scheduledTask = {
            ...task,
            lastRun: undefined,
            nextRun: this.calculateNextRun(task.cronExpression),
            isRunning: false
        };
        this.tasks.set(task.id, scheduledTask);
        console.log(`📅 [Scheduler] Added task: ${task.name} (${task.cronExpression})`);
    }
    /**
   * Remove a scheduled task
   */ removeTask(taskId) {
        const removed = this.tasks.delete(taskId);
        if (removed) {
            console.log(`🗑️ [Scheduler] Removed task: ${taskId}`);
        }
        return removed;
    }
    /**
   * Set task enabled/disabled status
   */ setTaskEnabled(taskId, enabled) {
        const task = this.tasks.get(taskId);
        if (task) {
            task.enabled = enabled;
            return true;
        }
        return false;
    }
    /**
   * Update task cron expression
   */ updateTaskCron(taskId, cronExpression) {
        const task = this.tasks.get(taskId);
        if (task) {
            task.cronExpression = cronExpression;
            task.nextRun = this.calculateNextRun(cronExpression);
            return true;
        }
        return false;
    }
    /**
   * Get all tasks
   */ getTasks() {
        return Array.from(this.tasks.values());
    }
    /**
   * Get a specific task
   */ getTask(taskId) {
        return this.tasks.get(taskId);
    }
    /**
   * Start the scheduler
   */ start() {
        if (this.isInitialized) {
            console.log('⚠️ [Scheduler] Already running');
            return;
        }
        console.log('🚀 [Scheduler] Starting built-in scheduler...');
        // Run every minute to check for tasks
        this.interval = setInterval(()=>{
            this.checkAndRunTasks();
        }, 60000); // 60 seconds
        this.isInitialized = true;
        console.log('✅ [Scheduler] Started successfully');
        // Run initial check
        this.checkAndRunTasks();
    }
    /**
   * Stop the scheduler
   */ stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isInitialized = false;
        console.log('🛑 [Scheduler] Stopped');
    }
    /**
   * Check and run tasks that are due
   */ async checkAndRunTasks() {
        const now = new Date();
        for (const [taskId, task] of this.tasks){
            if (!task.enabled || task.isRunning) {
                continue;
            }
            if (task.nextRun && now >= task.nextRun) {
                await this.runTask(taskId, task);
            }
        }
    }
    /**
   * Run a specific task
   */ async runTask(taskId, task) {
        if (task.isRunning) {
            console.log(`⏳ [Scheduler] Task ${taskId} is already running`);
            return;
        }
        task.isRunning = true;
        task.lastRun = new Date();
        try {
            console.log(`🕐 [Scheduler] Running task: ${task.name}`);
            await task.task();
            console.log(`✅ [Scheduler] Task completed: ${task.name}`);
        } catch (error) {
            console.error(`❌ [Scheduler] Task failed: ${task.name}`, error);
        } finally{
            task.isRunning = false;
            task.nextRun = this.calculateNextRun(task.cronExpression);
        }
    }
    /**
   * Calculate next run time based on cron expression
   */ calculateNextRun(cronExpression) {
        try {
            const now = new Date();
            const parts = cronExpression.split(' ');
            if (parts.length !== 5) {
                console.warn(`Invalid cron expression: ${cronExpression}, using default`);
                return this.getDefaultNextRun();
            }
            const [minute, hour, day, month, dayOfWeek] = parts.map((part)=>{
                if (part === '*') return undefined;
                const num = parseInt(part);
                return isNaN(num) ? undefined : num;
            });
            const nextRun = new Date(now);
            // Reset seconds and milliseconds
            nextRun.setSeconds(0, 0);
            // Handle minutes
            if (minute !== undefined) {
                nextRun.setMinutes(minute);
                if (nextRun <= now) {
                    nextRun.setHours(nextRun.getHours() + 1);
                }
            }
            // Handle hours
            if (hour !== undefined) {
                nextRun.setHours(hour);
                nextRun.setMinutes(minute !== undefined ? minute : 0);
                if (nextRun <= now) {
                    nextRun.setDate(nextRun.getDate() + 1);
                }
            }
            // Handle day of week (0 = Sunday, 1 = Monday, etc.)
            if (dayOfWeek !== undefined) {
                const currentDay = nextRun.getDay();
                const targetDay = dayOfWeek;
                let daysToAdd = (targetDay - currentDay + 7) % 7;
                // If it's today and the time has passed, move to next week
                if (daysToAdd === 0 && nextRun <= now) {
                    daysToAdd = 7;
                }
                nextRun.setDate(nextRun.getDate() + daysToAdd);
                nextRun.setHours(hour !== undefined ? hour : 0);
                nextRun.setMinutes(minute !== undefined ? minute : 0);
            }
            // Handle day of month
            if (day !== undefined && dayOfWeek === undefined) {
                nextRun.setDate(day);
                nextRun.setHours(hour !== undefined ? hour : 0);
                nextRun.setMinutes(minute !== undefined ? minute : 0);
                // If the date has passed this month, move to next month
                if (nextRun <= now) {
                    nextRun.setMonth(nextRun.getMonth() + 1);
                    nextRun.setDate(day);
                }
            }
            // Validate the result
            if (isNaN(nextRun.getTime()) || nextRun.getTime() <= 0) {
                console.warn(`Invalid calculated date for cron: ${cronExpression}, using default`);
                return this.getDefaultNextRun();
            }
            return nextRun;
        } catch (error) {
            console.error(`Error calculating next run for cron: ${cronExpression}`, error);
            return this.getDefaultNextRun();
        }
    }
    /**
   * Get default next run time (1 hour from now)
   */ getDefaultNextRun() {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(0, 0, 0);
        return now;
    }
    /**
   * Manually trigger a task
   */ async triggerTask(taskId) {
        const task = this.tasks.get(taskId);
        if (task && task.enabled) {
            await this.runTask(taskId, task);
            return true;
        }
        return false;
    }
    /**
   * Get scheduler status
   */ getStatus() {
        const enabledTasks = Array.from(this.tasks.values()).filter((t)=>t.enabled);
        const nextTask = enabledTasks.filter((t)=>t.nextRun).sort((a, b)=>(a.nextRun?.getTime() || 0) - (b.nextRun?.getTime() || 0))[0];
        return {
            isRunning: this.isInitialized,
            taskCount: this.tasks.size,
            enabledTaskCount: enabledTasks.length,
            nextTask: nextTask ? {
                id: nextTask.id,
                name: nextTask.name,
                nextRun: nextTask.nextRun
            } : undefined
        };
    }
}
// Create singleton instance
const scheduler = new AppScheduler();
const __TURBOPACK__default__export__ = scheduler;
}),
"[project]/src/app/api/admin/scheduler/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "GET": ()=>GET,
    "POST": ()=>POST,
    "PUT": ()=>PUT
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scheduler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/scheduler.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    try {
        const status = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scheduler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].getStatus();
        const tasks = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scheduler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].getTasks();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            status,
            tasks: tasks.map((task)=>({
                    id: task.id,
                    name: task.name,
                    cronExpression: task.cronExpression,
                    enabled: task.enabled,
                    isRunning: task.isRunning,
                    lastRun: task.lastRun,
                    nextRun: task.nextRun
                }))
        });
    } catch (error) {
        console.error('Failed to get scheduler status:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to get scheduler status'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { action, taskId } = body;
        switch(action){
            case 'start':
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scheduler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].start();
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true
                });
            case 'stop':
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scheduler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].stop();
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true
                });
            case 'trigger':
                if (!taskId) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: 'Task ID is required'
                    }, {
                        status: 400
                    });
                }
                const triggered = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scheduler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].triggerTask(taskId);
                if (triggered) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        success: true
                    });
                } else {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: `Task ${taskId} not found or disabled`
                    }, {
                        status: 404
                    });
                }
            default:
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Invalid action'
                }, {
                    status: 400
                });
        }
    } catch (error) {
        console.error('Failed to execute scheduler action:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to execute scheduler action'
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const body = await request.json();
        const { taskId, updates } = body;
        if (!taskId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Task ID is required'
            }, {
                status: 400
            });
        }
        const task = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scheduler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].getTask(taskId);
        if (!task) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Task not found'
            }, {
                status: 404
            });
        }
        // Update enabled status
        if (updates.enabled !== undefined) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scheduler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].setTaskEnabled(taskId, updates.enabled);
        }
        // Update cron expression
        if (updates.cronExpression) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scheduler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].updateTaskCron(taskId, updates.cronExpression);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error('Failed to update task:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to update task'
        }, {
            status: 500
        });
    }
}
}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__92296791._.js.map