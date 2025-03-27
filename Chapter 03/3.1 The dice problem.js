///////////////////////////////////////////////////////////////////////////////
// 3.1 The dice problem
//
// Suppose I have a box of dice that contains a 4-sided die,
//                                            a 6-sided die,
//                                           an 8-sided die,
//                                           a 12-sided die, and
//                                           a 20-sided die.
// Suppose I select a die from the box at random, roll it, and get a 6.
// What is the probability that I rolled each die?

(function() {

	class Simulate extends Suite
	{
		probMasses = {};
		simulation = {};
		nSimulations = 10000;

		constructor(hypoes, title)
		{
			super(hypoes, title);
			this.initMasses(this.probMasses, 1);
		};

		// --------- simulation --------- //

		initMasses(objMasses, prob)
		{
			for(var i = 0; i < hypoes.length; i++) {
				objMasses[ hypoes[i] ] = {"rolls": 0, "hits": 0, "unnorm": prob, "prob": prob };
			}
		};

		singleEvent(n, data, simulation)
		{
			var aDie = Math.floor( hypoes.length * Math.random() );
			aDie = hypoes[aDie];
			var aRoll = 1 + Math.floor( aDie * Math.random() );
			simulation[aDie].rolls += 1;
			if (aRoll == data)
			{
				simulation[aDie].hits += 1;
				simulation[aDie].unnorm = simulation[aDie].hits / n ;
			}
		};

		Experiment(N, data)
		{
			N = (typeof N !== 'number') ? this.nSimulations : N;
			this.nSimulations = N;

			this.initMasses(this.simulation, 0);

			for(var i=0; i < N; i++)
			{
				this.singleEvent(i + 1, data, this.simulation);
			}

			for(var h in this.probMasses)
			{
				this.probMasses[h].rolls += this.simulation[h].rolls;
				this.probMasses[h].hits += this.simulation[h].hits;
				this.probMasses[h].unnorm *= this.simulation[h].unnorm;
			}

			// normalize probMasses
			var total = 0; for(var h in this.probMasses) { total += this.probMasses[h].unnorm; }
			for(var h in this.probMasses) this.probMasses[h].prob = this.probMasses[h].unnorm / total;
		};

		Simulation()
		{
			return this.probMasses;
		};

		SimulationPrint(title, data)
		{
			var s = "<dt>" + title + " (" + this.nSimulations + " <i>simulations</i>):</dt>";
			for( var x in this.probMasses )
			{
				s += "<dd>P(<b>" + x + "|" + data + "</b>) = " + this.probMasses[x].prob + ";</dd>"
			}
			s += "<br/>" ;

			console.log( this.titleSlug, this.probMasses );
			this.msgDiv.innerHTML += s;
		};
	}

	class Dice extends Suite
	{
		constructor(hypoes, title)
		{
			super(hypoes, title);
		};

		Likelihood(data, hypo)
		{
			if (hypo < data) return 0;
			else return 1 / hypo;
		};
	}

	// -------------------- test -------------------- //

	var title = "3.1 The dice problem";
	var hypoes = [4, 6, 8, 12, 20];
	var dice  = new Dice(hypoes, title);
	var suite = new Simulate(hypoes, title);

	// var rolls = [6];
	var rolls = [6, 6, 8, 7, 7, 5, 4];
	var N = 100000;

	for(var i = 0; i < rolls.length; i++)
	{
		dice.Update( rolls[i] );
		suite.Experiment( N, rolls[i] );
	}

	dice.Print( title, rolls );
	suite.SimulationPrint( title, rolls );

})();
