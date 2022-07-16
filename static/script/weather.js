document.getElementById("current-weather-btn").addEventListener("click", function(){current_forecast("forecast")});
document.getElementById("forecast-weather-btn").addEventListener("click", function(){current_forecast("current")});
document.getElementById("location-submit").addEventListener("click", function(){get_location()});
document.getElementById("minus-1").addEventListener("click", function(){forecast_day_minus()});
document.getElementById("plus-1").addEventListener("click", function(){forecast_day_add()});

var index = 0;
var time = 100;
var text = "Weather Machine"
function type_heading() {
    if (index < text.length) {
        document.getElementById("app-heading").innerHTML += text.charAt(index);
        index++;
        setTimeout(type_heading, time);
    }
}

function forecast_day_minus() {
    var days_ahead = parseInt(document.getElementById("days-counter").innerHTML);

    if (days_ahead != 0) {
        days_ahead -= 1;
        document.getElementById("days-counter").innerHTML = days_ahead;
        get_location();
    }
}

function forecast_day_add() {
    var days_ahead = parseInt(document.getElementById("days-counter").innerHTML);

    if (days_ahead != 2) {
        days_ahead += 1;
        document.getElementById("days-counter").innerHTML = days_ahead;
        get_location();
    }
}

var cur_temp = 0;
var kph_gust = 0;
var mph_gust = 0;
var mb_pressure = 0;
var km_vis = 0;
var m_vis = 0;
var kph_wind = 0;
var mph_wind = 0;
var low_c = 0;
var low_f = 0;
var high_c = 0;
var high_f = 0;
function change_temp_mode() {
    const temp_button = document.getElementById("c_or_f");
    const temp_display = document.getElementById("g1t");
    const gust_display = document.getElementById("gust_kph-txt");
    const vis_display = document.getElementById("vis_km-txt");
    const wind_display = document.getElementById("wind_kph-txt");

    if (temp_button.innerHTML == "Metric Mode") {
        const new_temp = Math.round(parseInt(cur_temp) * 9/5 + 32);
        temp_button.innerHTML = "Imperial Mode";
        temp_display.innerHTML = `Temp: ${new_temp}°F`;
        gust_display.innerHTML = `${mph_gust}mph`
        vis_display.innerHTML = `${m_vis}miles`
        wind_display.innerHTML = `${mph_wind}mph`
    } else {
        const new_temp = cur_temp;
        temp_button.innerHTML = "Metric Mode";
        temp_display.innerHTML = `Temp: ${new_temp}`;  
        gust_display.innerHTML = `${kph_gust}kph`;
        vis_display.innerHTML = `${km_vis}km`
        wind_display.innerHTML = `${kph_wind}kph`
    }

    if (btn_active == "forecast") {
        if (temp_button.innerHTML == "Metric Mode") {
            const hi_low_display = document.getElementById("high_low-txt")
            hi_low_display.innerHTML = `${low_f}°F / ${high_f}°F`
        }
        else {
            const hi_low_display = document.getElementById("high_low-txt")
            hi_low_display.innerHTML = `${low_c}°C / ${high_c}°C`
        }
    }
}

