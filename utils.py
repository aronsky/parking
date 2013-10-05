#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import shared
from datamodel import *

class Clear(webapp2.RequestHandler):
    def get(self):
        for spot in Spot.all().filter("future = ", False):
            spot.Release()
        
class InitSpots(webapp2.RequestHandler):
    def get(self):
        for spot in Spot.all():
            spot.delete()
        for i in xrange(shared.SPOTS_COUNT):
            spot = Spot.get_or_insert(str(i+1), number=i+1, free=True, reserved=None, car=None, comments='', future=False)
            spot.put()

class InitCars(webapp2.RequestHandler):
    def get(self):
        for car in Car.all():
            car.delete()

app = webapp2.WSGIApplication([
                               ('/tasks/clear', Clear),
                               ('/tasks/initspots', InitSpots),
                               ('/tasks/initcars', InitCars),
                               ],
                              debug=True)
