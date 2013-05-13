#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=3 sw=3 tw=0:
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

   $self->render_json($ret);
}

sub view {
   my ($self) = @_;

   my $inc = $self->rexio->get_incident($self->param("incident_id"));

   if(! $inc) {
      return $self->render_text("Incident not found", status => 404);
   }

   $inc->{short}   = markdown($inc->{short} || "");
   $inc->{content} = markdown($inc->{content} || "");

   $self->stash("incident", $inc);

   $self->render;
}

sub add_message {
   my ($self) = @_;

   my $json = $self->req->json;
   $json->{creator}  = $self->current_user->id;

   my $ret = $self->rexio->add_incident_message($self->param("incident_id"), %{ $json });
   $self->render_json($ret);
}

1;