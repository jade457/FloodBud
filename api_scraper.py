import requests
import random

##
r = requests.get('https://api.sealevelsensors.org/v1.0/Things')
api_response = r.json()['value']
api_response
##

##
def get_all_sensor_links():
    r = requests.get('https://api.sealevelsensors.org/v1.0/Things')
    api_response = r.json()['value']
    return [x['Datastreams@iot.navigationLink'] for x in api_response]

get_all_sensor_links()
##
def get_water_obs_links():
    water_obs_links = []
    for sensor_link in get_all_sensor_links():
        obs_type_list = requests.get(sensor_link).json()['value']
        for obs_type in obs_type_list:
            if obs_type['name'] == 'Water Level':
                water_obs_links.append(obs_type['Observations@iot.navigationLink'])
    return water_obs_links


get_water_obs_links()
##
def get_all_obs_for_link(link):
    observations = requests.get(link).json()
    value = observations['value']
    if '@iot.nextLink' in observations:
        return get_all_obs_for_link(observations['@iot.nextLink']) + value
    else:
        return value
##
water_obs = random.choice(get_water_obs_links())
len(get_all_obs_for_link(water_obs))
