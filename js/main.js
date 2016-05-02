$(function() {
    var dataDirectory = '/yongjp94/info474/a2/viz2/data/test.csv'
    var orgData;
    
    var orgLayers;
    var currentData = [];
    
    var chart = function(data) {
        
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 1350 - margin.left - margin.right,
            height = 650 - margin.top - margin.bottom;

        var timeFormat = d3.time.format('%Y-%m-%d');

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var z = d3.scale.category20c();

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .ticks(d3.time.years);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        var stack = d3.layout.stack()
            .offset('zero')
            .order('reverse')
            .values(function(d) { return d.values; })
            .x(function(d) { return d.date; })
            .y(function(d) { return d.value; });

        var nest = d3.nest()
            .key(function(d) { return d.genre; });

        var area = d3.svg.area()
            .interpolate("linear")
            .x(function(d) { 
                return x(d.date); })
            .y0(function(d) { 
                return y(d.y0); 
            })
            .y1(function(d) { 
                return y(d.y0 + d.y); });

        var svg = d3.select('#viz').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // console.log(data);
        
        data.forEach(function(d) {
            d.date = timeFormat.parse(d.date);
            d.value = +d.value;
        });

        layers = stack(nest.entries(data));
        orgLayers = layers;
        // console.log(data);
        
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
        // console.log(layers);
        var layerSelect = svg.selectAll('.layer')
            .data(layers)
            .enter()
            .append('path')
            .attr('class', 'layer')
            .attr('d', function(d) { return area(d.values); })
            .style('fill', function(d, i) { return z(i); })
            .attr('id', function(d) {
                return d.key;
            })
            .on('mouseover', function(d, i) {
                $('#genre').text('This is: ' + d.key);
                d3.select(this).style('opacity', 0.5);
            ; })
            .on('mouseout', function(d, i) { 
                $('#genre').text('This is: ');
                d3.select(this).style('opacity', 1);
            })
            .on('click', function(d, i) {
                currentData = [];
                var thisGenre = $(this).text();
                $('#viz').empty();
                filter(thisGenre);
            });

        var toolTip = svg.selectAll('path')
            .append('svg:title')
            .text(function(d) { 
                return d.key; 
            });

        svg.append('g')
            .attr('class', 'x axis')
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
        
        return layers;
    };

    d3.csv(dataDirectory, function(error, data) {
        if (error) throw error;
        
        // console.log(data);
        
        var genres = new Set();
        genres.add('All');
        
        data.forEach(function(d) {
            var genre = d.genre;
            genres.add(genre);
        });
        
        var genreList = $('#genres');
        
        genres.forEach(function(d) {
            var li = $("<li></li>");
            li.text(d);
            li.attr('genre', d);
            li.on('mouseover', function() {
                $(this).animate({backgroundColor: '#337ab7'}, 'fast');
            }).on('mouseout', function() {
                $(this).animate({backgroundColor: '#fff'}, 150);
            }).on('click', function() {
                currentData = [];
                var thisGenre = $(this).text();
                $('#viz').empty();
                filter(thisGenre);
            });
            
            genreList.append(li);
        });
        
        orgData = data;
        var currentLayers = chart(orgData);
        
    });
    
    $('.btn').on('click', function() {
        $('#viz').empty();
        filter('All');
    });
    
    var filter = function(genre) {
        d3.csv(dataDirectory, function(error, data) {
            if (genre == 'All') {
                chart(data);
            } else {

            for (x in data) {
                if (data[x]['genre'] == genre) {
                    currentData.push(data[x]);
                }
            }
            console.log(currentData);
            chart(currentData);
            }
        });
    }
});