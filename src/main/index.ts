
declare const Vue : any;
declare const $ : any;


$(function() {
  Vue.createApp({
    data() {
      return {
        baseUrl : 'https://kazuhikoarase.github.io/',
        links : [
          [
            { label : 'SimcirJS', href : 'simcirjs/index.html', },
            { label : 'QR Code Generator', href : 'qrcode-generator/js/demo', ref : true },
            { label : 'kaleidoscope', href : 'kaleidoscope/index.html', },
            { label : 'Spherical Viewer', href : 'spherical-viewer/demo/', ref : true },
            { label : 'ComfortableJS', href : 'comfortable-js/demo/', ref : true },
            { label : 'vue-metronome', href : 'vue-metronome/demo/', ref : true },
          ],
          [
            { label : 'SVG Toolkit (with Gears)', href : 'ganttchart-js/demo/', ref : true },
            { label : 'GanttChartJS', href : 'ganttchart-js/demo/', ref : true },
            { label : 'JAJB', href : 'jajb', ref : true },
          ]
        ]
      };
    },
  }).mount('#app');
});
