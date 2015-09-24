var React = require('react'),
	moment = require('moment'),
	socket = io.connect();

var HumphreyUpdate = require('./HumphreyUpdate.react');

module.exports = React.createClass({
	getInitialState: function () {
		return {
			view: 'detail',
			loading: false,
			detail: {
				title: '',
				start: '',
				end: '',
				allday: true,
				multiday: false,
				category: { name: '', color: '', _id: '' },
				user: { name: { first: '', last: '' }, username: '', _id: '' },
				recursion: 'once',
				note: '',
				added: ''
			},
		}
	},
	componentDidMount: function () {
		var self = this;
		this.setState({ loading: true }, function () {
			socket.emit('events:detail', {_id: self.props.detail}, function (response) {
				self.setState({ detail: response, loading: false });
			});
		})
	},
	switchView: function (e) {
		e.preventDefault();
		this.setState({ view: e.target.dataset.arg });
	},
	render: function () {
		var self = this,
			detail = this.state.detail,
			currentView, updateButton,
			dateString, durationString;

		if (detail.start && detail.end && detail.allday) {
			dateString = (
				<span className='detail-time'>
					<time>{moment(detail.start).format('ddd. D MMMM YYYY')}</time> &ndash; <time>{moment(detail.end).format('ddd. D MMMM YYYY')}</time>
				</span>
			);
			durationString = (
				<small className='detail-duration'>
					{moment(detail.end).diff(detail.start, 'days') + 1} days
				</small>
			);
		} else if (detail.start && !detail.end && detail.allday) {
			dateString = (
				<span className='detail-time'>
					<time>{moment(detail.start).format('ddd. D MMMM YYYY')}</time>
				</span>
			);
			durationString = (
				<small className='detail-duration'>1 day</small>
			);
		} else if (detail.start && detail.end && !detail.allday) {
			dateString = (
				<span className='detail-time'>
					<time>{moment(detail.start).format('ddd. D MMMM YYYY')}, {moment(detail.start).format('H:mm')} &ndash; {moment(detail.end).format('H:mm')}</time>
				</span>
			);

			if (moment(detail.end).diff(detail.start, 'minutes') > 180) {
				durationString = (
					<small className='detail-duration'>{moment(detail.end).diff(detail.start, 'hours')} hours</small>
				);
			} else {
				durationString = (
					<small className='detail-duration'>{moment(detail.end).diff(detail.start, 'minutes')} minutes</small>
				);
			}
		} else if (detail.start && !detail.end && !detail.allday) {
			dateString = (
				<span className='detail-time'>
					<time>{moment(detail.start).format('ddd. D MMMM YYYY')}, {moment(detail.start).format('H:mm')}</time>
				</span>
			);
		} 

		if (this.state.view == 'detail') {
			currentView = (
				<div className='popup-body' style={{paddingTop: '2em'}}>
					<div className='cat-stripe' style={{backgroundColor: detail.category.color}}></div>
					
					<dl className='detail-list'>
						
						<div className='dl-row'>
							<dd>Title</dd>
							<dt><strong>{detail.title}</strong></dt>
						</div>

						<div className='dl-row'>
							<dd>Date</dd>
							<dt>{dateString} {durationString}</dt>
						</div>

						<div className='dl-row'>
							<dd>Category</dd>
							<dt><i style={{backgroundColor: detail.category.color}}></i> {detail.category.name}</dt>
						</div>

						<div className={detail.note ? 'dl-row' : 'dl-row hide'}>
							<dd>Note</dd>
							<dt>{detail.note}</dt>
						</div>

						<div className='dl-row'>
							<dd>Author</dd>
							<dt>
								{detail.user.name.first} {detail.user.name.last} <small>{moment(detail.added).fromNow()}</small>
							</dt>
						</div>
					</dl>
				</div>
			)
		}

		if (this.state.view == 'update') {
			currentView = <HumphreyUpdate 
				categories={this.props.categories}
				detail={this.state.detail}
				cancelPopup={this.props.cancelPopup}
				updateEvent={this.props.updateEvent} />
		}

		if (this.props.user.role > 49 || this.props.user._id == detail.user._id) {
			updateButton = <div className={this.state.view == 'update' ? 'active' : ''} onClick={this.switchView} data-arg='update'>Update</div>
		}

		return (
			<div id='humphrey-settings'>
				<header className='popup-header'>
					<div className={this.state.view == 'detail' ? 'active' : ''} onClick={this.switchView} data-arg='detail'>Detail</div>
					{updateButton}
					<div id='close-popup' onClick={this.props.cancelPopup}>&times;</div>
				</header>
				{currentView}
				<div className={this.state.loading ? 'loading active' : 'loading'}>
					<div className='spinner'></div>
				</div>
			</div>
		)
	}
});