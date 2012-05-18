(function basic_time(container) {

    var
    d1    = [], d2 = [], d3 = [], d4 = [],
    start = new Date(DATA[0].date).getTime(),
    options,
    graph,
    i, x, o;

    var collect = function (key) {
        var _data = Flotr._.map(DATA,
                    function (d) {
                       return [new Date(d.date).getTime(),
                               d[key]];
                    });
        return Flotr._.map(Flotr._.range(0, _data.length, 14),
                           function (i) {
                               var win = Flotr._.map(Flotr._.range(i, i+14),
                                                     function (i) {
                                                         return _data[i];
                                                     }).filter(function (a) {
                                                         return typeof(a) != 'undefined';
                                                     });
                               return [win[0][0],
                                       Flotr._.reduce(Flotr._.map(win,
                                                                  function (w) {
                                                                      return w[1];}),
                                                      function (a,b) { return a+b; })/14.0];
                           });

    };

    d1 = collect('bad_words');
    d2 = collect('sad_words');
    d3 = collect('happy_words');
    d4 = collect('sex_words');

    options = {
        xaxis : {
            mode : 'time',
            labelsAngle : 45
        },
        selection : {
            mode : 'x'
        },
        legend: {
            position: 'se'
        },
        HtmlText : false,
        title : 'Word types used (14 day running window)'
    };

    // Draw graph with default options, overwriting with passed options
    function drawGraph (opts) {

        // Clone the options, so the 'options' variable always keeps intact.
        o = Flotr._.extend(Flotr._.clone(options), opts || {});

        // Return a new graph.
        return Flotr.draw(
            container,
            [{data: d1, label: 'Cursewords'},
             {data: d2, label: 'Sad words'},
             {data: d3, label: 'Happy words'},
             {data: d4, label: 'Sex'}],
            options
        );
    }

    graph = drawGraph();

    Flotr.EventAdapter.observe(container, 'flotr:select', function(area){
        // Draw selected area
        graph = drawGraph({
            xaxis : { min : area.x1, max : area.x2, mode : 'time', labelsAngle : 45 },
            yaxis : { min : area.y1, max : area.y2 }
        });
    });

    // When graph is clicked, draw the graph with default area.
    Flotr.EventAdapter.observe(container, 'flotr:click', function () { graph = drawGraph(); });
})(document.getElementById("length-time"));
