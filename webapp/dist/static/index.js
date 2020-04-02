!function(t){var e={};function r(a){if(e[a])return e[a].exports;var n=e[a]={i:a,l:!1,exports:{}};return t[a].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=t,r.c=e,r.d=function(t,e,a){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(r.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)r.d(a,n,function(e){return t[e]}.bind(null,n));return a},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="/",r(r.s=1)}([function(t,e,r){"use strict";r.d(e,"a",(function(){return a}));const a=new Promise((function(t){"complete"===document.readyState||"loading"!==document.readyState&&!document.documentElement.doScroll?t():document.addEventListener("DOMContentLoaded",t)}))},function(t,e,r){"use strict";r.r(e);var a=r(0);window.onbeforeunload=function(){window.scrollTo(0,0)},ko.bindingHandlers.number={update:function(t,e,r){var a,n=ko.bindingHandlers.number.defaults,o=r,s=ko.utils.unwrapObservable,i=s(e())||e(),l="",c=s(o().separator)||n.separator,d=s(o().decimal)||n.decimal,u=s(o().precision)||n.precision,p=s(o().symbol)||n.symbol,h=s(o().after)||n.after;i=parseFloat(i)||0,u>0&&(i=i.toFixed(u)),a=i.toString().split(".");for(var f=0;f<a.length;f++)l+=0==f?a[f].replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1"+c):d+a[f];l=h?l+=p:p+l,ko.bindingHandlers.text.update(t,(function(){return l}))},defaults:{separator:",",decimal:".",precision:0,symbol:"",after:!1}},a.a.then((function(){Highcharts.getJSON("/county/map.json",(function(t){var e=t.data||[];t.error&&alert("Sorry fail to load the data for the map, please try again later");var r={};Highcharts.each(e,(function(t){r[t.fips+""]=t}));var a=Highcharts.geojson(Highcharts.maps["countries/us/us-all-all"]),n=Highcharts.geojson(Highcharts.maps["countries/us/us-all-all"],"mapline"),o=Highcharts.grep(n,(function(t){return"__border_lines__"===t.properties["hc-group"]})),s=Highcharts.grep(n,(function(t){return"__separator_lines__"===t.properties["hc-group"]}));Highcharts.each(a,(function(t){var e=t.properties["hc-key"].substr(3,2).toUpperCase(),a=r[t.properties.fips];if(a){var n=new Date(a.date.split("T")[0]);t.name=a.county+", "+e,t.deaths=a.deaths,t.date=n.toLocaleDateString()}else t.name=t.name+", "+e})),document.getElementById("container").innerHTML="Rendering map...",setTimeout((function(){Highcharts.mapChart("container",{chart:{borderWidth:0,marginRight:60},title:{text:null},legend:{layout:"vertical",align:"right",floating:!0,backgroundColor:Highcharts.defaultOptions&&Highcharts.defaultOptions.legend&&Highcharts.defaultOptions.legend.backgroundColor||"rgba(255, 255, 255, 0.85)"},tooltip:{formatter:function(){var t=this.point.name+"<br>Cases: "+this.point.value;return this.point.deaths&&(t+="<br/>Deaths: "+this.point.deaths),this.point.date&&(t+="<br/>As of: "+this.point.date),t}},mapNavigation:{enabled:!0},colorAxis:{min:0,max:100,tickInterval:10,stops:[[0,"#F1EEF6"],[.65,"#900037"],[1,"#500007"]],labels:{format:"{value}+"}},plotOptions:{mapline:{showInLegend:!1,enableMouseTracking:!1}},series:[{mapData:a,data:e,joinBy:["fips","fips"],name:"COVID-19 cases",tooltip:{valueSuffix:""},borderWidth:.5,states:{hover:{color:"#a4edba"}},shadow:!1},{type:"mapline",name:"State borders",data:o,color:"white",shadow:!1},{type:"mapline",name:"Separator",data:s,color:"gray",shadow:!1}]})}),0)}))})).then((function(){function t(t,e){var r=this;this.error=!1;var a=0,n=0;const o=(t||[]).map((function(t){return t.asof=new Date(t.asof.split("T")[0]).toLocaleDateString(),a+=parseInt(t.cases),n+=parseInt(t.deaths),t}));o.forEach(t=>{t.casesPct=100*parseFloat(parseInt(t.cases)/(1*a)),t.deathsPct=100*parseFloat(parseInt(t.deaths)/(1*n)),t.cfr=100*parseFloat(parseInt(t.deaths)/(1*parseInt(t.cases)))}),this.rows=ko.observableArray(o),this.totalCases=a,this.totalDeaths=n,this.sortedColumn=ko.observable("cases"),this.sortedOrder=ko.observable("desc"),e&&(this.error="No data available, due to error: "+e),this.sort=function(t,e){var a=e.currentTarget.getAttribute("data-id"),n=a==r.sortedColumn()&&"asc"==r.sortedOrder()?"desc":"asc";o.sort((function(t,e){return t[a]<e[a]?-1:t[a]>e[a]?1:0})),"desc"==n&&o.reverse(),r.rows(o),r.sortedColumn(a),r.sortedOrder(n)}}Highcharts.getJSON("/state/data.json",(function(e){var r=new t(e.data,e.error);ko.applyBindings(r,document.getElementById("tblStateData"))}))}))}]);