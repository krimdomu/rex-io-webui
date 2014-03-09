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
  $self->render;
}

sub add {
  my ($self) = @_;
  my $ret = $self->rexio->add_user(%{ $self->req->json });
  $self->render(json => $ret);
}

sub delete {
  my ($self) = @_;
  my $ret = $self->rexio->del_user($self->param("user_id"));
  $self->render(json => $ret);
}

##### Rex.IO WebUI Plugin specific methods 
sub rexio_routes {
  my ($self, $routes) = @_;
  my $r    = $routes->{route};
  my $r_auth = $routes->{route_auth};

  $r_auth->get("/user")->to("user#list");
  $r_auth->post("/user")->to("user#add");
  $r_auth->delete("/user/:user_id")->to("user#delete");

  $r_auth->get("/group")->to("group#list");
  $r_auth->post("/group")->to("group#add");
  $r_auth->post("/group/:group_id/user/:user_id")->to("group#add_user_to_group");
  $r_auth->delete("/group/:group_id")->to("group#delete");
}

1;
