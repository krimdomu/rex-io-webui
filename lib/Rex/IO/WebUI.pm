package Rex::IO::WebUI;
use Mojo::Base "Mojolicious";

use File::Basename 'dirname';
use File::Spec::Functions 'catdir';
use Cwd 'getcwd';
use Data::Dumper;
use JSON::XS;

our $VERSION = "0.4.0";

# This method will run once at server start
sub startup {
  my $self = shift;

  #######################################################################
  # some helper functions
  #######################################################################
  $self->helper(
    has_plugin => sub {
      my ( $self, $plugin ) = @_;
      my @plugins = @{ $self->config->{plugins} };

      for my $p (@plugins) {
        if ( $p eq $plugin ) {
          return 1;
        }
      }

      return 0;
    }
  );

  #######################################################################
  # for the package
  #######################################################################

  # Switch to installable home directory
  $self->home->parse( catdir( dirname(__FILE__), 'WebUI' ) );

  # Switch to installable "public" directory
  $self->static->paths->[0] = $self->home->rel_dir('public');

  # Switch to installable "templates" directory
  $self->renderer->paths->[0] = $self->home->rel_dir('templates');

  #######################################################################
  # Load configuration
  #######################################################################
  my @cfg = (
    "/etc/rex/io/webui.conf",
    "/usr/local/etc/rex/io/webui.conf",
    getcwd() . "/webui.conf"
  );
  my $cfg;
  for my $file (@cfg) {
    if ( -f $file ) {
      $cfg = $file;
      last;
    }
  }

  #######################################################################
  # Load plugins
  #######################################################################
  $self->plugin( "Config", file => $cfg );
  $self->plugin("Rex::IO::WebUI::Mojolicious::Plugin::RexIOServer");
  $self->plugin("Rex::IO::WebUI::Mojolicious::Plugin::User");
  $self->plugin(
    "Authentication" => {
      autoload_user => 1,
      session_key   => $self->config->{session}->{key},
      load_user     => sub {
        my ( $app, $uid ) = @_;
        my $user =
          $app->rexio->call( "GET", "1.0", "user", user => $uid )->{data};
        return $user;
      },
      validate_user => sub {
        my ( $app, $username, $password, $extra_data ) = @_;
        my $user_data = $app->rexio->call(
          "POST", "1.0", "user",
          login => undef,
          ref   => { user => $username, password => $password }
        );

        if ( $user_data->{ok} ) {
          $app->session( user        => $username );
          $app->session( password    => $password );
          $app->session( permissions => $user_data->{data}->{permissions} );
          return $user_data->{data}->{id};
        }

        return;
      },
    }
  );

  #######################################################################
  # Configure routing
  #######################################################################
  my $r = $self->routes;

  $r->get("/login")->to("dashboard#login");
  $r->post("/login")->to("dashboard#login_do_auth");

#my $r_auth = $r->route("/")->to(cb => sub {
#  my ($app) = @_;
#
#    $app->redirect_to("/login") and return 0 unless($app->is_user_authenticated);
#    return 1;
#  });

  my $r_auth = $r->bridge("/")->to("dashboard#check_login");

  # Normal route to controller
  $r_auth->get("/")->to("dashboard#index");
  $r_auth->get("/dashboard")->to("dashboard#view");
  $r_auth->post("/clear/cache")->to("server#clear_server_cache");

  # search
  $r_auth->get("/search")->to("search#index");

  #######################################################################
  # Load RexIO Plugins
  #######################################################################
  my @plugins = @{ $self->config->{plugins} };
  for my $plugin (@plugins) {
    my $klass = "Rex::IO::WebUI::$plugin";
    eval "use $klass";
    if ($@) {
      die("Error loading plugin $klass. $@");
    }

    eval { $klass->rexio_routes( { route => $r, route_auth => $r_auth, } ); };

    eval {
      $klass->__register__(
        {
          route      => $r,
          route_auth => $r_auth,
          app        => $self,
        }
      );
    };

    eval { $klass->__init__($self); };
    if ($@) { print STDERR "MOD/ERR: $@\n"; }
  }
}

1;
