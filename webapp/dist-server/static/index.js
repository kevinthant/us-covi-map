"use strict";

var _onReady = require("./on-ready");

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

function initHighChart() {
  Highcharts.getJSON('/county/map.json', function (response) {
    var data = response.data || [];

    if (response.error) {
      alert('Sorry fail to load the data for the map, please try again later');
    }

    var dataByFips = {};
    Highcharts.each(data, function (item) {
      dataByFips[item.fips + ''] = item;
    });
    var countiesMap = Highcharts.geojson(Highcharts.maps['countries/us/us-all-all']),
        // Extract the line paths from the GeoJSON
    lines = Highcharts.geojson(Highcharts.maps['countries/us/us-all-all'], 'mapline'),
        // Filter out the state borders and separator lines, we want these
    // in separate series
    borderLines = Highcharts.grep(lines, function (l) {
      return l.properties['hc-group'] === '__border_lines__';
    }),
        separatorLines = Highcharts.grep(lines, function (l) {
      return l.properties['hc-group'] === '__separator_lines__';
    }); // Add state acronym for tooltip

    Highcharts.each(countiesMap, function (mapPoint) {
      var state = mapPoint.properties['hc-key'].substr(3, 2).toUpperCase();
      var dataPoint = dataByFips[mapPoint.properties['fips']];

      if (dataPoint) {
        var date = new Date(dataPoint.date.split('T')[0]);
        mapPoint.name = dataPoint.county + ', ' + state;
        mapPoint.deaths = dataPoint.deaths;
        mapPoint.date = date.toLocaleDateString();
      } else {
        mapPoint.name = mapPoint.name + ', ' + state;
      }
    });
    document.getElementById('container').innerHTML = 'Rendering map...'; // Create the map

    setTimeout(function () {
      // Otherwise innerHTML doesn't update
      Highcharts.mapChart('container', {
        chart: {
          borderWidth: 0,
          marginRight: 60 // for the legend

        },
        title: {
          text: null //'COVID-19 cases by counties in US'

        },
        legend: {
          layout: 'vertical',
          align: 'right',
          floating: true,
          backgroundColor: // theme
          Highcharts.defaultOptions && Highcharts.defaultOptions.legend && Highcharts.defaultOptions.legend.backgroundColor || 'rgba(255, 255, 255, 0.85)'
        },
        tooltip: {
          formatter: function () {
            var msg = this.point.name + '<br>' + 'Cases: ' + this.point.value;

            if (this.point.deaths) {
              msg += '<br/>Deaths: ' + this.point.deaths;
            }

            if (this.point.date) {
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
  });
}

ko.bindingHandlers.number = {
  update: function (element, valueAccessor, allBindingsAccessor) {
    var defaults = ko.bindingHandlers.number.defaults,
        aba = allBindingsAccessor,
        unwrap = ko.utils.unwrapObservable,
        value = unwrap(valueAccessor()) || valueAccessor(),
        result = '',
        numarray;
    var separator = unwrap(aba().separator) || defaults.separator,
        decimal = unwrap(aba().decimal) || defaults.decimal,
        precision = unwrap(aba().precision) || defaults.precision,
        symbol = unwrap(aba().symbol) || defaults.symbol,
        after = unwrap(aba().after) || defaults.after;
    value = parseFloat(value) || 0;
    if (precision > 0) value = value.toFixed(precision);
    numarray = value.toString().split('.');

    for (var i = 0; i < numarray.length; i++) {
      if (i == 0) {
        result += numarray[i].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + separator);
      } else {
        result += decimal + numarray[i];
      }
    }

    result = after ? result += symbol : symbol + result;
    ko.bindingHandlers.text.update(element, function () {
      return result;
    });
  },
  defaults: {
    separator: ',',
    decimal: '.',
    precision: 0,
    symbol: '',
    after: false
  }
};

function initSummaryTable() {
  function StateTable(data, error) {
    var self = this;
    this.error = false;
    var totalCases = 0;
    var totalDeaths = 0;
    const rows = (data || []).map(function (row) {
      row.asof = new Date(row.asof.split('T')[0]).toLocaleDateString();
      totalCases += parseInt(row.cases);
      totalDeaths += parseInt(row.deaths);
      return row;
    });
    rows.forEach(row => {
      row.casesPct = parseFloat(parseInt(row.cases) / (totalCases * 1.0)) * 100;
      row.deathsPct = parseFloat(parseInt(row.deaths) / (totalDeaths * 1.0)) * 100;
      row.cfr = parseFloat(parseInt(row.deaths) / (parseInt(row.cases) * 1.0)) * 100;
    });
    this.rows = ko.observableArray(rows);
    this.totalCases = totalCases;
    this.totalDeaths = totalDeaths;
    this.sortedColumn = ko.observable('cases');
    this.sortedOrder = ko.observable('desc');

    if (error) {
      this.error = 'No data available, due to error: ' + error;
    }

    this.sort = function (v, e) {
      var col = e.currentTarget.getAttribute('data-id');
      var order = col == self.sortedColumn() ? self.sortedOrder() == 'asc' ? 'desc' : 'asc' : 'asc';
      rows.sort(function (a, b) {
        if (a[col] < b[col]) {
          return -1;
        }

        if (a[col] > b[col]) {
          return 1;
        }

        return 0;
      });

      if (order == 'desc') {
        rows.reverse();
      }

      self.rows(rows);
      self.sortedColumn(col);
      self.sortedOrder(order);
    };
  }

  Highcharts.getJSON('/state/data.json', function (response) {
    var model = new StateTable(response.data, response.error);
    ko.applyBindings(model, document.getElementById('tblStateData'));
  });
}

_onReady.onReady.then(initHighChart).then(initSummaryTable);