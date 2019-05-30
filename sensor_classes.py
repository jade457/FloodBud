from constants import *
def parse_topic(topic):
    """
    takes a topic string and returns a tuple of
    (dev_id, observation_type)
    """
    split_topic = topic.split("/")
    if len(split_topic) < 5:
        # if a payload doesn't have something after 'up'
        # we assume that it is a 'full payload'
        # and give it that observation type
        return (split_topic[2], FULL_PAYLOAD_OBS_TYPE)
    # topics are typically 
    # 'coastal_environment/devices/{dev_id}/up/{obs_type}'
    return (split_topic[2], split_topic[4])

class Sensor:
    """
    This class defines a 'sensor'
    whose main purpose is to hold a list to that sensors observations
    depending on how we want to use the data, we may modify this so that
    different data is stored or its stored in a different format
    (we could chunk the data by timestamp)
    """
    def __init__(self, dev_id):
        self.dev_id = dev_id
        self.observations = []

    def add_observation(self, topic, payload):
        # get the observation type
        obs_type = parse_topic(topic)[1]
        # and add that type / payload to the internal observation list
        self.observations.append({obs_type: payload})

class Observations:
    """
    This class stores a variety of sensors in a mapping
    from their dev_id to the sensor
    """
    def __init__(self):
        self.sensor_mapping = {}

    def add_observation(self, topic, payload):
        parsed_topic = parse_topic(topic)
        dev_id = parsed_topic[0]
        # we want to map dev_id to sensor objects
        if not sensor_mapping[dev_id]:
            sensor_mapping[dev_id] = Sensor(dev_id)
        # and then add the observation to the sensor's internal list
        sensor_mapping[dev_id].add_observation(topic, payload)

## Testing code
parse_topic("coastal_environment/devices/gt-envsense-025/up")
parse_topic("coastal_environment/devices/gt-envsense-025/up/temperature")
