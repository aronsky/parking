from shared import *
from google.appengine.ext import db
from google.appengine.api import users

class Car(db.Model):
    plate = db.IntegerProperty(required=True)
    make = db.StringProperty(required=True)
    model = db.StringProperty(required=True)
    color = db.StringProperty(required=True, choices=set(["red","green","blue","white","black","silver","brown","yellow","orange"]))
    owner = db.UserProperty(required=True, auto_current_user_add=True)
    
    @staticmethod
    def Store(plate, make, model, color):
        car = Car.get_or_insert(str(plate), plate=plate, model=model, make=make, color=color)
        car.plate = plate
        car.make  = make
        car.model = model
        car.color = color
        car.put()
    
    @staticmethod
    def Delete(plate):
        car = Car.get(db.Key.from_path("Car", str(plate)))
        if car.owner == users.get_current_user():
            car.delete()
        
    def prettyplate(self):
        result = str(self.plate)
        if len(result) == 7:
            return result[:2] + '-' + result[2:5] + '-' + result[-2:]
        elif len(result) == 6:
            return result[:3] + '-' + result[-3]
        else:
            return result

class Spot(db.Model):
    number = db.IntegerProperty(required=True)
    free = db.BooleanProperty()
    car = db.ReferenceProperty(reference_class=Car)
    comments = db.StringProperty()
    
    def Reserve(self, car, comments):
        if not self.free:
            raise SpotTakenException("The spot is taken!")
        self.free = False
        self.car = car
        self.comments = comments
    
    def Release(self):
        self.car = None
        self.comments = ""
        self.free = True
