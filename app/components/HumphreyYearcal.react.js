var React = require('react'),
	moment = require('moment');

module.exports = React.createClass({
	getInitialState: function () {
		return {
			year: '',
			month: ''
		}
	},
	componentDidMount: function () {
		var self = this;
		this.setState({
			year: moment(self.props.date).format('YYYY'),
			month: moment(self.props.date).format('MM')
		})
	},
	componentWillReceiveProps: function (nextProps) {
		var self = this;
		this.setState({
			year: moment(nextProps.date).format('YYYY'),
			month: moment(nextProps.date).format('MM')
		});
	},
	navYear: function (e) {
		var self = this;
		e.preventDefault();

		var newYear = moment(self.state.year, 'YYYY').add(1, 'years').format('YYYY'); 
		if (e.target.dataset.arg == 'prev') newYear = moment(self.state.year, 'YYYY').subtract(1, 'years').format('YYYY');

		this.setState({ year: newYear });
	},
	clickMonth: function (e) {
		e.preventDefault();
		this.props.setDate(moment(e.target.dataset.month, 'YYYY-MM'));
	},
	render: function () {
		var viewYear = moment(this.props.date).format('YYYY'),
			now = moment().format('YYYY-MM');

		return (
			<div id='humphrey-yearcal'>
				<header>
					<a href='' onClick={this.navYear} data-arg='prev'>{'\u2039'}</a>
					{this.state.year}
					<a href='' onClick={this.navYear} data-arg='next'>{'\u203A'}</a>
				</header>
				<ul id='yearcal-months' className={this.state.year ==  viewYear ? 'this-year' : ''}>
				
					<li className={this.state.month == '01' ? 'active' : ''} 
						data-today={now == this.state.year + '-01' ? 'yay' : 'nope'}
						data-month={this.state.year + '-01'}
						onClick={this.clickMonth}>JAN</li>
					<li className={this.state.month == '02' ? 'active' : ''} 
						data-today={now == this.state.year + '-02' ? 'yay' : 'nope'}
						data-month={this.state.year + '-02'}
						onClick={this.clickMonth}>FEB</li>
					<li className={this.state.month == '03' ? 'active' : ''} 
						data-today={now == this.state.year + '-03' ? 'yay' : 'nope'}
						data-month={this.state.year + '-03'}
						onClick={this.clickMonth}>MAR</li>
					<li className={this.state.month == '04' ? 'active' : ''} 
						data-today={now == this.state.year + '-04' ? 'yay' : 'nope'}
						data-month={this.state.year + '-04'}
						onClick={this.clickMonth}>APR</li>
					<li className={this.state.month == '05' ? 'active' : ''} 
						data-today={now == this.state.year + '-05' ? 'yay' : 'nope'}
						data-month={this.state.year + '-05'}
						onClick={this.clickMonth}>MAY</li>
					<li className={this.state.month == '06' ? 'active' : ''} 
						data-today={now == this.state.year + '-06' ? 'yay' : 'nope'}
						data-month={this.state.year + '-06'}
						onClick={this.clickMonth}>JUN</li>
					<li className={this.state.month == '07' ? 'active' : ''} 
						data-today={now == this.state.year + '-07' ? 'yay' : 'nope'}
						data-month={this.state.year + '-07'}
						onClick={this.clickMonth}>JUL</li>
					<li className={this.state.month == '08' ? 'active' : ''} 
						data-today={now == this.state.year + '-08' ? 'yay' : 'nope'}
						data-month={this.state.year + '-08'}
						onClick={this.clickMonth}>AUG</li>
					<li className={this.state.month == '09' ? 'active' : ''} 
						data-today={now == this.state.year + '-09' ? 'yay' : 'nope'}
						data-month={this.state.year + '-09'}
						onClick={this.clickMonth}>SEP</li>
					<li className={this.state.month == '10' ? 'active' : ''} 
						data-today={now == this.state.year + '-10' ? 'yay' : 'nope'}
						data-month={this.state.year + '-10'}
						onClick={this.clickMonth}>OCT</li>
					<li className={this.state.month == '11' ? 'active' : ''} 
						data-today={now == this.state.year + '-11' ? 'yay' : 'nope'}
						data-month={this.state.year + '-11'}
						onClick={this.clickMonth}>NOV</li>
					<li className={this.state.month == '12' ? 'active' : ''} 
						data-today={now == this.state.year + '-12' ? 'yay' : 'nope'}
						data-month={this.state.year + '-12'}
						onClick={this.clickMonth}>DEC</li>
				</ul>

			</div>
		)
	}
});