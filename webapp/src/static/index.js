Highcharts.getJSON(
  '/county/map.json',
  function (data) {

      var dataByFips = {};
      Highcharts.each(data, function(item){
        dataByFips[item.fips + ''] = item;
      });

      

      var countiesMap = Highcharts.geojson(
              Highcharts.maps['countries/us/us-all-all']
          ),
          // Extract the line paths from the GeoJSON
          lines = Highcharts.geojson(
              Highcharts.maps['countries/us/us-all-all'], 'mapline'
          ),
          // Filter out the state borders and separator lines, we want these
          // in separate series
          borderLines = Highcharts.grep(lines, function (l) {
              return l.properties['hc-group'] === '__border_lines__';
          }),
          separatorLines = Highcharts.grep(lines, function (l) {
              return l.properties['hc-group'] === '__separator_lines__';
          });

      // Add state acronym for tooltip
      Highcharts.each(countiesMap, function (mapPoint) {
        /* mapPoint.name = mapPoint.name + ', ' +
              mapPoint.properties['hc-key'].substr(3, 2);*/
            var state = mapPoint.properties['hc-key'].substr(3, 2).toUpperCase();
            if(dataByFips[mapPoint.properties['fips']]) {
              mapPoint.name = dataByFips[mapPoint.properties['fips']].county + ', ' + state;
              mapPoint.deaths = dataByFips[mapPoint.properties['fips']].deaths;
            } else {
              mapPoint.name = mapPoint.name + ', ' + state;
            }
            
      });

      document.getElementById('container').innerHTML = 'Rendering map...';

      // Create the map
      setTimeout(function () { // Otherwise innerHTML doesn't update
          Highcharts.mapChart('container', {
              chart: {
                  borderWidth: 1,
                  marginRight: 60 // for the legend
              },

              title: {
                  text: 'COVID-19 cases by counties in US'
              },

              legend: {
                  layout: 'vertical',
                  align: 'right',
                  floating: true,
                  backgroundColor: ( // theme
                      Highcharts.defaultOptions &&
                      Highcharts.defaultOptions.legend &&
                      Highcharts.defaultOptions.legend.backgroundColor
                  ) || 'rgba(255, 255, 255, 0.85)'
              },

              tooltip: {
                formatter: function () {
                  var msg = this.point.name + '<br>' +
                  'Cases: ' + this.point.value;

                  if(this.point.deaths) {
                    msg += '<br/>Deaths: ' + this.point.deaths;
                  }

                  return msg;
                }
              },
              mapNavigation: {
                  enabled: true
              },

              colorAxis: {
                  min: 0,
                  max: 100,
                  tickInterval: 10,
                  stops: [[0, '#F1EEF6'], [0.65, '#900037'], [1, '#500007']],
                  labels: {
                      format: '{value}+'
                  }
              },

              plotOptions: {
                  mapline: {
                      showInLegend: false,
                      enableMouseTracking: false
                  }
              },

              series: [{
                  mapData: countiesMap,
                  data: data,
                  joinBy: ['fips', 'fips'],
                  name: 'COVID-19 cases',
                  tooltip: {
                      valueSuffix: ''
                  },
                  borderWidth: 0.5,
                  states: {
                      hover: {
                          color: '#a4edba'
                      }
                  },
                  shadow: false
              }, {
                  type: 'mapline',
                  name: 'State borders',
                  data: borderLines,
                  color: 'white',
                  shadow: false
              }, {
                  type: 'mapline',
                  name: 'Separator',
                  data: separatorLines,
                  color: 'gray',
                  shadow: false
              }]
          });
      }, 0);
  }
);