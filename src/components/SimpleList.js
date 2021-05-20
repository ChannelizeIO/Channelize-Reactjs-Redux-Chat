import React, { Component } from 'react';
import { withChannelizeContext } from '../context';
import { dateSeparatorParser } from '../utils'
import { Avatar } from "./Avatar";
import { LANGUAGE_PHRASES } from "../constants";
import { OutsideClickHandler } from './OutsideClickHandler';

class SimpleList extends Component {
	constructor(props) {
  	super(props);
	}
	render() {
		const { title, action } = this.props;

		return (
			<li>
				<div className="title">
					<span>{title}</span>
				</div>
				<div className="action">
					{ action && action()}
				</div>
			</li>
		);
	}
}

SimpleList = withChannelizeContext(SimpleList);

export { SimpleList };