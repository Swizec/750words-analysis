function draw_time(container, data, title) {
    var
    d1    = [], d2 = [], d3 = [], d4 = [],
    start = new Date(DATA[0].date).getTime(),
    options,
    graph,
    i, x, o;


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
        title : title
    };

    // Draw graph with default options, overwriting with passed options
    function drawGraph (opts) {

        // Clone the options, so the 'options' variable always keeps intact.
        o = Flotr._.extend(Flotr._.clone(options), opts || {});

        // Return a new graph.
        return Flotr.draw(
            container,
            data,
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
    Flotr.EventAdapter.observe(container, 'flotr:click', function () { graph = drawGraph();});
}

function collect (key, normalize) {
        var _data = Flotr._.map(DATA,
                    function (d) {
                       return [new Date(d.date).getTime(),
                               (normalize) ? d[key]/d.words : d[key]];
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

(function types_time(container) {
    var
    d1 = collect('bad_words', false),
    d2 = collect('sad_words', false),
    d3 = collect('happy_words', false),
    d4 = collect('food_words', false);

    draw_time(container, [{data: d1, label: 'Cursewords'},
                          {data: d2, label: 'Sad words'},
                          {data: d3, label: 'Happy words'},
                          {data: d4, label: 'Food words'}],
              'Word types used (14 day running window)');

})(document.getElementById("word-types"));

(function words(container) {
    var
    d5 = collect('sex_words', false),
    d6 = collect('tea_words', false);

    draw_time(container, [
                          {data: d5, label: '"Sex"'},
                          {data: d6, label: '"Tea"'}],
              'Two important words (14 day running window)');

})(document.getElementById("words"));

(function length(container) {
    var
    d1 = collect('words', false);

    draw_time(container, [{data: d1, label: 'N words'}],
              'Length (14 day running window)');

})(document.getElementById("length"));

(function length(container) {
    var
    d1 = collect('minutes', false);

    draw_time(container, [{data: d1, label: 'Minutes'}],
              'Minutes spent writing (14 day running window)');

})(document.getElementById("time"));
