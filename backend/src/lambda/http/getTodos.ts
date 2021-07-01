import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'

import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()

const todoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Get all TODO items for a current user
  const userId = getUserId(event)

  const todos = await getTodosByUser(userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      todos
    })
  }
}

async function getTodosByUser(userId:string) {
  const result = await docClient.query({
    TableName: todoTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false
  }).promise()

  return result.Items
}