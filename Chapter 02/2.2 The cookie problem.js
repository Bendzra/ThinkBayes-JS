////////////////////////////////////////
// 2.2 The cookie problem

var pmf = new Pmf();

// the prior distribution:
pmf.Set('Bowl 1', 0.5);
pmf.Set('Bowl 2', 0.5);

// The likelihood of drawing a vanilla cookie from 'Bowl 1' is 3/4.
// The likelihood for 'Bowl 2' is 1/2.
pmf.Mult('Bowl 1', 0.75);
pmf.Mult('Bowl 2', 0.5);

pmf.Normalize();

console.log( "2.2 The cookie problem", pmf.GetDict() );
messageDiv.innerHTML += "<dt>2.2 The cookie problem: </dt>";
messageDiv.innerHTML += ""
		+ "<dd>P(<b>Bowl 1|" + "vanilla" + "</b>) = " + pmf.Prob('Bowl 1') + ";</dd>"
		+ "<dd>P(<b>Bowl 2|" + "vanilla" + "</b>) = " + pmf.Prob('Bowl 2') + ";</dd><br/>" ;
