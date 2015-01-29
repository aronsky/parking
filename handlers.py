import os
import jinja2
import webapp2
from google.appengine.api import users
from datamodel import *
from shared import *
import json

JINJA_ENV = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

class MainHandler(webapp2.RequestHandler):
    def get(self):
        logout_url = users.create_logout_url(self.request.uri)
        user = users.get_current_user()
        user.name = make_name(user)
        user.inside = False
        editablecars = list(Car.all().filter("owner = ", user).filter("plate != ", GUEST_PLATE))
        usercars = editablecars
        enablereservations = Configuration.GetEnableReservations()
        enablespotspecification = Configuration.GetEnableSpotSpecification()
        spots = list(Spot.all().filter("future = ", False))
        themename, subtheme, themecolor = Configuration.GetTheme()

        main    = JINJA_ENV.get_template('templates/html/subpages/main.html')
        options = JINJA_ENV.get_template('templates/html/subpages/options.html')
        future  = JINJA_ENV.get_template('templates/html/subpages/future.html')
        index   = JINJA_ENV.get_template('templates/html/index.html')

        mainpage_values = {
            "logout_url": logout_url,
            "user": user,
            "enablereservations": enablereservations,
            "enablespotspecification": enablespotspecification,
            "freespots": len([spot for spot in spots if spot.free]),
            "totalspots": len(spots),
            "usercars": usercars,
            "guestcar": Car.GuestCar(),
            }
        mainpage = main.render(mainpage_values)

        options_values = {
            "logout_url": logout_url,
            "editablecars": editablecars,
            "themecolor": themecolor,
            }
        optionspage = options.render(options_values)

        future_values = {
            "logout_url": logout_url,
            "enablereservations": enablereservations,
            "freespots": len([spot for spot in spots if spot.free]),
            "totalspots": len(spots),
            "reservablespots": len([spot for spot in spots if not spot.reserved]),
            "usercars": usercars,
            "guestcar": Car.GuestCar(),
            }
        futurepage = future.render(future_values)

        index_values = {
            "themename": themename,
            "subtheme": subtheme,
            "themecolor": themecolor,
            "mainpage": mainpage,
            "optionspage": optionspage,
            "futurepage": futurepage,
            }
        
        self.response.out.write(index.render(index_values))

class ScriptHandler(webapp2.RequestHandler):
    def get(self):
        enablespotspecification = Configuration.GetEnableSpotSpecification()
        
        script_tpl = JINJA_ENV.get_template('templates/js/main.js')

        script_values = {
            "enablespotspecification": enablespotspecification,
            }
        script = script_tpl.render(script_values)

        self.response.headers["Content-Type"] = "text/javascript"
        self.response.out.write(script)

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
            
            spots = Spot.all().filter('future = ', False)
            json_inisde_spots = []
            json_outside_spots = []
            
            for spot in spots:
                jspot = {}
                jspot['number'] = spot.number
                jspot['free'] = spot.free
                jspot['comments'] = spot.comments
                if not jspot['free']:
                    if spot.car.plate == GUEST_PLATE:
                        jspot['name'] = "Guest"
                        jspot['label'] = "Reserved"
                        jspot['plate'] = GUEST_PLATE
                        jspot['leavable'] = Configuration.GetEnableSpotSpecification()
                    else:
                        if spot.car.owner == user:
                            user.inside = True
                            jspot['leavable'] = True
                        jspot['name'] = make_name(spot.car.owner)
                        jspot['plate'] = spot.car.plate
                        jspot['label'] = spot.car.make + ' ' + spot.car.model
                else:
                    jspot['parkable'] = True
                if spot.outside:
                    json_outside_spots += [jspot]
                else:
                    json_inisde_spots += [jspot]
                
            result = {}
            
            result['inside_spots'] = json_inisde_spots
            result['outside_spots'] = json_outside_spots
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
            spots = Spot.all().filter('future = ', False)
            json_inside_spots = []
            json_outside_spots = []
            
            for spot in spots:
                jspot = {}
                jspot['number'] = spot.number
                jspot['reserved'] = spot.reserved is not None
                jspot['comments'] = spot.reserved.comments if spot.reserved else ""
                jspot['outside'] = spot.outside
                if spot.reserved is not None and spot.reserved.car is not None:
                    if spot.reserved.car.plate == GUEST_PLATE:
                        jspot['name'] = "Guest"
                        jspot['label'] = "Reserved for a guest"
                        jspot['plate'] = GUEST_PLATE
                    else:
                        jspot['name'] = make_name(spot.reserved.car.owner)
                        jspot['label'] = spot.reserved.car.make + ' ' + spot.reserved.car.model
                        jspot['plate'] = spot.reserved.car.plate
                if spot.outside:
                    json_outside_spots += [jspot]
                else:
                    json_inside_spots += [jspot]
                
            result = {}
            
            result['inside_spots'] = json_inside_spots
            result['outside_spots'] = json_outside_spots
            result['result'] = 'success'
        except Exception, e:
            result = {"result": "error",
                      "reason": `e`,
                      "args"  : self.request.arguments()
                      }
        self.response.out.write(json.dumps(result))
        
