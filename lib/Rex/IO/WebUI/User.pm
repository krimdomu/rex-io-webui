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

  $self->render;
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

##### Rex.IO WebUI Plugin specific methods
sub rexio_routes {
  my ( $self, $routes ) = @_;
  my $r      = $routes->{route};
  my $r_auth = $routes->{route_auth};

  $r_auth->get("/user")->to("user#list");

  #  $r_auth->post("/user")->to("user#add");
  $r_auth->delete("/user/:user_id")->to("user#delete");

  $r_auth->get("/group")->to("group#list");
  $r_auth->post("/group")->to("group#add");
  $r_auth->post("/group/:group_id/user/:user_id")
    ->to("group#add_user_to_group");
  $r_auth->delete("/group/:group_id")->to("group#delete");

  # new routes
  $r_auth->post("/1.0/user/user")->to("user#add");
  $r_auth->post("/1.0/group/group")->to("group#add");

  $r_auth->delete("/1.0/user/user/:user_id")->to("user#delete");
  $r_auth->delete("/1.0/group/group/:group_id")->to("group#delete");
}

1;
