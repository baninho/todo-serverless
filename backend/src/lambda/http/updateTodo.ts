import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const logger = createLogger('deleteTodo')

const todoTable = process.env.TODO_TABLE
const todoIdIndex = process.env.TODO_ID_INDEX

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Update a TODO item with the provided id using values in the "updatedTodo" object
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  logger.info(`update todo ${todoId}`)

  const result = await docClient.query({
    TableName : todoTable,
    IndexName : todoIdIndex,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
        ':todoId': todoId
    }
  }).promise()

  await docClient.update({
    TableName: todoTable,
    Key: {
      'userId': userId,
      'createdAt': result.Items[0].createdAt
    },
    ExpressionAttributeNames: { '#N': 'name' },
    UpdateExpression: 'set #N = :n, dueDate=:due, done=:d',
    ExpressionAttributeValues:{
      ':n':updatedTodo.name,
      ':due':updatedTodo.dueDate,
      ':d':updatedTodo.done
    },
    ReturnValues:'UPDATED_NEW'
  }, (err) => {
    if (err) {
      logger.error(`error updating todo`)
    }
  }).promise()

  return {
    statusCode: 200,
    body: ''
  }
})

handler.use(cors({
  credentials: true
}))
