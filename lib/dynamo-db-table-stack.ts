import { Construct } from 'constructs';
import  {CfnOutput, Stack } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface DynamoDbParams {
    table_name: string;
    partition_key: string;
  }
  
// Stack to create dynamoDB table.
export class DynamoDBTableStack extends Stack {
    constructor(scope: Construct, id: string, props: DynamoDbParams) {
      super(scope, id);
      const weather_table = new dynamodb.Table(this, props.table_name, {
        partitionKey: {
          name: props.partition_key,
          type: dynamodb.AttributeType.STRING
        },
        
      })    
      new CfnOutput(this, 'DynamoDbTableName', {
        exportName: 'DynamoDbTableName',
        value: weather_table.tableName
        })
    }
  }
  