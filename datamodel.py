from shared import *
from google.appengine.ext import db
from google.appengine.api import users

class Car(db.Model):
    plate = db.IntegerProperty(required=True)
    make = db.StringProperty(required=True)
    model = db.StringProperty(required=True)
    color = db.StringProperty(required=True, choices=set(["red","green","blue","white","turquoise","gray","black","silver","brown","yellow","orange","other"]))
    owner = db.UserProperty(required=True, auto_current_user_add=True)

    def __eq__(self, other):
        if isinstance(other, Car):
            return self.plate == other.plate
        else:
            raise NotImplementedError()

    def __ne__(self, other):
        if isinstance(other, Car):
            return self.plate != other.plate
        else:
            raise NotImplementedError()

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
            # Delete all references to the car by leaving all the spots
            for spot in list(Spot.all().filter("future = ", False)):
                if spot.car == car:
                    spot.Leave()
                if spot.reserved and spot.reserved.car == car:
                    spot.Reserve(False)
            car.delete()
    
    @staticmethod
    def GuestCar():
        return Car.get_or_insert(
        str(GUEST_PLATE),
        plate=GUEST_PLATE,
        model="Guest",
        make="Guest",
        color="other"
        )
        
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
    reserved = db.SelfReferenceProperty(collection_name='future_set')
    car = db.ReferenceProperty(reference_class=Car)
    comments = db.StringProperty()
    future = db.BooleanProperty()
    outside = db.BooleanProperty()
    
    def Take(self, car, comments=""):
        if not self.free:
            raise SpotTakenException("The spot is taken!")
        if not car:
            raise ParkingException("Can't reserve for None car!")
        self.free = False
        self.car = car
        self.comments = comments
        self.put()
    
    def Leave(self):
        if self.free:
            SpotNotTakenException()
        self.car = None
        self.comments = ""
        self.free = True
        self.put()
    
    def Reserve(self, reserve, car=None, comments=""):
        if reserve:
            if not car:
                car = Car.GuestCar()
            if car != Car.GuestCar():
                comments = ""
            if not self.reserved:
                futurespot = Spot(number=self.number, free=False, reserved=None, car=car, comments=comments, future=True, outside=self.outside)
                futurespot.put()
                self.reserved = futurespot
            else:
                raise SpotReservedException()
        else:
            if self.reserved:
                self.reserved.delete()
                self.reserved = None
            else:
                raise SpotNotReservedException()
        self.put()

    def Release(self):
        if not self.free:
            self.Leave()
        if self.reserved:
            self.Take(self.reserved.car, self.reserved.comments)
            self.Reserve(False)

class Configuration(db.Model):
    owner = db.UserProperty(required=True, auto_current_user_add=True)
    themename = db.StringProperty(required=True, choices=set(["nativedroid"]), default="nativedroid")
    subtheme = db.StringProperty(required=True, choices=set(["light", "dark"]), default="light")
    themecolor = db.StringProperty(required=True, choices=set(["blue", "green", "purple", "red", "yellow"]), default="blue")
    enablereservations = db.BooleanProperty(required=True, default=False)
    enablespotspecification = db.BooleanProperty(required=True, default=False)

    @staticmethod
    def GetTheme():
        try:
            cfg = list(Configuration.all().filter("owner = ", users.get_current_user()))[0]
        except:
            cfg = Configuration()
            cfg.put()
        return cfg.themename, cfg.subtheme, cfg.themecolor

    @staticmethod
    def SetTheme(themename, subtheme, themecolor):
        try:
            cfg = list(Configuration.all().filter("owner = ", users.get_current_user()))[0]
        except:
            cfg = Configuration()
        cfg.themename   = themename
        cfg.subtheme    = subtheme
        cfg.themecolor  = themecolor
        cfg.put()

    @staticmethod
    def GetEnableReservations():
        try:
            cfg = list(Configuration.all().filter("owner = ", users.get_current_user()))[0]
            return cfg.enablereservations
        except:
            return False

    @staticmethod
    def GetEnableSpotSpecification():
        try:
            cfg = list(Configuration.all().filter("owner = ", users.get_current_user()))[0]
            return cfg.enablespotspecification
        except:
            return False

    @staticmethod
    def MigrateConfigurationSchema():
        updated = []
        
        for cfg in Configuration.all():
            try:
                cfg.enablereservations = cfg.enablereservations
                cfg.enablespotspecification = cfg.enablespotspecification
            except:
                cfg.enablereservations = False
                cfg.enablespotspecification = False
            updated.append(cfg)

        if updated:
            db.put(updated)

        return len(updated)