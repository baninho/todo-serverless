import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from '../utils'
import { getTodosByUser } from '../../main/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')

export const handler = middy( async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Get all TODO items for a current user
  const userId = getUserId(event)

  logger.info(`getting todos for user ${userId}`)

  const items = await getTodosByUser(userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items
    })
  }
})

handler.use(cors({
  credentials: true
}))