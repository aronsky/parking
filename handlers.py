import os
import jinja2
import webapp2
from google.appengine.api import users
from datamodel import *
from shared import *
import json

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

class MainHandler(webapp2.RequestHandler):
    def get(self):
        logout_url = users.create_logout_url(self.request.uri)
        user = users.get_current_user()
        user.name = make_name(user)
        user.inside = False
        usercars = list(Car.all().filter("owner = ", user))
        
        spots = Spot.all()
        
        template_values = {
            "logout_url": logout_url,
            "user": user,
            "usercars": usercars,
            "useradmin": users.is_current_user_admin(),
            "freespots": len([spot for spot in spots if spot.free]),
            "reservablespots": len([spot for spot in spots if not spot.reserved]),
            }

        main = jinja_environment.get_template('templates/html/subpages/main.html')
        options = jinja_environment.get_template('templates/html/subpages/options.html')
        future = jinja_environment.get_template('templates/html/subpages/future.html')
        index = jinja_environment.get_template('templates/html/index.html')
        self.response.out.write(index.render(
            {
                'mainpage': main.render(template_values),
                'optionspage': options.render(template_values),
                'futurepage': future.render(template_values),
            }
            ))

class SetCarHandler(webapp2.RequestHandler):
    def get(self):
        try:
            result = {}
            
            result['plate'] = int(self.request.get('plate').replace('-',''))
            result['make']  = self.request.get('make')
            result['model'] = self.request.get('model')
            result['color'] = self.request.get('color')
            
            Car.Store(result['plate'], result['make'], result['model'], result['color'])
            
            result['result'] = 'success'
        except Exception, e:
            result = {"result": "error",
                      "reason": `e`,
                      "args"  : self.request.arguments()
                      }
        
        self.response.out.write(json.dumps(result))

class DeleteCarHandler(webapp2.RequestHandler):
    def get(self):
        try:
            result = {}
            
            result['plate'] = int(self.request.get('plate').replace('-',''))
            
            Car.Delete(result['plate'])
            
            result['result'] = 'success'
        except Exception, e:
            result = {"result": "error",
                      "reason": `e`,
                      "args"  : self.request.arguments()
                      }
        
        self.response.out.write(json.dumps(result))
        
class GetSpotsHandler(webapp2.RequestHandler):
    def get(self):
        try:
            user = users.get_current_user()
            user.name = make_name(user)
            user.inside = False
            
            spots = Spot.all()
            jsonspots = []
            
            for spot in spots:
                jspot = {}
                jspot['number'] = spot.number
                jspot['free'] = spot.free
                jspot['comments'] = spot.comments
                if not jspot['free']:
                    if spot.car.owner == user:
                        user.inside = True
                        jspot['leavable'] = True
                    jspot['name'] = make_name(spot.car.owner)
                    jspot['plate'] = spot.car.plate
                    jspot['label'] = spot.car.make + ' ' + spot.car.model
                jsonspots += [jspot]
                
            if not user.inside:
                for jspot in jsonspots:
                    if jspot['free']:
                        jspot['parkable'] = True
            
            result = {}
            
            result['spots'] = jsonspots
            result['result'] = 'success'
        except Exception, e:
            result = {"result": "error",
                      "reason": `e`,
                      "args"  : self.request.arguments()
                      }
        self.response.out.write(json.dumps(result))

class GetFutureSpotsHandler(webapp2.RequestHandler):
    def get(self):
        try:
            spots = Spot.all()
            jsonspots = []
            
            for spot in spots:
                jspot = {}
                jspot['number'] = spot.number
                jspot['reserved'] = spot.reserved
                jspot['comments'] = ''
                jsonspots += [jspot]
                
            result = {}
            
            result['spots'] = jsonspots
            result['result'] = 'success'
        except Exception, e:
            result = {"result": "error",
                      "reason": `e`,
                      "args"  : self.request.arguments()
                      }
        self.response.out.write(json.dumps(result))
        
class TakeSpotHandler(webapp2.RequestHandler):
    def get(self):
        try:
            result = {}
            
            spot = Spot.get(db.Key.from_path("Spot", self.request.get('spotnumber')))
            car = Car.get(db.Key.from_path("Car", self.request.get('plate').replace('-','')))
            spot.Take(car)
            
            result['result'] = 'success'
        except Exception, e:
            result = {"result": "error",
                      "reason": `e`,
                      "args"  : self.request.arguments()
                      }
        self.response.out.write(json.dumps(result))

class LeaveSpotHandler(webapp2.RequestHandler):
    def get(self):
        try:
            result = {}
            
            spot = Spot.get(db.Key.from_path("Spot", self.request.get('spotnumber')))
            spot.Leave()
            
            result['result'] = 'success'
        except Exception, e:
            result = {"result": "error",
                      "reason": `e`,
                      "args"  : self.request.arguments()
                      }
        self.response.out.write(json.dumps(result))

class ReserveSpotHandler(webapp2.RequestHandler):
    def get(self):
        try:
            result = {}
            
            spot = Spot.get(db.Key.from_path("Spot", self.request.get('spotnumber')))
            spot.Reserve(bool(int(self.request.get('reserve'))))
            
            result['result'] = 'success'
        except Exception, e:
            result = {"result": "error",
                      "reason": `e`,
                      "args"  : self.request.arguments()
                      }
        self.response.out.write(json.dumps(result))
