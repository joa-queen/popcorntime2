var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var superagent = require('superagent');
var OS = require('opensubtitles-api');

const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;

var Movies = React.createClass({
  displayName: 'Movies',

  getInitialState: function () {
    return {
      selected: null,
      movies: null,
      magnet: null
    };
  },
  componentDidMount: function () {
    superagent.get('https://yts.ag/api/v2/list_movies.json').set('Accept', 'application/json').end((function (err, res) {
      if (res.body.status == 'ok') {
        this.setState({ movies: res.body.data.movies });
      }
    }).bind(this));
  },
  selectMovie: function (index, event) {
    this.resizeWindow(300, 500);
    this.setState({ selected: index });

    var movie = this.state.movies[index];
    if (!movie.plot) {
      this.loadPlot(index);
    }
    if (!movie.subtitles) {
      this.loadSubtitles(index);
    }
  },
  unselectMovie: function () {
    this.resizeWindow(300, 150);
    this.setState({ selected: null });
  },
  resizeWindow: function (w, h) {
    window.resizeTo(w, h);
  },
  loadPlot: function (index) {
    var movies = this.state.movies;
    var movie = movies[index];
    superagent.get('http://www.omdbapi.com/').query({ i: movie.imdb_code }).set('Accept', 'application/json').end((function (err, res) {
      if (res.body) {
        movie.plot = res.body.Plot;
        movies[index] = movie;
        this.setState({ movies: movies });
      }
    }).bind(this));
  },
  loadSubtitles: function (index) {
    var movies = this.state.movies;
    var movie = movies[index];

    var OpenSubtitles = new OS({
      useragent: 'Popcorn Time v2',
      username: 'popcorntime2',
      password: 'popcorntime2'
    });
    OpenSubtitles.search({
      filesize: movie.torrents[0].size_bytes,
      imdbid: movie.imdb_code
    }).then((function (subtitles) {
      movie.subtitles = subtitles;
      movies[index] = movie;
      this.setState({ movies: movies });
    }).bind(this));
  },
  render: function () {
    var Content;
    if (!this.state.movies) {
      Content = React.createElement(
        'div',
        null,
        'Cargando...'
      );
    } else {
      if (this.state.selected) {
        var movie = this.state.movies[this.state.selected];
        Content = React.createElement(Movie, { movie: movie, unselectMovie: this.unselectMovie });
      } else {
        var _self = this;
        Content = React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { className: 'toolbar' },
            React.createElement('ul', { className: 'buttons' })
          ),
          React.createElement(
            'ul',
            { id: 'moviesList' },
            this.state.movies.map(function (movie, i) {
              return React.createElement(
                'li',
                { key: i },
                React.createElement(
                  'a',
                  { href: '#', onClick: _self.selectMovie.bind(_self, i) },
                  React.createElement('img', { src: movie.medium_cover_image, alt: movie.title, title: movie.title, width: '75' })
                )
              );
            })
          )
        );
      }
    }
    return React.createElement(
      'div',
      null,
      Content
    );
  }
});

