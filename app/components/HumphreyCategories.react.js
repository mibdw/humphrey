var React = require('react'),
	moment = require('moment'),
	_ = require('underscore'),
	ColorPicker = require('react-color-picker'),
	socket = io.connect();

module.exports = React.createClass({
	getInitialState: function () {
		return {
			loading: false,
			body: 'new',
			name: '',
			color: '#ff0000',
			_id: ''
		}
	},
	switchCat: function (e) {
		e.preventDefault();
		if (e.target.dataset.cat == 'new') {
			this.setState({ 
				body: 'new',
				name: '',
				color: '#ff0000',
				_id: ''
			})
		} else {
			var self = this;
			var cat = _.findWhere(self.props.categories, { _id: e.target.dataset.cat });

			this.setState({ 
				body: e.target.dataset.cat,
				name: cat.name,
				color: cat.color,
				_id: cat._id
			});
		}
	},
	handleChange: function (e) {
		e.preventDefault();
		var obj = {};
		obj[e.target.id] = e.target.value;
		this.setState(obj);
	},
	onDrag: function (color, c) {
		this.setState({ color: color });
	},
	handleCreate: function (e) {
		var self = this;
		e.preventDefault();

		if (self.state.name == '') return alert('Please enter a name');

		this.setState({ loading: true }, function () {
			socket.emit('categories:create', { name: self.state.name, color: self.state.color }, function (response) {

				if (response == 'success') {
					self.setState({
						loading: false,
						body: 'new',
						name: '',
						color: '#ff0000',
						_id: ''
					}, function () {
						self.props.fetchCategories();
					});
				}
			});
		})
	},
	handleUpdate: function (e) {
		var self = this;
		e.preventDefault();

		this.setState({ loading: true }, function () {
			socket.emit('categories:update', { _id: self.state._id, name: self.state.name, color: self.state.color }, function (response) {

				if (response == 'success') {
					self.setState({ loading: false }, function () {
						self.props.fetchCategories();
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
				socket.emit('categories:remove', { _id: self.state._id }, function (response) {

					if (response == 'success') {
						self.setState({ 
							loading: false,
							body: 'new',
							name: '',
							color: '#ff0000',
							_id: ''
						}, function () {
							self.props.fetchCategories();
						});
					}
				});
			});
		}
	},
	render: function () {
		var self = this, submitButton, removeButton;

		var categoryList = this.props.categories.map(function (cat) {
			return (
				<li onClick={self.switchCat} data-cat={cat._id} className={self.state.body == cat._id ? 'active' : ''} key={cat._id}>
					<span className='cat-color' style={{ backgroundColor: cat.color }}></span>
					{cat.name}
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
					<li onClick={self.switchCat} className={self.state.body == 'new' ? 'new active' : 'new'} data-cat='new'>
						Create category
					</li>
					{categoryList}
				</ul>

				<form className='popup-main'>
					<div className='form-row'>
						<label htmlFor='name'>Name</label>
						<input type='text' value={this.state.name} id='name' onChange={this.handleChange} />
					</div>
					<div className='form-row'>
						<label htmlFor='color-picker'>Color</label>
						<div className='color-picker'>
							<ColorPicker value={this.state.color} onDrag={this.onDrag} />
						</div>
					</div>
					<div className='form-row'>
						<label htmlFor='color'>&nbsp;</label>
						<input type='text' value={this.state.color} id='color' onChange={this.handleChange} style={{backgroundColor: this.state.color}} />
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