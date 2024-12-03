import { Stack, StackProps} from 'aws-cdk-lib';
import { Fn } from 'aws-cdk-lib';
import { aws_secretsmanager } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { TableViewer } from "cdk-dynamo-table-viewer";
import {WeatherLambdaFunction} from './weather_lambda_function'

// TO-DO:
// 1. Create github actions.
export class NorcalLnlCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //Retreive dynamo db table from the respective stack
    const weather_table_name = Fn.importValue('DynamoDbTableName')
    const weather_table = dynamodb.Table.fromTableName(this,'table',weather_table_name)
    
    // Create a secret to store api key used to access weather website  
    const apiKeySecret = new aws_secretsmanager.Secret(this, 'weather_api_key', {
        secretName: 'weather_api_key',
    });

    // Create a lambda function from the custom construct
    const lambda_function = new WeatherLambdaFunction(this, 'OpenWeatherMap', {
      handler: 'open_weather.lambda_handler',
      asset_folder: 'lambda',
      region: this.region,
      secret_name: apiKeySecret.secretName,
      ddb_table_name: weather_table.tableName
    })

    // Give lambda permission to invoke secrets manager.
    apiKeySecret.grantRead(lambda_function)

    // Give lambda permission to write into dynamo db
    weather_table.grantReadWriteData(lambda_function)

    // API Gateway to REST
    const api = new apigateway.RestApi(this, 'openweather', {
        defaultCorsPreflightOptions: {
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowMethods: apigateway.Cors.ALL_METHODS
        }
    })

    const open_weather_integration = new apigateway.LambdaIntegration(
        lambda_function,
        {
          requestTemplates: { "application/json": '{ "statusCode": "200" }' },

        });

    api.root.addMethod("GET", open_weather_integration);

    // UI to view the contents of DynamoDB Table.
    const tv = new TableViewer(this, 'ViewHitCounter', {
          title: 'Weather Data By Zip Code',
          table: weather_table
        });
  }
}