var btn_active = "current"
function get_location() {
    const key = "1a9bcc3b53b248b486d24649223006";
    const temp_display = document.getElementById("g1t");
    const cloud_display = document.getElementById("g2t");
    const humidity_display = document.getElementById("g3t");
    const uv_display = document.getElementById("g4t");


    if (btn_active == "current") {
        const url = `http://api.weatherapi.com/v1/current.json?key=${key}&q=${document.getElementById("location").value}`;
        let lat;
        let lon;

        fetch(url)
            .then(res => {
                const enter_something = document.getElementById("enter-something");
                const input_field = document.getElementById("location")
                if (res.ok) {
                    enter_something.innerHTML = "Collected Data";
                    enter_something.style.color = "green";
                    input_field.style.border = "solid 2px green";
                } else {
                    enter_something.innerHTML = "Invalid Place";
                    enter_something.style.color = "red";
                    input_field.style.border = "solid 2px red";
                };
                return res.json();
            })
            .then(data => {
                lat = data["location"]["lat"];
                lon = data["location"]["lon"];
                const current_temp = `${Math.round(data["current"]["temp_c"])}°C`;
                cur_temp = current_temp
                const humidity = `${data["current"]["humidity"]}%`;
                const precip = `${data["current"]["precip_mm"]}mm`;
                const uv = `${data["current"]["uv"]}`;

                temp_display.innerHTML = `Temp: ${current_temp}`;
                cloud_display.innerHTML = `Prcp: ${precip}`;
                humidity_display.innerHTML = `Humid: ${humidity}`;
                uv_display.innerHTML = `UVI: ${uv} UVI`;
                
                get_air_quality(lat, lon);
                return [data["location"], data["current"]]
            })
            .then(x => location_grid(x))
    }
    else {
        const days = parseInt(document.getElementById("days-counter").innerHTML) + 1
        const url = `http://api.weatherapi.com/v1/forecast.json?key=${key}&days=${days}&q=${document.getElementById("location").value}`
        
        fetch(url)
            .then(res => res.json())
            .then(json_obj => {;
                return json_obj;
            })
            .then(json_obj => {
                data = json_obj["forecast"]["forecastday"][days-1]["day"];
                const avg_temp = data["avgtemp_c"]
                const chance_rain = data["daily_chance_of_rain"]
                const avg_humidity = data["avghumidity"]
                const uv = data["uv"]

                temp_display.innerHTML = `Temp: ${Math.round(avg_temp)}°C`
                cloud_display.innerHTML = `Precip: ${chance_rain}%`
                humidity_display.innerHTML = `Humid: ${avg_humidity}%`
                uv_display.innerHTML = `UVI: ${uv} UVI`

                get_air_quality(json_obj["location"]["lat"], json_obj["location"]["lon"])
                return [json_obj["location"], data, json_obj["current"], json_obj["forecast"]["forecastday"][days-1]]
            })
            .then(x => forecast_location_grid(x))
    }
}

