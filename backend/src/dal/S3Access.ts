import * as AWS  from 'aws-sdk'

export class S3Access{
  constructor(
    private readonly bucketName = process.env.ATTACHMENTS_BUCKET,
    private readonly s3 = new AWS.S3({signatureVersion: 'v4'})
  ) {}

  async deleteObject(todoId: string){
    try {
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: todoId
      }).promise()
    } catch (e) {
      throw e
    }
  }
}