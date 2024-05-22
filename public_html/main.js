const dateInput = document.getElementById('date');
const form = document.getElementById('flightForm');

// Calculate the minimum and maximum dates
const today = new Date();
const maxDate = new Date(today);
maxDate.setDate(maxDate.getDate()-1); 
const minDate = new Date(today);
minDate.setDate(minDate.getDate()-91);


//initialize variables for analysis
var departure_timings={};
departure_timings["next"]=0;
for (let i=0; i<24; i++){
    let key = i.toString().padStart(2, '0');
    departure_timings[key] = 0;
}
var arrival_timings={};
arrival_timings["prev"]=0;
arrival_timings["next"]=0;
for (let i=0; i<24; i++){
    let key = i.toString().padStart(2, '0');
    arrival_timings[key] = 0;
}
var departure_special=0;
var arrival_special=0;

var departure_locations={}
var arrival_locations={};

var departure_list=[];
var arrival_list=[];

var names={};


form.addEventListener('submit', function(event) {
    const validationMessageParagraph = document.getElementById('dateValidationMessage');
    const selectedDate = new Date(dateInput.value);

    //no date selected
    if(!dateInput.value) {
        event.preventDefault(); // Prevent the form from being submitted
        validationMessageParagraph.textContent = 'Please select a date.';
        validationMessageParagraph.classList.add('error');
        return;
    }
    //incorrect date selected
    else if (selectedDate < minDate || selectedDate > maxDate) {
            event.preventDefault(); // Prevent the form from being submitted
            validationMessageParagraph.textContent = 'Please select a date between ' + minDate.toISOString().slice(0,10) + ' and yesterday.';
            validationMessageParagraph.classList.add('error');
    }
    //correct date selected
    else {
        //here is the crux of the code!!!
        validationMessageParagraph.textContent = '';
        validationMessageParagraph.classList.remove('error');
        const selectedDateString = selectedDate.toISOString().slice(0,10);
        console.log('Date selected:', selectedDateString);
        event.preventDefault(); // Prevent the form from being submitted
        
        let title="";
        title += '<h2>Flight Statistics for ' + selectedDateString + '</h2>';
        document.getElementById('Title').innerHTML = title;


        let departure_Output="";
        let arrival_Output="";

        //manipulate dataa
       Promise.all([
            fetch('flight.php?date=' + selectedDateString + '&lang=en&cargo=false&arrival=false').then(respose => respose.json()),
            fetch('flight.php?date=' + selectedDateString + '&lang=en&cargo=false&arrival=true').then(response => response.json()),
            fetch('iata.json').then(response => response.json())
            ]).then(([departureData, arrivalData, iataData]) => {
            iataData.forEach(item => {
                names[item.iata_code] = item.name;
            
            });
            
            //departure data analysis
            departure_list=departureData[0].list;
            departure_list.forEach(item => {
                item.destination.forEach(destination => {
                    if (departure_locations.hasOwnProperty(destination)) {
                        departure_locations[destination]++;
                    } else {
                        departure_locations[destination] = 1;
                    }
                });

                let time = item.status;
                if (time == "Cancelled") {
                    departure_special++;
                } else {
                    //get hour
                    let timeParts = time.split(' ');
                    let hourMinuteParts = timeParts[1].split(':');
                    let hour = hourMinuteParts[0];

                    if (timeParts.length == 2) {
                        // Format is "Dep hour:minute"
                        departure_timings[hour]++;
                    } else if (timeParts.length == 3) {
                        // Fprmat is for next day
                        hour="next";
                        departure_timings[hour]++;
                    }
                }
            });

            let locationsArray = Object.entries(departure_locations);
            locationsArray.sort((a, b) => b[1] - a[1]);
            let top10Locations = locationsArray.slice(0, 10);

            let Destinations=(Object.keys(departure_locations).length);
            let total= departure_list.length;
        

            departure_Output += '<h2>Departures</h2>';
            departure_Output += '<p><b>Total Flights</b>   '+ total + '</p>';
            departure_Output += '<p><b>Destinations</b>   '+ Destinations +'</p>';
            departure_Output += '<p><b>Special Cases</b>   <em>Cancelled: '+departure_special+'</em></p>';
            departure_Output += '<br>';
            

            //histogram departure
            departure_Output += '<p><b>Departure Time</b></p>';
            let maxCount = Math.max(...Object.values(departure_timings));
            let hours = Object.keys(departure_timings);
            hours.sort();
            for (let i = 0; i < hours.length; i++) {
                let hour = hours[i];
                let count = departure_timings[hour];
                let barWidth = (count / maxCount) * 100;  // Scale the bar width based on the count

                departure_Output += `
                    <div class="histogram-row">
                        <div class="histogram-column">${hour.padStart(2, '0')}</div>
                        <div class="histogram-column">
                            <div class="bar" style="width: ${barWidth}%;"></div>
                        </div>
                        <div class="histogram-column">${count}</div>
                    </div>
                `;
            }

            departure_Output += '<br>';
            departure_Output += '<br>';
            departure_Output += '<br>';
            
            //top 10 destinations
            departure_Output += '<div id="title_centre"><b>Top 10 Destinations</b></div>';
            departure_Output += `
                <div class="row">
                    <div class="column"><b>Code</b></div>
                    <div class="column"><b>Airport Name</b></div>
                    <div class="column"><b>No. Of Flights</b></div>
                </div>
            `;

            top10Locations.forEach(([location, count]) => {
                departure_Output += `
                    <div class="row">
                        <div class="column"><b>${location}</b></div>
                        <div class="column">${names[location]}</div>
                        <div class="column">${count}</div>
                    </div>
                `;
            });
            
            //arrival data analysis
            arrival_list=arrivalData[0].list;

            arrival_list.forEach(item => {
                item.origin.forEach(origin=> {
                    if (arrival_locations.hasOwnProperty(origin)) {
                        arrival_locations[origin]++;
                    } else {
                        arrival_locations[origin] = 1;
                    }
                });
                
                let time=item.status;
                if (time == "Cancelled") {
                    arrival_special++;
                } else {
                    //get hour
                    let timeParts = time.split(' ');
                    let hourMinuteParts = timeParts[2].split(':');
                    let hour = hourMinuteParts[0];
            
                    if (timeParts.length == 3) {
                        // Format is "At gate hour:minute"
                        arrival_timings[hour]++;
                    } else if (timeParts.length == 4) {
                        // Format is "At gate hour:minute (dd/mm/yyyy)"
                        let dateParts = timeParts[3].replace(/[()]/g, '').split('/');
                        let flightDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            
                        if (flightDate > selectedDate) {
                            arrival_timings["next"]++;
                        } else if (flightDate < selectedDate) {
                            arrival_timings["prev"]++;
                        }
                    }
                }
            });

            let Origins=Object.keys(arrival_locations).length;
            let locationsArray_arr = Object.entries(arrival_locations);

            locationsArray_arr.sort((a, b) => b[1] - a[1]);

            let top10Locations_arr = locationsArray_arr.slice(0, 10);

            arrival_Output += '<h2>Arrivals</h2>';
            arrival_Output += '<p><b>Total Flights</b> '+arrival_list.length+ '</p>';
            arrival_Output += '<p><b>Destinations</b> ' + Origins +'</p>';
            arrival_Output += '<p><b>Special Cases</b>  <em>Cancelled: '+arrival_special+'</em></p>';
            arrival_Output += '<br>'

            arrival_Output += '<p><b>Arrival Time</b></p>';
            maxCount = Math.max(...Object.values(arrival_timings));
            hours = Object.keys(arrival_timings);
            hours.sort();
            for (let i = 0; i < hours.length; i++) {
                let hour = hours[i];
                let count = arrival_timings[hour];
                let barWidth = (count / maxCount) * 100;  // Scale the bar width based on the count

                arrival_Output += `
                    <div class="histogram-row">
                        <div class="histogram-column">${hour.padStart(2, '0')}</div>
                        <div class="histogram-column">
                            <div class="bar" style="width: ${barWidth}%;"></div>
                        </div>
                        <div class="histogram-column">${count}</div>
                    </div>
                `;
            }

            arrival_Output += '<br>';
            
            arrival_Output += '<div id="title_centre"><b>Top 10 Origins</b></div>';
            arrival_Output += `
                <div class="row">
                    <div class="column"><b>Code</b></div>
                    <div class="column"><b>Airport Name</b></div>
                    <div class="column"><b>No. Of Flights</b></div>
                </div>
            `;
            top10Locations_arr.forEach(([location, count]) => {
                arrival_Output += `
                    <div class="row">
                        <div class="column"><b>${location}</b></div>
                        <div class="column">${names[location]}</div>
                        <div class="column">${count}</div>
                    </div>
                `;
            });
 
            document.getElementById('departure_Data').innerHTML = departure_Output;
            document.getElementById('arrival_Data').innerHTML = arrival_Output;
            
            //reset all data-strucutres
            departure_special=0;
            arrival_special=0;
            departure_list=[];
            arrival_list=[];
            departure_locations={};
            arrival_locations={};
            departute_timings={};
            arrival_timings={};
            locationsArray=[];
            locationsArray_arr=[];
            top10Locations=[];
            top10Locations_arr=[];
        })


        .catch(error => {
            console.error('Error fetching flight data:', error);
        });
    }
});