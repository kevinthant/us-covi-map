!function(e){var t={};function r(a){if(t[a])return t[a].exports;var n=t[a]={i:a,l:!1,exports:{}};return e[a].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=e,r.c=t,r.d=function(e,t,a){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(r.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)r.d(a,n,function(t){return e[t]}.bind(null,n));return a},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="/",r(r.s=0)}([function(e,t){var r=new Promise((function(e){"complete"===document.readyState||"loading"!==document.readyState&&!document.documentElement.doScroll?e():document.addEventListener("DOMContentLoaded",e)}));ko.bindingHandlers.number={update:function(e,t,r){var a,n=ko.bindingHandlers.number.defaults,o=r,i=ko.utils.unwrapObservable,s=i(t())||t(),l="",d=i(o().separator)||n.separator,u=i(o().decimal)||n.decimal,c=i(o().precision)||n.precision,p=i(o().symbol)||n.symbol,h=i(o().after)||n.after;s=parseFloat(s)||0,c>0&&(s=s.toFixed(c)),a=s.toString().split(".");for(var f=0;f<a.length;f++)l+=0==f?a[f].replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1"+d):u+a[f];l=h?l+=p:p+l,ko.bindingHandlers.text.update(e,(function(){return l}))},defaults:{separator:",",decimal:".",precision:0,symbol:"",after:!1}},r.then((function(){Highcharts.getJSON("/county/map.json",(function(e){var t=e.data||[];e.error&&alert("Sorry fail to load the data for the map, please try again later");var r={};Highcharts.each(t,(function(e){r[e.fips+""]=e}));var a=Highcharts.geojson(Highcharts.maps["countries/us/us-all-all"]),n=Highcharts.geojson(Highcharts.maps["countries/us/us-all-all"],"mapline"),o=Highcharts.grep(n,(function(e){return"__border_lines__"===e.properties["hc-group"]})),i=Highcharts.grep(n,(function(e){return"__separator_lines__"===e.properties["hc-group"]}));Highcharts.each(a,(function(e){var t=e.properties["hc-key"].substr(3,2).toUpperCase(),a=r[e.properties.fips];if(a){var n=new Date(a.date.split("T")[0]);e.name=a.county+", "+t,e.deaths=a.deaths,e.date=n.toLocaleDateString()}else e.name=e.name+", "+t})),document.getElementById("container").innerHTML="Rendering map...",setTimeout((function(){Highcharts.mapChart("container",{chart:{borderWidth:0,marginRight:60},title:{text:null},legend:{layout:"vertical",align:"right",floating:!0,backgroundColor:Highcharts.defaultOptions&&Highcharts.defaultOptions.legend&&Highcharts.defaultOptions.legend.backgroundColor||"rgba(255, 255, 255, 0.85)"},tooltip:{formatter:function(){var e=this.point.name+"<br>Cases: "+this.point.value;return this.point.deaths&&(e+="<br/>Deaths: "+this.point.deaths),this.point.date&&(e+="<br/>As of: "+this.point.date),e}},mapNavigation:{enabled:!0},colorAxis:{min:0,max:100,tickInterval:10,stops:[[0,"#F1EEF6"],[.65,"#900037"],[1,"#500007"]],labels:{format:"{value}+"}},plotOptions:{mapline:{showInLegend:!1,enableMouseTracking:!1}},series:[{mapData:a,data:t,joinBy:["fips","fips"],name:"COVID-19 cases",tooltip:{valueSuffix:""},borderWidth:.5,states:{hover:{color:"#a4edba"}},shadow:!1},{type:"mapline",name:"State borders",data:o,color:"white",shadow:!1},{type:"mapline",name:"Separator",data:i,color:"gray",shadow:!1}]})}),0)}))})).then((function(){function e(e,t){var r=this;this.error=!1;var a=0,n=0,o=(e||[]).map((function(e){return e.asof=new Date(e.asof.split("T")[0]).toLocaleDateString(),a+=parseInt(e.cases),n+=parseInt(e.deaths),e}));this.rows=ko.observableArray(o),this.totalCases=a,this.totalDeaths=n,this.sortedColumn=ko.observable("cases"),this.sortedOrder=ko.observable("desc"),t&&(this.error="No data available, due to error: "+t),this.sort=function(e,t){var a=t.currentTarget.getAttribute("data-id"),n=a==r.sortedColumn()&&"asc"==r.sortedOrder()?"desc":"asc";o.sort((function(e,t){return e[a]<t[a]?-1:e[a]>t[a]?1:0})),"desc"==n&&o.reverse(),r.rows(o),r.sortedColumn(a),r.sortedOrder(n)}}Highcharts.getJSON("/state/data.json",(function(t){var r=new e(t.data,t.error);ko.applyBindings(r,document.getElementById("tblStateData"))}))}))}]);
//# sourceMappingURL=index.js.map