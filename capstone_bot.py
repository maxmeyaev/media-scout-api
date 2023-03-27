from dotenv import load_dotenv
import os
import requests
import boto3
from botocore.exceptions import ClientError
import threading
import time

load_dotenv()

sns_client = boto3.client(
    'sns',
    aws_access_key_id=os.getenv("AWSAccessKeyId"),
    aws_secret_access_key=os.getenv("AWSSecretKey"),
    region_name = 'us-east-1'
)

sns = boto3.resource('sns', region_name = 'us-east-1',
    aws_access_key_id=os.getenv("AWSAccessKeyId"),
    aws_secret_access_key=os.getenv("AWSSecretKey")
)

dynamodb = boto3.resource('dynamodb',
    region_name='us-east-1',
    endpoint_url='https://dynamodb.us-east-1.amazonaws.com',
    aws_access_key_id=os.getenv("AWSAccessKeyId"),
    aws_secret_access_key=os.getenv("AWSSecretKey"),
)

api_key = os.getenv('API_KEY')
api_url = ""


def main():

    # create db object
    table = dynamodb.Table('subscriptions')

    
    #use db to get list of movies/shows
    items = scan_table(table)



    # def updateData(items):
    #     while(True):
    #         items.clear()
    
    #         #create db object
        
    #         table = dynamodb.Table('subscriptions')

    #         #use db to get list of movies/shows

    #         items = scan_table(table)

    #         time.sleep(3600)

    # x = threading.Thread(target=updateData, args=(items))
    # x.start()

    counter = 0
    while(True):
        while(len(items) != 0):
            if counter > len(items) -1:
                counter = 0

            print(items)
            movie = items[counter]['Movie']
            services = items[counter]['Services']

            services_available = isavailable(movie, services)

            if(not services_available):
                counter+=1
            else:
                publish(services_available, sns_client, items[counter]['Arn'])
                time.sleep(2)
                delete_topic(sns, items[counter]['Arn'])
                delete_item(items[counter], table)
                items.pop(counter)
                counter = 0

def publish(details, sns_client, arn):
    try:
        response = sns_client.publish(TopicArn = arn, Message=details)
        print(response)
    except:
        print("Could not publish")

def delete_item(item,table):
    table.delete_item(
        Key={
            'Movie': item['Movie'],
            'Email': item['Email'],
            'Services' : item['Services'],
            'Arn' : item['Arn']
        }
    )

def scan_table(table):
    response = table.scan()
    items = response['Items']
    return items


def delete_topic(sns, arn):
    """
    Deletes a topic. All subscriptions to the topic are also deleted.
    """
    try:
        topic = sns.Topic(arn)

        topic.delete()
        print("Deleted topic %s.", topic.arn)
    except ClientError:
        print("Couldn't delete topic %s.", topic.arn)


def isavailable(movie, services):
    response = requests.get(api_url+movie)
    available_services = response.json()['Services']

    set1 = set(services)
    set2 = set(available_services)

    intersection = list(set1.intersection(set2))
    if not intersection:
        return None
    
    res = f"{movie} is available to watch on"

    for service in intersection:
        res += " " + service
    
    res += '.'


    return res 

if __name__ == "__main__":
    main()