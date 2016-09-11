"use strict";
console.info("Up and running!");
const COLORS = {
    AXIS: "#C6C6C6",
    BACKGROUND: "#FFFFFF",
    GRAPH_POINT: "#999999",
    GRAPH_LINE: "#BBBBBB"
};
const RADIUS = 6;
const RENDER_SPEED = {
    POINT: 500,
    LINE: 1000,
};

$(function(){

    var GraphRenderer = {
        init: function(context, options){
            this.context = context;
            this.x = options.paddingSize;
            this.y = options.height - options.paddingSize;
            this.width = options.width - options.paddingSize * 2;
            this.height = options.height - options.paddingSize * 2;
            this.paddingSize = options.paddingSize;

            this.drawGraphAxis();
        },
        drawGraphAxis: function(){
            this.context.strokeStyle = COLORS.AXIS;
            this.context.beginPath();
            this.context.moveTo(this.x - this.paddingSize/2, this.y);
            this.context.lineTo(this.x + this.width, this.y); 
            this.context.stroke();

            this.context.beginPath();
            this.context.moveTo(this.x, this.y + this.paddingSize/2);
            this.context.lineTo(this.x, this.y - this.height); 
            this.context.stroke();
        },
        animatedPoint: function(options){
            options.percent += 0.1;
            this.context.strokeStyle = options.color; 
            this.context.fillStyle = COLORS.BACKGROUND;
            this.context.lineWidth = options.lineWidth;
            this.context.beginPath();
            this.context.arc(options.x, options.y, options.radius, 0, 2 * Math.PI * options.percent);
            this.context.stroke();
            this.context.fill();

            if(options.percent<1){
                setTimeout( x => GraphRenderer.animatedPoint(options), RENDER_SPEED.POINT/10);
            } else {
                options.onFinished();
            }
        },
        animateLine: function(options){
            var vector = {
                x: options.to.x - options.from.x,
                y: options.to.y - options.from.y
            };
            var length = calculateVectorLength(vector.x, vector.y);
            var startModifier = RADIUS;
            var modifier = Math.max(Math.abs(vector.x), Math.abs(vector.y));
            vector.x = vector.x / modifier;
            vector.y = vector.y / modifier;

            GraphRenderer.drawLine({
                vector: {x: vector.x, y: vector.y},
                point: {
                    x: options.from.x + vector.x * startModifier, 
                    y: options.from.y + vector.y * startModifier},
                endPoint: {
                    x: options.to.x ,
                    y: options.to.y },
                modifier: modifier,
                color: options.color,
                onFinished: options.onFinished || (()=> console.info("done"))
            });
        },
        drawLine: function(options){ 
            this.context.strokeStyle = options.color;
            this.context.lineWidth = 2;
            this.context.beginPath();
            this.context.moveTo(
                options.point.x + 0.5, 
                options.point.y + 0.5
            );


            options.point.x = options.point.x + options.vector.x * 5;
            options.point.y = options.point.y + options.vector.y * 5;

            this.context.lineTo(
                options.point.x + 0.5,
                options.point.y + 0.5
            );
            this.context.stroke();

            if(!GraphRenderer.isLineFinished(options)){
                setTimeout( x => GraphRenderer.drawLine(options), RENDER_SPEED.LINE/options.modifier);
            } else {
                options.onFinished();
            }
        },
        isLineFinished: function(options){
            var result = false;

            if((options.vector.x > 0 && options.point.x >= options.endPoint.x) || 
                (options.vector.x < 0 && options.point.x <= options.endPoint.x)){
                result = true;
            }

            if((options.vector.y > 0 && options.point.y >= options.endPoint.y) || 
                (options.vector.y < 0 && options.point.y <= options.endPoint.y)){
                result = true;
            }

            return result;
        },
        renderGraph: function(options){
            options.data = options.data.map(function(item){
                return {x:GraphRenderer.x + item.x*20, y: GraphRenderer.y - item.y*20}
            });
            GraphRenderer.drawGraph(options);
        },
        drawGraph: function(options){
            var [nextItem,...newList] = options.data;
            var options = Object.assign({lineColor:COLORS.GRAPH_LINE, pointColor:COLORS.GRAPH_POINT}, options);

            var drawPoint = ()=>{   
                GraphRenderer.animatedPoint({
                    x: nextItem.x ,
                    y: nextItem.y ,
                    percent:0,
                    lineWidth: 6,
                    radius: 3,
                    color: options.pointColor,
                    onFinished: function(){
                        if(newList.length > 0){
                            Object.assign(options, {data:newList, lastPoint: {x: nextItem.x, y: nextItem.y}});
                            GraphRenderer.drawGraph(options);
                        }
                    }
                });
            };

            if(options.lastPoint!==undefined){
                GraphRenderer.animateLine({
                    to: {x: nextItem.x, y: nextItem.y },
                    from: {x: options.lastPoint.x , y: options.lastPoint.y },
                    color: options.lineColor,
                    onFinished: drawPoint
                });
            }else{
               drawPoint();
            }
        }
    };

    var canvas = $("#canvas").get(0);
    var context = canvas.getContext("2d");

    canvas.width = 400;
    canvas.height = 300;

    var calculateVectorLength = (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)); 
    var nf = x => x;

    GraphRenderer.init(context, {paddingSize: 20, width: canvas.width, height: canvas.height});

    var dataPoints1 = [
        {x:0, y:0},
        {x:1, y:2},
        {x:2, y:4},
        {x:3, y:10},
        {x:4, y:2},
        {x:5, y:2},
        {x:6, y:12}
    ];

    GraphRenderer.renderGraph({data: dataPoints1 });

    var dataPoints2 = [
        {x:0, y:10},
        {x:1, y:5},
        {x:2, y:4},
        {x:3, y:3},
        {x:4, y:10},
        {x:5, y:3},
        {x:6, y:0}
    ];

    GraphRenderer.renderGraph({
        data: dataPoints2, 
        lineColor: "#F90400", 
        pointColor: "#A50500"
    });

});



