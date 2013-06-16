#############
# Constants #
#############

SPOTS_COUNT = 5

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

#############
# Functions #
#############

def make_name(user):
    return user.nickname().split('@')[0].replace('.', ' ').title()
    
