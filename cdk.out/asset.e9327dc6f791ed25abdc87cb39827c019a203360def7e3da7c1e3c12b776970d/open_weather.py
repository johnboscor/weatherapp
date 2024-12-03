
import boto3
import json
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
import os

#api_key = os.environ['API_KEY']
region = os.environ['REGION']
secret_name = os.environ['SECRET_NAME']

session = boto3.session.Session()
client = session.client(
    service_name = 'secretsmanager',
    region_name = region
)
secret_response = client.get_secret_value(SecretId=secret_name)
api_key = secret_response['SecretString']
print(api_key)

def respond(err, res=None):
    return {
        'statusCode': '400' if err else '200',
        'body': err if err else res,
        'headers': {
            'Content-Type': 'application/json',
        },
    }


def lambda_handler(event, context):
    '''Demonstrates a simple HTTP endpoint using API Gateway. You have full
    access to the request and response payload, including headers and
    status code.

    '''
    print("Received event: " + json.dumps(event, indent=2))

    zip = event['queryStringParameters']['zip']
    #zip = event.get('zip',None)
    
    
    ##########
    baseUrl = 'http://api.openweathermap.org/data/2.5/weather'
    completeUrl = baseUrl + '?zip=' + zip + '&appid=' + api_key
    print('Request URL--> ' + completeUrl)

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
        print(decodedresponse)
        return respond(None, decodedresponse)
    
    ##########