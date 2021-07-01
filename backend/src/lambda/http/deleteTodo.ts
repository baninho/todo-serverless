import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const logger = createLogger('deleteTodo')

const todoTable = process.env.TODO_TABLE
const todoIdIndex = process.env.TODO_ID_INDEX

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Remove a TODO item by id

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  const result = await docClient.query({
    TableName : todoTable,
    IndexName : todoIdIndex,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
        ':todoId': todoId
    }
  }).promise()  

  const params = {
    TableName: todoTable,
    Key: {
      'userId': userId,
      'createdAt': result.Items[0].createdAt
    }
  }

  logger.info(`delete params: ${params}`)
  
  await docClient.delete(params).promise()

  return {
    statusCode: 200,
    body: JSON.stringify({
      deletedItem: todoId
    })
  }
})

handler.use(cors())