var Movie = React.createClass({
  displayName: 'Movie',

  getInitialState: function () {
    return {
      scene: 'main',
      subtitle: null,
      torrent: 0
    };
  },
  playMovie: function () {
    var movie = this.props.movie;

    var PlayerWindow = new BrowserWindow({
      title: movie.title,
      width: 800,
      height: 500,
      show: true,
      resizable: false,
      alwaysOnTop: false,
      skipTaskbar: false,
      frame: true
    });
    PlayerWindow.loadURL('file://' + __dirname + '/player.html?hash=' + movie.torrents[this.state.torrent].hash);
    PlayerWindow.webContents.openDevTools();
  },
  qualityScene: function () {
    this.setState({ scene: 'quality' });
  },
  subtitlesScene: function () {
    this.setState({ scene: 'subtitles' });
  },
  backButton: function () {
    switch (this.state.scene) {
      case 'quality':
      case 'subtitles':
        this.setState({ scene: 'main' });
        break;
      default:
        this.props.unselectMovie();
    }
  },
  selectQuality: function (index, event) {
    this.setState({ torrent: index, scene: 'main' });
  },
  selectSubtitle: function (key, event) {
    this.setState({ subtitle: key, scene: 'main' });
  },
  render: function () {
    var Scene;
    var movie = this.props.movie;

    switch (this.state.scene) {
      case 'quality':
        Scene = React.createElement(QualityScene, {
          movie: movie,
          selectQuality: this.selectQuality });
        break;
      case 'subtitles':
        Scene = React.createElement(SubtitlesScene, {
          selectSubtitle: this.selectSubtitle,
          movie: movie });
        break;
      default:
        Scene = React.createElement(MovieMain, _extends({}, this.props, {
          quality: this.state.torrent,
          subtitle: this.state.subtitle,
          qualityScene: this.qualityScene,
          subtitlesScene: this.subtitlesScene,
          playMovie: this.playMovie }));
    }

    var styles = {
      cover: {
        width: '100%'
      }
    };

    return React.createElement(
      'div',
      null,
      React.createElement(
        'a',
        { href: '#', onClick: this.backButton },
        'Volver'
      ),
      React.createElement('img', { src: movie.background_image, style: styles.cover }),
      React.createElement(
        'h1',
        null,
        movie.title
      ),
      Scene
    );
  }
});

var MovieMain = React.createClass({
  displayName: 'MovieMain',

  render: function () {
    var movie = this.props.movie;

    var Plot;
    if (!movie.plot) {
      Plot = React.createElement(
        'div',
        null,
        'Cargando plot...'
      );
    } else {
      Plot = React.createElement(
        'div',
        null,
        movie.plot
      );
    }

    var Subtitles;
    if (!movie.subtitles) {
      Subtitles = React.createElement(
        'li',
        null,
        'Cargando subtítulos'
      );
    } else {
      if (Object.keys(movie.subtitles).length > 0) {
        if (!this.props.subtitle) {
          Subtitles = React.createElement(
            'li',
            { onClick: this.props.subtitlesScene },
            'Elegir subtítulo'
          );
        } else {
          Subtitles = React.createElement(
            'li',
            { onClick: this.props.subtitlesScene },
            movie.subtitles[this.props.subtitle].langName
          );
        }
      } else {
        Subtitles = React.createElement(
          'li',
          null,
          'No hay subtítulos'
        );
      }
    }

    return React.createElement(
      'div',
      null,
      React.createElement(
        'button',
        { onClick: this.props.playMovie },
        'Reproducir'
      ),
      React.createElement('br', null),
      'Rating: ',
      movie.rating,
      React.createElement('br', null),
      movie.runtime,
      'm - ',
      movie.year,
      ' - ',
      movie.genres.join(', '),
      React.createElement('br', null),
      React.createElement('br', null),
      Plot,
      React.createElement('br', null),
      React.createElement('br', null),
      React.createElement(
        'ul',
        null,
        React.createElement(
          'li',
          { onClick: this.props.qualityScene },
          movie.torrents[this.props.quality].quality
        ),
        Subtitles
      )
    );
  }
});

var QualityScene = React.createClass({
  displayName: 'QualityScene',

  render: function () {
    var _self = this;
    return React.createElement(
      'ul',
      null,
      this.props.movie.torrents.map(function (torrent, i) {
        return React.createElement(
          'li',
          { key: i, onClick: _self.props.selectQuality.bind(_self, i) },
          torrent.quality
        );
      })
    );
  }
});

var SubtitlesScene = React.createClass({
  displayName: 'SubtitlesScene',

  render: function () {
    var _self = this;

    return React.createElement(
      'ul',
      null,
      Object.keys(this.props.movie.subtitles).map(function (key, i) {
        return React.createElement(
          'li',
          { key: i, onClick: _self.props.selectSubtitle.bind(_self, key) },
          _self.props.movie.subtitles[key].langName
        );
      })
    );
  }
});

ReactDOM.render(React.createElement(Movies, null), document.getElementById('container'));