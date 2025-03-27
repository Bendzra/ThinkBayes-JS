__study0();
__study1();
__study2();
__study3();

///////////////////// prices/bids/diffs /////////////////////

function __study0(title="prices/bids/diffs") {

	const showcases = readShowcases();
	let prices1 = showcases.price1;
	let prices2 = showcases.price2;
	let bids1   = showcases.bid1  ;
	let bids2   = showcases.bid2  ;
	let diffs1  = showcases.diff1 ;
	let diffs2  = showcases.diff2 ;

	let D = {
		arrs:
		{
			"prices1": prices1,
			"prices2": prices2,
			"bids1"  : bids1,
			"bids2"  : bids2,
			"diffs1" : diffs1,
			"diffs2" : diffs2
		},
		min: {},
		max: {}
	};

	var infoDiv = createDiv( 'min_max', slugify(guid()) ) ;
	var s = `<pre><dt>${title} (<b>min_max</b>):</dt>\n`;

	for(var a in D.arrs)
	{
		var arr = D.arrs[a];

		D.min[a] = {};
		D.min[a].v = arr[0];
		D.min[a].d = {
			prices1: prices1[0],
			prices2: prices2[0],
			bids1  : bids1[0],
			bids2  : bids2[0],
			diffs1 : diffs1[0],
			diffs2 : diffs2[0]
		};

		D.max[a] = {};
		D.max[a].v = arr[0];
		D.max[a].d = {
			prices1: prices1[0],
			prices2: prices2[0],
			bids1  : bids1[0],
			bids2  : bids2[0],
			diffs1 : diffs1[0],
			diffs2 : diffs2[0]
		};

		for(var i = 1; i < arr.length; i++)
		{
			var x  = Math.abs(arr[i]);
			var mi = Math.abs(D.min[a].v);
			var ma = Math.abs(D.max[a].v);

			if( x < mi ) {
				D.min[a].v = arr[i];
				D.min[a].d.prices1 = prices1[i];
				D.min[a].d.prices2 = prices2[i];
				D.min[a].d.bids1   = bids1[i];
				D.min[a].d.bids2   = bids2[i];
				D.min[a].d.diffs1  = diffs1[i];
				D.min[a].d.diffs2  = diffs2[i];
			}
			if( x > ma ) {
				D.max[a].v = arr[i];
				D.max[a].d.prices1 = prices1[i];
				D.max[a].d.prices2 = prices2[i];
				D.max[a].d.bids1   = bids1[i];
				D.max[a].d.bids2   = bids2[i];
				D.max[a].d.diffs1  = diffs1[i];
				D.max[a].d.diffs2  = diffs2[i];
			}
		}
		// console.log( "*** min (%s) = ", a, JSON.stringify(D.min[a], null, 2) );
		// console.log( "*** max (%s) = ", a, JSON.stringify(D.max[a], null, 2) );
		s += `<dd>min(<b>${a}</b>) = <b>${D.min[a].v}</b> ${JSON.stringify(D.min[a].d, null, 2)};</dd>`;
		s += `<dd>max(<b>${a}</b>) = <b>${D.max[a].v}</b> ${JSON.stringify(D.max[a].d, null, 2)};</dd>`;
	}
	infoDiv.innerHTML += s + `</pre>`;

	let price_bids1  = new Hist(null, "player 1");
	let price_bids2  = new Hist(null, "player 2");
	let price_diffs1 = new Hist(null, "player 1");
	let price_diffs2 = new Hist(null, "player 2");

	for(var i = 0; i < prices1.length; i++)
	{
		price_bids1.Set(prices1[i], bids1[i]);
		price_bids2.Set(prices2[i], bids2[i]);
		price_diffs1.Set(prices1[i], diffs1[i]);
		price_diffs2.Set(prices2[i], diffs2[i]);
	}

	price_bids1.SortMasses();
	price_bids2.SortMasses();
	price_diffs1.SortMasses();
	price_diffs2.SortMasses();

	var plotData = [];
	chargePlot(price_bids1, plotData, "scatter", extra={markerSize:6});
	chargePlot(price_bids2, plotData, "scatter", extra={markerSize:6});
	renderPlot(title, plotData, "price_bids_test_chart_", {x:{title:"price"},y:{title:"bids"}} );

	var plotData = [];
	chargePlot(price_diffs1, plotData, "scatter", extra={markerSize:6});
	chargePlot(price_diffs2, plotData, "scatter", extra={markerSize:6});
	renderPlot(title, plotData, "price_diffs_test_chart_", {x:{title:"price"},y:{title:"diffs"}} );
}

///////////////////// testing gauss pdf /////////////////////

function __study1(title = "normal PDF") {

	var plotData = [];

	/// --------------- Normal PDF test --------------- ///

	var low = 0, high = 75000;
	var n = 101;

	var xs = [];
	for (var i = 0, prev = low, a = (high - low) / (n-1); i < n; i++, prev += a)
	{
		xs.push( parseInt(prev, 10) );
	}

	var mu = (high - low) / 2, sigma = 10000;
	var pdf = new GaussianPdf(mu, sigma);
	var pmf = pdf.MakePmf(xs, `Normal PDF: mu = ${mu}, sigma = ${sigma}`);

	logSummary(title, pmf, "summaryNormal_", "cyan");
	chargePlot(pmf, plotData, "line");

	var mu = 30299, sigma = 7134;
	var pdf = new GaussianPdf(mu, sigma);
	var pmf = pdf.MakePmf(xs, `Normal PDF: mu = ${mu}, sigma = ${sigma}`);

	logSummary(title, pmf, "summaryNormal_", "cyan");
	chargePlot(pmf, plotData, "line");

	renderPlot(title, plotData, divPrefix="chartNormal_");
}

