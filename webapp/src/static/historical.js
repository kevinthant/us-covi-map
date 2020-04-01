
import { onReady } from './on-ready';

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
}

ko.bindingHandlers.highstock = {
  update: function(element, valueAccessor, allBindingsAccessor) {
    var value = ko.unwrap(valueAccessor());
		var options = (value!=null) && (value.options!= null) ? value.options : value;
    Highcharts.stockChart(element, options);
  }
};

const getChartData = ({ state = false, county = false } = {}) => {
  return new Promise((resolve, reject) => {
    let query = '';
    let name = 'US nationwide';
    if(state) {
      query = `?state=${state}` + (county ? `&county=${county}` : '');
      name = !county ? `${state} state` : `${county}, ${state}`;
    }

    Highcharts.getJSON(`/historical/data.json${query}`, (response) => {

      if(response.error) {
        return reject(error);
      }
      
      const { rows, options: ddlOptions } = response;
      const data = rows.map((item) => {
        const date = new Date(item.date.split('T')[0]);
        return [date.getTime(), parseInt(item.cases)];
      });

      const options = {
        rangeSelector: {
          selected: 1
        },
    
        title: {
          text: null
        },
    
        series: [{
          name,
          data: data,
          tooltip: {
            valueDecimals: 0
          }
        }]
      };

      return resolve({ options, ddlOptions });
    });
  });
};

class HistoricalChartModel {
  constructor(options, stateOptions) {
    var self = this;
    this.options = ko.observable(options);
    this.state = ko.observable(false);
    this.county = ko.observable(false);
    this.stateOptions = ko.observableArray(stateOptions);
    this.countyOptions = ko.observableArray([]);
    this.hasCountyOptions = ko.computed(() => {
      return this.countyOptions().length > 0;
    });
    window.model = this;

    this.onFormClick = function(v, e) {
      e.preventDefault();
      e.stopPropagation();
      const state = v.state();
      if(state) {
        self.populateData();
      } else {
        alert('Please select a state/territory');
      }
    };

    this.onStateChange = function(v, e) {
      self.county(null);
      self.countyOptions([]);
    };

    this.populateData = function() {
      getChartData({ state: self.state(), county: self.county() })
        .then(({ options, ddlOptions }) => {
          if(self.state() !== '' && ddlOptions) {
            self.countyOptions(ddlOptions);
          }
          self.options(options);
        })
        .catch((err) => {
          console.log(err);
          alert('Fail to load data for rendering the chart. Please try again!');
        });
    }
  }
}

function initChart() {
  getChartData().then(({ options, ddlOptions }) => {
    var model = new HistoricalChartModel(options, ddlOptions);
    ko.applyBindings(model, document.getElementById('app'));
  });
}

onReady.then(initChart);

