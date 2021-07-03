import * as uuid from 'uuid'

import { TodoAccess } from "../dal/todoAccess";
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

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

export async function getTodosByUser(userId:string): Promise<TodoItem[]> {
  return await todoAccess.getTodosByUser(userId)
}

export async function deleteTodo(todoId: string, userId: string) {
  await todoAccess.deleteTodo(todoId, userId)
}

export async function updateTodo(updatedTodo: UpdateTodoRequest, todoId: string, userId: string) {
  await todoAccess.updateTodo(updatedTodo, todoId, userId)
}