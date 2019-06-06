#!/usr/bin/python3
# 
# test of attaching to the sealevelsensor data feed

import paho.mqtt.client as mqtt
import time


import json
from pprint import pprint

def on_connect(mqttc, obj, flags, rc):
    global all_output
    all_output = []
    print("rc: " + str(rc))
    print(obj)
    print(flags)

def on_message(mqttc, obj, msg):
    global on_mode, off_mode, state, on_modes, off_modes
    try:
        print("message received")

        # print the complete message including which gateways received it
        # print("topic = ", msg.topic)
        # print("qos = ", str(msg.qos))
        # print("payload = ", msg.payload.decode('UTF-8'))
        observation = {}
        observation[msg.topic] = msg.payload.decode('UTF-8')
        all_output.append(observation)
        with open("stored_output.json", mode = "w", encoding = 'utf-8') as outfile:
            json.dump(all_output, outfile)
    except Exception as e:
        print(e)

def on_publish(mqttc, obj, mid):
    print("mid: " + str(mid))


def on_subscribe(mqttc, obj, mid, granted_qos):
    print("Subscribed: " + str(mid) + " " + str(granted_qos))

def on_log(mqttc, obj, level, string):
    print(string)

mqttc = mqtt.Client()

mqttc.on_message = on_message
mqttc.on_connect = on_connect
mqttc.on_publish = on_publish
mqttc.on_subscribe = on_subscribe

mqttc.username_pw_set("coastal_environment","ttn-account-v2.kFc5s848a3j-sDnUtLqm2c22DXURSRklSwPsGNw8PAY")
mqttc.connect("us-west.thethings.network", 1883, 60)
mqttc.subscribe("+/devices/#", 0)

while True:
    mqttc.loop()

