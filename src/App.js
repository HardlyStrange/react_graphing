import React, { Component } from 'react';
import './App.css';
import '../node_modules/react-vis/dist/style.css';
import {XYPlot, LineSeries, VerticalBarSeries,
  VerticalGridLines, HorizontalGridLines, XAxis, YAxis} from 'react-vis';
var moment = require('moment');

/*class SideBarNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render(){
    return (
        <div className="sideBar">
          <div className="sideBarButton">
            Button
          </div>
          <div className="sideBarButton">
            Button
          </div>
          <div className="sideBarButton">
            Button
          </div>
        </div>
    )}
}*/

class StockTicker extends Component {

  componentDidMount(){
  }

  render(){

    /*So, lets calculate the prencentage change from totals[0] through totals[limit] */
    let direction = 'Flat';
    let diff = null;
    if  (typeof this.props.totals !== 'undefined' && this.props.totals){
      let lm = this.props.totals.length-1;
      let lx = this.props.totals[lm];
      let l0 = this.props.totals[0];
      if (lx > l0){
        direction = 'Up';
        let inc = lx - l0;
        diff = inc / l0 * 100;
      } else if (lx < l0){
        direction = 'Down';
        let dec = l0 - lx;
        diff = dec / l0 * 100;
      } else {
        diff = 0;
      }
    }

    return(
      <div className="stockTicker">
        Inventory
          <font color="red" size="100vw">
            ↑
          </font>
          {direction} {diff} % since last week
      </div>
    )};
}

class BigOpenChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartW: window.innerWidth/100*75,
      chartH: window.innerHeight/100*40,
    };
     this.updateChartSize = this.updateChartSize.bind(this);
     this.tickFormatterX = this.tickFormatterX.bind(this);
     /*this.tickFormatterY = this.tickFormatterY.bind(this);*/
  }
  updateChartSize(){
    let winW = window.innerWidth;
    winW = (winW/100)*75;
    let winH = window.innerHeight;
    winH = (winH/100)*20;
    this.setState({
      chartW: winW,
      chartH: winH,
    });
  }
  componentDidMount() {
    /*Adjust the chart size to the viewing window */
     window.addEventListener("resize", this.updateChartSize);
    /* call the DB and get the last 10 days of Alerts data*/
    let offenders = [];
    fetch("http://localhost:4000/countBigOffenders")
        .then(res => res.json())
        .then(res => {
                      /* For each row, build the data Object */
                      for (let [key, value] of Object.entries(res)) {
                          /*console.log(key, value);*/
                          offenders.push({
                            key: value,
                          });
                      }
                      this.setState(
                        {offenders}
                      );
    });

  }
  componentDidUpdate(){
  }
  tickFormatterY(t, i) {
    return (<tspan>
            <tspan x="0" dy="1em">{t}</tspan>
            </tspan>
    );
  }
  tickFormatterX(t, i) {
    if (typeof this.state.offenders !== 'undefined' && this.state.offenders){
      return (
        <tspan>
          <tspan textLength="-300%" x="15%" y="0" dy="2%">{t}</tspan>
        </tspan>
      );
    } else {
      return (
        <tspan>
          <tspan x="0" y="0">{t}</tspan>
        </tspan>
      );
    }
  }
  render() {

    let mydata = [
      {x: 'Loading...', y: 3000}
    ];

    if (typeof this.state.offenders !== 'undefined' && this.state.offenders){
      /*mydata=[];*/
      console.log("Offenders is real!"+this.state.offenders.length);
      mydata = [];
      for (let [,value] of Object.entries(this.state.offenders)){
        for (let [,value] of Object.entries(value)){
          if (mydata.length <= 4){
            mydata.push(
              {x: value[0], y: value[1]}
            );
          }
        };
      };
    } else {
      console.log("Offenders is not real");
    }

    return (
      <div>
        <div className="alertsSum">
          Non-Compliance Top (High) offenses (last hour):
        </div>
        <div className="worstChart">
          <XYPlot xType="ordinal" height={this.state.chartH} width={this.state.chartW}  >
            <XAxis width={1000} tickFormat={this.tickFormatterX} tickLabelAngle={-4}/>
            <YAxis width={55} />
            <VerticalBarSeries data={mydata}  barWidth={.8} color="#8c0000"/>
          </XYPlot>
        </div>
      </div>
    );
  }
}

class AlertsChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartW: window.innerWidth/100*75,
      chartH: window.innerHeight/100*20,
    };
     this.updateChartSize = this.updateChartSize.bind(this);
     this.tickFormatterX = this.tickFormatterX.bind(this);
     this.tickFormatterY = this.tickFormatterY.bind(this);
  }
  updateChartSize(){
    let winW = window.innerWidth;
    winW = (winW/100)*75;
    let winH = window.innerHeight;
    winH = (winH/100)*20;
    this.setState({
      chartW: winW,
      chartH: winH,
    });
  }
  componentDidMount() {
    /*Adjust the chart size to the viewing window */
     window.addEventListener("resize", this.updateChartSize);
    /* call the DB and get the last 10 days of Alerts data*/
    let opn = [];
    let rlvd = [];
    let dsmssd = [];
    let gdts = [];
    fetch("http://localhost:4000/countAlerts/10")
        .then(res => res.json())
        .then(res => {
                      /* For each row, build the data Object
                      for (let [key, value] of Object.entries(res)) {
                          console.log(key, value);
                      } */
                      res.forEach((e) => {
                        /*console.log("Date: "+e[0]);*/
                        gdts.push(e[0]);
                        opn.push(e[1]);
                        rlvd.push(e[2]);
                        dsmssd.push(e[3]);
                      })
                      this.setState({
                        ds: gdts,
                        oa: opn,
                        ra: rlvd,
                        da: dsmssd,
                      });
        });
  }
  componentDidUpdate(){
  }
  tickFormatterY(t, i) {
    return (<tspan>
            <tspan x="0" dy="1em">{t}</tspan>
            </tspan>
    );
  }
  tickFormatterX(t, i) {
    if (typeof this.state.ds !== 'undefined' && this.state.ds){
      var momentDate = moment(this.state.ds[i]);
      return (
        <tspan>
        <tspan x="0" dy="1vh">{momentDate.format("MM/DD")}</tspan>
        </tspan>
      );
    } else {
      return (
        <tspan>
        <tspan x="0" dy="1em">{i}</tspan>
        </tspan>
      );
    }
  }
  render() {
    /* chart will be dynamically generated based on return totals*/
    let limits = [0,5];
    let xlim = [0,5];

    if (typeof this.state.ds !== 'undefined' && this.state.ds){
        limits = [];
        xlim = [];
        limits.push(0, this.state.ds.length);
        xlim.push(this.state.ds);
    }



    let opendata = [];
    if (typeof this.state.oa !== 'undefined' && this.state.oa){
      for (let i = 0; i < this.state.oa.length; i++){
        opendata.push(
          {x: i, y: this.state.oa[i]}
        );
      }
      /*console.log(JSON.stringify(opendata));*/
    } else {
      opendata = [
        {x: 0, y: 0}
      ];
    }
    let resdata = [];
    if(typeof this.state.ra !== 'undefined' && this.state.ra){
      for (let i = 0; i < this.state.ra.length; i++){
        resdata.push(
          {x: i, y: this.state.ra[i]}
        );
      }
      /*console.log(JSON.stringify(resdata));*/
    } else {
      resdata = [
          {x: 0, y: 0}
      ];
    }
    let disdata = [];
    if(typeof this.state.da !== 'undefined' && this.state.da){
      for (let i = 0; i < this.state.da.length; i++){
        disdata.push(
          {x: i, y: this.state.da[i]}
        );
      }
      /*console.log(JSON.stringify(disdata));*/
    } else {
      disdata = [
          {x: 0, y: 0}
      ];
    }

    return (
      <div>

        <div className="alertsSum">
          <div><font color="red">demo</font> Security Alerts (Compliance Violations)</div>
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Open:&nbsp;
            {
              this.state.oa
              ? <font color="crimson">
                  {this.state.oa[0]}
                </font>
                : null
            }
          </div>
          <div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Resolved:&nbsp;
          {
            this.state.ra
            ? <font color="blue">
                {this.state.ra[0]}
              </font>
            : null
          }
          </div>
          <div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Dismissed:&nbsp;
          {
            this.state.oa
            ? <font color="orange">
                {this.state.da[0]}
              </font>
            : null
          }
         </div>
        </div>

        <div className="AlrtChart">
          <XYPlot height={this.state.chartH} width={this.state.chartW}
                  literalType={xlim} xDomain={limits}>
            <LineSeries curve={'curveMonotoneY'} color={'red'} data={opendata} />
            <LineSeries color={'blue'} data={resdata} />
            <LineSeries color={'orange'} data={disdata} />
            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis tickFormat={this.tickFormatterX} title="Over Time"/>
            <YAxis tickFormat={this.tickFormatterY} width={60} title="Alert Count"/>
          </XYPlot>
        </div>
      </div>
    );
  }
}

class InventoryChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartW: window.innerWidth/100*75,
      chartH: window.innerHeight/100*25,
    };
     this.updateChartSize = this.updateChartSize.bind(this);
     this.tickFormatterX = this.tickFormatterX.bind(this);
  }
  updateChartSize(){
   let winW = window.innerWidth;
   winW = (winW/100)*75;
   let winH = window.innerHeight;
   winH = (winH/100)*25;
   this.setState({
     chartW: winW,
     chartH: winH,
   });
  }
  componentDidMount() {
    /*Adjust the chart size to the viewing window */
     window.addEventListener("resize", this.updateChartSize);
    /* call the DB and get the last 10 days of inventory data*/
    let dtl = [];
    let to = [];
    let azl = [];
    let al = [];
    let gl = [];
    fetch("http://localhost:4000/trendSubChart/10")
        .then(res => res.json())
        .then(res => {
                      /* For each row, build the data Object */
                      res.forEach((e) => {
                        /*console.log(e[0]);*/
                        dtl.push(e[0]);
                        to.push(e[1]);
                        azl.push(e[2]);
                        al.push(e[3]);
                        gl.push(e[4]);
                      })
                      this.setState({
                        ds: dtl,
                        total: to,
                        azure: azl,
                        aws: al,
                        gcp: gl,
                       });
        });
  }
  componentDidUpdate(){
  }

  tickFormatterX(t, i) {
    if (typeof this.state.ds !== 'undefined' && this.state.ds){
      var momentDate = moment(this.state.ds[i]);
      return (
        <tspan>
        <tspan x="0" dy="1vh">{momentDate.format("MM/DD")}</tspan>
        </tspan>
      );
    } else {
      return (
        <tspan>
        <tspan x="0" dy="1em">{i}</tspan>
        </tspan>
      );
    }
  }
  render() {
    /* chart will be dynamically generated based on return totals*/
    /* Build total data from */

    let limits = [0,5];
    let xlim = [0,5];
    if (typeof this.state.ds !== 'undefined' && this.state.ds){
        limits = [];
        xlim = [];
        limits.push(0, this.state.ds.length);
        xlim.push(this.state.ds);
    }

    let totaldata = [];
    if(typeof this.state.total !== 'undefined' && this.state.total){
      /*let xln = this.state.total.length - 5;
      dlimits = [xln, this.state.total];*/
      for (let i = 0; i < this.state.total.length; i++){
        totaldata.push(
          {x: i, y: this.state.total[i]}
        );
      }
      /*console.log(JSON.stringify(totaldata));*/
    } else {
      totaldata = [
        {x: 0, y: 0}
      ];
    }
    let azuredata = [];
    if(typeof this.state.azure !== 'undefined' && this.state.azure){
      for (let i = 0; i < this.state.azure.length; i++){
        azuredata.push(
          {x: i, y: this.state.azure[i]}
        );
      }
    /*  console.log(JSON.stringify(azuredata));*/
    } else {
      azuredata = [
          {x: 0, y: 0}
      ];
    }
    let awsdata = [];
    if(typeof this.state.aws !== 'undefined' && this.state.aws){
      for (let i = 0; i < this.state.aws.length; i++){
        awsdata.push(
          {x: i, y: this.state.aws[i]}
        );
      }
      /*console.log(JSON.stringify(awsdata));*/
    } else {
      awsdata = [
          {x: 0, y: 0}
      ];
    }
    if (typeof this.state.dates !== 'undefined' && this.state.dates){
      this.state.dates.forEach((e) => {
        /*console.log(e);*/
      });
    }

    let props ={
      totals: this.state.total,
    }

    return (
      <div>
        <StockTicker {...props}/>
        <div className="InvChart">
          <div className="layOverLegend">
            <ul>
            <li><font color='teal'>Total</font></li>
            <li><font color='blue'>Azure</font></li>
            <li><font color='crimson'>Aws</font></li>
            </ul>
          </div>
          <XYPlot height={this.state.chartH} width={this.state.chartW}
              literalType={xlim} xDomain={limits}>
            <LineSeries curve={'curveMonotoneY'} color={'teal'} data={totaldata} />
            <LineSeries color={'blue'} data={azuredata} />
            <LineSeries color={'crimson'} data={awsdata} />
            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis tickFormat={this.tickFormatterX} title="Over Time"/>
            <YAxis title="Subscriptions"/>
          </XYPlot>
        </div>
      </div>
    );
  }
}

