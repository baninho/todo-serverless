import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { deleteTodo } from '../../main/todos'
import { deleteObject } from '../../main/attachments'

const logger = createLogger('deleteTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Remove a TODO item by id
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  logger.info(`delete todo: ${todoId}, userId: ${userId}`)

  await deleteTodo(todoId, userId)
  await deleteObject(todoId)

  return {
    statusCode: 200,
    body: ''
  }
})

handler.use(cors({
  credentials: true
}))
