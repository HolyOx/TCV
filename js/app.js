$(document).foundation()

const ctx = document.getElementById('bars-chart-container');

let myMapChart;
let myChart;
let myHistogram;
let myPolarChart;

let chartForm = document.getElementById("chart-form");
let selectRegiao = document.getElementById("input-regioes");
let selectEstado = document.getElementById("input-estados");
let selectCidade = document.getElementById("input-cidades");
let selectAno = document.getElementById("input-anos");

chartForm.addEventListener("change", () => {
    cleanChart(Chart.getChart(ctx));
    printChart(myChart);
});

fillOptions(selectRegiao, selectRegiao, REGIONS, "");

selectRegiao.addEventListener("change", () => {
    cleanChart(Chart.getChart(ctx));
    cleanOptions(selectEstado);
    cleanOptions(selectCidade);
    cleanOptions(selectAno);
    fillOptions(selectRegiao, selectEstado, STATES, "regionId");
});

selectEstado.addEventListener("change", () => {
    cleanChart(Chart.getChart(ctx));
    cleanOptions(selectCidade);
    cleanOptions(selectAno);
    fillOptions(selectEstado, selectCidade, CITIES, "code", getFirstTwoDigits);
});

selectCidade.addEventListener("change", () => {
    cleanChart(Chart.getChart(ctx));
    cleanOptions(selectAno);
    fillOptions(selectCidade, selectAno, YEARS, "");
});

printMapChart(myMapChart);

// print map chart
function printMapChart(myMapChart, map = "BRAZIL") {

    var d, jb;
    if (map === "BRAZIL") {
        d = STATES.map((state) => { return { "hc-a2": state.acron, "value": state.total }});
        jb = "hc-a2";
    } else {
        d = eval(map).features.map((city) => {
            var count = 0;
            var sum = 0;
            for (var i = 0; i < YEARS.length; i++) {
                if (INDEXED_DATA[city.properties.name] && INDEXED_DATA[city.properties.name][YEARS[i].name]) {
                    var totalDoAno = INDEXED_DATA[city.properties.name][YEARS[i].name];
                    if (totalDoAno[11]) {
                        count++;
                        sum += totalDoAno[11];
                    }
                }
            }
            sum = sum / count;
            return { "name": city.properties.name, "value": sum.toFixed(2) }
        });
        jb = "name";
    }

    document.getElementById("bt-voltar").style.display = "none";

    if (myMapChart) myMapChart.destroy();

    myMapChart = Highcharts.mapChart('map-container', {

        title: { text: 'Vacinação por Estado' },
        subtitle: { text: '' },

        mapNavigation: {
            enabled: true,
            buttonOptions: { verticalAlign: 'bottom' }
        },

        colorAxis: { 
        min: 1,
            max: 200,
            
            stops: [
                [0.1, '#FF0000'],
                [0.3, '#FC6600'],
                [0.5, '#FFFF00'],
                [0.7, '#4ce825'],
                [0.9, '#1f8c15']
            ],
            marker: {
                color: '#323'
            }
        },
        series: [{
            data: d,
            joinBy: jb,
            mapData: eval(map),
            allAreas: true,
            name: 'Percentual de vacinação',
            dataLabels: {
                enabled: true,
                format: '{point.name}'
            },
            point: {
                events: {
                    click: function () {
                        if (map === "BRAZIL") {
                            STATES.forEach((state) => {
                                if (state.name === this.name) {
                                    printMapChart(myMapChart, state.acron);
                                    document.getElementById("bt-voltar").style.display = "block";
                                    selectByCode(selectRegiao, String(state.code).substring(0, 1));
                                    selectByCode(selectEstado, String(state.code).substring(0, 2));
                                }
                            });
                        } else {
                            eval(map).features.forEach((city) => {
                                if (city.properties.name === this.name) {
                                    selectByCode(selectCidade, String(city.properties.id));
                                }
                            });
                        }
                    }
                }
            }
        }]
        
    });
}

