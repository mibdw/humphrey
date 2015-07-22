var React = require('react'),
	moment = require('moment');

module.exports = React.createClass({	
	toggleFilter: function (e) {
		e.preventDefault();
		this.props.toggleFilter(e.target.id);
	},
	render: function () {
		var self = this;

		var categoryList = self.props.categories.map(function (cat) {
			return (
				<li className='category'>
					<label className={self.props.catFilter.indexOf(cat._id) > -1 ? 'checkbox active' : 'checkbox'} onClick={self.toggleFilter} id={cat._id} title={cat.name} key={'filter-' + cat._id}>
						<i style={{backgroundColor: cat.color}}></i>	{cat.name}
					</label>
				</li>
			)
		});

		return (
			<ul id='humphrey-filter'>
				{categoryList}
				<li className='clear-filter' style={self.props.catFilter.length > 0 ? {} : { display: 'none' }}>
					<a href='' onClick={self.toggleFilter} id='clear'>Clear filters</a>
				</li>
			</ul>
		)
	}
});