var React = require('react'),
	moment = require('moment'),
	$ = require('jquery'),
	socket = io.connect();

module.exports = React.createClass({
	getInitialState: function () {
		return {
			loading: true,
			user: {
				_id: '',
				name: { first: '',	last: '' },
				username: '',
				password: '',
				confirm: '',
				role: ''
			}
		}
	},
	componentDidMount: function () {
		var self = this,
			avatarWidth = $('.avatar').width();

		$('.avatar').height(avatarWidth);

		socket.emit('users:fetch', this.props.user, function (data) {
			self.setState({ loading: false, user: data });
		});
	},
	handleChange: function (e) {
		var user = this.state.user;
		if (e.target.name == 'first') user.name.first = e.target.value;
		if (e.target.name == 'last') user.name.last = e.target.value;
		if (e.target.name == 'username') user.username = e.target.value;
		if (e.target.name == 'password') user.password = e.target.value;
		if (e.target.name == 'confirm') user.confirm = e.target.value;
		this.setState({ user: user });
	},
	handleSubmit: function (e) {
		var self = this;
		e.preventDefault();
		this.setState({ loading: true }, function () {
			socket.emit('users:update', self.state.user, function (data) {
				if (data == 'success') self.setState({ loading: false });
				if (data == 'error') self.setState({ loading: false });
			})
		})
	},
	render: function () {
		return (
			<div className='popup-body with-sidebar'>
				<div className='popup-sidebar'>
					<div className='avatar'></div>
					<input type='file' disabled='disabled' />
				</div>
				<form className='popup-main'>
					<div className='form-row'>
						<label htmlFor='name-first'>Name</label>
						<input type='text' id='name-first' placeholder='First' value={this.state.user.name.first} onChange={this.handleChange} name='first' />
					</div>
					<div className='form-row'>
						<label htmlFor='name-last'> </label>
						<input type='text' id='name-last' placeholder='Last' value={this.state.user.name.last} onChange={this.handleChange} name='last' />
					</div>
					<div className='form-row'>
						<label htmlFor='password'>Password</label>
						<input type='password' id='password' placeholder='New password' value={this.state.user.password} onChange={this.handleChange} name='password' />
					</div>
					<div className='form-row'>
						<label htmlFor='confirm'>&nbsp;</label>
						<input type='password' id='confirm' placeholder='Confirm password' value={this.state.user.confirm} onChange={this.handleChange} name='confirm' />
					</div>
					<div className='form-row'>
						<label htmlFor='email'>E-mail</label>
						<input type='email' id='email' value={this.state.user.username} onChange={this.handleChange} name='username' />
					</div>
					<div className='form-row'>
						<label htmlFor='role'>Role</label>
						<select id='role' value={this.state.user.role} onChange={this.handleChange} name='role' disabled='disabled'>
							<option value='10'>User</option>
							<option value='30'>Contributor</option>
							<option value='50'>Editor</option>
							<option value='99'>Administrator</option>
						</select>
					</div>
					<button className='button' type='submit' onClick={this.handleSubmit}>Save</button>
				</form>
				<div className={this.state.loading ? 'loading active' : 'loading'}>
					<div className='spinner'></div>
				</div>
			</div>
		)
	}
});