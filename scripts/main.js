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
                $.each(data["spots"], function () {
                    var item = "";
                    if (this.free) {
                        if (this.parkable) {
                            item = '<li><a href="#confirmreserve" data-rel="popup" data-transition="pop" onclick="$(\'input#takespotnumber\').val('+this.number+')">Empty</a></li>';
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
                })
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

$(document).bind('pageinit', function (event, data) {
    update_spots();
});