///////////////////// testing gauss kde /////////////////////

function __study2(title="test_gauss_kde")
{

	// const dataSource = [93, 93, 96, 100, 101, 102, 102];
	const showcases = readShowcases();
	const dataSource = (showcases.price1).toSorted( (a, b) => a - b );

	var xs = [];
	var points = 1001;
	xs = spreadDots(dataSource, points);

	// var range = 20, low = 88;
	// // var range = 60000, low = 10000;
	// var step = range / (points - 1) ;
	// for (var i = 0; i < points; i++) { xs[i] = low + i * step; }

	function estimateMU(dataset)
	{
		let sum = dataset.reduce((partialSum, a) => partialSum + a, 0);
		return sum / dataset.length;
	}

	function estimateSigma(dataset, mu)
	{
		let sum = dataset.reduce((partialSum, a) => partialSum + Math.pow(a - mu, 2), 0);
		this.variance = sum / (dataset.length - 1);
		return Math.sqrt(this.variance);
	}

	function estimateBandwidth(dataset, sigma, iqr)
	{
		return 0.9 * Math.min(sigma, iqr/1.34) * Math.pow(dataset.length, -1/5);
	}

	function estimateIQR(dataset)
	{
		var l  = dataset.length;
		var r  = l % 2 ;

		var k2 = Math.floor(l / 2);
		var q2 = ( r ) ? q2 = dataset[k2] : (dataset[k2] + dataset[k2-1]) / 2;

		var k1 = Math.floor(k2 / 2);
		var q1 = 0;

		var k3 = k2 + r + k1;
		var q3 = 0;


		if (k2 % 2)
		{
			q1 = dataset[k1];
			q3 = dataset[k3];
		}
		else
		{
			q1 = (dataset[k1] + dataset[k1-1]) / 2;
			q3 = (dataset[k3] + dataset[k3-1]) / 2;
		}

		return q3 - q1;
	}

	var mu    = estimateMU(dataSource);
	var sigma = estimateSigma(dataSource, mu);
	var variance = sigma * sigma;
	var iqr   = estimateIQR(dataSource);
	var h     = estimateBandwidth(dataSource, sigma, iqr);

	console.log ("***** test_gauss_ *****\n",
			"mu = ", mu, "\n",
			"sigma = ", sigma, "\n",
			"iqr = ", iqr, "\n",
			"h = ", h, "\n"
		);

	let N = dataSource.length;
	let plotData = [];

	function gaussKDE(xi, x, h, sigma)
	{
		return ( 1 / (sigma * h * Math.sqrt(2 * Math.PI)) )
					* Math.exp ( (xi - x) * (x - xi) / (2 * sigma * h * sigma * h) ) ;
	}

	var xy2 = [];
	// var h = 1;
	var sigma = 1; // !!! (tested)

	for (var i = 0; i < xs.length; i++) {
	  var temp = 0;
	  for (var j = 0; j < dataSource.length; j++) {
	    temp = temp + gaussKDE(xs[i], dataSource[j], h, sigma);
	  }
	  xy2.push( {"x": xs[i], "y": (1 / N) * temp} );
	}

	var d = {
				type: "line",
				showInLegend: true,
				legendText: "test_gauss2",
				dataPoints: xy2
			};
	plotData.push(d);

	renderPlot(title, plotData, divPrefix="test_gauss_");

}

///////////////////// testing CDFs /////////////////////

function __study3(title="CDF-PMFs tests")
{
	var plotData = [];

	const showcases = readShowcases();
	var prices1 = showcases.price1;
	var prices2 = showcases.price2;
	let bids1   = showcases.bid1;
	let bids2   = showcases.bid2;

	var cdf_prices1 = MakeCdfFromList(prices1, "prices1");
	var cdf_prices2 = MakeCdfFromList(prices2, "prices2");

	var cdf_bids1 = MakeCdfFromList(bids1, "bids1");
	var cdf_bids2 = MakeCdfFromList(bids2, "bids2");

	chargePlot(cdf_prices1, plotData);
	chargePlot(cdf_prices2, plotData);
	chargePlot(cdf_bids1, plotData);
	chargePlot(cdf_bids2, plotData);

	renderPlot(title, plotData, "cdf_prices_bids_study3_chart_", {x:{title:"price|bid ($)"},y:{title:"CDF"}} );

	var pmf_prices1 = cdf_prices1.MakePmf("prices1");
	var pmf_prices2 = cdf_prices2.MakePmf("prices2");
	var pmf_bids1 = cdf_bids1.MakePmf("bids1");
	var pmf_bids2 = cdf_bids2.MakePmf("bids2");

	var plotData = [];
	chargePlot(pmf_prices1, plotData);
	chargePlot(pmf_prices2, plotData);
	chargePlot(pmf_bids1, plotData);
	chargePlot(pmf_bids2, plotData);

	renderPlot(title, plotData, "pmf_prices_bids_study3_chart_", {x:{title:"price|bid ($)"},y:{title:"PMF"}} );

}

