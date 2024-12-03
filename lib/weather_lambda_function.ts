import { aws_lambda as lambda } from 'aws-cdk-lib';
import { Duration, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_iam as iam } from 'aws-cdk-lib';


export interface LambdaFnParams {
    handler: string;
    asset_folder: string;
    region: string;
    secret_name: string;
    ddb_table_name: string
}

// Create a construct for lambda function
export class WeatherLambdaFunction extends lambda.Function {
    constructor(scope: Construct, id: string, props: LambdaFnParams){
      super(scope,id, {
        runtime: lambda.Runtime.PYTHON_3_11,
        handler: props.handler,
        timeout: Duration.minutes(5),
        code: lambda.Code.fromAsset(props.asset_folder),
        environment: {
          REGION : props.region,
          SECRET_NAME: props.secret_name,
          DYNAMO_DB_TABLE: props.ddb_table_name
        }
    })
    this.addPermission('Invoke-permission',
    {
      action: 'lambda:InvokeFunction',
      principal: new iam.AnyPrincipal()
    })
  }
}
  