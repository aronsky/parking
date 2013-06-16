<!--
    Parameters:
    
    logout_url: string, URL for logging out
    user: User object, representing the current user
    freespots: int, number of free spots
    spots: list of spots
    usercars: list of cars belonging to current user
-->

<!DOCTYPE html> 
<html>

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0 maximum-scale=1.0 user-scalable=no"> 
	<title>C4 Parking</title>
    
    <link rel="stylesheet" href="/css/font-awesome.min.css"/>
    <link rel="stylesheet" href="/css/jquerymobile.css"/>
    <link rel="stylesheet" href="/css/jquerymobile.nativedroid.css"/>
    <link rel="stylesheet" href="/css/jquerymobile.nativedroid.light.css" id='jQMnDTheme' />
    <link rel="stylesheet" href="/css/jquerymobile.nativedroid.color.blue.css" id='jQMnDColor' />
    <!--
	<link rel="stylesheet" href="http://code.jquery.com/mobile/1.3.1/jquery.mobile-1.3.1.min.css" />
    -->
	<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
	<script src="http://code.jquery.com/mobile/1.3.1/jquery.mobile-1.3.1.min.js"></script>
    <script src="/scripts/main.js"></script>
</head>
	
<body> 

<!-- Start of first page: #main -->
<div data-role="page" id="main">

	<div data-role="header" data-position="fixed" data-tap-toggle="false" data-theme="b">
        <!--<a href="#options" data-icon="gear">&nbsp;</a>-->
        <a href="#options" class="ui-btn-left"><i class="icon-cog"></i></a>
        <h1>Welcome, {{ user.name }}!</h1>
        <a href="{{ logout_url }}" data-icon="delete" data-theme="b" class="ui-btn-right">Logout</a>
	</div><!-- /header -->

	<div data-theme="b" data-role="content">	
		<h2>Parking spots</h2>
		
        <div class="content-primary">
            <div class="inset"><!--nativeDroid workaround-->
                <ul data-role="listview" data-inset="true" id="spotlist">
                    <!-- Content is dynamically generated... -->
                </ul>
            </div>
		</div><!--/content-primary -->
        
        <form>
            <input id="takespotnumber" type="hidden"></input>
            <input id="leavespotnumber" type="hidden"></input>
        </form>
        
        <!-- Start of popup: #confirmleave -->
        <div data-role="popup" id="confirmleave">

            <div data-role="header" data-theme="b" style="padding-top: 5px;">
                <h1>Leave</h1>
            </div><!-- /header -->

            <div data-role="content" data-theme="b">	
                <h2>Are you sure you'd like to leave?</h2>
                <div class="inset"><!--nativeDroid workaround-->
                    <ul data-role="listview" data-inset="true">
                        <li><a href="#main" onclick="leave_spot();">Leave</a></li>
                        <li><a href="#main">Stay</a></li>
                    </ul>
                </div>
            </div><!-- /content -->
            
            <div data-role="footer">
                <h4>&nbsp;</h4>
            </div><!-- /footer -->
        </div><!-- /popup confirmleave -->

        <!-- Start of popup: #confirmreserve -->
        <div data-role="popup" id="confirmreserve">

            <div data-role="header" data-theme="b" style="padding-top: 5px;">
                <h1>Reservation</h1>
            </div><!-- /header -->

            <div data-role="content" data-theme="b">
                <h2>What car are you driving?</h2>
                <div class="inset"><!--nativeDroid workaround-->
                    <ul data-role="listview" data-inset="true">
                        {% for car in usercars %}
                        <li><a href="#main" onclick="take_spot({{ car.plate }});">{{ car.make }} {{ car.model }} // {{ car.color.title() }}</a></li>
                        {% endfor %}
                    </ul>
                </div>
            </div><!-- /content -->
            
            <div data-role="footer">
                <h4>&nbsp;</h4>
            </div><!-- /footer -->
        </div><!-- /popup confirmreserve -->


	</div><!-- /content -->
	
	<div data-role="footer" data-theme="b">
		<h4>Current free spots: {{ freespots }}</h4>
	</div><!-- /footer -->
</div><!-- /page main -->


<!-- Start of second page: #options -->
<div data-role="page" id="options">

	<div data-role="header" data-position="fixed" data-tap-toggle="false" data-theme="b">
        <a href="#main" class="ui-btn-left"><i class="icon-angle-left"></i></a>
		<h1>Options</h1>
	</div><!-- /header -->

	<div data-theme="b" data-role="content">
		<h2>Car List</h2>
		
        <div class="inset"><!--nativeDroid workaroud-->
            <ul data-role="listview" data-inset="true" id="carlist">
            {% for car in usercars %}
                <li>
                    <a href="#addcar" data-rel="popup" data-transition="pop" onclick="fill('{{ car.prettyplate() }}','{{ car.make }}','{{ car.model }}','{{ car.color }}')">
                        <h3>{{ car.make }} {{ car.model }} // {{ car.color.title() }}</h3>
                        <p><strong>{{ car.prettyplate() }}</strong></p>
                    </a>
                </li>
            {% endfor %}
            </ul>
        </div>
        
        <!-- Start of popup: #addcar -->
        <div data-role="popup" id="addcar" data-theme="b">

            <div data-role="header" data-theme="b"  style="padding-top: 5px;">
                <h1>Car details</h1>
            </div><!-- /header -->

            <div data-role="content" data-theme="b">
                <form>
                    <div data-role="fieldcontain" class="ui-field-contain ui-body ui-br">
                        <label for="plate" class="ui-input-text">Plate:</label>
                        <input type="text" name="plate" id="plate" value="" class="ui-input-text ui-body-c ui-corner-all ui-shadow-inset">
                    </div>
                    <div data-role="fieldcontain" class="ui-field-contain ui-body ui-br">
                        <label for="make" class="ui-input-text">Make:</label>
                        <input type="text" name="make" id="make" value="" class="ui-input-text ui-body-c ui-corner-all ui-shadow-inset">
                    </div>
                    <div data-role="fieldcontain" class="ui-field-contain ui-body ui-br">
                        <label for="model" class="ui-input-text">Model:</label>
                        <input type="text" name="model" id="model" value="" class="ui-input-text ui-body-c ui-corner-all ui-shadow-inset">
                    </div>
                    <div data-role="fieldcontain" class="ui-field-contain ui-body ui-br">
                        <label for="color" class="ui-input-text">Color:</label>
                        <select name="color" id="color" data-native-menu="true">
                            <option value="white">White</option>
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="black">Black</option>
                        </select>
                    </div>
                </form>
                
                <div class="showastabs center nobg">
                    <a href="#" data-inline="true" data-role="button" data-icon="delete" onclick="delete_car();">Delete</a>
                    <a href="#" data-inline="true" data-role="button" data-icon="check" onclick="save_car();">Save</a>
                </div><!-- /footer -->
            </div><!-- /content -->
            
            
        </div><!-- /popup addcar -->

        
        <p><a href="#addcar" data-role="button" data-rel="popup" data-transition="pop" onclick="fill('','','','White')">Add a new car...</a></p>
	</div><!-- /content -->
	
	<div data-role="footer">
		<h4>&nbsp;</h4>
	</div><!-- /footer -->
</div><!-- /page two -->


</body>
</html>