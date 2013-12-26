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

function update_spots()
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

                listhtml += '<li><h3>Inside Spots</h3></li>';
                $.each(data["inside_spots"], spots_populator);
                listhtml += '<li><h3>Outside Spots</h3></li>';
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
                        item = '<li><a href="#confirmunreserve" data-rel="popup" data-transition="pop" onclick="$(\'input#unreservespotnumber\').val('+this.number+')"><h3>Guest</h3><p><strong>Reserved</strong></p><p class="ui-li-aside"><strong>' + this.comments + '</strong></p></a></li>';
                    }
                    
                    listhtml += item;
                }

                listhtml += '<li><h3>Inside Spots</h3></li>';
                $.each(data["inside_spots"], spots_populator);
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
    
    $.ajax({
        url: '/takespot?plate=' + plate + '&spotnumber=' + $('input#takespotnumber').val(),
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

function reserve_spot()
{
    $("body").addClass("ui-disabled");
    $.mobile.showPageLoadingMsg();
    
    $.ajax({
        url: '/reservespot?reserve=1&spotnumber=' + $('input#reservespotnumber').val() + '&comments=' + $('input#reservecomments').val(),
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
        url: '/reservespot?reserve=0&spotnumber=' + $('input#unreservespotnumber').val(),
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
    update_spots();
});
