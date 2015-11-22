var peerflix = require('peerflix');
var url = require('url');

var BUFFERING_SIZE = 3 * 1024 * 1024;

var Player = React.createClass({
  player: null,
  getInitialState: function() {
    return {
      downloaded: 0,
      playing: false
    };
  },
  componentDidMount: function() {
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
  render: function() {
    var Content;
    if (this.state.downloaded <= BUFFERING_SIZE) {
      Content = <div>Buffering: {this.state.downloaded} / </div>;
    } else {
      Content = (
        <video width="700" controls>
          <source src={this.src} type="video/mp4" />
        </video>
      );
    }
    return (
      <div>
        {Content}
      </div>
    );
  }
});

ReactDOM.render(
  <Player />,
  document.getElementById('container')
);
