var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 60,
  right: 60,
  bottom: 100,
  left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .classed("chart", true)
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var allData = null;  // Store the chart data
var chosenXAxis = "poverty";  // Default initial x-axis label
var chosenYAxis = "obesity";  // Default initial y-axis label
var xAxisLabels = ["poverty", "age", "income"];  // Default 
var yAxisLabels = ["obesity", "smokes", "healthcare"];
var labelsTitle = { "poverty": "In Poverty (%)", 
                    "age": "Age (Median)", 
                    "income": "Household Income (Median)",
                    "obesity": "Obese (%)", 
                    "smokes": "Smokes (%)", 
                    "healthcare": "Lacks Healthcare (%)" };

// function used to define x/y scales and update x/y var upon click on axis label
function xScale(censusData, chosenXAxis){
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d=>d[chosenXAxis])*0.9, d3.max(censusData,d=>d[chosenXAxis])*1.1])
        .range([0,width])
    return xLinearScale; }
  
function yScale(censusData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis])*0.9, d3.max(censusData, d => d[chosenYAxis])*1.1 ])
        .range([height, 0]);
    return yLinearScale; }

 function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);     
    xAxis.transition()
        .call(bottomAxis);
    return xAxis; }
      
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
            .call(leftAxis);
    return yAxis; }

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup; }

// Function used for updating text in circles group with a transition to new text.
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circletextGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
    return circletextGroup; }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    // X Axis
    if (chosenXAxis === "poverty") {
        var xlabel = "Poverty: "; }
    else if (chosenXAxis === "income") {
        var xlabel = "Median Income: "}
    else {
        var xlabel = "Age: "}
    // Y Axis
    if (chosenYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare: "; }
    else if (chosenYAxis === "smokes") {
        var ylabel = "Smokers: "}
    else {
        var ylabel = "Obesity: "}
  
    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .style("background", "#5E238D")
    .style("color", "white")
    .offset([120, -60])
    .html(function(d) {
        if (chosenXAxis === "age") {
            // All yAxis tooltip labels presented and formated as %.
            // Display Age without format for xAxis.
            return (`${d.state}<hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
          } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
            // Display Income in dollars for xAxis.
            return (`${d.state}<hr>${xlabel}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
          } else {
            // Display Poverty as percentage for xAxis.
            return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`); }      
    });
  
    circlesGroup.call(toolTip);
    //mouseon event
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this); })
    //mouseout event
     .on("mouseout", function(data,index) {
      toolTip.hide(data)
    });
  
  return circlesGroup; }

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(censusData) {

  // parse data
  censusData.forEach(function(d) {
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    d.obesity = +d.obesity;
    d.healthcare = +d.healthcare;
    d.smokes = +d.smokes; });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create xy axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append axis to chart
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // create initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 18)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // Add text to cicles and offset to y
  var circletextGroup = chartGroup.selectAll()
    .data(censusData)
    .enter()
    .append("text")
    .text(d => (d.abbr))
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .style("font-size", "11px")
    .style("text-anchor", "middle")
    .style('fill', 'black');

    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .attr("value", "poverty") 
        .classed("active", true)
        .text("In Poverty (%)");
    
    var healthcareLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", margin.left * 2)
        .attr("y", 0 - (height + 95))
        .attr("value", "healthcare") 
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 35)
        .attr("value", "age") 
        .classed("inactive", true)
        .text("Age (Median)");

    var smokeLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", margin.left * 2)
        .attr("y", 0 - (height + 115))
        .attr("value", "smokes") 
        .classed("inactive", true)
        .text("Smokes (%)");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 55)
        .attr("value", "income") 
        .classed("inactive", true)
        .text("Household Income (Median)");

    var obesityLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", margin.left * 2)
        .attr("y", 0 - (height + 135))
        .attr("value", "obesity") 
        .classed("inactive", true)
        .text("Obesity (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
        .on("click", function() {
        // Get value of selection.
          var value = d3.select(this).attr("value");
          // console.log(value);

        //if select x axises
          if (true) {
              if (value === "poverty" || value === "age" || value === "income") {
                chosenXAxis = value;

                // Update x scale & axis for new data
                xLinearScale = xScale(censusData, chosenXAxis);
                xAxis = renderXAxes(xLinearScale, xAxis);

                // Update circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                // Update tool tip with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Update circles text with new values
                circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                // Changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);

                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true); }
                else if (chosenXAxis === "age"){
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);

                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);

                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true); }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);

                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)

                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);  }}
           else {
                    chosenYAxis = value;
            
                    // Update y scale & axis for new data
                    yLinearScale = yScale(censusData, chosenYAxis);
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    // Update circles with new values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                    // Update tool tip with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    // Update circles text with new values
                    circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                    // Changes classes to change bold text
                    if (chosenYAxis === "healthcare") {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true); }
                    else if (chosenYAxis === "smokes"){
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true); }
                    else {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);  }}}      
 });  });