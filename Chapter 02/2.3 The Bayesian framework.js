////////////////////////////////////////
// 2.3 The Bayesian framework

(function() {

	function Cookie(hypoes)
	{
		Pmf.call(this);
		function init(self, hypoes)
		{
			for(var i = 0; i < hypoes.length; i++) { self.Set(hypoes[i], 1); }
			self.Normalize();
		}

		init(this, hypoes);

		// mixes = { H1: {D1: P(D1|H1), D2: P(D2|H1) },
		//           H2: {D1: P(D1|H2), D2: P(D2|H2) } }
		var mixes = {
			'Bowl 1': {'vanilla': 0.75, 'chocolate': 0.25},
			'Bowl 2': {'vanilla': 0.5,  'chocolate': 0.5},
		}

		this.Likelihood = function(data, hypo)
		{
			/* 	The likelihood of the data (D) under the hypothesis (H) = p(D|H).
				data: string cookie type
				hypo: string bowl ID */

			var mix = mixes[hypo];
			var like = mix[data];
			return like ;
		}

		this.Update = function(data)
		{
			/* Updates each hypothesis based on the data.
			data: any representation of the data
			returns: the normalizing constant */

			for(var [hypo, prob] of this.GetDict() )
			{
				var like = this.Likelihood(data, hypo);
				this.Mult(hypo, like);
			}
			return this.Normalize();
		}
	}

	// Cookie.prototype = Object.create(Pmf.prototype);

	var hypoes = ['Bowl 1', 'Bowl 2'];
	var pmf = new Cookie(hypoes);
	var data = "chocolate";
	pmf.Update(data);

	console.log( "2.3 The Bayesian framework", pmf.GetDict() );
	messageDiv.innerHTML += "<dt>2.3 The Bayesian framework: </dt>"
							+ "<dd>P(<b>Bowl 1|" + data + "</b>) = " + pmf.Prob('Bowl 1') + ";</dd>"
							+ "<dd>P(<b>Bowl 2|" + data + "</b>) = " + pmf.Prob('Bowl 2') + ";</dd><br/>" ;

})();