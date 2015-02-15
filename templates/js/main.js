function fill(plate, make, model, color)
{
    $('input#plate').val(plate);
    $('input#make').val(make);
    $('input#model').val(model);
    $('select#color').val(color);
    try
    {
        $('select#color').selectmenu('refresh');
    }
    catch (e)
    {
    }
}

function save_car()
{
    plate = $('input#plate').val();
    make  = $('input#make').val();
    model = $('input#model').val();
    color = $('select#color').val();
    
    $("body").addClass("ui-disabled");
    $.mobile.showPageLoadingMsg();
    
    $.ajax({
        url: '/user/setcar?plate=' + plate + '&make=' + make + '&model=' + model + '&color=' + color,
        dataType: 'json',
        success: function(data) {
            if (data["result"] == "error")
            {
                alert(data["reason"]);
                alert(data["args"]);
                $.mobile.hidePageLoadingMsg();
                $("body").removeClass("ui-disabled");
                $.mobile.changePage('#options');
            }
            else
            {
                document.location = document.location.protocol + "//" + document.location.host + document.location.pathname + "#options";
                document.location.reload(true);
            }
        },
        error: function(data) {
            alert("Unexpected error has occured!");
            $.mobile.hidePageLoadingMsg();
            $("body").removeClass("ui-disabled");
            $.mobile.changePage('#options');
        }
        });
}

function delete_car()
{
    plate = $('input#plate').val();
    make  = $('input#make').val();
    model = $('input#model').val();
    color = $('select#color').val();
    
    $("body").addClass("ui-disabled");
    $.mobile.showPageLoadingMsg();
    
    $.ajax({
        url: '/user/delcar?plate=' + plate + '&make=' + make + '&model=' + model + '&color=' + color,
        dataType: 'json',
        success: function(data) {
            if (data["result"] == "error")
            {
                alert(data["reason"]);
                alert(data["args"]);
                $.mobile.hidePageLoadingMsg();
                $("body").removeClass("ui-disabled");
                $.mobile.changePage('#options');
            }
            else
            {
                setTimeout(function()
                    {
                        document.location = document.location.protocol + "//" + document.location.host + document.location.pathname + "#options";
                        document.location.reload(true);
                    }, 500);
            }
        },
        error: function(data) {
            alert("Unexpected error has occured!");
            $.mobile.hidePageLoadingMsg();
            $("body").removeClass("ui-disabled");
            $.mobile.changePage('#options');
        }
        });
}

function update_spots_specific()
{
    sl = $('ul#spotlist');
    sl.children().empty(); // Clear the list
    listhtml = "";
    
    $.mobile.showPageLoadingMsg();
    
    $.ajax({
        url: '/getspots',
        dataType: 'json',
        success: function(data) {
            $.mobile.hidePageLoadingMsg();
            if (data["result"] == "error")
            {
                alert(data["reason"]);
                alert(data["args"]);
                $.mobile.changePage('#main');
            }
            else
            {
                spots_populator = function () {
                    var item = "";
                    if (this.free) {
                        if (this.parkable) {
                            item = '<li><a href="#confirmtake" data-rel="popup" data-transition="pop" onclick="$(\'input#takespotnumber\').val('+this.number+')">Empty</a></li>';
                        }
                        else {
                            item = "<li>Empty</li>";
                        }
                    }
                    else {
                        if (this.leavable) {
                            item = '<li><a href="#confirmleave" data-rel="popup" data-transition="pop" onclick="$(\'input#leavespotnumber\').val('+this.number+')"><h3>' + this.name + '</h3><p><strong>' + this.label + '</strong></p><p class="ui-li-aside"><strong>' + this.comments + '</strong></p></a></li>';
                        }
                        else {
                            item = '<li><h3>' + this.name + '</h3><p><strong>' + this.label + '</strong></p><p class="ui-li-aside"><strong>' + this.comments + '</strong></p></li>';
                        }
                    }
                    
                    listhtml += item;
                }

                // Inside spots
                listhtml += '<li><h3>Inside Spots</h3><h5 class="ui-li-heading-small">Lobby Phone#: <a href="tel:036071812">03-607-1812</a></h5></li>';
                $.each(data["inside_spots"], spots_populator);

                // Outside spots
                listhtml += '<li><h3>Outside Spots</h3><h5 class="ui-li-heading-small">Moshe Salti Parking Lot</h5></li>';
                $.each(data["outside_spots"], spots_populator);
                sl.html(listhtml);
                sl.listview("refresh");
            }
        },
        error: function(data) {
            alert("Unexpected error has occured!");
            $.mobile.hidePageLoadingMsg();
            $.mobile.changePage('#main');
        }
    });
}

