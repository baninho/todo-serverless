import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()

const todoTable = process.env.TODO_TABLE
const todoIdIndex = process.env.TODO_ID_INDEX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

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
  }).promise()

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  return {
    statusCode: 200,
    body: JSON.stringify({
      updatedTodoId: todoId
    })
  }
}
