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
    def __init__(self, dev_id):
        self.dev_id = dev_id

## Testing code
parse_topic("coastal_environment/devices/gt-envsense-025/up")
