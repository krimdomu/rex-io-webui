#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=2 sw=2 tw=0:
# vim: set expandtab:
  

package Rex::IO::WebUI::Incident;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;
use Text::Markdown 'markdown';

# This action will render a template
sub list {
  my ($self) = @_;
  $self->render;
}

sub add {
  my ($self) = @_;

  my $json = $self->req->json;
  $json->{assignee} = $self->current_user->id;
  $json->{creator}  = $self->current_user->id;

  my $ret = $self->rexio->add_incident(%{ $json });

  $self->render(json => $ret);
}

sub view {
  my ($self) = @_;

  my $inc = $self->rexio->get_incident($self->param("incident_id"));

  if(! $inc) {
    return $self->render_text("Incident not found", status => 404);
  }

  $inc->{short}  = markdown($inc->{short} || "");
  $inc->{content} = markdown($inc->{content} || "");

  $self->stash("incident", $inc);

  $self->render;
}

sub add_message {
  my ($self) = @_;

  my $json = $self->req->json;
  $json->{creator}  = $self->current_user->id;

  my $ret = $self->rexio->add_incident_message($self->param("incident_id"), %{ $json });
  $self->render(json => $ret);
}

##### Rex.IO WebUI Plugin specific methods 
sub rexio_routes {
  my ($self, $routes) = @_;
  my $r    = $routes->{route};
  my $r_auth = $routes->{route_auth};

  $r_auth->get("/incident")->to("incident#list");
  $r_auth->post("/incident")->to("incident#add");
  $r_auth->get("/incident/:incident_id")->to("incident#view");
  $r_auth->post("/incident/:incident_id")->to("incident#add_message");

}



1;