// print chart
function printChart(chart) {
    
    let regiaoSelecionada = selectRegiao.options[selectRegiao.selectedIndex].text;
    let estadoSelecionado = selectEstado.options[selectEstado.selectedIndex].text;
    let cidadeSelecionada = selectCidade.options[selectCidade.selectedIndex].text;
    let anoSelecionado = selectAno.options[selectAno.selectedIndex].text;
    
    if (regiaoSelecionada && estadoSelecionado
            && cidadeSelecionada && anoSelecionado) {
        
        cleanChart(Chart.getChart(ctx));

        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: VACCINES.map((vac) => vac.name),
                datasets: [{
                    label: 'Percentual de Vacinação',
                    data: INDEXED_DATA[cidadeSelecionada][anoSelecionado],
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(75, 192, 192)',
                        'rgb(255, 205, 86)',
                        'rgb(201, 203, 207)',
                        'rgb(54, 162, 235)',
                        'rgb(31, 120, 50)',
                        'rgb(95, 105, 207)',
                        'rgb(255 122 127 / 80%)',
                        'rgb(30% 20% 10%)',
                        'rgb(162,235,54)',
                        'rgb(235,127,54)',
                        'rgb(30% 20% 50%)'
                      ],
                      borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(255, 159, 64)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)',
                        'rgb(201, 203, 207)'
                      ],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}


printHistogram(myHistogram);

