#
# (c) Jan Gehring <jan.gehring@gmail.com>
#
# vim: set ts=2 sw=2 tw=0:
# vim: set expandtab:

package Rex::IO::WebUI::User;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

# This action will render a template
sub list {
  my ($self) = @_;

  if ( !$self->has_permission('UI_USER_AND_GROUP') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  $self->render("user/list");
}

sub add {
  my ($self) = @_;

  if ( !$self->has_permission('UI_USER_AND_GROUP') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  my $ret = $self->rexio->call(
    "POST", "1.0", "user",
    user => undef,
    ref  => $self->req->json->{data},
  );
  $self->render( json => $ret );
}

sub delete {
  my ($self) = @_;

  if ( !$self->has_permission('UI_USER_AND_GROUP') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  my $ret = $self->rexio->call( "DELETE", "1.0", "user",
    user => $self->param("user_id") );
  $self->render( json => $ret );
}

sub update {
  my ($self) = @_;

  if ( !$self->has_permission('UI_USER_AND_GROUP') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  my $ret = $self->rexio->call(
    "POST", "1.0", "user",
    user => $self->param("user_id"),
    ref  => $self->req->json->{data},
  );

  $self->render( json => $ret );
}

sub mainmenu {
  my $self = shift;
  $self->app->log->debug("User: rendering main menu");

  my $main_menu = $self->stash("main_menu") || [];
  push @{$main_menu},
    $self->render_to_string( "user/ext/mainmenu", partial => 1 );

  $self->stash( main_menu => $main_menu );
}

sub __register__ {
  my ($app) = @_;

  my $config = {
    plugin_hooks => {},
    config       => {
      name  => "user",
      hooks => {
        consume => [
          {
            plugin => "dashboard",
            action => "index",
            call   => "Rex::IO::WebUI::User::mainmenu",
          }
        ]
      }
    },
    plugin_name => "user",
  };

  $app->register_plugin($config);

  $app->register_url(
    {
      plugin => "user",
      meth   => "GET",
      auth   => Mojo::JSON->true,
      url    => "/",
      root   => Mojo::JSON->false,
      action => "list",
    }
  );

  $app->register_url(
    {
      plugin => "user",
      meth   => "DELETE",
      auth   => Mojo::JSON->true,
      url    => "/:user_id",
      root   => Mojo::JSON->false,
      action => "delete",
    }
  );

  $app->register_url(
    {
      plugin => "user",
      meth   => "POST",
      auth   => Mojo::JSON->true,
      url    => "/user",
      api    => Mojo::JSON->true,
      action => "add",
    }
  );

  $app->register_url(
    {
      plugin => "user",
      meth   => "POST",
      auth   => Mojo::JSON->true,
      url    => "/user/:user_id",
      api    => Mojo::JSON->true,
      action => "update",
    }
  );

  $app->register_url(
    {
      plugin => "user",
      meth   => "DELETE",
      auth   => Mojo::JSON->true,
      url    => "/user/:user_id",
      api    => Mojo::JSON->true,
      action => "delete",
    }
  );

}

1;
