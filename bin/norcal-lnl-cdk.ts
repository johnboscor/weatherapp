#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NorcalLnlCdkStack } from '../lib/norcal-lnl-cdk-stack';
import { DynamoDBTableStack } from '../lib/dynamo-db-table-stack';

import { Construct } from 'constructs';
import { StackProps } from 'aws-cdk-lib';

const app = new cdk.App();
new DynamoDBTableStack(app, 'DynamoDBTableStack', {table_name: "weather_table", partition_key: "zip"});
new NorcalLnlCdkStack(app, 'NorcalLnlCdkStack',{});


