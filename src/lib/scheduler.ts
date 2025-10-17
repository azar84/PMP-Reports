interface ScheduledTask {
  id: string;
  name: string;
  cronExpression: string;
  task: () => Promise<void>;
  lastRun?: Date;
  nextRun?: Date;
  isRunning: boolean;
  enabled: boolean;
}

class AppScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private interval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    // Initialize default tasks
    this.initializeDefaultTasks();
  }

  private initializeDefaultTasks() {
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
   */
  addTask(task: Omit<ScheduledTask, 'lastRun' | 'nextRun' | 'isRunning'>): void {
    const scheduledTask: ScheduledTask = {
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
   */
  removeTask(taskId: string): boolean {
    const removed = this.tasks.delete(taskId);
    if (removed) {
      console.log(`🗑️ [Scheduler] Removed task: ${taskId}`);
    }
    return removed;
  }

  /**
   * Set task enabled/disabled status
   */
  setTaskEnabled(taskId: string, enabled: boolean): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Update task cron expression
   */
  updateTaskCron(taskId: string, cronExpression: string): boolean {
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
   */
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get a specific task
   */
  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isInitialized) {
      console.log('⚠️ [Scheduler] Already running');
      return;
    }

    console.log('🚀 [Scheduler] Starting built-in scheduler...');
    
    // Run every minute to check for tasks
    this.interval = setInterval(() => {
      this.checkAndRunTasks();
    }, 60000); // 60 seconds

    this.isInitialized = true;
    console.log('✅ [Scheduler] Started successfully');
    
    // Run initial check
    this.checkAndRunTasks();
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isInitialized = false;
    console.log('🛑 [Scheduler] Stopped');
  }

  /**
   * Check and run tasks that are due
   */
  private async checkAndRunTasks(): Promise<void> {
    const now = new Date();
    
    for (const [taskId, task] of this.tasks) {
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
   */
  private async runTask(taskId: string, task: ScheduledTask): Promise<void> {
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
    } finally {
      task.isRunning = false;
      task.nextRun = this.calculateNextRun(task.cronExpression);
    }
  }

  /**
   * Calculate next run time based on cron expression
   */
  private calculateNextRun(cronExpression: string): Date {
    try {
      const now = new Date();
      const parts = cronExpression.split(' ');
      
      if (parts.length !== 5) {
        console.warn(`Invalid cron expression: ${cronExpression}, using default`);
        return this.getDefaultNextRun();
      }
      
      const [minute, hour, day, month, dayOfWeek] = parts.map(part => {
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
   */
  private getDefaultNextRun(): Date {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0, 0, 0);
    return now;
  }

  /**
   * Manually trigger a task
   */
  async triggerTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (task && task.enabled) {
      await this.runTask(taskId, task);
      return true;
    }
    return false;
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    taskCount: number;
    enabledTaskCount: number;
    nextTask?: { id: string; name: string; nextRun: Date };
  } {
    const enabledTasks = Array.from(this.tasks.values()).filter(t => t.enabled);
    const nextTask = enabledTasks
      .filter(t => t.nextRun)
      .sort((a, b) => (a.nextRun?.getTime() || 0) - (b.nextRun?.getTime() || 0))[0];

    return {
      isRunning: this.isInitialized,
      taskCount: this.tasks.size,
      enabledTaskCount: enabledTasks.length,
      nextTask: nextTask ? {
        id: nextTask.id,
        name: nextTask.name,
        nextRun: nextTask.nextRun!
      } : undefined
    };
  }
}

// Create singleton instance
const scheduler = new AppScheduler();

export default scheduler; 