from dotenv import load_dotenv
import os
import requests
import boto3
from botocore.exceptions import ClientError
import threading
import time
import json

load_dotenv()
api_key = os.getenv('API_KEY')
items = []

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
first_half_api_url = "https://api.themoviedb.org/3/movie/"
second_half_api_url = "/watch/providers?api_key="


def main():
    global items
    # create db object
    table = dynamodb.Table('subscriptions')

    
    #use db to get list of movies/shows
    items = scan_table(table)


    def updateData(items):
        while(True):
            items = scan_table(table)
            time.sleep(1800)

    x = threading.Thread(target=updateData, args=(items,))
    x.start()

    counter = 0
    while(True):
        while(len(items) != 0):
            time.sleep(1)
            if counter > len(items) -1:
                counter = 0

            print(items)
            if(counter > len(items)-1):
                continue
            movieID = items[counter]['MovieID']
            services = items[counter]['Services']
            movie = items[counter]['Movie']

            services_available = isavailable(movie, movieID, services)

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


def isavailable(movie, movieID, services):
    response = requests.get(first_half_api_url + movieID + second_half_api_url + api_key).json()
    available_services = {}

    try:
        flatrate = response['results']['US']['flatrate']
        for item in flatrate:
            available_services[item['provider_id']] = item['provider_name']
    except:
        return None


    print(available_services)

    set1 = set(services)
    set2 = set(available_services.keys())

    intersection = list(set1.intersection(set2))
    if not intersection:
        return None
    
    res = f"{movie} is available to watch on"

    for service in intersection:
        res += " " + available_services[service] + ','
    
    res += '.'

    print(res)
    return res 

if __name__ == "__main__":
    main()

# response = requests.get(first_half_api_url + "1003579" + second_half_api_url + api_key).json()
# available_services = {}

# flatrate = response['results']['US']['buy']
# for item in flatrate:
#     available_services[item['provider_id']] = item['provider_name']

# print(available_services.keys())

# print(json.dumps(response['results']['US']['flatrate'], indent =2))