class SubSubs extends Component {
  render(){
    return (
        <div className="LittleSubs">
          <ul>
            <li>Azure: <font color='crimson'>{this.props.azures}</font></li>
            <li>Amazon Web Services: <font color='crimson'>{this.props.awss}</font></li>
            <li>Google Cloud Products: <font color='crimson'>{this.props.gcp}</font></li>
          </ul>
        </div>
    )}
}

class CurrentSubsCount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSubss: false,
    };
     this.showSubsubs = this.showSubsubs.bind(this);
  }

  componentDidMount() {
    fetch("http://localhost:4000/countSubs")
        .then(res => res.json())
        .then(res => this.setState({
                    apiResponse: res.all,
                    azures: res.azure,
                    awss: res.aws,
                    gcp: res.gcp,
        }));
    this.setState({
      now: moment().format('MMMM Do YYYY, h:mm a'),
    });
  }

  showSubsubs(){
    this.setState(prevState => ({
      showSubss: !prevState.showSubss
    }));
  }

  componentWillMount(){
  }

  render(){
    let props ={
      azures: this.state.azures,
      awss: this.state.awss,
      gcp: this.state.gcp,
    }
    return (
      <div className="AScrips" >
        <div className="timestamp">{this.state.now}</div>
        <div onMouseOver={this.showSubsubs}>
          <font color="red">demo </font>
          Onboarded Subscriptions:
        </div>
        <div align="center"><font color="crimson">{this.state.apiResponse}</font> accounts</div>
          <SubSubs {...props}/>
      </div>
  )}

}

/* This is the Main Class, so I named it "Main" because I am very creative. */
class Main extends Component {

  render() {
    /* Live update items here*/
    /* 3) Display Both*/

    return (
      <div>
        <div className="title">
          demo Numbers
        </div>
        <div className="App">
          <CurrentSubsCount />
          <div className="TScrips">
            <div>Total <font color="blue">Cloud</font> Subscriptions:</div>
            <div align="center">#</div>
          </div>
        </div>
        <div className="charts">
          <InventoryChart />
          <AlertsChart />
          {/*<BigOpenChart />*/}
          <div><p></p></div>
          <div><p></p></div>
        </div>
      </div>
    );
  }
}

/*default */
export default Main;
