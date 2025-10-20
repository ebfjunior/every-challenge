import { TaskRepository } from "@/modules/tasks/task.repository";
import {
  createArchiveTaskUseCase,
  createCreateTaskUseCase,
  createDestroyTaskUseCase,
  createShowTaskUseCase,
  createSearchTasksUseCase,
  createUnarchiveTaskUseCase,
  createUpdateTaskUseCase,
  type UpdateTaskUseCase,
  type ArchiveTaskUseCase,
  type UnarchiveTaskUseCase,
  type DestroyTaskUseCase,
  type ShowTaskUseCase,
  type SearchTasksUseCase,
  type CreateTaskUseCase,
} from "@/modules/tasks/usecases/index";

export interface TaskUseCases {
  createTask: CreateTaskUseCase;
  searchTasks: SearchTasksUseCase;
  showTask: ShowTaskUseCase;
  updateTask: UpdateTaskUseCase;
  destroyTask: DestroyTaskUseCase;
  archiveTask: ArchiveTaskUseCase;
  unarchiveTask: UnarchiveTaskUseCase;
}

export function createUseCases(): TaskUseCases {
  const repo = new TaskRepository();

  const updateTaskUseCase = createUpdateTaskUseCase({ repository: repo });

  return {
    createTask: createCreateTaskUseCase({ repository: repo }),
    searchTasks: createSearchTasksUseCase({ repository: repo }),
    showTask: createShowTaskUseCase({ repository: repo }),
    updateTask: createUpdateTaskUseCase({ repository: repo }),
    destroyTask: createDestroyTaskUseCase({ repository: repo }),
    archiveTask: createArchiveTaskUseCase({ updateTask: updateTaskUseCase }),
    unarchiveTask: createUnarchiveTaskUseCase({
      updateTask: updateTaskUseCase,
    }),
  };
}
