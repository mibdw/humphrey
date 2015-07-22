var React = require('react'),
	moment = require('moment'),
	_ = require('underscore'),
	socket = io.connect();

module.exports = React.createClass({
	getInitialState: function () {
		return {
			loading: false,
			body: 'new',
			user: {
				_id: '',
				name: { first: '',	last: '' },
				username: '',
				role: 10,
				password: '',
				confirm: ''
			},
			userList: []
		}
	},
	componentDidMount: function () {
		var self = this;
		socket.emit('users:list', function (userList) {
			self.setState({ userList: userList });
		});
	},
	switchUser: function (e) {
		e.preventDefault();
		if (e.target.dataset.id == 'new') {
			this.setState({ 
				body: 'new',
				user: {
					_id: '',
					name: { first: '',	last: '' },
					username: '',
					role: 10,
					password: '',
					confirm: ''
				}
			})
		} else {
			var self = this;
			var user = _.findWhere(self.state.userList, { _id: e.target.dataset.id });
			this.setState({ 
				body: e.target.dataset.id,
				user: user,
			});
		}
	},
	handleChange: function (e) {
		e.preventDefault();
		var user = this.state.user;
		if (e.target.name == 'first') user.name.first = e.target.value;
		if (e.target.name == 'last') user.name.last = e.target.value;
		if (e.target.name == 'username') user.username = e.target.value;
		if (e.target.name == 'role') user.role = e.target.value;
		if (e.target.name == 'password') user.password = e.target.value;
		if (e.target.name == 'confirm') user.confirm = e.target.value;
		this.setState({ user: user });
	},
	handleCreate: function (e) {
		var self = this;
		e.preventDefault();

		if (self.state.user.name.first == '') return alert('Please enter a first name');
		if (self.state.user.name.last == '') return alert('Please enter a last name');
		if (self.state.user.username == '') return alert('Please enter an e-mail address');
		if (self.state.user.body == 'new' && self.state.user.password == '') return alert('Please enter a password');
		if (self.state.user.body == 'new' && self.state.user.password != self.state.user.confirm) return alert('Password do not match');

		this.setState({ loading: true }, function () {
			socket.emit('users:create', self.state.user, function (response) {

				if (response == 'error') self.setState({ loading: false });
				if (response == 'success') {
					self.setState({ 
						body: 'new',
						loading: false,
						user: {
							_id: '',
							name: { first: '',	last: '' },
							username: '',
							role: 10,
							password: '',
							confirm: ''
						}
					}, function () {
						socket.emit('users:list', function (userList) {
							self.setState({ userList: userList });
						});
					});
				}
			});
		})
	},
	handleUpdate: function (e) {
		var self = this;
		e.preventDefault();

		this.setState({ loading: true }, function () {
			socket.emit('users:update', self.state.user, function (response) {

				if (response == 'error') self.setState({ loading: false });
				if (response == 'success') {
					self.setState({ loading: false }, function () {
						socket.emit('users:list', function (userList) {
							self.setState({ userList: userList });
						});
					});
				}
			});
		})
	},
	handleRemove: function (e) {
		var self = this;
		e.preventDefault();

		if(confirm('Are you sure?')) {
			this.setState({ loading: true }, function () {
				socket.emit('users:remove', { _id: self.state.user._id }, function (response) {

					if (response == 'error') self.setState({ loading: false });
					if (response == 'success') {
						self.setState({ 
							body: 'new',
							user: {
								_id: '',
								name: { first: '',	last: '' },
								username: '',
								role: 10,
								password: '',
								confirm: ''
							}
						}, function () {
							socket.emit('users:list', function (userList) {
								self.setState({ userList: userList });
							});
						});
					}
				});
			});
		}
	},
	render: function () {
		var self = this, submitButton, removeButton;

		var userList = this.state.userList.map(function (user) {
			return (
				<li onClick={self.switchUser} data-id={user._id} className={self.state.body == user._id ? 'active' : ''} key={user._id}>
					<span className='user-avatar'></span>
					{user.name.first} {user.name.last} 
				</li>
			)
		});

		if (this.state.body == 'new') {
			submitButton = <button className='button' type='submit' onClick={this.handleCreate}>Create</button>;
		} else {
			submitButton = <button className='button' type='submit' onClick={this.handleUpdate}>Update</button>;
			removeButton = <a href='' className='link' onClick={this.handleRemove}>Remove</a>;
		}

		return (
			<div className='popup-body with-sidebar'>
				<ul className='popup-sidebar list'>
					<li onClick={self.switchUser} className={self.state.body == 'new' ? 'new active' : 'new'} data-id='new'>
						Create user
					</li>
					{userList}
				</ul>

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
						<select id='role' value={this.state.user.role} onChange={this.handleChange} name='role'>
							<option value='10'>User</option>
							<option value='30'>Contributor</option>
							<option value='50'>Editor</option>
							<option value='99'>Administrator</option>
						</select>
					</div>

					{submitButton}
					{removeButton}
				</form>

				<div className={this.state.loading ? 'loading active' : 'loading'}>
					<div className='spinner'></div>
				</div>
			</div>
		)
	}
});