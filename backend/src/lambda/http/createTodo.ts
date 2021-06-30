import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoItem } from '../../models/TodoItem'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()

const todoTable = process.env.TODO_TABLE
const bucketName = process.env.ATTACHMENTS_BUCKET

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const todoId = uuid.v4()
  const userId = getUserId(event)
  const createdAt = new Date().toISOString()
  const done = false
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

  const todoItem: TodoItem = {
    userId,
    todoId,
    createdAt,
    done,
    attachmentUrl,
    ...newTodo
  }

  await docClient.put({
    TableName: todoTable,
    Item: todoItem
  }).promise()

  return {
    statusCode: 201,
    body: JSON.stringify({
      newItem: todoItem,
    })
  }
}