function update_spots_generic() {
    sl = $('ul#spotlist');
    sl.children().empty(); // Clear the list
    listhtml = "";

    $.mobile.showPageLoadingMsg();

    $.ajax({
        url: '/getspots',
        dataType: 'json',
        success: function (data) {
            $.mobile.hidePageLoadingMsg();
            if (data["result"] == "error") {
                alert(data["reason"]);
                alert(data["args"]);
                $.mobile.changePage('#main');
            }
            else {
                var inside_full = true;
                var outside_full = true;
                var inside_parked = false;
                var outside_parked = false;

                inside_spots_populator = function () {
                    if (!inside_parked && !outside_parked && this.free && this.parkable) {
                        inside_full = false;
                    }

                    if (!this.free && this.leavable) {
                        inside_parked = true;
                    }
                }

                outside_spots_populator = function () {
                    if (!inside_parked && !outside_parked && this.free && this.parkable) {
                        outside_full = false;
                    }

                    if (!this.free && this.leavable) {
                        outside_parked = true;
                    }
                }

                $.each(data["inside_spots"], inside_spots_populator);
                $.each(data["outside_spots"], outside_spots_populator);

                if (inside_parked) {
                    // Already parked inside!
                    listhtml += '<li><h3>Already Parked Inside!</h3><h5 class="ui-li-heading-small">Lobby Phone#: <a href="tel:036071812">03-607-1812</a></h5></li>';
                    listhtml += '<li><a href="#confirmleave" data-rel="popup" data-transition="pop"><h3>Leave</h3></a></li>';
                } else if (outside_parked) {
                    // Already parked outside!
                    listhtml += '<li><h3>Already Parked Outside!</h3><h5 class="ui-li-heading-small">Moshe Salti Parking Lot</h5></li>';
                    listhtml += '<li><a href="#confirmleave" data-rel="popup" data-transition="pop"><h3>Leave</h3></a></li>';
                } else {
                    // Inside spots
                    listhtml += '<li><h3>Inside Spots</h3><h5 class="ui-li-heading-small">Lobby Phone#: <a href="tel:036071812">03-607-1812</a></h5></li>';
                    if (inside_full) {
                        listhtml += "<li><h3>Full</h3></li>";
                    } else {
                        listhtml += '<li><a href="#confirmtake" data-rel="popup" data-transition="pop" onclick="$(\'input#takespottype\').val(\'inside\')">Available</a></li>';
                    }
                    
                    // Outside spots
                    listhtml += '<li><h3>Outside Spots</h3><h5 class="ui-li-heading-small">Moshe Salti Parking Lot</h5></li>';
                    if (outside_full) {
                        listhtml += "<li><h3>Full</h3></li>";
                    } else {
                        listhtml += '<li><a href="#confirmtake" data-rel="popup" data-transition="pop" onclick="$(\'input#takespottype\').val(\'outside\')">Available</a></li>';
                    }
                }

                sl.html(listhtml);
                sl.listview("refresh");
            }
        },
        error: function (data) {
            alert("Unexpected error has occured!");
            $.mobile.hidePageLoadingMsg();
            $.mobile.changePage('#main');
        }
    });
}

function update_future_spots()
{
    sl = $('ul#futurespotlist');
    sl.children().empty(); // Clear the list
    listhtml = "";
    
    $.mobile.showPageLoadingMsg();
    
    $.ajax({
        url: '/getfuturespots',
        dataType: 'json',
        success: function(data) {
            $.mobile.hidePageLoadingMsg();
            if (data["result"] == "error")
            {
                alert(data["reason"]);
                alert(data["args"]);
                $.mobile.changePage('#future');
            }
            else
            {
                spots_populator = function () {
                    var item = "";
                    if (!this.reserved) {
                        item = '<li><a href="#confirmreserve" data-rel="popup" data-transition="pop" onclick="$(\'input#reservespotnumber\').val('+this.number+')">Empty</a></li>';
                    }
                    else {
                        item = '<li><a href="#confirmunreserve" data-rel="popup" data-transition="pop" onclick="$(\'input#unreservespotnumber\').val('+this.number+')"><h3>'+this.label+'</h3><p><strong>Reserved</strong></p><p class="ui-li-aside"><strong>' + this.comments + '</strong></p></a></li>';
                    }
                    
                    listhtml += item;
                }

                // Inside spots
                listhtml += '<li><h3>Inside Spots</h3></li>';
                $.each(data["inside_spots"], spots_populator);

                // Outside spots
                listhtml += '<li><h3>Outside Spots</h3></li>';
                $.each(data["outside_spots"], spots_populator);

                sl.html(listhtml);
                sl.listview("refresh");
            }
        },
        error: function(data) {
            alert("Unexpected error has occured!");
            $.mobile.hidePageLoadingMsg();
            $.mobile.changePage('#future');
        }
    });
}

