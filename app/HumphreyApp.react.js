var React = require('react'),
	$ = require('jquery'),
	_ = require('underscore'),
	moment = require('moment'),
	cookie = require('react-cookie'),
	socket = io.connect();

var HumphreyBody = require('./components/HumphreyBody.react'),
	HumphreySidebar = require('./components/HumphreySidebar.react'),
	HumphreyLogin = require('./components/HumphreyLogin.react'),
	HumphreyDetail = require('./components/HumphreyDetail.react'),
	HumphreyCreate = require('./components/HumphreyCreate.react'),
	HumphreySettings = require('./components/HumphreySettings.react');

var Router = require('react-router'),
	Route = Router.Route;

var Humphrey = React.createClass({
	getInitialState: function () {
		var now = moment();
		if (this.props.params.week) now = moment().year(this.props.params.year).isoWeek(this.props.params.week);
		now['position'] = 0;
		var cookieView = cookie.load('view') || 'weekly';

		return {
			date: now,
			view: cookieView,
			events: [],
			queue: [],
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
		if (this.props.params.period) {
			if (this.state.view == 'weekly') {
				now = moment().year(this.props.params.year).isoWeek(this.props.params.period);
			} else if (this.state.view == 'monthly') {
				now = moment().year(this.props.params.year).month(this.props.params.period);
			}
		}

		self.fetchCategories();
		self.handleDate(now);
		
		if (this.state.view == 'weekly') {
			document.title = moment(this.state.date).startOf('isoWeek').format('D') + '\u2013' + moment(this.state.date).endOf('isoWeek').format('D MMMM YYYY') + ' \u00AB Humphrey';
		} else if (this.state.view == 'monthly') {
			document.title = moment(this.state.date).format('MMMM YYYY') + ' \u00AB Humphrey';
			
		}

		$(window).on('popstate', function (e) {
			var pop;
			if (this.state.view == 'weekly') {
				pop = moment(e.originalEvent.target.location.pathname, '/YYYY/W').add(1, 'days');
			} else if (this.state.view == 'monthly') {
				pop = moment(e.originalEvent.target.location.pathname, '/YYYY/M');
			}
			self.handleDate(pop)
		});
	
		socket.emit('auth:handshake');
		socket.on('fistbump', function (data) { self.setState({ user: data }) });
		
		socket.on('message', function (data) { 
			var msg;
			if (data.m == 'create') msg = (<span>Event <em>{data.ev.title}</em> has succesfully been created.</span>); 
			if (data.m == 'update') msg = (<span>Event <em>{data.ev.title}</em> has succesfully been updated.</span>);
			if (data.m == 'remove') msg = (<span>Event <em>{data.ev.title}</em> has succesfully been removed.</span>);

			self.setState({ message: { a: true, m: msg, o: data.o }}, function () {
				if (data.o == 'success') {
					setTimeout(function () { self.cancelMessage()	}, 5000)
				}
			});
		});

		socket.on('highfive', function (data) {
			if (moment(data.ev.start).isSame(self.state.date, 'isoWeek')) {
				var queue = self.state.queue, found = false, creations = [], updates = [], removals = [], createString, updateString, removeString;

				found = _.find(queue, function (q) { return q.id == data.id && q.what == 'create' });

				if (found && data.what == 'remove') {
					queue = _.reject(queue, function (q) { return q.id == found.id });
				} else {
					queue.push(data);
				}

				if (queue.length > 0) {

					queue.forEach(function (q) {
						if (q.what == 'create') creations.push(q);
						if (q.what == 'update') updates.push(q);
						if (q.what == 'remove') removals.push(q);
					});

					if (creations.length > 0) createString = ( <span><strong>{creations.length}</strong> {creations.length > 1 ? 'events have' : 'event has'} been created. </span> );

					if (updates.length > 0) updateString = ( <span><strong>{updates.length}</strong> {updates.length > 1 ? 'events have' : 'event has'} been updated. </span> );

					if (removals.length > 0) removeString = ( <span><strong>{removals.length}</strong> {removals.length > 1 ? 'events have' : 'event has'} been removed. </span> );

					var msg = (
						<span>
							{createString}
							{updateString}
							{removeString}
							<a href='' onClick={self.refreshEvents}>Refresh</a>
						</span>
					);

					self.setState({ queue: queue, message: { a: true, m: msg, o: 'warning' }})
				} else {
					self.cancelMessage();
				}
			}
		});
	},
	fetchCategories: function () {
		var self = this, x = self.state.categories.length;
		socket.emit('categories:list', function (categoryList) {
			var catList = _.sortBy(categoryList, 'name');
			self.setState({ categories: catList }, function () {
				var cookieFilter = cookie.load('catFilter');
				if (cookieFilter) self.setState({ catFilter: cookieFilter });

				if (x > 0) {

					self.fetchEvents(self.state.date, function (newEvents) {
						self.setState({ loading: false, events: newEvents });
					});
				}
			});
		});
	},
	fetchEvents: function (week, callback) {
		var self = this;
		this.setState({ loading: true }, function () {
			var obj = {
				date: moment(week).format(),
				view: self.state.view
			};

			socket.emit('events:fetch', obj, function (data) {
				
				data.forEach(function (ev) {
					ev['visible'] = true;
					if (self.state.catFilter.length > 0 && self.state.catFilter.indexOf(ev.category._id) == -1) ev.visible = false;
				});

				setTimeout(function () { callback(data); }, 300);
			});
		})
	},
	refreshEvents: function (e) {
		e.preventDefault();
		var self = this;
		self.fetchEvents(self.state.date, function (newEvents) {
			self.cancelMessage();
			self.setState({ loading: false, events: newEvents}); 
		})
	},
	handleEventChange: function (ev) {
		var self = this, events = this.state.events;	
		this.fetchEvents(self.state.date, function (newEvents) {
			self.setState({ loading: false, events: newEvents });
		})
	},
	handleDate: function (newDate) {
		var self = this, url;
		if (this.state.view == 'weekly') {
			url = moment(newDate).format('/YYYY/W');
		} else if (this.state.view == 'monthly') {
			url = moment(newDate).format('/YYYY/M')
		}

		window.history.pushState(self.props.params, null, url);

		if (this.state.view == 'weekly' && moment(newDate).isoWeekday() == 1) newDate = moment(newDate).add(1, 'days');

		self.fetchEvents(newDate, function (newEvents) {
			self.setState({ loading: false, date: newDate, events: newEvents }, function () {
				
				if (self.state.view == 'weekly') {
					document.title = moment(newDate).startOf('isoWeek').format('D') + '\u2013' + moment(newDate).endOf('isoWeek').format('D MMMM YYYY') + ' \u00AB Humphrey';
				} else if (self.state.view == 'monthly') {
					document.title = moment(newDate).format('MMMM YYYY') + ' \u00AB Humphrey';
				}
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
							self.setState({ user: data, loading: false }, function () {
								$.ajax({
									url: '/elbowbump',
									success: function (data) { console.log(data) }
								});
							});
						}
					}
				});
			}
		});
	},
	cancelPopup: function () {
		var self = this, popup = this.state.popup;
		popup.a = false;
		self.setState({ popup: popup }, function () {
			setTimeout(function () {
				popup.p = false;
				self.setState({ popup: popup }, function () {
					if (self.state.message.o != 'success') {
						self.cancelMessage();	
					}
				});
			}, 1);
		});
	},
	cancelPopupClick: function (e) {
		var self = this, popup = this.state.popup;
		e.preventDefault();
		if (e.target.id == 'humphrey-jacket' || e.target.id == 'close-popup') {
			popup.a = false;
			self.setState({ popup: popup }, function () {
				setTimeout(function () {
					popup.p = false;
					self.setState({ popup: popup, detail: false }, function () {
						if (self.state.message.o != 'success') {
							self.cancelMessage();	
						}
					});
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
				self.setState({ message: message, queue: [] });
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

		this.setState({ catFilter: catFilter, events: events }, function () {
			cookie.save('catFilter', catFilter);
		});
	},
	viewToggle: function (e) {
		e.preventDefault();
		var self = this, date = this.state.date, newView = 'weekly';

		if (this.state.view == 'weekly') newView = 'monthly';
				
		this.setState({ view: newView }, function () {
			self.handleDate(date);
			cookie.save('view', newView);
		});		
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
			<div id='humphrey-wrapper' className={this.state.message.a ? 'message' : ''}>

				<HumphreySidebar
					date={this.state.date}
					view={this.state.view}
					catFilter={this.state.catFilter}
					categories={this.state.categories}
					toggleFilter={this.toggleFilter}
					setDate={this.handleDate}
					viewToggle={this.viewToggle} />

				<HumphreyBody
					date={this.state.date}
					view={this.state.view}
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

var routes = (
	<Route handler={HumphreyApp}>
		<Route path='/' handler={Humphrey} />
		<Route path='/:year/:period' handler={Humphrey} />
	</Route>
);

var RouteHandler = Router.RouteHandler;

var HumphreyApp = React.createClass({
	render: function () {
		return (
			<div>
				<RouteHandler />
			</div>
		)
	}
});

Router.run(routes, Router.HistoryLocation, function (Handler) {
	React.render(<Handler/>, document.getElementById('humphrey'));
});

// React.render(
// 	<Humphrey />,
// 	document.getElementById('humphrey')
// );