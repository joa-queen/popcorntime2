var superagent = require('superagent');
var OS = require('opensubtitles-api');

const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;

var Movies = React.createClass({
  getInitialState: function() {
    return {
      selected: null,
      movies: null,
      magnet: null,
    };
  },
  componentDidMount: function() {
    superagent
      .get('https://yts.ag/api/v2/list_movies.json')
      .set('Accept', 'application/json')
      .end(function(err, res){
        if (res.body.status == 'ok') {
          this.setState({movies: res.body.data.movies});
        }
      }.bind(this));
  },
  selectMovie: function(index, event) {
    this.resizeWindow(300, 500);
    this.setState({selected: index});

    var movie = this.state.movies[index];
    if (!movie.plot) {
      this.loadPlot(index);
    }
    if (!movie.subtitles) {
      this.loadSubtitles(index);
    }
  },
  unselectMovie: function() {
    this.resizeWindow(300, 150);
    this.setState({selected: null});
  },
  resizeWindow: function(w, h) {
    window.resizeTo(w, h);
  },
  loadPlot: function(index) {
    var movies = this.state.movies;
    var movie = movies[index];
    superagent
      .get('http://www.omdbapi.com/')
      .query({i: movie.imdb_code})
      .set('Accept', 'application/json')
      .end(function(err, res){
        if (res.body) {
          movie.plot = res.body.Plot;
          movies[index] = movie;
          this.setState({movies: movies});
        }
      }.bind(this));
  },
  loadSubtitles: function(index) {
    var movies = this.state.movies;
    var movie = movies[index];

    var OpenSubtitles = new OS({
      useragent:'Popcorn Time v2',
      username: 'popcorntime2',
      password: 'popcorntime2',
    });
    OpenSubtitles.search({
      filesize: movie.torrents[0].size_bytes,
      imdbid: movie.imdb_code
    }).then(function(subtitles) {
      movie.subtitles = subtitles;
      movies[index] = movie;
      this.setState({movies: movies});
    }.bind(this));
  },
  render: function() {
    var Content;
    if (!this.state.movies) {
      Content = <div>Cargando...</div>;
    } else {
      if (this.state.selected) {
        var movie = this.state.movies[this.state.selected];
        Content = <Movie movie={movie} unselectMovie={this.unselectMovie} />;
      } else {
        var _self = this;
        Content = (
          <div>
            <div className="toolbar">
              <ul className="buttons">
              </ul>
            </div>
            <ul id="moviesList">
              {this.state.movies.map(function(movie, i) {
                return (
                  <li key={i}><a href="#" onClick={_self.selectMovie.bind(_self, i)}>
                    <img src={movie.medium_cover_image} alt={movie.title} title={movie.title} width="75" />
                  </a></li>
                );
              })}
            </ul>
          </div>
        );
      }
    }
    return (
      <div>{Content}</div>
    );
  }
});

var Movie = React.createClass({
  getInitialState: function() {
    return {
      scene: 'main',
      subtitle: null,
      torrent: 0,
    };
  },
  playMovie: function() {
    var movie = this.props.movie;

    var PlayerWindow = new BrowserWindow({
      title: movie.title,
      width: 800,
      height: 500,
      show: true,
      resizable: false,
      alwaysOnTop: false,
      skipTaskbar: false,
      frame: true,
    });
    PlayerWindow.loadURL('file://' + __dirname + '/player.html?hash=' + movie.torrents[this.state.torrent].hash);
    PlayerWindow.webContents.openDevTools();
  },
  qualityScene: function() {
    this.setState({scene: 'quality'});
  },
  subtitlesScene: function() {
    this.setState({scene: 'subtitles'});
  },
  backButton: function() {
    switch (this.state.scene) {
      case 'quality':
      case 'subtitles':
        this.setState({scene: 'main'});
        break;
      default:
        this.props.unselectMovie();
    }
  },
  selectQuality: function(index, event) {
    this.setState({torrent: index, scene: 'main'});
  },
  selectSubtitle: function(key, event) {
    this.setState({subtitle: key, scene: 'main'});
  },
  render: function() {
    var Scene;
    var movie = this.props.movie;

    switch (this.state.scene) {
      case 'quality':
        Scene = <QualityScene
          movie={movie}
          selectQuality={this.selectQuality} />;
        break;
      case 'subtitles':
        Scene = <SubtitlesScene
          selectSubtitle={this.selectSubtitle}
          movie={movie} />;
        break;
      default:
        Scene = <MovieMain {...this.props}
          quality={this.state.torrent}
          subtitle={this.state.subtitle}
          qualityScene={this.qualityScene}
          subtitlesScene={this.subtitlesScene}
          playMovie={this.playMovie} />;
    }

    var styles = {
      cover: {
        width: '100%'
      }
    };

    return (
      <div>
        <a href="#" onClick={this.backButton}>Volver</a>
        <img src={movie.background_image} style={styles.cover} />
        <h1>{movie.title}</h1>

        {Scene}
      </div>
    );
  }
});

var MovieMain = React.createClass({
  render: function() {
    var movie = this.props.movie;

    var Plot;
    if (!movie.plot) {
      Plot = <div>Cargando plot...</div>;
    } else {
      Plot = <div>{movie.plot}</div>
    }

    var Subtitles;
    if (!movie.subtitles) {
      Subtitles = <li>Cargando subtítulos</li>;
    } else {
      if (Object.keys(movie.subtitles).length > 0) {
        if (!this.props.subtitle) {
          Subtitles = <li onClick={this.props.subtitlesScene}>Elegir subtítulo</li>;
        } else {
          Subtitles = <li onClick={this.props.subtitlesScene}>{movie.subtitles[this.props.subtitle].langName}</li>;
        }
      } else {
        Subtitles = <li>No hay subtítulos</li>;
      }
    }

    return (
      <div>
        <button onClick={this.props.playMovie}>Reproducir</button>
        <br />

        Rating: {movie.rating}<br />
        {movie.runtime}m - {movie.year} - {movie.genres.join(', ')}<br /><br />
        {Plot}

        <br /><br />
        <ul>
          <li onClick={this.props.qualityScene}>{movie.torrents[this.props.quality].quality}</li>
          {Subtitles}
        </ul>
      </div>
    );
  }
});

var QualityScene = React.createClass({
  render: function() {
    var _self = this;
    return (
      <ul>
        {this.props.movie.torrents.map(function(torrent, i) {
          return (
            <li key={i} onClick={_self.props.selectQuality.bind(_self, i)}>{torrent.quality}</li>
          );
        })}
      </ul>
    );
  }
});

var SubtitlesScene = React.createClass({
  render: function() {
    var _self = this;

    return (
      <ul>
        {Object.keys(this.props.movie.subtitles).map(function(key, i) {
          return (
            <li key={i} onClick={_self.props.selectSubtitle.bind(_self, key)}>{_self.props.movie.subtitles[key].langName}</li>
          );
        })}
      </ul>
    );
  }
});

ReactDOM.render(
  <Movies />,
  document.getElementById('container')
);