function take_spot(plate)
{
    $("body").addClass("ui-disabled");
    $.mobile.showPageLoadingMsg();

    var spotnumberortype = "";

    if ($('input#takespotnumber').val() != "") {
        spotnumberortype = '&spotnumber=' + $('input#takespotnumber').val();
    } else {
        spotnumberortype = '&spottype=' + $('input#takespottype').val();
    }
    
    $.ajax({
        url: '/takespot?plate=' + plate + spotnumberortype,
        dataType: 'json',
        success: function(data) {
            if (data["result"] == "error")
            {
                alert(data["reason"]);
                alert(data["args"]);
                $.mobile.hidePageLoadingMsg();
                $("body").removeClass("ui-disabled");
                $.mobile.changePage('#main');
            }
            else
            {
                setTimeout(function()
                    {
                        document.location = document.location.protocol + "//" + document.location.host + document.location.pathname + "#main";
                        document.location.reload(true);
                    }, 500);
            }
        },
        error: function(data) {
            alert("Unexpected error has occured!");
            $.mobile.hidePageLoadingMsg();
            $("body").removeClass("ui-disabled");
            $.mobile.changePage('#main');
        }
        });
}

function leave_spot(plate)
{
    $("body").addClass("ui-disabled");
    $.mobile.showPageLoadingMsg();
    
    $.ajax({
        url: '/leavespot?spotnumber=' + $('input#leavespotnumber').val(),
        dataType: 'json',
        success: function(data) {
            if (data["result"] == "error")
            {
                alert(data["reason"]);
                alert(data["args"]);
                $.mobile.hidePageLoadingMsg();
                $("body").removeClass("ui-disabled");
                $.mobile.changePage('#main');
            }
            else
            {
                setTimeout(function()
                    {
                        document.location = document.location.protocol + "//" + document.location.host + document.location.pathname + "#main";
                        document.location.reload(true);
                    }, 500);
            }
        },
        error: function(data) {
            alert("Unexpected error has occured!");
            $.mobile.hidePageLoadingMsg();
            $("body").removeClass("ui-disabled");
            $.mobile.changePage('#main');
        }
        });
}

function reserve_spot(plate)
{
    $("body").addClass("ui-disabled");
    $.mobile.showPageLoadingMsg();
    
    $.ajax({
        url: '/reservespot?reserve=1&spotnumber=' + $('input#reservespotnumber').val() + '&comments=' + $('input#reservecomments').val() + '&plate=' + plate,
        dataType: 'json',
        success: function(data) {
            if (data["result"] == "error")
            {
                alert(data["reason"]);
                alert(data["args"]);
                $.mobile.hidePageLoadingMsg();
                $("body").removeClass("ui-disabled");
                $.mobile.changePage('#future');
            }
            else
            {
                setTimeout(function()
                    {
                        document.location = document.location.protocol + "//" + document.location.host + document.location.pathname + "#future";
                        document.location.reload(true);
                    }, 500);
            }
        },
        error: function(data) {
            alert("Unexpected error has occured!");
            $.mobile.hidePageLoadingMsg();
            $("body").removeClass("ui-disabled");
            $.mobile.changePage('#future');
        }
        });
}

function unreserve_spot()
{
    $("body").addClass("ui-disabled");
    $.mobile.showPageLoadingMsg();
    
    $.ajax({
        url: '/reservespot?reserve=0&spotnumber=' + $('input#unreservespotnumber').val() +'&plate=',
        dataType: 'json',
        success: function(data) {
            if (data["result"] == "error")
            {
                alert(data["reason"]);
                alert(data["args"]);
                $.mobile.hidePageLoadingMsg();
                $("body").removeClass("ui-disabled");
                $.mobile.changePage('#future');
            }
            else
            {
                setTimeout(function()
                    {
                        document.location = document.location.protocol + "//" + document.location.host + document.location.pathname + "#future";
                        document.location.reload(true);
                    }, 500);
            }
        },
        error: function(data) {
            alert("Unexpected error has occured!");
            $.mobile.hidePageLoadingMsg();
            $("body").removeClass("ui-disabled");
            $.mobile.changePage('#future');
        }
        });
}

function update_theme()
{
    $("body").addClass("ui-disabled");
    $.mobile.showPageLoadingMsg();

    $.ajax({
        url: '/settheme?themename=nativedroid&subtheme=light&themecolor=' + $('select#theme-color').val(),
        dataType: 'json',
        success: function (data) {
            if (data["result"] == "error") {
                alert(data["reason"]);
                alert(data["args"]);
                $.mobile.hidePageLoadingMsg();
                $("body").removeClass("ui-disabled");
                $.mobile.changePage('#main');
            }
            else {
                setTimeout(function () {
                    document.location = document.location.protocol + "//" + document.location.host + document.location.pathname + "#options";
                    document.location.reload(true);
                }, 500);
            }
        },
        error: function (data) {
            alert("Unexpected error has occured!");
            $.mobile.hidePageLoadingMsg();
            $("body").removeClass("ui-disabled");
            $.mobile.changePage('#options');
        }
    });
}

$('#future').on('pageshow', function (event) {
    update_future_spots();
});

$('#main').on('pageshow', function (event) {
    {% if enablespotspecification %}
    update_spots_specific();
    {% else %}
    update_spots_generic();
    {% endif %}
});
