
import { onReady, getLocalDate } from './utils';

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

const getJSON = (url) => {
  return new Promise((resolve) => {
    Highcharts.getJSON(url, (response) => {
      resolve(response);
    });
  });
};

const getChartData = (tickers) => {
  return new Promise((resolve, reject) => {

    const requests = tickers.map(({ criteria = { }}) => {
      const { state = false, county = false } = criteria;
      let query = '';
      if(state) {
        query = `?state=${state}` + (county ? `&county=${county}` : '');
      }

      return getJSON(`/historical/data.json${query}`);
    });

    return Promise.all(requests).then((results) => {

      const series = results.map((result, i) => {
        const name = tickers[i].key;
        const { error = false, rows  = []} = result;
        if(error) {
          return reject(error);
        }
  
        const data = rows.map((item) => {
          const date = getLocalDate(item.date);
          return [date.getTime(), parseInt(item.cases)];
        });

        return {
          name,
          data,
          tooltip: {
            valueDecimals: 0
          }
        };
      });

      const options = {
        rangeSelector: {
          selected: 1
        },
        title: {
          text: null
        },
        series,
      };

      return resolve({ options });
    });
  });
};

const getDdlOptions = ({ state = false } = {}) => {
  return new Promise((resolve, reject) => {
    const query = state ? `?state=${state}` : '';
    Highcharts.getJSON(`/historical/drill-down-options.json${query}`, ({ rows = null, error = false }) => {
      if(error) {
        return reject(error);
      }

      resolve(rows);
    });
  });
};

class HistoricalChartModel {
  constructor(options, stateOptions) {
    var self = this;
    this.selectedTickers = ko.observableArray([{ key: this.constructor.US_TICKER_KEY }]);
    this.options = ko.observable(options);
    this.state = ko.observable(false);
    this.county = ko.observable(false);
    this.stateOptions = ko.observableArray(stateOptions);
    this.countyOptions = ko.observableArray([]);
    this.hasCountyOptions = ko.computed(() => {
      return this.countyOptions().length > 0;
    });
    window.model = this;

    this.onAdd = function(v, e) {

      self.populateData();
    };

    this.onRemoveTicker = function(v, e) {
      const key = e.currentTarget.getAttribute('data-key');
      const i = self.selectedTickers().findIndex((t) => t.key == key);
      self.selectedTickers.splice(i, 1);
      self.refreshChart(self.selectedTickers());
    };

    this.onDrillDown = function(v, e) {
      e.preventDefault();
      e.stopPropagation();

      const state = v.state();
      if(!state) {
        alert('Please select a state/territory');
        return false;
      }

      getDdlOptions({ state })
      .then((options) => {
        self.countyOptions(options);
      })
      .catch(() => alert('Fail to load  drill down options, please try again'));
    };

    this.onFormClear = function(v, e) {
      e.preventDefault();
      e.stopPropagation();

      self.state(undefined);
      self.county(false);
      self.countyOptions([]);
      self.selectedTickers([]);
      self.populateData();
    };

    this.onStateChange = function(v, e) {
      self.county(null);
      self.countyOptions([]);
    };

    this.populateData = function() {
      const state = self.state();
      const county = self.county();
      const selectedTickers = self.selectedTickers();
      let newTicker = {};

      if(state && !county) {
        newTicker = { key: state, criteria: { state }};
      } else if(state && county) {
        newTicker = { key: `${county}, ${state}`, criteria: { state, county }};
      } else {
        newTicker = { key: self.constructor.US_TICKER_KEY };
      }

      if(selectedTickers.some((x) => x.key == newTicker.key)) {
        alert(`${newTicker.key} is already in the chart`);
        return false;
      }

      selectedTickers.push(newTicker);
      self.refreshChart(selectedTickers);
    };

    this.refreshChart  = (selectedTickers) => {
      getChartData(selectedTickers)
        .then(({ options }) => {
          self.options(options);
          self.selectedTickers(selectedTickers);
        })
        .catch((err) => {
          alert('Fail to load data for rendering the chart. Please try again!');
          console && console.log(err);
        });
    };
  }
}

HistoricalChartModel.US_TICKER_KEY = 'US Nationwide';

function initChart() {
  Promise.all([getChartData([{ key: HistoricalChartModel.US_TICKER_KEY }]), getDdlOptions()]).then(([{ options }, stateOptions]) => {
    var model = new HistoricalChartModel(options, stateOptions);
    ko.applyBindings(model, document.getElementById('app'));
  })
  .catch((err) => {
    alert('Sorry, error encountered, please try again!');
    console && console.log(err);
  });
}

onReady.then(initChart);