class TakeSpotHandler(webapp2.RequestHandler):
    def _take_specific(self):
        spot = Spot.get(db.Key.from_path("Spot", self.request.get('spotnumber')))
        car = Car.get(db.Key.from_path("Car", self.request.get('plate').replace('-','')))
        comments = make_name(users.get_current_user()) if car.prettyplate() == Car.GuestCar().prettyplate() else self.request.get('comments')
        spot.Take(car, comments=comments)

    def _take_inside(self):
        spot = Spot.all().filter("free =", True).filter("future =", False).filter("outside =", False).get()
        car = Car.get(db.Key.from_path("Car", self.request.get('plate').replace('-','')))
        comments = self.request.get('comments')
        spot.Take(car, comments=comments)

    def _take_outside(self):
        spot = Spot.all().filter("free =", True).filter("future =", False).filter("outside =", True).get()
        car = Car.get(db.Key.from_path("Car", self.request.get('plate').replace('-','')))
        comments = self.request.get('comments')
        spot.Take(car, comments=comments)

    def get(self):
        result = {}
        try:
            if self.request.get('spottype') == 'inside':
                self._take_inside()
            elif self.request.get('spottype') == 'outside':
                self._take_outside()
            else:
                self._take_specific()
            
            result['result'] = 'success'
        except Exception, e:
            result = {"result": "error",
                      "reason": `e`,
                      "args"  : self.request.arguments()
                      }
        self.response.out.write(json.dumps(result))

class LeaveSpotHandler(webapp2.RequestHandler):
    def _leave_specific(self):
        spot = Spot.get(db.Key.from_path("Spot", self.request.get('spotnumber')))
        spot.Leave()

    def _leave_any(self):
        for spot in Spot.all():
            if spot.car and spot.car != Car.GuestCar():
                spot.Leave()

    def get(self):
        result = {}
        try:
            if self.request.get('spotnumber') != "":
                self._leave_specific()
            else:
                self._leave_any()
            
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
            comments = self.request.get('comments') or make_name(users.get_current_user())

            if bool(int(self.request.get('reserve'))):
                car = Car.get(db.Key.from_path("Car", self.request.get('plate').replace('-','')))
                spot.Reserve(True, car, comments)
            else:
                spot.Reserve(False)
            
            result['result'] = 'success'
        except Exception, e:
            result = {"result": "error",
                      "reason": `e`,
                      "args"  : self.request.arguments()
                      }
        self.response.out.write(json.dumps(result))

class SetThemeHandler(webapp2.RequestHandler):
    def get(self):
        try:
            result = {}
            
            Configuration.SetTheme(
                                   self.request.get('themename'),
                                   self.request.get('subtheme'),
                                   self.request.get('themecolor')
                                   )
                        
            result['result'] = 'success'
        except Exception, e:
            result = {"result": "error",
                      "reason": `e`,
                      "args"  : self.request.arguments()
                      }
        self.response.out.write(json.dumps(result))