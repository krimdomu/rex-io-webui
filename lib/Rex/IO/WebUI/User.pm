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

sub __register__ {
  my ($app) = @_;

  $app->register_url(
    {
      plugin => "user",
      meth   => "GET",
      auth   => Mojo::JSON->true,
      url    => "/",
      root   => Mojo::JSON->false,
      func   => \&list,
    }
  );

  $app->register_url(
    {
      plugin => "user",
      meth   => "DELETE",
      auth   => Mojo::JSON->true,
      url    => "/:user_id",
      root   => Mojo::JSON->false,
      func   => \&delete,
    }
  );

  $app->register_url(
    {
      plugin => "user",
      meth   => "POST",
      auth   => Mojo::JSON->true,
      url    => "/user",
      api    => Mojo::JSON->true,
      func   => \&add,
    }
  );

  $app->register_url(
    {
      plugin => "user",
      meth   => "POST",
      auth   => Mojo::JSON->true,
      url    => "/user/:user_id",
      api    => Mojo::JSON->true,
      func   => \&update,
    }
  );

  $app->register_url(
    {
      plugin => "user",
      meth   => "DELETE",
      auth   => Mojo::JSON->true,
      url    => "/user/:user_id",
      api    => Mojo::JSON->true,
      func   => \&delete,
    }
  );

}

1;
