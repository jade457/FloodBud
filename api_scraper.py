import requests
import random

##
r = requests.get('https://api.sealevelsensors.org/v1.0/Things')
api_response = r.json()['value']
api_response
##

##
def get_all_sensor_links():
    """
    Gets all of the datastream links for all the sensors
    """
    r = requests.get('https://api.sealevelsensors.org/v1.0/Things')
    api_response = r.json()['value']
    return [x['Datastreams@iot.navigationLink'] for x in api_response]

get_all_sensor_links()
##
def get_water_obs_links():
    """
    if a sensor observes water level, then it has a link to its observations
    this function returns all those such observations
    """
    water_obs_links = []
    for sensor_link in get_all_sensor_links():
        # for every sensor
        obs_type_list = requests.get(sensor_link).json()['value']
        for obs_type in obs_type_list:
            # get all the types of things it observes
            if obs_type['name'] == 'Water Level':
                # if the observation is of the water level, add that link to the observation links
                water_obs_links.append(obs_type['Observations@iot.navigationLink'])
    return water_obs_links


get_water_obs_links()
##
def get_obs_for_link(observation_link, start_date = None, end_date = None):
    """
    recursively gets all observations by using @iot.nextLink if there is more data to be received
    """
    #TODO search based on start and end date
    observations = requests.get(observation_link).json()
    value = observations['value']
    if '@iot.nextLink' in observations:
        return get_all_obs_for_link(observations['@iot.nextLink']) + value
    else:
        return value
##
water_obs = random.choice(get_water_obs_links())
water_obs
feh = requests.get(water_obs).json()['value']
feh
import datetime
from dateutil import parser
foo = feh[0]
parser.parse(foo['resultTime'])
len(get_all_obs_for_link(water_obs))
