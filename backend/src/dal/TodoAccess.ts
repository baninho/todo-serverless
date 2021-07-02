import * as AWS  from 'aws-sdk'
import * as AWSXRay  from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

interface TodoKey {
  userId?: string
  createdAt: string
}

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODO_TABLE,
    private readonly todoIdIndex = process.env.TODO_ID_INDEX
  ) {}

  async createTodo(todoItem: TodoItem) {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todoItem
    }).promise()
  }

  async getTodosByUser(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todoTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    return result.Items as TodoItem[]
  }

  async deleteTodo(todoId: string, userId: string) {
    const key = await this.getTodoKeyById(todoId)
    
    key.userId = userId
  
    const params = {
      TableName: this.todoTable,
      Key: key
    }
    
    await this.docClient.delete(params).promise()
  }

  async updateTodo(updatedTodo: UpdateTodoRequest, todoId: string, userId: string) {
    const key = await this.getTodoKeyById(todoId)
    
    key.userId = userId
  
    await this.docClient.update({
      TableName: this.todoTable,
      Key: key,
      ExpressionAttributeNames: { '#N': 'name' },
      UpdateExpression: 'set #N = :n, dueDate=:due, done=:d',
      ExpressionAttributeValues:{
        ':n':updatedTodo.name,
        ':due':updatedTodo.dueDate,
        ':d':updatedTodo.done
      },
      ReturnValues:'UPDATED_NEW'
    }).promise()
  }

  private async getTodoKeyById(todoId: string): Promise<TodoKey> {
    const result = await this.docClient.query({
      TableName : this.todoTable,
      IndexName : this.todoIdIndex,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
          ':todoId': todoId
      }
    }).promise()

    return {
      'createdAt': result.Items[0].createdAt
    }
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}