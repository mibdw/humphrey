var React = require('react'),
	moment = require('moment');

module.exports = React.createClass({
	handleLogin: function (e) {
		e.preventDefault();
		var username = React.findDOMNode(this.refs.username).value.trim(),
    	password = React.findDOMNode(this.refs.password).value.trim();
    this.props.handleAuth({username: username, password: password});

	},
	render: function () {
		var self = this;

		return (
			<div id='humphrey-login'>
				<header className='popup-header'>
					<div className='active'>Login</div>
					<div id='close-popup' onClick={this.props.cancelPopup}>&times;</div>
				</header>
				<div className='popup-body'>
					<form>
						<input type='email' name='username' ref='username' placeholder='E-mail' />
						<input type='password' name='password' ref='password' placeholder='Password' />
						<button onClick={self.handleLogin} className='button'>Login</button>
					</form>
				</div>
				<div className={this.props.loading ? 'loading active' : 'loading'}>
					<div className='spinner'></div>
				</div> 
			</div>
		)
	}
});