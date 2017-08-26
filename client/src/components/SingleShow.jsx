import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class SingleShow extends Component {

  render(){
    return(
      <div className='singleShow'>
        <img src={this.props.showData.image_url} alt={this.props.showData.title} />
        <ul>
          <li>{this.props.showData.title}</li>
          <li>{this.props.showData.tv_network === '' ? this.props.showData.webChannel : this.props.showData.tv_network}</li>
          {this.props.showData.tv_network === '' ? '' : <li>{this.props.showData.sched_day}</li>}
          {this.props.showData.tv_network === '' ? '' : <li>{this.props.showData.sched_time}</li>}
        </ul>
        <p>{this.props.showData.summary}</p>
        {this.props.auth ? <button className="favButton" onClick={() => this.props.addFavorite()}><Link to='/profile'>Add</Link></button> : ''}
        {this.props.auth ? <button className="favButton" onClick={() => this.props.removeFavorite(this.props.imageClicked)}><Link to='/profile'>Remove</Link></button> : ''}
      </div>
    )
  }
}

export default SingleShow;
