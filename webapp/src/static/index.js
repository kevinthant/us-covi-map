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
            var state = mapPoint.properties['hc-key'].substr(3, 2).toUpperCase();
            var dataPoint = dataByFips[mapPoint.properties['fips']];
            if(dataPoint) {
              var date = new Date(dataPoint.date.split('T')[0]);
              mapPoint.name = dataPoint.county + ', ' + state;
              mapPoint.deaths = dataPoint.deaths;
              mapPoint.date = date.toLocaleDateString();
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

                  if(this.point.date) {
                    msg += '<br/>As of: ' + this.point.date;
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