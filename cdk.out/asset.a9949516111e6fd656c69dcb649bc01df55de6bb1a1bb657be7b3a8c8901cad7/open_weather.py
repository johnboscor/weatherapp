
import boto3
import json
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
import os

# Get the env variables
region = os.environ['REGION']
secret_name = os.environ['SECRET_NAME']
table_name = os.environ['DYNAMO_DB_TABLE']

# Get the api_key from secrets manager
session = boto3.session.Session()
client = session.client(
    service_name = 'secretsmanager',
    region_name = region
)
secret_response = client.get_secret_value(SecretId=secret_name)
api_key = secret_response['SecretString']
print(api_key)


# Respond back to caller
def respond(err, res=None):
    return {
        'statusCode': '400' if err else '200',
        'body': err if err else res,
        'headers': {
            'Content-Type': 'application/json',
        },
    }

# Main function
def lambda_handler(event, context):

    zip = event['queryStringParameters']['zip']
    #zip = event.get('zip',None)

    baseUrl = 'http://api.openweathermap.org/data/2.5/weather'
    completeUrl = baseUrl + '?zip=' + zip + '&appid=' + api_key

    req = Request(completeUrl)
    try:
        apiresponse = urlopen(completeUrl)
    except HTTPError as e:
        print('The server couldn\'t fulfill the request.')
        print('Error code: ', e.code)
        errorResponse = '{Error:The server couldn\'t fulfill the request: ' + e.reason +'}'
        return respond(errorResponse, e.code)
    except URLError as e:
        print('We failed to reach a server.')
        print('Reason: ', e.reason)
        errorResponse = '{Error:We failed to reach a server: ' + e.reason +'}'
        return respond(e, e.code)
    else:
        headers = apiresponse.info()
        print('DATE    :', headers['date'])
        print('HEADERS :')
        print('---------')
        print(headers)
        print('DATA :')
        print('---------')
        decodedresponse = apiresponse.read().decode('utf-8')
        item_data = json.loads(decodedresponse)

        ddb_client = boto3.resource("dynamodb")
        table = client.Table(table_name)
        table.put_item(Item=item_data)


        return respond(None, decodedresponse)
    
    ##########