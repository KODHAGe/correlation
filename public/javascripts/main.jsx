var pages = [{title:"Correlation != Causation", text:"Correlation != Causation is an application highlighting the age old rule of never reading too much into the relationship of two graphs without understanding what the graphs represent. It randomly scourges through the World Bank database of indicators until it finds two time series that correlate with a coefficient of 0.8 or more. Simple? Very.", buttontext:"This here button sets off the adventure. It'll take a while (and theres's no loading screen)."}]

var Intropage = React.createClass({
  render: function() {
    return (     
       <div>
        <h1>{this.props.title}</h1>
        <p>{this.props.text}</p>
       </div>
    )
  }
});

var Nextbutton = React.createClass({
  render: function() {
    return (
        <button className="btn-large" onClick={e => this.handleClick()}>
         {this.props.text}
        </button>
      )
  },
  handleClick: function(){
    //ReactDOM.render(<ChartHolder title="Cool stuff" />, document.getElementById('app'));
    fetch('/',{headers:{'Content-Type':'application/json'}}).then(function(response){
      response.json().then(function(ret){
        console.log(ret);
        var data = {
          labels: ['2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015'],
          series: [ret.result.set1, ret.result.set2]
        }
        var options = {low:0, fullWidth: true, chartPadding: {right: 40, left:40},lineSmooth: Chartist.Interpolation.cardinal({tension: 0.2})};
        console.log(data);
        var apiurl1 = 'http://api.worldbank.org/countries/'+ret.result.country1+'/indicators/'+ret.result.dataset1+'?format=json';
        var apiurl2 = 'http://api.worldbank.org/countries/'+ret.result.country2+'/indicators/'+ret.result.dataset2+'?format=json';
        var link1 = 'http://data.worldbank.org/indicator/'+ret.result.dataset1+'?locations='+ret.result.country1;
        var link2 = 'http://data.worldbank.org/indicator/'+ret.result.dataset2+'?locations='+ret.result.country2;
        $.ajax({
          type:"POST",
          url:'funnel/',
          contentType:'application/json',
          data:JSON.stringify({'url':apiurl1}),
          success: function(res){
            console.log("result",res);
            var country1 = res[1][0].country.value;
            var indicator1 = res[1][0].indicator.value;
            $.ajax({
              type:"POST",
              url:'funnel/',
              contentType:'application/json',
              data:JSON.stringify({'url':apiurl2}),
              success: function(res){
                console.log("result",res);
                var country2 = res[1][0].country.value;
                var indicator2 = res[1][0].indicator.value;
                ReactDOM.render(<ChartHolder data={data} options={options} title="Cool stuff" country1={country1} indicator1={indicator1} country2={country2} indicator2={indicator2} link1={link1} link2={link2}/>, document.getElementById('app'));
              }
            });
          }
        });
      });
    });

  }
})

var Textclass = React.createClass({
  render: function() {
    return (     
       <div className="holder">
        <h1>{this.props.title}</h1>
        <p className="intro">{this.props.text}</p>
        <Nextbutton text={this.props.buttontext}/>
        <p className="info">
          Definitely inspired by <a href="http://www.tylervigen.com/spurious-correlations">Tyler Vigen</a> and <a href="https://www.google.com/trends/correlate">Google Correlate</a>.
          <br/>
          And check out <a href="http://rpsychologist.com/d3/correlation/">Interpreting Correlations</a> as well.
        </p>
        <p>
          Created as part of DOM-E2100, Information Design I @ Aalto University, 2016
        </p>
       </div>
    )
  },
  handleClick: function(){
  }
});

var ChartHolder = React.createClass({
  render: function(){
   return(
    <div className="holder">
    <h1>Correlation != Causation</h1>
    <LineGraph data={this.props.data} options={this.props.options}/>
    <p className="result-p country-1">{this.props.indicator1} in {this.props.country1} (<a href={this.props.link1}>source</a>)</p>
    <p className="result-p divider">correlates with</p>
    <p className="result-p country-2">{this.props.indicator2} in {this.props.country2} (<a href={this.props.link2}>source</a>)</p>
    </div>
    )
  }
});

var LineGraph = React.createClass({
  render: function(){
    return (
      <div className={'ct-chart'} ref='chart' />
    )
  },
  componentWillReceiveProps: function(){
    this.updateChart(this.props.data, this.props.options)
  },
  componentDidMount: function(){
    this.updateChart(this.props.data, this.props.options)
  },
  updateChart: function (data, options){
    console.log("hello");
    //console.log(data);
    var seq = 0,
        delays = 80,
        durations = 1000;

    var chart = new Chartist.Line('.ct-chart', data, options);
    chart.on('created', function() {
      seq = 0;
    });
    chart.on('draw', function(data) {
      seq++;
        if(data.type === 'line') {
          // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
          data.element.animate({
            opacity: {
            // The delay when we like to start the animation
            begin: 100,
            // Duration of the animation
            dur: durations,
            // The value where the animation should start
            from: 0,
            // The value where it should end
            to: 1
          }
        });
      }
      if(data.type === 'grid' && data.element._node.classList[1] === 'ct-horizontal'){
        var bound = data.axis.ticks.length;
        if(data.index != 0 && data.index != bound - 1){
          data.element.remove();
        } else {
          data.element._node.y1.baseVal.value = data.y1 - 10;
          data.element._node.y2.baseVal.value = data.y2 + 5;
          console.log(data);
        }
      }
      if (data.type === 'point') {
        var circle = new Chartist.Svg('circle', {
          cx: [data.x],
          cy: [data.y],
          r: [4],
        }, 'ct-circle');
        data.element.replace(circle);
      }
    });
  }
})

ReactDOM.render(
  <Textclass title={pages[0].title} text={pages[0].text} buttontext={pages[0].buttontext}/>,
  document.getElementById('app')
);