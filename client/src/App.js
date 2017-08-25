import React, { Component } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Redirect
} from 'react-router-dom'
import axios from 'axios'

import Header from './components/Header';
import Footer from './components/Footer';
import PopularShows from './components/PopularShows';
import Login from './components/Login';
import Register from './components/Register';
import SingleShow from './components/SingleShow';
import SearchResults from './components/SearchResults';
import Profile from './components/Profile';

class App extends Component {
  constructor() {
    super();

    this.state = {
      search: null,
      pageNum: 1,
      auth: sessionStorage.getItem('auth') || false,
      user: null,
      popularShows: null,
      apiDataLoaded: false,
      searchDataLoaded: false,
      redirect: false,
      mobileNavVisible: false,
      imageClicked: 0,
      showData: {
        title: null,
        genre: null,
        sched_time: null,
        sched_date: null,
        image_url: null,
        summary: null,
      },
      showResults: null,
      usersShows: null,
      lastPage: null
    }

    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
    this.logOut = this.logOut.bind(this);
    this.getShowData = this.getShowData.bind(this);
    this.handleNavClick = this.handleNavClick.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.inputSearch = this.inputSearch.bind(this);
    this.getUsersShows = this.getUsersShows.bind(this);
    this.changePopularPage = this.changePopularPage.bind(this);
    this.addFavorite = this.addFavorite.bind(this);
    this.removeFavorite = this.removeFavorite.bind(this);
    this.getFavData = this.getFavData.bind(this);
  }

  handleSearch() {
    axios.get(`http://api.tvmaze.com/search/shows?q=${this.state.search}`)
    .then(res => {
      this.setState({
        showResults: res.data,
        searchDataLoaded: true
      })
    })
    .catch(err => console.log(err))
  }

  inputSearch(e){
    this.setState({search: e.target.value})
  }

  handleNavClick() {
    if(!this.state.mobileNavVisible) {
      this.setState({mobileNavVisible: true});
    } else {
      this.setState({mobileNavVisible: false});
    }
  }

  getUsersShows(userid){
    axios.get(`/profile/${userid}`)
    .then(res =>{
      this.setState({
        usersShows: res.data
      })
    })
  }

  resetUsersShows() {
    axios.get('/profile')
    .then(res => {
      this.setState({
        usersShows: res.data
      })
    }).catch(err => console.log(err));
  }

  handleLoginSubmit(e, username, password) {
    e.preventDefault();
    axios.post('/auth/login', {
      username,
      password,
    })
      .then(res => {
        this.setState({
          auth: res.data.auth,
          user: res.data.user,
          redirect: true
        });
        this.getUsersShows(res.data.user.id);
        sessionStorage.setItem('auth', true)
      })
      .catch(err => console.log(err));
  }

  handleRegisterSubmit(e, first_name, last_name, username, password, email) {
    e.preventDefault();
    axios.post('/auth/register', {
      first_name,
      last_name,
      username,
      password,
      email,
    })
      .then(res => {
        this.setState({
          auth: res.data.auth,
          user: res.data.user,
          redirect: true
        });
        sessionStorage.setItem('auth', true)
      })
      .catch(err => console.log(err));
  }

  logOut() {
    axios.get('/auth/logout')
      .then(res => {
        this.setState({
          auth: false,
          redirect: false
        });
        sessionStorage.removeItem('auth')
      })
      .catch(err => console.log(err));
  }

  componentDidMount(){
    axios.get('https://www.episodate.com/api/most-popular?page=1')
      .then(res => {
        this.setState({
          popularShows: res.data.tv_shows,
          apiDataLoaded: true,
          lastPage: res.data.pages
        })
      })
      .catch(err => console.log(err))
  }

  changePopularPage(num){
    const newPageNum = this.state.pageNum + num;
    axios.get(`https://www.episodate.com/api/most-popular?page=${newPageNum}`)
      .then(res => {
        this.setState({
          popularShows: res.data.tv_shows,
          apiDataLoaded: true,
          pageNum: newPageNum,
        })
      })
      .catch(err => console.log(err))
  }

  getShowData(show) {
    axios.get(`http://api.tvmaze.com/singlesearch/shows?q=${show}`)
      .then(res => {
        console.log(res.data.name)
        const regex = /<\/?\w+[^>]*\/?>/g
        this.setState({
          showData: {
            title: res.data.name,
            genre: res.data.genre,
            sched_time: res.data.schedule.time,
            sched_day: res.data.schedule.days[0],
            image_url: res.data.image.medium,
            summary: res.data.summary.replace(regex, ""),
          }
        })
      })
      .catch(err => console.log(err))
  }

  getFavData(show){
    axios.get(`http://api.tvmaze.com/singlesearch/shows?q=${show.title}`)
      .then(res => {
        const regex = /<\/?\w+[^>]*\/?>/g
        this.setState({
          showData: {
            title: res.data.name,
            genre: res.data.genre,
            sched_time: res.data.schedule.time,
            sched_day: res.data.schedule.days[0],
            image_url: res.data.image.medium,
            summary: res.data.summary.replace(regex, ""),
          },
          imageClicked: show.id
        })
      })
      .catch(err => console.log(err))
  }

  addFavorite(){
    axios.post('/profile', {
      title: this.state.showData.title,
      genre: this.state.showData.genre,
      sched_time: this.state.showData.sched_time,
      sched_day: this.state.showData.sched_day,
      image_url: this.state.showData.image_url,
      summary: this.state.showData.summary,
    })
    .then(res => {
      this.getUsersShows(this.state.user.id)
    })
    .catch(err => console.log(err));
  }

  removeFavorite(id) {
    axios.delete(`/profile/${id}`,{
        id,
    }).then(res => {
      this.getUsersShows(this.state.user.id)
    })
    .catch(err => console.log(err));
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Header
            inputSearch={this.inputSearch}
            handleSearch={this.handleSearch}
            showData={this.state.showData}
            showResults={this.state.showResults}
            logOut={this.logOut}
            auth={this.state.auth}
            handleNavClick={this.handleNavClick}
            mobileNavVisible={this.state.mobileNavVisible}
          />
          <Route exact path='/' render={() => <PopularShows
            pageNum={this.state.pageNum}
            dataLoaded={this.state.apiDataLoaded}
            popularShows={this.state.popularShows}
            getShowData={this.getShowData}
            changePopularPage={this.changePopularPage}
            lastPage={this.state.lastPage}
          /> } />
          <Route exact path='/login' render={() => <Login
            handleLoginSubmit={this.handleLoginSubmit}
          /> } />
          <Route exact path='/register' render={() => <Register
            handleRegisterSubmit={this.handleRegisterSubmit}
          /> } />
          <Route exact path='/show' render={() => <SingleShow
            showData={this.state.showData}
            auth={this.state.auth}
            addFavorite={this.addFavorite}
            removeFavorite={this.removeFavorite}
            usersShows={this.state.usersShows}
            imageClicked={this.state.imageClicked}
            getFavData={this.getFavData}
          /> } />
          <Route exact path='/results' render={() => <SearchResults
            showData={this.state.showData}
            showResults={this.state.showResults}
            getShowData={this.getShowData}
            dataLoaded={this.state.searchDataLoaded}
          /> } />
          <Route exact path='/profile' render={() => <Profile
            getShowData={this.getShowData}
            usersShows={this.state.usersShows}
            getFavData={this.getFavData}
          /> } />
          {this.state.redirect ? <Redirect push to={'/'} /> : ''}
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
