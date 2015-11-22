var peerflix = require('peerflix');
var url = require('url');

var BUFFERING_SIZE = 3 * 1024 * 1024;

var Player = React.createClass({
  displayName: 'Player',

  player: null,
  getInitialState: function () {
    return {
      downloaded: 0,
      playing: false
    };
  },
  componentDidMount: function () {
    var _self = this;

    var url_parts = url.parse(window.location.href, true);
    console.log(url_parts);
    var query = url_parts.query;
    var magnetLink = 'magnet:?xt=urn:btih:' + query.hash;
    var engine = peerflix(magnetLink);

    engine.server.on('listening', function () {
      _self.src = 'http://localhost:' + engine.server.address().port + '/';
    });

    setInterval(function () {
      _self.setState({ downloaded: engine.swarm.downloaded });
      // if (_self.state.downloaded > BUFFERING_SIZE && !_self.state.playing) {
      //   _self.setState({playing: true});
      //   var player = wcjs.init(document.getElementById("player"));
      //   player.play(_self.src);
      // }
    }, 3000);
  },
  render: function () {
    var Content;
    if (this.state.downloaded <= BUFFERING_SIZE) {
      Content = React.createElement(
        'div',
        null,
        'Buffering: ',
        this.state.downloaded,
        ' / '
      );
    } else {
      Content = React.createElement(
        'video',
        { width: '700', controls: true },
        React.createElement('source', { src: this.src, type: 'video/mp4' })
      );
    }
    return React.createElement(
      'div',
      null,
      Content
    );
  }
});

ReactDOM.render(React.createElement(Player, null), document.getElementById('container'));