function get_air_quality(lat, lon) {
    const key = "1fe4d6fcffb273c22daff0999d14ce8a"
    const link = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`
     
    fetch(link)
        .then(res => res.json())
        .then(data => {
            let components = ["co", "o3", "no2"]
            let cap_components = ["CO", "O3", "NO2"]
            const aqi = data["list"][0]["main"]["aqi"]
            const aqi_display = document.getElementById("g1a")
            aqi_display.innerHTML = `AQI: ${aqi}`

            for (const [counter, element] of components.entries()) {
                document.getElementById(`g${counter+2}a`).innerHTML = `${cap_components[counter]}: ${data["list"][0]["components"][components[counter]]}μg/m3`
            };
        })
}

function location_grid(json_obj) {
    comp_list = [
        "name",
        "region",
        "country",
        "lat",
        "lon",
        "localtime",
        "last_updated",
        "conditions",
        "isday",
        "gust_kph",
        "pressure_mb",
        "vis_km",
        "wind_kph",
        "wind_degree"
    ];

    location_json = json_obj[0];
    current_json = json_obj[1];

    document.getElementById("high_low-txt").innerHTML = "--"
    document.getElementById("date-display").innerHTML = String(location_json["localtime"]).substring(0, 10);

    for (const [counter, component] of comp_list.entries()) {
        if (counter < 6) {
            item = location_json[comp_list[counter]];

            if (item == "") {
                item = "--"
            };

            document.getElementById(`${comp_list[counter]}-txt`).innerHTML = item;
        } else {
            item = current_json[comp_list[counter]];

            if (item == "") {
                item = "--";
            } 
            else if (counter == comp_list.indexOf("conditions")) {
                item = `${current_json["condition"]["text"]}`;
            }
            else if (counter == comp_list.indexOf("isday")) {
                if (item == 0) {
                    item = "Night";
                } else {
                    item = "Day";
                }
            } 
            else if (counter == comp_list.indexOf("wind_degree")) {
                item = `${current_json["wind_degree"]}° | ${current_json["wind_dir"]}`;
            }
            if (counter == comp_list.indexOf("gust_kph") || counter == comp_list.indexOf("wind_kph")) {
                if (counter == comp_list.indexOf("gust_kph")) {
                    kph_gust = item;
                    mph_gust = current_json["gust_mph"];
                }
                else {
                    kph_wind = item;
                    mph_wind = current_json["wind_mph"];
                }
                document.getElementById(`${component}-txt`).innerHTML = `${item}kph`;
            }
            else if (counter == comp_list.indexOf("pressure_mb")) {
                document.getElementById(`${component}-txt`).innerHTML = `${item}mb`
            }
            else if (counter == comp_list.indexOf("vis_km")) {
                km_vis = item;
                m_vis = current_json["vis_miles"]
                document.getElementById(`${component}-txt`).innerHTML = `${item}km`;
            }
            else {
                document.getElementById(`${component}-txt`).innerHTML = item;
            };
        };
    };
};

function forecast_location_grid(json_obj) {
    comp_list = [
        "name",
        "region",
        "country",
        "lat",
        "lon",
        "conditions",
        "vis_km",
        "wind_kph",
    ];

    prop_list = [
        "name",
        "region",
        "country",
        "lat",
        "lon",
        "conditions",
        "avgvis_km",
        "maxwind_kph",
    ];

    ignore_list = [
        "isday",
        "gust_kph",
        "pressure_mb",
        "wind_degree"
    ];

    for (const [counter, component] of ignore_list.entries()) {
        document.getElementById(`${component}-txt`).innerHTML = "--"
    }

    location_json = json_obj[0];
    current_json = json_obj[1];
    last_up = json_obj[2];
    whole_obj = json_obj[3];

    document.getElementById("date-display").innerHTML = whole_obj["date"]
    document.getElementById("localtime-txt").innerHTML = whole_obj["date"];
    document.getElementById("last_updated-txt").innerHTML = last_up["last_updated"];
    document.getElementById("high_low-txt").innerHTML = `${current_json["mintemp_c"]}°C / ${current_json["maxtemp_c"]}°C`;
    low_c = current_json["mintemp_c"];
    low_f = current_json["mintemp_f"];
    high_c = current_json["maxtemp_c"];
    high_f = current_json["maxtemp_f"];


    for (const [counter, component] of comp_list.entries()) {
        if (counter < 5) {
            item = location_json[prop_list[counter]];

            if (item == "") {
                item = "--"
            };

            document.getElementById(`${component}-txt`).innerHTML = item;
        } else {
            item = current_json[prop_list[counter]];

            if (item == "") {
                item = "--";
            } 
            else if (counter == comp_list.indexOf("conditions")) {
                item = `${current_json["condition"]["text"]}`;
                document.getElementById(`${comp_list[counter]}-txt`).innerHTML = item;
            }
            else if (counter == comp_list.indexOf("vis_km")) {
                km_vis = item;
                m_vis = current_json["avgvis_miles"]
                document.getElementById(`${component}-txt`).innerHTML = `${item}km`;
            }
            else if (counter == comp_list.indexOf("wind_kph")) {
                kph_wind = item;
                mph_wind = current_json["maxwind_mph"];
                document.getElementById(`${component}-txt`).innerHTML = `${item}kph`
            }
            else {
                document.getElementById(`${component}-txt`).innerHTML = item;
            };
        };
    };
};


function current_forecast(opp_mode) {
    current_btn = document.getElementById("current-weather-btn");
    forecast_btn = document.getElementById("forecast-weather-btn");
    active_color = "#1ff39e";
    inactive_color = "lightgray";
    
    if (opp_mode == "current") {
        current_btn.style.backgroundColor = inactive_color;
        forecast_btn.style.backgroundColor = active_color;
        btn_active = "forecast";
        get_location();
    }
    else {
        current_btn.style.backgroundColor = active_color;
        forecast_btn.style.backgroundColor = inactive_color;
        btn_active = "current";
        get_location();
    }
}


type_heading();