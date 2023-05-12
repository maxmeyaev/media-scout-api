import requests
import boto3
import os
from dotenv import load_dotenv

load_dotenv()

dynamodb = boto3.resource('dynamodb',
     region_name= 'us-east-2',
     endpoint_url = 'https://dynamodb.us-east-2.amazonaws.com',
     aws_access_key_id = os.getenv("AWSAccessKeyId"),
     aws_secret_access_key = os.getenv("AWSSecretKey"),
)

api_key = os.getenv('API_KEY')

url = "https://api.themoviedb.org/3/movie/popular?api_key=" + api_key

table = dynamodb.Table('movies')

response = requests.get(url)
data = response.json()


def add_item(movie_id, overview, posterUrl, vote_average, release_date, title):
    table.put_item(
        Item = {
            'movie id': str(movie_id),
            'overview': overview,
            'posterurl': 'https://image.tmdb.org/t/p/original' + posterUrl,
            'vote average': str(vote_average),
            'releasedate': release_date,
            'title': title
        }
)
    
def queryApi():
    for movie in data["results"][:5]:
        add_item(str(movie['id']), movie['overview'], movie['poster_path'], movie['vote_average'], movie['release_date'], movie['title'])

def main():
    queryApi()

if __name__ == '__main__':
    main()