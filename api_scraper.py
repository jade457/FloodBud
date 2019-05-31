import requests

##
r = requests.get('https://api.sealevelsensors.org/v1.0/Things')
api_response = r.json()['value']
##

##
for sensor in api_response:
    print(sensor['name'])
len(api_response)
##
print(api_response[1].keys())

a_sensor = api_response[7]
a_sensor

datastream = requests.get(a_sensor['Datastreams@iot.navigationLink']).json()['value'][0]
datastream

observations = requests.get(datastream['Observations@iot.navigationLink']).json()['value']
observations

single_obs = observations[1]
single_obs 

data_in_obs = requests.get(single_obs['Datastream@iot.navigationLink'])
data_in_obs.json()

multidatastream = requests.get(a_sensor['MultiDatastreams@iot.navigationLink']).json()
multidatastream

locations = requests.get(a_sensor['Locations@iot.navigationLink']).json()
locations

historicallocations = requests.get(a_sensor['HistoricalLocations@iot.navigationLink']).json()
historicallocations
