var React = require('react'),
	moment = require('moment'),
	$ = require('jquery'),
	fullCal = require('fullcalendar'),
	socket = io.connect();

module.exports = React.createClass({
	getInitialState: function () {
		return {
			title: '',
			start: moment(),
			end: '',
			allday: true,
			multiday: false,
			category: '',
			recursion: 'once',
			note: '',
			loading: false
		}
	},
	componentDidMount: function () {
		var self = this;

		$('.humphrey-popupcal').fullCalendar({
			firstDay: 1,
			header: {
				left: '',
				center: 'prev title next',
				right: ''
			},
			buttonIcons: false,
			buttonText: {
				prev: '\u2039',
				next: '\u203A'
			},
			dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
			dayRender: function (date, cell) {
				$(cell).html('<span>' + moment(date).format('D') + '</span>');
				if (self.state.multiday) {
					if (moment(date).isSame(self.state.start, 'day')) $(cell).addClass('selected start');
					if (moment(date).isSame(self.state.end, 'day')) $(cell).addClass('selected end');
					if (moment(date).isBetween(self.state.start, self.state.end)) $(cell).addClass('selected');
				} else {
					if (moment(self.state.start).isSame(date, 'day')) self.setDate(date);
				}
			},
			dayClick: function (date, jsEvent, view) {
				self.setDate(date);
			}
		});
	},
	setDate: function (date) {
		var self = this;
		$('.fc-day').removeClass('selected start end');

		if (self.state.multiday) {
			if (moment(date).isBefore(self.state.start)) {
				if (self.state.end != '') {
					self.setState({ start: moment(date) }, function () {
						drawRange(self.state.start, self.state.end);
					});
				} else {
					self.setState({ start: moment(date), end: self.state.start }, function () {
						drawRange(self.state.start, self.state.end);
					});
				}
			} else if (moment(date).isBetween(self.state.start, self.state.end)) {
				self.setState({ start: moment(date) }, function () {
					drawRange(self.state.start, self.state.end);
				});
			} else if (moment(date).isAfter(self.state.start)) {
				self.setState({ end: moment(date) }, function () {
					drawRange(self.state.start, self.state.end);
				});
			}
		} else {					
			$('.fc-day[data-date=' + moment(date).format('YYYY-MM-DD') + ']').addClass('selected start end');
			self.setState({ start: moment(date), end: '' });
		}

		function drawRange (start, end) {
			var num = end.diff(start, 'days');
			for (var i = 0; i <= num; i++) {
				$('.fc-day[data-date=' + moment(start).add(i, 'days').format('YYYY-MM-DD') + ']').addClass('selected');

				if (i == 0) $('.fc-day[data-date=' + moment(start).add(i, 'days').format('YYYY-MM-DD') + ']').addClass('start');
				if (i == num) $('.fc-day[data-date=' + moment(start).add(i, 'days').format('YYYY-MM-DD') + ']').addClass('end');
			}
		}
	},
	handleChange: function (e) {
		var obj = {};
		obj[e.target.name] = e.target.value;
		this.setState(obj);
	},
	handleCheckbox: function (e) {
		var self = this, obj = {};
		if ($(e.target).hasClass('active')) {
			obj[e.target.dataset.arg] = false;
		} else { obj[e.target.dataset.arg] = true; 	}

		if (obj.multiday == true || this.state.multiday == true) obj['allday'] = true;
		if (obj.multiday == false || this.state.multiday == false) obj['end'] = '';
		if (obj.allday == true) obj['start'] = moment(self.state.start).set({'hour': 0, 'minute': 0});

		this.setState(obj, function () {
			if (obj.multiday == false) self.setDate(self.state.start);
		});
	},
	handleTime: function (e) {
		var start = moment(this.state.start),
			end = '',
			time = Number(e.target.value);

		if (this.state.end != '') end = moment(this.state.end);

		if (e.target.dataset.arg == 'start-hours') start = moment(start).set('hour', time);
		if (e.target.dataset.arg == 'start-minutes') start = moment(start).set('minute', time);
		if (e.target.dataset.arg == 'end-hours') end = moment(end).set('hour', time);
		if (e.target.dataset.arg == 'end-minutes') end = moment(end).set('minute', time);

		if (moment(end).isBefore(start)) return alert('Invalid time');

		this.setState({ start: start, end: end });
	},
	handleEndTime: function (e) {
		var start = this.state.start;

		if (this.state.end == '' && this.state.allday == false) {
			this.setState({ end: moment(start).add(1, 'hours') });
		} else {
			this.setState({ end: '' });
		}
	},
	handleSubmit: function (e) {
		var self = this;
		e.preventDefault();

		if (self.state.title == '') return alert('Please enter a title');
		if (self.state.category == '') return alert('Please supply a category');

		this.setState({ loading: true }, function () {
			var ev = this.state;
			ev.user = self.props.user._id;

			if (ev.allday) {
				ev.start = moment(ev.start).format();
				if (ev.end) ev.end = moment(ev.end).format();	
			} else {
				ev.start = moment(ev.start).subtract(2, 'hours').format();
				if (ev.end) ev.end = moment(ev.end).subtract(2, 'hours').format();		
			}

			socket.emit('events:create', ev, function (response) {
				self.setState({ loading: false }, function () {
					self.props.cancelPopup();
					self.props.newEvent(response);
				});
			});
		})
	},
	render: function () {
		var self = this,
			ev = this.state,
			hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
			minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

		var startHourList = hours.map(function (hour) {
			return ( <option value={hour} key={'sh-' + hour}>{hour}</option> )
		});

		var startMinuteList = minutes.map(function (minute) {
			return ( <option value={minute} key={'sm-' + minute}>{minute}</option> )
		});	

		var endHourList = hours.map(function (hour) {
			if (hour >= moment(ev.start).format('HH')) {
				return ( <option value={hour} key={'eh-' + hour}>{hour}</option> )
			}			
		});

		var endMinuteList = minutes.map(function (minute) {
			return ( <option value={minute} key={'em-' + minute}>{minute}</option> )
		});

		var catList = this.props.categories.map(function (cat) {
			return ( <option value={cat._id} key={cat._id}>{cat.name}</option> )
		});

		return (
			<div id='humphrey-create'>
				<header className='popup-header'>
					<div className='active'>Add</div>
					<div id='close-popup' onClick={this.props.cancelPopup}>&times;</div>
				</header>
				<div className='popup-body'>
					<form>

						<div className='form-row'>
							<label htmlFor='create-title'>Title</label>
							<input type='text' id='create-title' name='title' value={ev.title} onChange={this.handleChange} />
						</div>		

						<div className='form-row'>	
							<label htmlFor='create-date'>Date</label>
							<div className='calendar'>
								<div className='humphrey-popupcal'></div>
								<div className='calendar-options'>
									
									<label className={ev.allday ? 'checkbox active' : 'checkbox'} data-arg='allday' onClick={this.handleCheckbox}>All day</label>
									<label className={ev.multiday ? 'checkbox active' : 'checkbox'} data-arg='multiday' onClick={this.handleCheckbox}>Date range</label>

									<label className={ev.allday ? 'create-time disabled' : 'create-time'} htmlFor='create-time-start-hours'>Start time</label>
									<div className='set-time'>
										<select id='create-time-start-hours' onChange={this.handleTime} value={moment(ev.start).format('HH')} disabled={ev.allday} data-arg='start-hours'>
											{startHourList}
										</select>
										<select id='create-time-start-minutes' onChange={this.handleTime} value={moment(ev.start).format('mm')} disabled={ev.allday} data-arg='start-minutes'>
											{startMinuteList}
										</select>
									</div>

									<label className={ev.allday ? 'checkbox disabled' : ev.end != '' ? 'checkbox active' : 'checkbox'} htmlFor='create-time-end-hours' onClick={this.handleEndTime}>End time</label>
									<div className='set-time'>
										<select id='create-time-end-hours' onChange={this.handleTime} value={moment(ev.end).format('HH')} disabled={ev.allday == true || ev.end == ''} data-arg='end-hours'>
											{endHourList}
										</select>
										<select id='create-time-end-minutes' onChange={this.handleTime} value={moment(ev.end).format('mm')} disabled={ev.allday == true || ev.end == ''} data-arg='end-minutes'>
											{endMinuteList}
										</select>
									</div>

									<label className='create-time' htmlFor='create-recursion'>Recursion</label>
									<div className='set-time'>
										<select id='create-recursion' name='recursion' value={ev.recursion} onChange={this.handleChange}>
											<option value='once'>Once</option>
											<option value='monthly'>Monthly</option>
											<option value='yearly'>Yearly</option>
										</select>
									</div>
								</div>
							</div>
						</div>

						<div className='form-row'>	
							<label htmlFor='create-category'>Category</label>
							<select id='create-category' name='category' value={ev.category} onChange={this.handleChange}>
								<option value='' key='empty-cat'> </option>
								{catList}
							</select>
						</div>

						<div className='form-row'>	
							<label htmlFor='create-note'>Note</label>
							<textarea id='create-note' name='note' value={ev.note} onChange={this.handleChange}></textarea>
						</div>

						<button className='button' type='submit' onClick={this.handleSubmit}>Create</button>
					</form>
				</div>
				<div className={this.state.loading ? 'loading active' : 'loading'}>
					<div className='spinner'></div>
				</div>
			</div>
		)
	}
}); 