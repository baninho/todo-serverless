import * as AWS  from 'aws-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('S3Access')

export class S3Access{
  constructor(
    private readonly bucketName = process.env.ATTACHMENTS_BUCKET,
    private readonly s3 = new AWS.S3({signatureVersion: 'v4'})
  ) {}

  async deleteObject(todoId: string){
    logger.info(`deleting S3 object ${todoId}`)
    
    try {
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: todoId
      }).promise()
    } catch (e) {
      logger.error(`Error deleting S3 item`, { message: e.message })
    }
  }
}