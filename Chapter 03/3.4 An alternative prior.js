///////////////////////////////////////////////////////////////////////////////
// 3.4 An alternative prior
//
// In fact, the distribution of company sizes tends to follow a power law

(function () {

	class Train extends Suite
	{
		constructor(hypoes, title, alpha=1)
		{
			super(hypoes, title);

			// Re-Initializes the distribution (power law)
			for(var i = 0; i < hypoes.length; i++) {
				this.Set( hypoes[i], Math.pow( hypoes[i], -alpha ) );
			}
			this.Normalize();
		};

		Likelihood(data, hypo)
		{
			if (hypo < data) return 0;
			else return 1 / hypo;
		};
	}

	// -------------------- test -------------------- //

	var title = "3.4 An alternative prior";
	console.log( title );

	var N = [500, 1000, 2000];

	for(var k = 0; k < N.length; k++)
	{
		var hypoes = new Array(N[k]); for (var i = 0; i < N[k]; i++) { hypoes[i] = i + 1; }
		var suite = new Train(hypoes, title);
		if (k == 0) suite.msgDiv.innerHTML += "</br><dt>" + title + ": </dt>" ;

		// var data = [60];
		var data = [60, 60, 30, 90];

		for (var i = 1; i < data.length; i++)
		{
			suite.Update(data[i])
		}

		function Mean(suite) {
			var mu = 0;
			for(var i = 0; i < hypoes.length; i++)
			{
				mu += suite.Prob(hypoes[i]) * hypoes[i];
			}
			return mu
		}

		var mean = Mean(suite);

		console.log("", "Upper Bound = ", N[k], "; mean = ", mean );
		suite.msgDiv.innerHTML += "<dd>" + "Upper Bound = " + N[k] + "; mean = " + mean + "</dd>" ;
	}

	/// -------------------- Sim ------------------ ///

	(function ()
	{
		// Событие:
		// Случайно (power-law распределение) выбираем кол-во поездов (<= MAX_TRAINS),
		// из этого кол-ва случайно (uniform) выбираем поезд. Выпадет ли TRAIN?
		//
		// Повторяем эксперимент REPEAT раз.


		var MAX_TRAINS = 1000;
		var TRAIN      = 60;
		var REPEAT     = 10000000;

		var trains = [];
		var hits = [];
		var countHits = 0;

		for(var i = 0; i < MAX_TRAINS; i++)
		{
			trains[i] = i + 1;
			hits[i] = 0;
		}

		function powerLawRandom(alpha=1)
		{
			// Math.random() is a number from 0 to <1
			var y = 1 - Math.random(); // excluding 0
			var offZero = 0.000000001;
			if(alpha == 1) alpha += offZero;
			var n = 1 - alpha;
			var x0 = offZero;
			var x1 = 1;
			var x =  Math.pow( ( Math.pow(x1, n) - Math.pow(x0, n) ) * y + Math.pow(x0, n), 1 / n);
			return x;
		}

		function getRandomTrainsIndex()
		{
			var index = Math.floor( MAX_TRAINS * powerLawRandom() );
			return index;
		}

		function singleEvent()
		{
			var index = getRandomTrainsIndex();
			var train = Math.ceil( trains[index] * Math.random() )
			if (train == TRAIN) { hits[index] += 1; countHits++; }
		}

		// Experiment
		for(var i = 0; i < REPEAT; i++)
		{
			singleEvent();
		}

		var xy = []; // [{"x": trains, "y": hits}, ....]
		for(var i = 0; i < MAX_TRAINS; i++)
		{
			xy[i] = { "x": trains[i], "y": hits[i] * 100 / countHits };
		}

		/// --- chart --- ///

		var chartDiv = createDiv("chart_", suite.titleSlug);
		chartDiv.style.cssText = "height: 370px; max-width: 920px; margin: 0px;";

		var chart = new CanvasJS.Chart(chartDiv.id, {
			animationEnabled: false,
			zoomEnabled: true,
			title: {
				text: title
			},
			axisX: {
				title: "Number of trains"
			},
			axisY: {
				title: "Hits",
				suffix: "%"
			},
			data: [{
				type: "line",
				dataPoints: xy
			}]
		});
		chart.render();

	}) ();

})();
