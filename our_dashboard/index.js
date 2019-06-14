import { get_all_sensor_links, get_water_obs_links, get_obs_for_link } from './api_scraper.js';

get_water_obs_links().then(links => {
  get_obs_for_link(links[0], new Date("June 5, 2019"), new Date("June 7, 2019")).then(obs => {
    console.log(obs);
  });
});
