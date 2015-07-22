var React = require('react'),
	$ = require('jquery'),
	_ = require('underscore'),
	moment = require('moment'),
	socket = io.connect();

var HumphreyBody = require('./components/HumphreyBody.react'),
	HumphreySidebar = require('./components/HumphreySidebar.react'),
	HumphreyLogin = require('./components/HumphreyLogin.react'),
	HumphreyDetail = require('./components/HumphreyDetail.react'),
	HumphreyCreate = require('./components/HumphreyCreate.react'),
	HumphreySettings = require('./components/HumphreySettings.react');

var Humphrey = React.createClass({
	getInitialState: function () {
		var now = moment();
		now['position'] = 0;

		return {
			date: now,
			events: [],
			popup: { a: false, p: false },
			user: false,
			message: { a: false, m: false, o: false },
			loading: false,
			detail: false,
			catFilter: [],
			categories: []
		}
	},
	componentDidMount: function () {
		var self = this, now = moment();
		self.fetchCategories();
		self.handleDate(now);

		$('#humphrey-body').css({ 'min-height': window.innerHeight });
		$(window).resize(function () {
			$('#humphrey-body').css({ 'min-height': window.innerHeight });
		});

		document.title = moment(this.state.date).startOf('isoWeek').format('D') + '\u2013' + moment(this.state.date).endOf('isoWeek').format('D MMMM YYYY') + ' \u00AB Humphrey';

		socket.emit('auth:handshake');
		socket.on('fistbump', function (data) { self.setState({ user: data }) });
		
		socket.on('message', function (data) { 
			self.setState({ message: { a: true, m: data.m, o: data.o }}, function () {
				if (data.o == 'success') {
					setTimeout(function () { self.cancelMessage()	}, 5000)
				}
			});
		});
	},
	fetchCategories: function () {
		var self = this;
		socket.emit('categories:list', function (categoryList) {
			var catList = _.sortBy(categoryList, 'name');
			self.setState({ categories: catList });
		});
	},
	fetchEvents: function (week, callback) {
		var self = this;
		this.setState({ loading: true }, function () {
			socket.emit('events:fetch', week, function (data) {
				
				data.forEach(function (ev) {
					ev['visible'] = true;
					if (self.state.catFilter.length > 0 && self.state.catFilter.indexOf(ev.category._id) == -1) ev.visible = false;
				});

				setTimeout(function () { callback(data); }, 300);
			});
		})
	},
	handleEventChange: function (ev) {
		var self = this, events = this.state.events;	
		this.fetchEvents(self.state.date, function (newEvents) {
			self.setState({ loading: false, events: newEvents });
		})
	},
	handleDate: function (newDate) {
		var self = this;
		self.fetchEvents(newDate, function (newEvents) {
			self.setState({ loading: false, date: newDate, events: newEvents }, function () {
				document.title = moment(newDate).startOf('isoWeek').format('D') + '\u2013' + moment(newDate).endOf('isoWeek').format('D MMMM YYYY') + ' \u00AB Humphrey';
			});
		});
	},
	handlePopup: function (arg) {
		this.setState({ popup: { a: true, p: arg }});
	},
	handleDetail: function (arg) {
		this.setState({ detail: arg });
	},
	handleAuth: function (arg) {
		var self = this;
		self.setState({ loading: true }, function () {
			if (arg == 'logout') {
				$.ajax({
					url: '/logout',	
					success: function (data) {
						self.setState({ user: false, loading: false })
					}
				});
			} else {
	    	if (!arg.username || !arg.password) return self.setState({ message: { a: true, m: 'Missing credentials', o: 'error' }, loading: false });

				$.ajax({
					method: 'POST',
					url: '/login',
					data: { username: arg.username, password: arg.password },
					success: function (data) {
						if (data.message) {
							self.setState({ message: { a: true, m: data.message, o: 'error'}, loading: false });
						} else {
							self.cancelPopup();
							console.log(data);
							self.setState({ user: data, loading: false });
						}
					}
				});
			}
		});
	},
	cancelPopup: function () {
		var self = this, popup = this.state.popup;
			if (this.state.message.o != 'success') self.cancelMessage();	
		popup.a = false;
		self.setState({ popup: popup }, function () {
			setTimeout(function () {
				popup.p = false;
				self.setState({ popup: popup });
			}, 1);
		});
	},
	cancelPopupClick: function (e) {
		var self = this, popup = this.state.popup;
		e.preventDefault();
		if (e.target.id == 'humphrey-jacket' || e.target.id == 'close-popup') {
			self.cancelMessage();	
			popup.a = false;
			self.setState({ popup: popup }, function () {
				setTimeout(function () {
					popup.p = false;
					self.setState({ popup: popup, detail: false });
				}, 251);
			});
		} 
	},
	cancelMessage: function (e) {
		var self = this, message = this.state.message;
		if (e) e.preventDefault();

		message.a = false;
		this.setState({ message: message }, function () {
			setTimeout(function () {
				message.m = false;
				message.o = false;
				self.setState({ message: message });
			}, 251)
		});
	},
	preventCancelPopup: function (e) {
		e.preventDefault();
	},
	toggleFilter: function (arg) {
		var self = this,
			catFilter = this.state.catFilter,
			events = this.state.events,
			catIndex = catFilter.indexOf(arg);

		if (catIndex > -1) catFilter.splice(catIndex, 1);
		if (catIndex == -1) catFilter.push(arg);
		if (arg == 'clear') catFilter = [];

		events.forEach(function (ev) {
			ev.visible = true;
			if (catFilter.length > 0  && catFilter.indexOf(ev.category._id) == -1) ev.visible = false;
		});

		this.setState({ catFilter: catFilter, events: events });
	},
	render: function () {
		var HumphreyPopup;
		if (this.state.popup.p == 'login') HumphreyPopup = <HumphreyLogin 
			loading={this.state.loading}
			cancelPopup={this.cancelPopup}
			handleAuth={this.handleAuth} />;

		if (this.state.popup.p == 'detail') HumphreyPopup = <HumphreyDetail 
			user={this.state.user}
			detail={this.state.detail}
			categories={this.state.categories}
			cancelPopup={this.cancelPopup} 
			updateEvent={this.handleEventChange} />;

		if (this.state.popup.p == 'create') HumphreyPopup = <HumphreyCreate 
			user={this.state.user}
			cancelPopup={this.cancelPopup}
			categories={this.state.categories} 
			newEvent={this.handleEventChange} />;

		if (this.state.popup.p == 'settings') HumphreyPopup = <HumphreySettings  
			user={this.state.user}
			cancelPopup={this.cancelPopup}
			categories={this.state.categories}
			fetchCategories={this.fetchCategories} />;

		var HumphreyMessage, messageClasses = 'humphrey-message ';
		if (this.state.message.m) {
			HumphreyMessage = (
				<span>
					<span className='content'>{this.state.message.m}</span>
					<a href='' className='close' onClick={this.cancelMessage}>&times;</a>
				</span>
			);
			messageClasses = messageClasses + this.state.message.o;
		}

		return (
			<div id='humphrey-wrapper'>
				
				<HumphreySidebar
					date={this.state.date}
					catFilter={this.state.catFilter}
					categories={this.state.categories}
					toggleFilter={this.toggleFilter}
					setDate={this.handleDate} />

				<HumphreyBody
					date={this.state.date}
					events={this.state.events}
					loading={this.state.loading}
					user={this.state.user} 
					setDate={this.handleDate}
					setPopup={this.handlePopup}
					setDetail={this.handleDetail}
					handleAuth={this.handleAuth} />

				<div id='humphrey-jacket' onClick={this.cancelPopupClick} className={this.state.popup.a ? 'active' : ''}>
					<div className={'humphrey-popup ' + this.state.popup.p} onClick={this.preventCancelPopup}>
						{HumphreyPopup}
					</div>
				</div>

				<div className={this.state.message.a ? messageClasses + ' active' : messageClasses}>
					{HumphreyMessage}
				</div>

			</div>
		)
	}
});

React.render(
	<Humphrey />,
	document.getElementById('humphrey')
);