function printHistogram(myHistogram) {
        const ctx = document.getElementById('histogram').getContext('2d');

        var year4in4 = [];
    
             for (var i = 0; i < YEARS.length; i = i + 4) {
                 var max = i + 4;
                
                 if (max > YEARS.length) {
                     max = YEARS.length;
                 }
        
                 var avg = 0.0;
                
                 for (var j = i; j < max; j++) {
                     avg = (avg + YEARS[j].total) / 2
                 }
                 year4in4.push(parseInt(avg * 100) / 100);
             }
        
             var arr = [];
        
             for (var i =0; i < YEARS.length; i = i + 4) {
                 arr.push(YEARS[i].name);
             }

myHistogram = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ["2000/2023", "2024/2007", "2008/2011", "2012/2015", "2016/2020"],
    datasets: [{
      label: 'Percentual de Vacinações',
      data: year4in4,
      backgroundColor: [
                     'rgba(255, 99, 132, 0.2)',
                     'rgba(255, 159, 64, 0.2)',
                     'rgba(255, 205, 86, 0.2)',
                     'rgba(75, 192, 192, 0.2)',
                     'rgba(54, 162, 235, 0.2)',
                     'rgba(153, 102, 255, 0.2)',
                     'rgba(201, 203, 207, 0.2)'
                   ],
                   borderColor: [
                     'rgb(255, 99, 132)',
                     'rgb(255, 159, 64)',
                     'rgb(255, 205, 86)',
                     'rgb(75, 192, 192)',
                     'rgb(54, 162, 235)',
                     'rgb(153, 102, 255)',
                     'rgb(201, 203, 207)'
                   ],
                   barPercentage: 1,
                   categoryPercentage:1,
    }]
  },
  options: {
    scales: {
      xAxes: [{
        display: false,
        barPercentage: 1.3,
        ticks: {
          max: 3,
        }
      }, {
        display: true,
        ticks: {
            
          autoSkip: false,
          max: 4,
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  }
});
};

//histograma
// function printhistogram(myhistogram) {
    
//     const ctx = document.getElementById('histogram').getContext('2d');

//     var year4in4 = [];
    
//     for (var i = 0; i < YEARS.length; i = i + 4) {
//         var max = i + 4;
        
//         if (max > YEARS.length) {
//             max = YEARS.length;
//         }

//         var avg = 0.0;
		
//         for (var j = i; j < max; j++) {
//             avg = (avg + YEARS[j].total) / 2
//         }
//         year4in4.push(parseInt(avg * 100) / 100);
//     }

//     var arr = [];

//     for (var i =0; i < YEARS.length; i = i + 4) {
//         arr.push(YEARS[i].name);
//     }

//     myhistogram = new Chart(ctx, {
//       type: 'bar',
//       data: {
//         labels: ["2000,2020"],
//         datasets: [{
//           data: year4in4,
//           backgroundColor: [
//             'rgba(255, 99, 132, 0.2)',
//             'rgba(255, 159, 64, 0.2)',
//             'rgba(255, 205, 86, 0.2)',
//             'rgba(75, 192, 192, 0.2)',
//             'rgba(54, 162, 235, 0.2)',
//             'rgba(153, 102, 255, 0.2)',
//             'rgba(201, 203, 207, 0.2)'
//           ],
//           borderColor: [
//             'rgb(255, 99, 132)',
//             'rgb(255, 159, 64)',
//             'rgb(255, 205, 86)',
//             'rgb(75, 192, 192)',
//             'rgb(54, 162, 235)',
//             'rgb(153, 102, 255)',
//             'rgb(201, 203, 207)'
//           ],
//           barPercentage: 1,
//           categoryPercentage:1,

//         }]
//       },
//       options: {
       
//         scales: {
//             x: {
//                 type: 'linear',
//                 offset: false,
//                 grid: {
//                   offset: false
//                 },
//                 ticks: {
//                   stepSize: 1
//                 },
//                 title: {
//                   display: true,
//                   text: 'Anos',
//                   font: {
//                       size: 14
//                   }
//                 }
//             }, 
//             y: {
//                 // beginAtZero: true
//                 title: {
//                   display: true,
//                   text: 'Vacinações',
//                   font: {
//                       size: 14
//                   }
//                 }
//             }
//         }
//       }
//     });
// }



printPolarChart(myPolarChart);

function printPolarChart(myPolarChart) {
    const ctx = document.getElementById('polarchart').getContext('2d');
    myPolarChart = new Chart(ctx, {
            type: 'polarArea',
            data: {
            labels: STATES.map((estado) => estado.name),
              datasets: [{
                label: 'Gráfico Polar',
                data: STATES.map((estado) => estado.total),
                backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(75, 192, 192)',
                'rgb(255, 205, 86)',
                'rgb(201, 203, 207)',
                'rgb(54, 162, 235)',
                'rgb(31, 120, 50)',
                'rgb(95, 105, 207)',
                'rgb(255 122 127 / 80%)',
                'rgb(30% 20% 10%)',
                'rgb(162,235,54)',
                'rgb(235,127,54)',
                'rgb(30% 20% 50%)'
                ]
              }]
            },
            options: {}

})
}

function cleanOptions(el) {
    while (el.options.length > 1) el.remove(1);
}

function fillOptions(el, target, objArrToCompare, propToCompare, functionToCompareCallback) {
    if (el === target || el.value) {
        var val;
        objArrToCompare.forEach((obj) => {
            if (propToCompare) {
                val = functionToCompareCallback ? functionToCompareCallback(obj[propToCompare]) : obj[propToCompare];
            }
            if (!propToCompare || (propToCompare && el.value == val)) {
                var novaOpcao = new Option(String(obj.name), String(obj.code));
                target.add(novaOpcao, undefined);
            }
        });
        target.disabled = false;
    } else {
        target.disabled = true;
    }
}

function getFirstTwoDigits(str) {
    return String(str).substring(0, 2);
}

function selectByCode(el, code) {
    if (el) {

        var opts = el.getElementsByTagName("option");
        
        if (opts && opts.length > 0) {
            
            for (var i= 0; i < opts.length; i++) {
                
                if (opts[i].value === code) {
                    
                    opts[i].selected = "selected";
                    var e = new Event("change");
                    el.dispatchEvent(e);
                }
            }
        }
    }
}

// limpa um gráfico se ele existir
function cleanChart(chart) {
    if (chart) chart.destroy();
}