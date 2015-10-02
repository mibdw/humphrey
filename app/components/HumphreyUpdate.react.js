var React = require('react'),
	moment = require('moment'),
	$ = require('jquery'),
	fullCal = require('fullcalendar'),
	socket = io.connect();

module.exports = React.createClass({
	getInitialState: function () {
		return {
			loading: false,
			detail: {
				title: '',
				start: '',
				end: '',
				allday: true,
				multiday: false,
				category: '',
				recursion: 'once',
				user: '',
				note: '',
			},
		}
	},
	componentDidMount: function () {
		var self = this, detail = this.props.detail;
		detail.category = detail.category._id;
		detail.start = moment(detail.start);
		if (detail.end) detail.end = moment(detail.end);

		this.setState({ detail: detail }, function () {

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
					if (self.state.detail.multiday) {
						if (moment(date).isSame(self.state.detail.start, 'day')) $(cell).addClass('selected start');
						if (moment(date).isSame(self.state.detail.end, 'day')) $(cell).addClass('selected end');
						if (moment(date).isBetween(self.state.detail.start, self.state.detail.end)) $(cell).addClass('selected');
					} else {
						if (moment(self.state.detail.start).isSame(date, 'day')) $(cell).addClass('selected start end');;
					}
				},
				dayClick: function (date, jsEvent, view) {
					self.setDate(date);
				}
			});
		});
	},
	setDate: function (date) {
		var self = this, detail = this.state.detail;
		$('.fc-day').removeClass('selected start end');

		if (self.state.detail.multiday) {
			if (moment(date).isBefore(self.state.detail.start)) {
				detail.start = moment(date);
			} else if (moment(date).isBetween(self.state.detail.start, self.state.detail.end)) {
				detail.start = moment(date);
			} else if (moment(date).isAfter(self.state.detail.start)) {
				detail.end = moment(date);
			}

			self.setState({ detail: detail }, function () {
				drawRange(self.state.detail.start, self.state.detail.end);
			});
		} else {					
			$('.fc-day[data-date=' + moment(date).format('YYYY-MM-DD') + ']').addClass('selected start end');
			detail.start = moment(date);
			detail.end = '';
			self.setState({ detail: detail });
		}

		function drawRange (start, end) {
			var num = moment(end).diff(start, 'days');
			for (var i = 0; i <= num; i++) {
				$('.fc-day[data-date=' + moment(start).add(i, 'days').format('YYYY-MM-DD') + ']').addClass('selected');

				if (i == 0) $('.fc-day[data-date=' + moment(start).add(i, 'days').format('YYYY-MM-DD') + ']').addClass('start');
				if (i == num) $('.fc-day[data-date=' + moment(start).add(i, 'days').format('YYYY-MM-DD') + ']').addClass('end');
			}
		}
	},
	handleChange: function (e) {
		var detail = this.state.detail;
		detail[e.target.name] = e.target.value;
		this.setState({ detail: detail });
	},
	handleCheckbox: function (e) {
		var self = this, detail = this.state.detail;
		if ($(e.target).hasClass('active')) {
			detail[e.target.dataset.arg] = false;
		} else { detail[e.target.dataset.arg] = true; 	}

		if (detail.multiday == true || this.state.detail.multiday == true) detail['allday'] = true;
		if (detail.multiday == false || this.state.detail.multiday == false) detail['end'] = '';
		if (detail.allday == true) detail['start'] = moment(self.state.detail.start).set({'hour': 0, 'minute': 0});

		this.setState({ detail: detail }, function () {
			if (detail.multiday == false) self.setDate(self.state.detail.start);
		});
	},
	handleTime: function (e) {
		var detail = this.state.detail,
			time = Number(e.target.value);

		if (e.target.dataset.arg == 'start-hours') detail.start = moment(detail.start).set('hour', time);
		if (e.target.dataset.arg == 'start-minutes') detail.start = moment(detail.start).set('minute', time);
		if (e.target.dataset.arg == 'end-hours') detail.end = moment(detail.end).set('hour', time);
		if (e.target.dataset.arg == 'end-minutes') detail.end = moment(detail.end).set('minute', time);

		if (moment(detail.end).isBefore(detail.start)) return alert('Invalid time');

		this.setState({ detail: detail });
	},
	handleEndTime: function (e) {
		var detail = this.state.detail;

		if (detail.end == '' && detail.allday == false) {
			detail.end = moment(detail.start).add(1, 'hours');
		} else {
			detail.end = '';
		}

		this.setState({ detail: detail });
	},
	handleSubmit: function (e) {
		var self = this;
		e.preventDefault();

		if (self.state.detail.title == '') return alert('Please enter a title');
		if (self.state.detail.category == '') return alert('Please supply a category');

		this.setState({ loading: true }, function () {
			var ev = self.state.detail;

			if (ev.allday) {
				ev.start = moment(ev.start).format();
				if (ev.end) ev.end = moment(ev.end).format();	
			} else {
				ev.start = moment(ev.start).format();
				if (ev.end) ev.end = moment(ev.end).format();		
			}

			socket.emit('events:update', ev, function (response) {
				self.setState({ loading: false }, function () {
					self.props.cancelPopup();
					self.props.updateEvent(response);
				});
			});
		})
	},
	handleRemove: function (e) {
		var self = this;
		e.preventDefault();

		if (confirm('Are you sure?')) {
			socket.emit('events:remove', self.state.detail, function (response) {
				self.setState({ loading: false }, function () {
					self.props.cancelPopup();
					self.props.updateEvent(response);
				});
			});
		}
	},
	render: function () {
		var self = this,
			ev = this.state.detail,
			hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
			minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

		console.log(self.state.detail.start)

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
			<div className='popup-body'>
				<form>

					<div className='form-row'>
						<label htmlFor='update-title'>Title</label>
						<input type='text' id='update-title' name='title' value={ev.title} onChange={this.handleChange} />
					</div>		

					<div className='form-row'>	
						<label htmlFor='update-date'>Date</label>
						<div className='calendar'>
							<div className='humphrey-popupcal'></div>
							<div className='calendar-options'>
								
								<label className={ev.allday ? 'checkbox active' : 'checkbox'} data-arg='allday' onClick={this.handleCheckbox}>All day</label>
								<label className={ev.multiday ? 'checkbox active' : 'checkbox'} data-arg='multiday' onClick={this.handleCheckbox}>Date range</label>

								<label className={ev.allday ? 'update-time disabled' : 'update-time'} htmlFor='update-time-start-hours'>Start time</label>
								<div className='set-time'>
									<select id='update-time-start-hours' onChange={this.handleTime} value={moment(ev.start).format('HH')} disabled={ev.allday} data-arg='start-hours'>
										{startHourList}
									</select>
									<select id='update-time-start-minutes' onChange={this.handleTime} value={moment(ev.start).format('mm')} disabled={ev.allday} data-arg='start-minutes'>
										{startMinuteList}
									</select>
								</div>

								<label className={ev.allday ? 'checkbox disabled' : ev.end != '' ? 'checkbox active' : 'checkbox'} htmlFor='update-time-end-hours' onClick={this.handleEndTime}>End time</label>
								<div className='set-time'>
									<select id='update-time-end-hours' onChange={this.handleTime} value={moment(ev.end).format('HH')} disabled={ev.allday == true || ev.end == ''} data-arg='end-hours'>
										{endHourList}
									</select>
									<select id='update-time-end-minutes' onChange={this.handleTime} value={moment(ev.end).format('mm')} disabled={ev.allday == true || ev.end == ''} data-arg='end-minutes'>
										{endMinuteList}
									</select>
								</div>

								<label className='update-time' htmlFor='update-recursion'>Recursion</label>
								<div className='set-time'>
									<select id='update-recursion' name='recursion' value={ev.recursion} onChange={this.handleChange}>
										<option value='once'>Once</option>
										<option value='monthly'>Monthly</option>
										<option value='yearly'>Yearly</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					<div className='form-row'>	
						<label htmlFor='update-category'>Category</label>
						<select id='update-category' name='category' value={ev.category} onChange={this.handleChange}>
							{catList}
						</select>
					</div>

					<div className='form-row'>	
						<label htmlFor='update-note'>Note</label>
						<textarea id='update-note' name='note' value={ev.note} onChange={this.handleChange}></textarea>
					</div>

					<button className='button' type='submit' onClick={this.handleSubmit}>Update</button>
					<a href='' className='link' onClick={this.handleRemove}>Remove</a>
				</form>

				<div className={this.state.loading ? 'loading active' : 'loading'}>
					<div className='spinner'></div>
				</div>
			</div>
		)
	}
}); 