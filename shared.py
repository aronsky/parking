#############
# Constants #
#############

INSIDE_SPOTS_COUNT = 5
OUTSIDE_SPOTS_COUNT = 4
GUEST_PLATE = 9999999

##############
# Exceptions #
##############

class ParkingException(Exception):
    pass

class DoubleBookingException(ParkingException):
    pass

class NoFreeSpaceException(ParkingException):
    pass

class SpotTakenException(ParkingException):
    pass

class SpotNotTakenException(ParkingException):
    pass

class SpotReservedException(ParkingException):
    pass

class SpotNotReservedException(ParkingException):
    pass

#############
# Functions #
#############

def make_name(user):
    return user.nickname().split('@')[0].replace('.', ' ').title()
    
