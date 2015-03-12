#
# (c) Jan Gehring <jan.gehring@gmail.com>
#
# vim: set ts=2 sw=2 tw=0:
# vim: set expandtab:

package Rex::IO::WebUI::Permission;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

sub list_types {
  my ($self) = @_;

  $self->app->log->debug("Listing permission types.");

  my $ref = $self->rexio->call( "GET", "1.0", "permission", type => undef );

  return $self->render( json => $ref );
}

sub list_permission_sets {
  my ($self) = @_;

  if ( !$self->has_permission('UI_USER_AND_GROUP') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  $self->render("permission/list_permission_sets");
}

sub create_set {
  my ($self) = @_;

  if ( !$self->has_permission('UI_USER_AND_GROUP') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  my $ref = $self->rexio->call(
    "POST", "1.0", "permission",
    set => undef,
    ref => $self->req->json->{data}
  );

  $self->render( json => $ref );
}

sub delete_set {
  my ($self) = @_;

  if ( !$self->has_permission('UI_USER_AND_GROUP') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  my $ref = $self->rexio->call( "DELETE", "1.0", "permission",
    set => $self->param("set_id") );

  $self->render( json => $ref );
}

sub get_permission_set {
  my ($self) = @_;

  if ( !$self->has_permission('UI_USER_AND_GROUP') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  my $ref = $self->rexio->call( "GET", "1.0", "permission",
    set => $self->param("set_id") );

  $self->render( json => $ref );
}

sub update_set {
  my ($self) = @_;

  if ( !$self->has_permission('UI_USER_AND_GROUP') ) {
    return $self->render( text => 'No permission', status => 403 );
  }

  my $ref = $self->rexio->call(
    "POST", "1.0", "permission",
    set => $self->param("set_id"),
    ref => $self->req->json->{data}
  );

  $self->render( json => $ref );

}

sub __register__ {
  my ( $app ) = @_;

  $app->register_url(
    {
      plugin => "permission",
      meth   => "GET",
      auth   => Mojo::JSON->true,
      url    => "/list_types",
      root   => Mojo::JSON->false,
      func   => \&list_permission_sets,
    }
  );

  $app->register_url(
    {
      plugin => "permission",
      meth   => "GET",
      auth   => Mojo::JSON->true,
      url    => "/set/:set_id",
      api    => Mojo::JSON->true,
      func   => \&get_permission_set,
    }
  );

  $app->register_url(
    {
      plugin => "permission",
      meth   => "POST",
      auth   => Mojo::JSON->true,
      url    => "/set",
      api    => Mojo::JSON->true,
      func   => \&create_set,
    }
  );

  $app->register_url(
    {
      plugin => "permission",
      meth   => "POST",
      auth   => Mojo::JSON->true,
      url    => "/set/:set_id",
      api    => Mojo::JSON->true,
      func   => \&update_set,
    }
  );

  $app->register_url(
    {
      plugin => "permission",
      meth   => "DELETE",
      auth   => Mojo::JSON->true,
      url    => "/set/:set_id",
      api    => Mojo::JSON->true,
      func   => \&delete_set,
    }
  );
}

1;
