import * as uuid from 'uuid'

import { TodoAccess } from "../dal/todoAccess";
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from "../requests/CreateTodoRequest";

const bucketName = process.env.ATTACHMENTS_BUCKET

const todoAccess = new TodoAccess()

export async function createTodo(todoRequest: CreateTodoRequest, userId: string):Promise<TodoItem> {
  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const done = false
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

  const todoItem: TodoItem = {
    userId,
    todoId,
    createdAt,
    done,
    attachmentUrl,
    ...todoRequest
  }

  await todoAccess.createTodo(todoItem)

  return todoItem
}