// create a parser
const parser = math.parser()

let padding = 50

let domainStart;
let domainEnd;
let rangeLowest;
let rangeHighest;
let graphStart, graphEnd;

let functionInput, enterButton, errorText, areaText;

let xLabelDiff = 1;
let yLabelDiff = 1;

let range = [];
let biggerRange = [];
let iterations = 10000;

function setup() {
    createCanvas(600, 600);

    functionInput = createInput("x^2")
    enterButton = createButton("Calculate!")
    enterButton.mousePressed(calculateArea);

    lowerBoundInput = createInput("-5")
    lowerBoundInput.style("margin-left: 50px;margin-right: 10px;")
    upperBoundInput = createInput("5")


    areaText = createElement('h3', '');
    errorText = createElement('h3', 'Errors will be displayed here...');

    calculateArea()
}

function calculateArea() {
    domainStart = float(lowerBoundInput.value())
    domainEnd = float(upperBoundInput.value())
    errorText.html("Errors will be displayed here...")
    if (redrawFunction() == 1) {
        let area = 0;
        for (let i = 0; i < iterations; i++) {
            area += range[i] / iterations * (domainEnd - domainStart);
        }
        area = round(area * 100) / 100
        areaText.html(`Area is ${area}`)
    }
}

function redrawFunction() {
    try {
        parser.evaluate(`f(x) = ${functionInput.value()}`);
        let f = parser.get('f')

        rangeLowest = f(domainStart);
        rangeHighest = f(domainStart);

        //draw partial graph
        for (let i = 0; i < iterations; i++) {
            let xi = map(i, 0, iterations - 1, domainStart, domainEnd);
            range[i] = f(xi);
            if (isNaN(range[i])) {
                errorText.html("Error: Parts of the graph is undefined")
                return 0
            }
            if (rangeLowest > range[i]) {
                rangeLowest = range[i]
            } else if (rangeHighest < range[i]) {
                rangeHighest = range[i]
            }
        }


        //draw full graph
        graphStart = domainStart
        graphEnd = domainEnd
        while (map(graphStart, domainStart, domainEnd, padding, width - padding) > 0) {
            graphStart -= 1
        }
        while (map(graphEnd, domainStart, domainEnd, padding, width - padding) < width) {
            graphEnd += 1
        }

        for (let i = 0; i < iterations; i++) {
            let xi = map(i, 0, iterations - 1, graphStart, graphEnd);
            biggerRange[i] = f(xi);
            if (isNaN(biggerRange[i])) {
                errorText.html("Error: Parts of the graph is undefined")
                biggerRange[i] = biggerRange[i-1];
            }
        }

        rangeLowest = min(-1, rangeLowest)

        return 1

    } catch (error) {
        console.log(error)
        errorText.html(error)
        return 0
    }
}

function draw() {
    background(220);

    stroke(0)
    strokeWeight(2)
    let yIntercept = map(0, domainStart, domainEnd, padding, width - padding)
    line((yIntercept), 0, (yIntercept), height)
    let xIntercept = map(0, rangeLowest, rangeHighest, height - padding, padding)
    line(0, xIntercept, width, xIntercept)

    //logarithmically change the diff depending on graph size
    yLabelDiff = 10 ** (floor(log((rangeHighest - rangeLowest) / 2) / log(10)))
    xLabelDiff = 10 ** (floor(log((domainEnd - domainStart) / 2) / log(10)))

    //draw x-axis labels
    for (let i = round(domainStart); i <= domainEnd; i += xLabelDiff) {
        let integer = map(i, domainStart, domainEnd, padding, width - padding);
        line(integer, xIntercept - 5, integer, xIntercept + 5)
    }

    //draw y-axis lables
    for (let i = round(rangeLowest); i <= rangeHighest; i += yLabelDiff) {
        let integer = map(i, rangeLowest, rangeHighest, height - padding, padding);
        line(yIntercept - 5, integer, yIntercept + 5, integer)
    }

    //full graph
    noFill();
    stroke(46, 112, 179);
    strokeWeight(4);
    beginShape();
    for (let i = 0; i < biggerRange.length; i++) {
        let xx = map(i, 0, biggerRange.length - 1, padding, width - padding);
        xx = map(xx - width / 2, domainStart, domainEnd, graphStart, graphEnd) + width / 2

        let yy = map(biggerRange[i], rangeLowest, rangeHighest, height - padding, padding);
        vertex(xx, yy);
    }
    endShape();

    //shade area under graph
    noStroke()
    beginShape()
    fill(255, 0, 0, 100)
    for (let i = 0; i < range.length; i++) {
        let xx = map(i, 0, range.length - 1, padding, width - padding);
        let yy = map(range[i], rangeLowest, rangeHighest, height - padding, padding);
        vertex(xx, yy);
    }
    vertex(width - padding, xIntercept)
    vertex(padding, xIntercept)

    endShape()
}


