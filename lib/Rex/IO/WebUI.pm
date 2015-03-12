package Rex::IO::WebUI;
use Mojo::Base "Mojolicious";

use File::Basename 'dirname';
use File::Spec::Functions 'catdir';
use Cwd 'getcwd';
use Data::Dumper;
use JSON::XS;
use IPC::Shareable;

our $VERSION = "0.4.0";

my $shared_data_handler;
my %shared_data;

# This method will run once at server start
sub startup {
  my $self = shift;

  my $r      = $self->routes;
  my $r_auth = $r->bridge("/")->to("dashboard#check_login");

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

  $shared_data_handler = tie %shared_data, "IPC::Shareable", undef,
    { destroy => 1 };
  $self->helper(
    shared_data_tx => sub {
      my ( $self, $code ) = @_;
      $shared_data_handler->shlock();
      $code->();
      $shared_data_handler->shunlock();
    }
  );
  $self->helper(
    shared_data => sub {
      my ( $self, $key, $value ) = @_;
      if ($value) {
        $shared_data{$key} = $value;
      }
      else {
        if ($key) {
          return $shared_data{$key};
        }
        else {
          return %shared_data;
        }
      }
    }
  );

  $self->helper(
    register_url => sub {
      my ( $self, $config ) = @_;

      my $plugin_name = $config->{plugin};
      my $r           = $self->app->routes;

      my $meth_case = "\L$config->{meth}";
      if ( $meth_case eq "get"
        || $meth_case eq "post"
        || $meth_case eq "put"
        || $meth_case eq "delete" )
      {
        my $plugin_action_url = "/$plugin_name$config->{url}";
        if($config->{root}) {
          $plugin_action_url = $config->{url};
        }

        if($config->{api}) {
          $plugin_action_url = "/1.0$plugin_action_url";
        }

        if ( $config->{auth} ) {
          $r_auth->$meth_case($plugin_action_url)->to(
            "plugin#call_plugin",
            plugin => $plugin_name,
            config => $config
          );
        }
        else {
          $r->$meth_case($plugin_action_url)->to(
            "plugin#call_plugin",
            plugin => $plugin_name,
            config => $config
          );
        }
      }
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


#my $r_auth = $r->route("/")->to(cb => sub {
#  my ($app) = @_;
#
#    $app->redirect_to("/login") and return 0 unless($app->is_user_authenticated);
#    return 1;
#  });

  # Normal route to controller

  $r_auth->get("/plugins")->to("plugin#list");

#$r->post("/1.0/plugin/plugin")->over( authenticated => 1 )->to("plugin#register");
  $r->post("/1.0/plugin/plugin")->to("plugin#register");

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

    eval {
      no strict 'refs';
      *{ "${klass}::__register__" }->($self);
      #$klass->__register__($self);
      1;
    } or do {
      $self->log->error("Error calling $klass\->__register__(): $@");
    }
  }
}

1;
