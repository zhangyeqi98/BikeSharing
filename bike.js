//-------------------------- 配置信息 start --------------------------
        var options = {
            width: 960,
            height: 600,
            margins: {
                left: 80,
                right: 40,
                top: 40,
                bottom: 80
            },
            xAxis: {
                ticks: 20,
                name: "date",     // X轴坐标字段
                title: "Date"     // X轴坐标名称
            },
            yAxis: {
                name: "",     // Y轴坐标字段
                title: "Count"     // Y轴坐标名称
            }
        };
        //-------------------------- 配置信息 end --------------------------
        var margins = options.margins;
        var width = options.width - margins.left - margins.right;
        var height = options.height - margins.top - margins.bottom;
        var xAxisName = options.xAxis.name;
        var xAxisTitle = options.xAxis.title;
        var yAxisName = options.yAxis.name;
        var yAxisTitle = options.yAxis.title;
        var xTicks = options.xAxis.ticks;
        var valueNameList = [
            { name: "registered", show: true },
            { name: "casual", show: true },
            { name: "total", show: true }
        ];
        var datalist = [];
        var currentYear = "all";

        var svg = d3.select("#chart")
            .append('svg')
            .attr('width', width + margins.left + margins.right)
            .attr('height', height + margins.top + margins.bottom)
            .append("g")
            .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

        var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        let scale = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        // 坐标轴
        var xAxis = d3.axisBottom().scale(scale);
        var yAxis = d3.axisLeft().scale(y);

        // 绘制坐标轴
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height) + ")")
            .call(xAxis)
            .append("text")
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            ;
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            ;
        // 绘制X轴标题
        var xaxisLeft = (width - xAxisTitle.length * 10) + 10;
        svg.append("g")
            .attr("class", "x-axis-title")
            .attr("transform", "translate(" + xaxisLeft + "," + (height + 40) + ")")
            .append("text")
            .text(xAxisTitle)
            ;

        //  绘制Y轴标题
        svg.append("g")
            .attr("class", "y-axis-title")
            .attr("transform", "translate(-50," + (yAxisTitle.length * 8 + 10) + ")")
            .append("text")
            .style("transform", "rotate(-90deg)")
            .text(yAxisTitle);

        d3.select(".filter-box")
            .selectAll(".legend")
            .data(valueNameList)
            .join("span")
            .text(d => d.name)
            .style("color", d => colorScale(d.name))
            .on("click", function (evt,d) {
                if (d.show) {
                    d3.select(this).style("color", "#ccc");
                }
                else {
                    d3.select(this).style("color", colorScale(d.name));
                }
                d.show = !d.show;
                update();
            });
        d3.select("#year-list")
            .on("change", function () {
                currentYear = this.value;
                update();
            })
        function update() {
            var sublist = currentYear === "all"
                ? datalist : datalist.filter(e => e.date.getFullYear() === currentYear * 1);
            var minDate = d3.min(sublist, function (d) { return d.date; });
            var maxDate = d3.max(sublist, function (d) { return d.date; });
            scale.domain([minDate, maxDate]);
            xAxis.scale(scale).tickFormat(function (d) {
                return `${d.getFullYear()}-${d.getMonth() + 1}`;
            });
            svg.select(".x.axis").call(xAxis);

            valueNameList.forEach(function (item) {
                if (item.show) {
                    //创建一个直线生成器
                    var linePath = d3.line()
                        .x(function (d) {
                            return scale(d.date);
                        })
                        .y(function (d) {
                            return y(d[item.name]);
                        });
                    //添加路径
                    svg.selectAll(".line-path-" + item.name) //选择<svg>中所有的<path>
                        .data([sublist]) //绑定数据
                        .join("path") //添加足够数量的<path>元素
                        .attr("class", "line-path-" + item.name)
                        .attr("d", linePath)
                        .attr("fill", "none")
                        .attr("stroke-width", 1)
                        .attr("stroke", function (d, i) {
                            return colorScale(item.name);
                        });
                }
                else {
                    svg.selectAll(".line-path-" + item.name).remove();
                }
            });
        }

        function handle(data) {
            var max = 0;
            data.forEach(function (item) {
                valueNameList.forEach(function (p) {
                    item[p.name] = item[p.name] * 1;
                    max = Math.max(max, item[p.name]);
                });
                item.date = new Date(item.date);
            });
            var minDate = d3.min(data, function (d) { return d.date; });
            var maxDate = d3.max(data, function (d) { return d.date; });
            scale.domain([minDate, maxDate]);
            xAxis.scale(scale).tickFormat(function (d) {
                return `${d.getFullYear()}-${d.getMonth() + 1}`;
            });
            svg.select(".x.axis").call(xAxis);

            y.domain([0, max * 1.1]);
            yAxis.scale(y);
            svg.select(".y.axis").call(yAxis);
            datalist = data;
            update();
        }
        handle(data);

        // 在本地建立Web服务才可以直接加载d3_data.csv
        // 现在已经将数据整理到data.js里，所以这段代码注释掉
        //d3.csv("d3_data.csv").then(function (data) {
        //    handle(data);
        //});