var React = require('react'),
	moment = require('moment');

var HumphreyProfile = require('./HumphreyProfile.react'),
	HumphreyCategories = require('./HumphreyCategories.react'),
	HumphreyUsers = require('./HumphreyUsers.react');

module.exports = React.createClass({
	getInitialState: function () {
		return {
			view: 'profile' 
		}
	},
	switchView: function (e) {
		e.preventDefault();
		this.setState({ view: e.target.dataset.arg });
	},
	render: function () {
		var self = this, currentView, profileButton, categoriesButton, usersButton;

		if (this.props.user.role > 0) profileButton = <div className={this.state.view == 'profile' ? 'active' : ''} onClick={this.switchView} data-arg='profile'>Profile</div>;
		if (this.props.user.role > 49) categoriesButton = <div className={this.state.view == 'categories' ? 'active' : ''} onClick={this.switchView} data-arg='categories'>Categories</div>;
		if (this.props.user.role > 98) usersButton = <div className={this.state.view == 'users' ? 'active' : ''} onClick={this.switchView} data-arg='users'>Users</div>;


		if (this.state.view == 'profile') currentView = <HumphreyProfile user={this.props.user} />
		if (this.state.view == 'categories') currentView = (
				<HumphreyCategories 
					user={this.props.user}
					categories={this.props.categories}
					fetchCategories={this.props.fetchCategories} />
				)
		if (this.state.view == 'users') currentView = <HumphreyUsers user={this.props.user} />

		return (
			<div id='humphrey-settings'>
				<header className='popup-header'>
					{profileButton}
					{categoriesButton}
					{usersButton}
					
					<div id='close-popup' onClick={this.props.cancelPopup}>&times;</div>
				</header>
				{currentView}
			</div>
		)
	}
});