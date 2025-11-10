export interface CreateTaskDto { title: string; category?: string; }
export interface UpdateTaskDto { title?: string; category?: string; done?: boolean; }
