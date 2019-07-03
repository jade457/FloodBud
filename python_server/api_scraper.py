"""
Helper functions to scrape data from the sea level sensors project.

see https://dev.sealevelsensors.org/
"""
import requests as req
import dateutil.parser as date_parser
from pprint import pprint as print

base_url_sls  = 'https://api.sealevelsensors.org/v1.0/Things'
base_url_noaa = 'https://tidesandcurrents.noaa.gov/api/datagetter'

def get_sensor_datastreams():
    """
    Creates a list of all sensors with datastream links.

    Returns:
        sensors (list): a list of 'sensors', each sensor being a dictonary with information on the sensor
    """
    api_response = req.get(base_url_sls).json()
    def create_sensor_obj(sensor):
        location = (req.get(sensor["Locations@iot.navigationLink"])).json()["value"][0]
        coordinates = location["location"]["coordinates"]
        return {
          "name":   sensor["name"],
          "desc":   sensor["description"],
          "link":   sensor["Datastreams@iot.navigationLink"],
          "elev":   sensor["properties"].get("elevationNAVD88"),
          "coords": coordinates}
    return list(map(create_sensor_obj, api_response["value"]))

def get_sensors_with_water():
  """
  Creates a list of all sensors with water level observation links.

  Returns:
      sensors (list): a list of 'sensors', each sensor being a dictonary with information on the sensor
  """
  water_obs_links = []
  all_sensor_links = get_sensor_datastreams()
  """
  these links contain all types of observations
  we need to filter only water level observations
  """
  def get_water_link_from_sensor(sensor):
      obs_type_list = req.get(sensor["link"]).json()["value"]
      only_water_list = list(filter(lambda obs_type: obs_type["name"] == "Water Level", obs_type_list))
      if len(only_water_list) == 0:
          return
      only_water = only_water_list[0]
      return {
          "name":   sensor["name"],
          "desc":   sensor["desc"],
          "elev":   sensor["elev"],
          "coords": sensor["coords"],
          "link":   only_water['Observations@iot.navigationLink']}
  return list(filter(None, map(get_water_link_from_sensor, all_sensor_links)))

def get_obs_for_link(link, start_date = None, end_date = None):
    """
    Gets all observations for a given link

    The observations are sorted by date.
    The return list has datetime objects inside, which may pose a challenge
    to json serialization

    This code has only been tested on water observations
    may need tweaking for other observation types

    Parameters:
        link       (str):            Datastream link to collect observations from
        start_date (str) (optional): Date to start  collecting observations from
        end_date   (str) (optional): Date to finish collecting observations from

    Returns:
        observations (list): a list of tuples, (observation, date_of_observation)
    """
    is_iot_next_link = "?" in link
    params = {}
    if not is_iot_next_link:
        params["$select"]       =  "resultTime,result"
        params["$resultFormat"] =  "dataArray"
    """
    the next few lines look ugly, but that's just
    string formatting for the urls in the GET request
    the important thing is that I ask for a filter
    based on whether start_date / end_date exist
    http://developers.sensorup.com/docs/#query-filter
    """
    start_date = date_parser.parse(start_date).isoformat() + "Z" if start_date else None
    end_date   = date_parser.parse(end_date).isoformat()   + "Z" if end_date   else None

    if start_date and end_date:
        params["$filter"] = "resultTime ge " + start_date + " and resultTime le " + end_date
    elif start_date:
        params["$filter"] = "resultTime ge " + start_date

    response = req.get(link, params = params).json()
    if len(response["value"]) == 0:
        return []
    unparsed_observations = response["value"][0]["dataArray"]
    observations = list(map(lambda x: (x[0], date_parser.parse(x[1])), unparsed_observations))
    """
    the response only returns 100 observations
    so we need to get the rest. Luckily it also returns
    @iot.nextLink which is a link to the next 100
    we use that link to recursively get all the observations we need
    We don't need to deal with params because the @iot.nextLink
    includes all the params
    """
    if "@iot.nextLink" in response:
        all_observations = get_obs_for_link(response['@iot.nextLink']) + observations
        """
        sort the observations by time.
        might be inefficient because of sorting at each recursion,
        but who cares
        """
        if not is_iot_next_link:
            return sorted(all_observations, key=lambda x: x[1])
        return all_observations
    else:
        # No iot next link? Must be the end, return
        return observations

def get_ft_pulaski(start_date, end_date):
    """
    Gets tide PREDICTIONS from the ft pulaski NOAA sensor

    uses NAVD datum, GMT timezone, and metric units

    Parameters:
        start_date (str): Date to start  collecting observations from
        end_date   (str): Date to finish collecting observations from

    Returns:
        observations (list): a list of dictionaries with information on predictions
    """
    params = {
        "product":     "predictions",
        "application": "Georgia_Tech",
        "datum":       "NAVD",
        "station":     "8670870",
        "time_zone":   "GMT",
        "units":       "metric",
        "format":      "json"
    }
    format_time = lambda date: (date_parser
                                    .parse(date)
                                    .strftime("%Y%m%d %H:%M"))

    params["begin_date"] = format_time(start_date)
    params["end_date"]   = format_time(end_date)

    return req.get(base_url_noaa, params=params).json()["predictions"]

if __name__ == "__main__":
    waaata = get_sensors_with_water()
    # aa = get_obs_for_link(waaata[6]["link"], "April 1 2019", "April 3 2019")
    # print(aa)
    print(get_ft_pulaski("April 1 2018", "April 3 2019"))
