!function(e){var t={};function a(r){if(t[r])return t[r].exports;var n=t[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.m=e,a.c=t,a.d=function(e,t,r){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(a.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)a.d(r,n,function(t){return e[t]}.bind(null,n));return r},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="/",a(a.s=0)}([function(e,t){var a=new Promise((function(e){"complete"===document.readyState||"loading"!==document.readyState&&!document.documentElement.doScroll?e():document.addEventListener("DOMContentLoaded",e)}));ko.bindingHandlers.number={update:function(e,t,a){var r,n=ko.bindingHandlers.number.defaults,o=a,i=ko.utils.unwrapObservable,s=i(t())||t(),l="",u=i(o().separator)||n.separator,d=i(o().decimal)||n.decimal,c=i(o().precision)||n.precision,p=i(o().symbol)||n.symbol,h=i(o().after)||n.after;s=parseFloat(s)||0,c>0&&(s=s.toFixed(c)),r=s.toString().split(".");for(var f=0;f<r.length;f++)l+=0==f?r[f].replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1"+u):d+r[f];l=h?l+=p:p+l,ko.bindingHandlers.text.update(e,(function(){return l}))},defaults:{separator:",",decimal:".",precision:0,symbol:"",after:!1}},a.then((function(){Highcharts.getJSON("/county/map.json",(function(e){var t=e.data||[];e.error&&alert("Sorry fail to load the data for the map, please try again later");var a={};Highcharts.each(t,(function(e){a[e.fips+""]=e}));var r=Highcharts.geojson(Highcharts.maps["countries/us/us-all-all"]),n=Highcharts.geojson(Highcharts.maps["countries/us/us-all-all"],"mapline"),o=Highcharts.grep(n,(function(e){return"__border_lines__"===e.properties["hc-group"]})),i=Highcharts.grep(n,(function(e){return"__separator_lines__"===e.properties["hc-group"]}));Highcharts.each(r,(function(e){var t=e.properties["hc-key"].substr(3,2).toUpperCase(),r=a[e.properties.fips];if(r){var n=new Date(r.date.split("T")[0]);e.name=r.county+", "+t,e.deaths=r.deaths,e.date=n.toLocaleDateString()}else e.name=e.name+", "+t})),document.getElementById("container").innerHTML="Rendering map...",setTimeout((function(){Highcharts.mapChart("container",{chart:{borderWidth:0,marginRight:60},title:{text:null},legend:{layout:"vertical",align:"right",floating:!0,backgroundColor:Highcharts.defaultOptions&&Highcharts.defaultOptions.legend&&Highcharts.defaultOptions.legend.backgroundColor||"rgba(255, 255, 255, 0.85)"},tooltip:{formatter:function(){var e=this.point.name+"<br>Cases: "+this.point.value;return this.point.deaths&&(e+="<br/>Deaths: "+this.point.deaths),this.point.date&&(e+="<br/>As of: "+this.point.date),e}},mapNavigation:{enabled:!0},colorAxis:{min:0,max:100,tickInterval:10,stops:[[0,"#F1EEF6"],[.65,"#900037"],[1,"#500007"]],labels:{format:"{value}+"}},plotOptions:{mapline:{showInLegend:!1,enableMouseTracking:!1}},series:[{mapData:r,data:t,joinBy:["fips","fips"],name:"COVID-19 cases",tooltip:{valueSuffix:""},borderWidth:.5,states:{hover:{color:"#a4edba"}},shadow:!1},{type:"mapline",name:"State borders",data:o,color:"white",shadow:!1},{type:"mapline",name:"Separator",data:i,color:"gray",shadow:!1}]})}),0)}))})).then((function(){function e(e,t){this.error=!1;var a=0,r=0,n=(e||[]).map((function(e){return e.asof=new Date(e.asof.split("T")[0]).toLocaleDateString(),a+=parseInt(e.cases),r+=parseInt(e.deaths),e}));this.rows=ko.observableArray(n),this.totalCases=a,this.totalDeaths=r,t&&(this.error="No data available, due to error: "+t)}Highcharts.getJSON("/state/data.json",(function(t){var a=new e(t.data,t.error);ko.applyBindings(a,document.getElementById("tblStateData"))}))}))}]);
//# sourceMappingURL=index.js.map