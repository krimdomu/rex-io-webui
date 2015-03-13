package Rex::IO::WebUI::Dashboard;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

# This action will render a template
sub index {
  my $self = shift;

  my $main_menu = $self->stash("main_menu") || [];
  unshift @{$main_menu},
    $self->render_to_string( "dashboard/ext/mainmenu", partial => 1 );

  $self->stash( main_menu => $main_menu );

  $self->render("dashboard/index");
}

sub view {
  my $self = shift;

  my $tab_info_droplets = $self->stash("tab_info") || [];
  $self->stash( tab_info => $tab_info_droplets );

  my $tabs = $self->stash("tabs") || [];
  $self->stash( tabs => $tabs );

  $self->render( 'dashboard/view', status => 200 );
}

sub login {
  my ($self) = @_;
  $self->render("dashboard/login");
}

sub ctrl_logout {
  my ($self) = @_;
  $self->logout;
  $self->render( json => { ok => Mojo::JSON->true } );
}

sub login_do_auth {
  my ($self) = @_;

  if ( $self->authenticate( $self->param("user"), $self->param("password") ) ) {
    $self->redirect_to("/");
  }

  $self->render("dashboard/login");

}

sub check_login {
  my ($self) = @_;
  $self->redirect_to("/login") and return 0
    unless ( $self->is_user_authenticated );
  return 1;
}

sub __register__ {
  my ($app) = @_;
  $app->log->debug("Loading Dashboard Plugin.");

  my $config = {
    config       => {
      name  => "dashboard",
    },
    plugin_name => "dashboard",
  };

  $app->register_plugin($config);

  $app->register_url(
    {
      plugin => "dashboard",
      meth   => "GET",
      auth   => Mojo::JSON->false,
      url    => "/login",
      root   => Mojo::JSON->true,
      action => "login",
    }
  );

  $app->register_url(
    {
      plugin => "dashboard",
      meth   => "POST",
      auth   => Mojo::JSON->false,
      url    => "/login",
      root   => Mojo::JSON->true,
      action => "login_do_auth",
    }
  );

  $app->register_url(
    {
      plugin => "dashboard",
      meth   => "GET",
      auth   => Mojo::JSON->true,
      url    => "/",
      root   => Mojo::JSON->true,
      action => "index",
    }
  );

  $app->register_url(
    {
      plugin => "dashboard",
      meth   => "GET",
      auth   => Mojo::JSON->true,
      url    => "/dashboard",
      root   => Mojo::JSON->true,
      action => "view",
    }
  );

  $app->register_url(
    {
      plugin => "dashboard",
      meth   => "GET",
      auth   => Mojo::JSON->true,
      url    => "/logout",
      root   => Mojo::JSON->true,
      action => "ctrl_logout",
    }
  );
}

1;
