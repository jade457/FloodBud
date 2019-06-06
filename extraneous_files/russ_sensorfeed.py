#!/usr/bin/python3
# 
# test of attaching to the sealevelsensor data feed
#

import paho.mqtt.client as mqtt
#import MySQLdb
import time


import json
from pprint import pprint

def on_connect(mqttc, obj, flags, rc):
    print("rc: " + str(rc))

def on_message(mqttc, obj, msg):
    global on_mode, off_mode, state, on_modes, off_modes

    # print the complete message including which gateways received it
    print("topic = ", msg.topic)
    print("qos = ", str(msg.qos))
    print("payload = ", msg.payload.decode('UTF-8'))

    # print the decoded message payload
#    payload = json.loads(msg.payload.decode('UTF-8'))
#    print("json payload = ", payload)

# commenting out the database stuff
# focus on just seeing the raw feed for now
    try:
        print("json payload['dev_id'] = ", payload['dev_id'])

#        if msg.topic == "chatham_water/devices/00633_ultrasonic/up":
#            i=0
#
#        cnx = MySQLdb.connect(user='xxx', password='********',
#                              host='localhost',
#                              database='ttn')
#        cursor = cnx.cursor()
#
#        add_msg = ("INSERT into chatham_raw "
#                   "(device_id, raw, tstamp) "
#                   "VALUES (%s, %s, now())")
#
#        data_msg = (payload['dev_id'], payload['payload_raw'])
#        cursor.execute(add_msg, data_msg)
#
#        # Commit the changes and close the cursor & connection
#        cnx.commit()
#
#        cursor.close()
#        cnx.close()
    except:
        i=0


data = []

def on_publish(mqttc, obj, mid):
    print("mid: " + str(mid))


def on_subscribe(mqttc, obj, mid, granted_qos):
    print("Subscribed: " + str(mid) + " " + str(granted_qos))


def on_log(mqttc, obj, level, string):
    print(string)


for d in data:
  pprint(d);
  tstamp = d['time']
  d['mysqldatetime'] = tstamp[0:10] + " " + tstamp[11:26]
  # print(d['mysqldatetime'])
  # dict_keys(['device_id', 'time', 'junk', 'raw', 'temp'])
  data_data_point = (d['device_id'], d['raw'], d['temp'], d['mysqldatetime'])

  print(add_data_point)
  print(data_data_point)



# If you want to use a specific client id, use
# mqttc = mqtt.Client("client-id")
# but note that the client id must be unique on the broker. Leaving the client
# id parameter empty will generate a random id for you.

mqttc = mqtt.Client()

mqttc.on_message = on_message
mqttc.on_connect = on_connect
mqttc.on_publish = on_publish
mqttc.on_subscribe = on_subscribe

mqttc.username_pw_set("coastal_environment","ttn-account-v2.kFc5s848a3j-sDnUtLqm2c22DXURSRklSwPsGNw8PAY")
mqttc.connect("us-west.thethings.network", 1883, 60)
mqttc.subscribe("+/devices/#", 0)
#mqttc.subscribe("$SYS/#", 0)

while True:
    mqttc.loop()

