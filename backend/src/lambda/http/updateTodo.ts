import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { updateTodo } from '../../main/todos'

const logger = createLogger('updateTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Update a TODO item with the provided id using values in the "updatedTodo" object
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  logger.info(`update todo ${todoId}`)

  updateTodo(updatedTodo, todoId, userId)

  return {
    statusCode: 200,
    body: ''
  }
})

handler.use(cors({
  credentials: true
}))
