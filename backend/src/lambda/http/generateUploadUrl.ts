import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getUploadUrl } from '../../main/attachments'

const logger = createLogger('uploadUrl')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Return a presigned URL to upload a file for a TODO item with the provided id
  const todoId = event.pathParameters.todoId

  logger.info(`Upload URL for todo ${todoId} requested`)

  const uploadUrl = await getUploadUrl(todoId)
  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
})

handler.use(cors({
  credentials: true
}))