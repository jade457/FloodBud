const base_url = 'https://api.sealevelsensors.org/v1.0/Things';
/**
 * Creates a list of all datastream links.
 * Helper function for get_water_obs_links
 * Exported in case anyone wants to use it
 */
export async function get_all_sensor_links() {
  let api_response = await $.get(base_url);
  let return_list = []
  for (const sensor of api_response.value) {
    let location = (await $.get(sensor["Locations@iot.navigationLink"])).value[0];
    let coordinates = location.location.coordinates;
    return_list.push({
      name:   sensor.name,
      desc:   sensor.description,
      link:   sensor["Datastreams@iot.navigationLink"],
      elev:   sensor.properties.elevationNAVD88,
      coords: coordinates
    });
  }
  return return_list;
}

/**
 * Returns a list of links that
 * lead to water sensor observations.
 * These links are for use in get_obs_for_link
 */
export async function get_water_obs_links(){
  let water_obs_links = [];
  // get all the datastream links
  let all_sensor_links = await get_all_sensor_links();
  /**
   * these links contain all types of observations
   * we need to filter only water level observations
   */
  for (const sensor of all_sensor_links) {
    let obs_type_list = await $.get(sensor.link);
    for (const obs_type of obs_type_list.value) {
      if (obs_type.name === 'Water Level') {
        water_obs_links.push({
          name:   sensor.name,
          desc:   sensor.desc,
          elev:   sensor.elev,
          coords: sensor.coords,
          link:   obs_type['Observations@iot.navigationLink']}
        );
      }
    };
  }
  return water_obs_links;
}

/**
 * given a link, start_date, and end_date,
 * returns all observations for that link
 * between those times
 * start_date and end_date are optional
 * end date is even more optional than start date
 */
export async function get_obs_for_link(link, start_date, end_date) {
  var filters = "";
  /**
   * the next few lines look ugly, but that's just
   * string formatting for the urls in the GET request
   * the important thing is that I ask for a filter
   * based on whether start_date / end_date exist
   * http://developers.sensorup.com/docs/#query-filter
   */
  if (typeof start_date !== 'undefined' && typeof end_date !== 'undefined') {
    filters = "?%24filter=resultTime%20ge%20"+start_date.toISOString()+"%20and%20resultTime%20le%20"+end_date.toISOString();
  }
  else if (typeof start_date !== 'undefined') {
    filters = "?%24filter=resultTime%20ge%20"+start_date.toISOString();
  }
  var response = await $.get(link + filters);
  var observations = response.value;
  /**
   * the response only returns 100 observations
   * so we need to get the rest. Luckily it also returns
   * @iot.nextLink which is a link to the next 100
   * we use that link to recursively get all the observations we need
   * We don't need to deal with filters because the @iot.nextLink
   * includes all the filters
   */
  if ('@iot.nextLink' in response){
    let all_observations = (await get_obs_for_link(response['@iot.nextLink'])).concat(observations);
    /**
     * sort the observations by time.
     * might be inefficient because of sorting at each recursion,
     * but who cares
     */
    all_observations.sort((a, b) => a.resultTime > b.resultTime);
    return all_observations;
  }
  else {
    // No iot next link? Must be the end, return
    return observations;
  }
}
