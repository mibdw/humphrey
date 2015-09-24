var React = require('react'),
	$ = require('jquery'),
	moment = require('moment');

module.exports = React.createClass({
	setDate: function (e) {
		e.preventDefault();
		this.props.setDate(moment(e.target.dataset.date, 'YYYY-MM-DD'));
	},
	setPopup: function (e) {
		e.preventDefault();
		this.props.setPopup(e.target.dataset.arg);
	},
	handleLogout: function (e) {
		e.preventDefault();
		this.props.handleAuth('logout');
	},
	render: function () {
		var prev,	next,	now = moment().format('YYYY-MM-DD'),
			loginButton, createButton, settingsButton,
			periodTitle, periodNum, periodNav,
			styles;

		if (this.props.view == 'weekly') {
			var startWeek = moment(this.props.date).startOf('isoWeek'),
				next = moment(this.props.date).add(7, 'days').format('YYYY-MM-DD'),
				prev = moment(this.props.date).subtract(7, 'days').format('YYYY-MM-DD');

			periodTitle = (
				<h1>{moment(this.props.date).startOf('isoWeek').format('D') + ' \u2013 ' + moment(this.props.date).endOf('isoWeek').format('D MMM YYYY')}</h1>
			);
			
			periodNum = (
				<span className='weekly-num' title={'Week ' + moment(this.props.date).format('W')}>
					<strong>{moment(this.props.date).format('W')}</strong>
				</span>
			);

			periodNav = (
				<nav className='weekly-nav'>
					<a href='' onClick={this.setDate} data-date={prev} title={'Go to week ' + moment(this.props.date).subtract(1, 'weeks').format('W')}>
						<span>&lsaquo;</span>
					</a>
					<a href='' onClick={this.setDate} data-date={next} title={'Go to week ' + moment(this.props.date).add(1, 'weeks').format('W')}>
						<span>&rsaquo;</span>
					</a>
				</nav>
			)

			if (moment().startOf('isoWeek').isSame(startWeek, 'week')) styles = { display: 'none'}

		} else if (this.props.view == 'monthly') {
			
			var next = moment(this.props.date).add(1, 'months').format('YYYY-MM-DD'),
				prev = moment(this.props.date).subtract(1, 'months').format('YYYY-MM-DD');

			periodTitle = <h1>{moment(this.props.date).format('MMMM YYYY')}</h1>

			periodNav = (
				<nav className='weekly-nav'>
					<a href='' onClick={this.setDate} data-date={prev} title={'Go to ' + moment(this.props.date).subtract(1, 'months').format('MMMM YYYY')}>
						<span>&lsaquo;</span>
					</a>
					<a href='' onClick={this.setDate} data-date={next} title={'Go to ' + moment(this.props.date).add(1, 'months').format('MMMM YYYY')}>
						<span>&rsaquo;</span>
					</a>
				</nav>
			)
		
			if (moment().isSame(this.props.date, 'month')) styles = { display: 'none'}
		}


		if (!this.props.user) loginButton = <a href='' className='button' onClick={this.setPopup} data-arg='login'>Login</a>;
		if (this.props.user) loginButton = <a href='' className='button' onClick={this.handleLogout}>Logout</a>;
		if (this.props.user.role > 10) createButton = <a href='' className='button' onClick={this.setPopup} data-arg='create'>Add</a>;
		if (this.props.user) settingsButton = <a href='' className='button' onClick={this.setPopup} data-arg='settings'>Settings</a>;

		return (
			<header id='humphrey-controls'>
				{periodTitle}
				
				{periodNum}

				{periodNav}

				<div className='weekly-options'>
					<a href='' className='button' onClick={this.setDate} data-date={now} style={styles}>Today</a>
					{createButton}
					{settingsButton}
					{loginButton}
				</div>
			</header>
		)
	}
});