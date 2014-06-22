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

  $self->render;
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
  my ( $self, $opt ) = @_;
  my $r      = $opt->{route};
  my $r_auth = $opt->{route_auth};
  my $app    = $opt->{app};

  $r_auth->get("/permission/list_types")->to("permission#list_permission_sets");
  $r_auth->get("/1.0/permission/set/:set_id")
    ->to("permission#get_permission_set");

  $r_auth->post("/1.0/permission/set")->to("permission#create_set");
  $r_auth->post("/1.0/permission/set/:set_id")->to("permission#update_set");
  $r_auth->delete("/1.0/permission/set/:set_id")->to("permission#delete_set");
}

1;
