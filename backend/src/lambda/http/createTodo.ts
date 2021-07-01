import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoItem } from '../../models/TodoItem'
import { getUserId } from '../utils'
import { createTodo } from '../../main/todos'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const todoItem: TodoItem = await createTodo(newTodo, getUserId(event))

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: todoItem
    })
  }
})

handler.use(cors({
  credentials: true
}))