import requests as req
import dateutil.parser as date_parser
from pprint import pprint as print
base_url = 'https://api.sealevelsensors.org/v1.0/Things'
def get_all_sensor_links():
    """
    Creates a list of all datastream links.
    Helper function for get_water_obs_links
    Exported in case anyone wants to use it
    """
    api_response = req.get(base_url).json()
    return_list = []
    for sensor in api_response["value"]:
        location = (req.get(sensor["Locations@iot.navigationLink"])).json()["value"][0]

        coordinates = location["location"]["coordinates"]
        return_list.append({
          "name":   sensor["name"],
          "desc":   sensor["description"],
          "link":   sensor["Datastreams@iot.navigationLink"],
          "elev":   sensor["properties"].get("elevationNAVD88"),
          "coords": coordinates
          })
    return return_list

def get_water_obs_links():
  """
  Returns a list of links that
  lead to water sensor observations.
  These links are for use in get_obs_for_link
  """
  water_obs_links = []
  # get all the datastream links
  all_sensor_links = get_all_sensor_links()
  """
  these links contain all types of observations
  we need to filter only water level observations
  """
  for sensor in all_sensor_links:
      obs_type_list = req.get(sensor["link"]).json()
      for obs_type in obs_type_list["value"]:
          if obs_type["name"] == "Water Level":
              water_obs_links.append({
                  "name":   sensor["name"],
                  "desc":   sensor["desc"],
                  "elev":   sensor["elev"],
                  "coords": sensor["coords"],
                  "link":   obs_type['Observations@iot.navigationLink']})
  return water_obs_links

def get_obs_for_link(link, start_date = None, end_date = None):
    """
    given a link, start_date, and end_date,
    returns all observations for that link
    between those times
    start_date and end_date are optional
    end date is even more optional than start date
    """
    filters = {
        "$select":       "resultTime,result",
        "$resultFormat": "dataArray"}
    """
    the next few lines look ugly, but that's just
    string formatting for the urls in the GET request
    the important thing is that I ask for a filter
    based on whether start_date / end_date exist
    http://developers.sensorup.com/docs/#query-filter
    TODO: make the filters not terrible code
    """
    if start_date and end_date:
        # filters = "?%24select=resultTime,result&%24resultFormat=dataArray&%24filter=resultTime%20ge%20"+start_date.toISOString()+"%20and%20resultTime%20le%20"+end_date.toISOString()
        filters["$filter"] = "resultTime ge " + start_date + " and resultTime le " + end_date
    elif start_date:
        # filters = "?%24select=resultTime,result&%24resultFormat=dataArray&%24filter=resultTime%20ge%20"+start_date.toISOString()
        filters["$filter"] = "resultTime ge " + start_date

    response = (req.get(link).json() if "?" in link
                else req.get(link, params = filters).json())
    if len(response["value"]) == 0:
        return []
    observations = response["value"][0]["dataArray"]
    """
    the response only returns 100 observations
    so we need to get the rest. Luckily it also returns
    @iot.nextLink which is a link to the next 100
    we use that link to recursively get all the observations we need
    We don't need to deal with filters because the @iot.nextLink
    includes all the filters
    """
    if "@iot.nextLink" in response:
        all_observations = get_obs_for_link(response['@iot.nextLink']) + observations
        """
        sort the observations by time.
        might be inefficient because of sorting at each recursion,
        but who cares
        """
        if not "?" in link:
            return sorted(all_observations, key=lambda x: x[1])
        return all_observations
    else:
        # No iot next link? Must be the end, return
        return observations

def get_obs_for_links(links, start_date = None, end_date = None):
    """
    simple wrapper function that takes in a list of links
    """
    promises_array = map(lambda link: get_obs_for_link(link, start_date, end_date), links)
    return promises_array

if __name__ == "__main__":
    all_links = list(map(lambda thing: thing["link"], get_water_obs_links()))
    start_date = date_parser.parse("April 1 2019")
    end_date = date_parser.parse("April 3 2019")
    vals = get_obs_for_links(all_links[:3], start_date.isoformat() + "Z", end_date.isoformat() + "Z")
    print(list(vals))
