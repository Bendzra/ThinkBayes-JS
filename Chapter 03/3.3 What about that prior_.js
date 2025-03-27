///////////////////////////////////////////////////////////////////////////////
// 3.3 What about that prior?
//
// There are two ways to proceed:
// * Get more data.
// * Get more background information.

(function () {

	class Train extends Suite
	{
		constructor(hypoes, title)
		{
			super(hypoes, title);
		};

		Likelihood(data, hypo)
		{
			if (hypo < data) return 0;
			else return 1 / hypo;
		}
	}

	// -------------------- test -------------------- //

	var title = "3.3 What about that prior?";
	console.log( title );

	var N = [500, 1000, 2000];

	for(var k = 0; k < N.length; k++)
	{
		var hypoes = new Array(N[k]); for (var i = 0; i < N[k]; i++) { hypoes[i] = i + 1; }
		var suite = new Train(hypoes, title);
		if (k == 0) suite.msgDiv.innerHTML += "</br><dt>" + title + ": </dt>" ;

		// var data = [60];
		var data = [60, 60, 30, 90];

		for(var i = 1; i < data.length; i++)
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

		console.log( "", "Upper Bound = ", N[k], "; mean = ", mean );
		suite.msgDiv.innerHTML += "<dd>" + "Upper Bound = " + N[k] + "; mean = " + mean + "</dd>" ;
	}

	/// -------------------- Sim ------------------ ///

	function sim3()
	{
		// Событие:
		// Случайно (равномерное распределение) выбираем кол-во поездов (<= MAX_TRAINS),
		// из этого кол-ва случайно выбираем поезд. Выпадет ли TRAIN?
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

		function getRandomTrainsIndex()
		{
			var index = Math.floor( MAX_TRAINS * Math.random() );
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
	}

	sim3();

})();
