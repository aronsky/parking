<!--
    Parameters:
    
    spots: list of spots
-->

<ul data-role="listview" data-inset="true" id="spotlist">
    {% for spot in spots %}
        <li>
            {% if spot.free %}
                {% if spot.parkable %}
                    <a href="#confirmreserve" data-rel="popup" data-transition="pop">
                        Empty / Parkable
                    </a>
                {% else %}
                    Empty / Unparkable
                {% endif %}
            {% else %}
                {% if spot.leavable %}
                    <a href="#confirmleave" data-rel="popup" data-transition="pop">
                        <h3>{{ spot.name }}</h3>
                        <p><strong>{{ spot.car }}</strong></p>
                        <p class="ui-li-aside"><strong>{{ spot.comments }}</strong></p>
                    </a>
                {% else %}
                    <h3>{{ spot.name }}</h3>
                    <p><strong>{{ spot.car }}</strong></p>
                    <p class="ui-li-aside"><strong>{{ spot.comments }}</strong></p>
                {% endif %}
            {% endif %}
        </li>
    {% endfor %}
</ul>